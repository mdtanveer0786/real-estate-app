'use strict';

const asyncHandler = require('express-async-handler');
const crypto       = require('crypto');
const User         = require('../models/User');
const generateToken = require('../utils/generateToken');
const {
    sendWelcomeEmail,
    sendVerificationEmail,
    sendPasswordResetEmail,
} = require('../utils/emailService');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Fire-and-forget email – logs success/failure but never blocks the response */
const fireEmail = (fn, label) =>
    fn.catch
      .catch(err  => console.error(`Email failed [${label}]: ${err.message}`));

// ─── POST /api/auth/register ──────────────────────────────────────────────────
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
