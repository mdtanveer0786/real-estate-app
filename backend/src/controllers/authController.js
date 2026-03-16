const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { 
    sendPasswordResetEmail, 
    sendWelcomeEmail, 
    sendVerificationEmail 
} = require('../utils/emailService');

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

    if (!isPasswordMatch) {
        res.status(401);
        throw new Error('Invalid email or password');
    }

    // Check if email is verified
    if (!user.isVerified) {
        res.status(401);
        throw new Error('Please verify your email address before logging in.');
    }

    const token = generateToken(user._id);
    res.json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
    });
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
        // Generate verification token
        const verificationToken = user.getVerificationToken();
        await user.save({ validateBeforeSave: false });

        // Send verification email (await to catch SMTP errors)
        try {
            await sendVerificationEmail(user, verificationToken);
            console.log('✅ Verification email sent to:', user.email);
        } catch (emailError) {
            console.error('❌ Verification email failed:', emailError.message);
            // Optionally: we could delete the user here if verification is critical,
            // but for now we just log it and inform the user that registration was successful but email might be delayed.
            // Or better: let it throw so the user knows it failed.
            throw new Error('User registered but failed to send verification email. Please try to resend it from login.');
        }

        res.status(201).json({
            success: true,
            message: 'Registration successful! Please check your email to verify your account.',
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data. Please try again.');
    }
});

// @desc    Verify email
// @route   GET /api/auth/verifyemail/:token
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
    // Hash token from URL
    const verificationToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        verificationToken,
        verificationExpire: { $gt: Date.now() },
    });

    if (!user) {
        res.status(400);
        throw new Error('Invalid or expired verification token.');
    }

    // Update user to verified
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpire = undefined;

    await user.save({ validateBeforeSave: false });

    // Send welcome email (await to catch SMTP errors)
    try {
        await sendWelcomeEmail(user);
        console.log('✅ Welcome email sent to verified user:', user.email);
    } catch (err) {
        console.error('❌ Welcome email failed:', err.message);
        // We don't throw here as the verification was successful regardless.
    }

    res.status(200).json({
        success: true,
        message: 'Email verified successfully! You can now login.',
    });
});

// @desc    Resend verification email
// @route   POST /api/auth/resendverification
// @access  Public
const resendVerification = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        res.status(400);
        throw new Error('Please provide an email address');
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
        res.status(404);
        throw new Error('No user found with that email address');
    }

    if (user.isVerified) {
        res.status(400);
        throw new Error('This account is already verified');
    }

    // Generate new token
    const verificationToken = user.getVerificationToken();
    await user.save({ validateBeforeSave: false });

    try {
        await sendVerificationEmail(user, verificationToken);
        res.status(200).json({
            success: true,
            message: 'Verification email resent! Please check your inbox.',
        });
    } catch (err) {
        console.error('❌ Resend verification email error:', err.message);
        res.status(500);
        throw new Error('Failed to send verification email. Please try again later.');
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

    // Send reset email (await to catch SMTP errors)
    try {
        await sendPasswordResetEmail(user, resetToken);
        console.log('✅ Password reset email sent to:', user.email);
    } catch (err) {
        console.error('❌ Forgot password email error:', err.message);
        res.status(500);
        throw new Error('Failed to send password reset email. Please try again later.');
    }

    res.status(200).json({
        success: true,
        message: 'A password reset link has been sent to your email.',
        data: 'Email sent successfully',
    });
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
    verifyEmail,
    resendVerification,
};
