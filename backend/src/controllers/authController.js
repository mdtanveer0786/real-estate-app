'use strict';

const asyncHandler = require('express-async-handler');
const crypto       = require('crypto');
const User         = require('../models/User');
const generateToken = require('../utils/generateToken');
<<<<<<< HEAD
const {
    sendWelcomeEmail,
    sendVerificationEmail,
    sendPasswordResetEmail,
=======
const { 
    sendPasswordResetEmail, 
    sendWelcomeEmail, 
    sendVerificationEmail 
>>>>>>> f09f67a4d9c30a8a79cb18e0aff6098a770e46e2
} = require('../utils/emailService');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Fire-and-forget email – logs success/failure but never blocks the response */
const fireEmail = (fn, label) =>
    fn.catch
      .catch(err  => console.error(`Email failed [${label}]: ${err.message}`));

<<<<<<< HEAD
// ─── POST /api/auth/register ──────────────────────────────────────────────────
=======
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
>>>>>>> f09f67a4d9c30a8a79cb18e0aff6098a770e46e2
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name?.trim())     { res.status(400); throw new Error('Name is required'); }
    if (!email?.trim())    { res.status(400); throw new Error('Email is required'); }
    if (!password)         { res.status(400); throw new Error('Password is required'); }
    if (password.length < 6) { res.status(400); throw new Error('Password must be at least 6 characters'); }

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) { res.status(400); throw new Error('An account with this email already exists'); }

    // Create user – isVerified defaults to FALSE in the schema
    const user = await User.create({
        name:  name.trim(),
        email: email.toLowerCase().trim(),
        password,
        role:  role === 'admin' ? 'user' : (role || 'user'),
    });

<<<<<<< HEAD
    // Generate email-verification token and save hashed copy to DB
    const verificationToken = user.getVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Send verification email (non-blocking)
    fireEmail(sendVerificationEmail(user, verificationToken), `verification → ${user.email}`);

    res.status(201).json({
        success: true,
        message: 'Registration successful! Please check your email to verify your account before logging in.',
    });
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
=======
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

>>>>>>> f09f67a4d9c30a8a79cb18e0aff6098a770e46e2

    if (!email || !password) { res.status(400); throw new Error('Please provide email and password'); }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) { res.status(401); throw new Error('Invalid email or password'); }

    const match = await user.matchPassword(password);
    if (!match) { res.status(401); throw new Error('Invalid email or password'); }

    if (!user.isVerified) {
        res.status(401);
        throw new Error('Please verify your email address before logging in. Check your inbox for the verification link.');
    }

    const token = generateToken(user._id);
    res.json({
        success: true,
        _id:   user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
        token,
    });
});

// ─── GET /api/auth/verifyemail/:token ─────────────────────────────────────────
const verifyEmail = asyncHandler(async (req, res) => {
    const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        verificationToken:  hashed,
        verificationExpire: { $gt: Date.now() },
    });

    if (!user) {
        res.status(400);
        throw new Error('Invalid or expired verification link. Please request a new one.');
    }

    user.isVerified         = true;
    user.verificationToken  = undefined;
    user.verificationExpire = undefined;
    await user.save({ validateBeforeSave: false });

    // Send welcome email now that address is confirmed (non-blocking)
    fireEmail(sendWelcomeEmail(user), `welcome → ${user.email}`);

    res.json({ success: true, message: 'Email verified successfully! You can now log in.' });
});

// ─── POST /api/auth/resendverification ───────────────────────────────────────
const resendVerification = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) { res.status(400); throw new Error('Please provide an email address'); }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user)           { res.status(404); throw new Error('No account found with that email address'); }
    if (user.isVerified) { res.status(400); throw new Error('This account is already verified'); }

    const verificationToken = user.getVerificationToken();
    await user.save({ validateBeforeSave: false });

    await sendVerificationEmail(user, verificationToken);

    res.json({ success: true, message: 'Verification email sent! Please check your inbox.' });
});

// ─── GET /api/auth/profile ────────────────────────────────────────────────────
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate('wishlist');
    if (!user) { res.status(404); throw new Error('User not found'); }
    res.json({
        _id:      user._id,
        name:     user.name,
        email:    user.email,
        role:     user.role,
        phone:    user.phone,
        wishlist: user.wishlist,
    });
});

// ─── PUT /api/auth/profile ────────────────────────────────────────────────────
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) { res.status(404); throw new Error('User not found'); }

    user.name  = req.body.name  || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    if (req.body.password) user.password = req.body.password;

    const updated = await user.save();
    res.json({
        _id:   updated._id,
        name:  updated.name,
        email: updated.email,
        role:  updated.role,
        phone: updated.phone,
        token: generateToken(updated._id),
    });
});

// ─── POST /api/auth/forgotpassword ────────────────────────────────────────────
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email?.trim()) { res.status(400); throw new Error('Please provide your email address'); }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

<<<<<<< HEAD
    if (user) {
        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });
        // Non-blocking – always return a generic 200 to prevent user enumeration
        fireEmail(sendPasswordResetEmail(user, resetToken), `password-reset → ${user.email}`);
    }

    // Always respond identically whether user exists or not (security best practice)
    res.json({
        success: true,
        message: 'If an account exists with that email address, a password reset link has been sent. Please check your inbox.',
=======
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
>>>>>>> f09f67a4d9c30a8a79cb18e0aff6098a770e46e2
    });
});

// ─── PUT /api/auth/resetpassword/:resettoken ─────────────────────────────────
const resetPassword = asyncHandler(async (req, res) => {
    const { password } = req.body;
    if (!password)          { res.status(400); throw new Error('Please provide a new password'); }
    if (password.length < 6){ res.status(400); throw new Error('Password must be at least 6 characters'); }

    const hashed = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');

    const user = await User.findOne({
        resetPasswordToken:  hashed,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        res.status(400);
        throw new Error('Invalid or expired reset link. Please request a new password reset.');
    }

    user.password            = password;
    user.resetPasswordToken  = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({
        success: true,
        message: 'Password reset successful! You can now log in with your new password.',
        token:   generateToken(user._id),
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
