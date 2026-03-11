const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendPasswordResetEmail, sendWelcomeEmail } = require('../utils/emailService');

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    console.log('Login attempt:', req.body.email);

    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
        res.status(400);
        throw new Error('Please provide email and password');
    }

    // Find user by email (include password field)
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
        res.status(401);
        throw new Error('Invalid email or password');
    }

    // Check password
    const isPasswordMatch = await user.matchPassword(password);

    if (isPasswordMatch) {
        const token = generateToken(user._id);
        res.json({
            success: true,
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token,
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    console.log('Register attempt:', req.body.email);

    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !name.trim()) {
        res.status(400);
        throw new Error('Please provide your name');
    }
    if (!email || !email.trim()) {
        res.status(400);
        throw new Error('Please provide your email');
    }
    if (!password) {
        res.status(400);
        throw new Error('Please provide a password');
    }
    if (password.length < 6) {
        res.status(400);
        throw new Error('Password must be at least 6 characters');
    }

    // Check if user exists
    const userExists = await User.findOne({ email: email.toLowerCase().trim() });

    if (userExists) {
        res.status(400);
        throw new Error('An account with this email already exists');
    }

    // Create user
    const user = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        role: role === 'admin' ? 'user' : (role || 'user'), // Prevent self-assigning admin
    });

    if (user) {
        // Send welcome email (non-blocking - don't let email failure prevent registration)
        sendWelcomeEmail(user)
            .then(() => console.log('✅ Welcome email sent to:', user.email))
            .catch((emailError) => console.error('❌ Welcome email failed:', emailError.message));

        const token = generateToken(user._id);
        console.log('✅ User created successfully:', user.email, 'Role:', user.role);

        res.status(201).json({
            success: true,
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token,
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data. Please try again.');
    }
});


// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate('wishlist');

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            wishlist: user.wishlist,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.phone = req.body.phone || user.phone;

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            phone: updatedUser.phone,
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email || !email.trim()) {
        res.status(400);
        throw new Error('Please provide your email address');
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
        res.status(404);
        throw new Error('No account found with that email address');
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    try {
        await sendPasswordResetEmail(user, resetToken);
        res.status(200).json({
            success: true,
            message: 'Password reset email sent! Please check your inbox.',
            data: 'Email sent',
        });
    } catch (err) {
        console.error('❌ Forgot password email error:', err.message);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        res.status(500);
        throw new Error('Failed to send password reset email. Please try again later.');
    }
});

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
    const { password } = req.body;

    if (!password) {
        res.status(400);
        throw new Error('Please provide a new password');
    }
    if (password.length < 6) {
        res.status(400);
        throw new Error('Password must be at least 6 characters');
    }

    // Get hashed token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resettoken)
        .digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        res.status(400);
        throw new Error('Invalid or expired reset token. Please request a new password reset.');
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Password reset successful! You can now login with your new password.',
        data: 'Password reset successful',
        token: generateToken(user._id),
    });
});

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    forgotPassword,
    resetPassword,
};
