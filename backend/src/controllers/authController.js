'use strict';

const asyncHandler = require('express-async-handler');
const crypto       = require('crypto');
const passport     = require('passport');
const speakeasy    = require('speakeasy');
const QRCode       = require('qrcode');
const User         = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
const logger        = require('../utils/logger');
const {
    sendWelcomeEmail,
    sendVerificationEmail,
    sendPasswordResetEmail,
} = require('../utils/emailService');

// ─── Constants ───────────────────────────────────────────────────────────────

const REFRESH_COOKIE = 'refreshToken';
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

const cookieOptions = (maxAge = REFRESH_MAX_AGE) => ({
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge,
    path: '/',
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Fire-and-forget email – logs success/failure but never blocks the response */
const fireEmail = (fn, label) =>
    fn.catch(err => logger.error(`Email failed [${label}]: ${err.message}`));

/** Build the standard user response object */
const userResponse = (user) => ({
    _id:   user._id,
    name:  user.name,
    email: user.email,
    role:  user.role,
    avatar: user.avatar,
    phone: user.phone,
    twoFactorEnabled: user.twoFactorEnabled || false,
    subscription: user.subscription,
});

// ─── POST /api/auth/register ─────────────────────────────────────────────────

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name?.trim())      { res.status(400); throw new Error('Name is required'); }
    if (!email?.trim())     { res.status(400); throw new Error('Email is required'); }
    if (!password)          { res.status(400); throw new Error('Password is required'); }
    if (password.length < 6){ res.status(400); throw new Error('Password must be at least 6 characters'); }

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) { res.status(400); throw new Error('An account with this email already exists'); }

    // Only allow 'user' or 'agent' during registration — never 'admin'
    const allowedRole = role === 'agent' ? 'agent' : 'user';

    const user = await User.create({
        name:  name.trim(),
        email: email.toLowerCase().trim(),
        password,
        role: allowedRole,
    });

    if (user) {
        const verificationToken = user.getVerificationToken();
        await user.save({ validateBeforeSave: false });

        fireEmail(
            sendVerificationEmail(user, verificationToken),
            `registration-verify → ${user.email}`
        );

        res.status(201).json({
            success: true,
            message: 'Registration successful! Please check your email to verify your account.',
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data. Please try again.');
    }
});

// ─── POST /api/auth/login ────────────────────────────────────────────────────

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error('Please provide email and password');
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
        .select('+password +twoFactorSecret');

    if (!user) {
        res.status(401);
        throw new Error('Invalid email or password');
    }

    // Google-only accounts cannot log in with password
    if (!user.password) {
        res.status(401);
        throw new Error('This account uses Google login. Please sign in with Google.');
    }

    const match = await user.matchPassword(password);
    if (!match) {
        res.status(401);
        throw new Error('Invalid email or password');
    }

    if (!user.isVerified) {
        res.status(401);
        throw new Error('Please verify your email address before logging in. Check your inbox for the verification link.');
    }

    // If 2FA is enabled, require TOTP before issuing tokens
    if (user.twoFactorEnabled) {
        // Return a temporary indicator — frontend must call /auth/2fa/verify-login
        const tempToken = crypto.randomBytes(32).toString('hex');
        const hashedTemp = crypto.createHash('sha256').update(tempToken).digest('hex');

        // Store temporarily (reuse resetPasswordToken field for simplicity)
        user.resetPasswordToken = hashedTemp;
        user.resetPasswordExpire = Date.now() + 5 * 60 * 1000; // 5 min
        await user.save({ validateBeforeSave: false });

        return res.json({
            success: true,
            requiresTwoFactor: true,
            tempToken,
            message: 'Please enter your 2FA code.',
        });
    }

    // Issue tokens
    const accessToken  = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.addRefreshToken(refreshToken, req.headers['user-agent']);
    await user.save({ validateBeforeSave: false });

    res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions());

    res.json({
        success: true,
        accessToken,
        user: userResponse(user),
    });
});

// ─── POST /api/auth/refresh ──────────────────────────────────────────────────

const refreshAccessToken = asyncHandler(async (req, res) => {
    const token = req.cookies?.[REFRESH_COOKIE];

    if (!token) {
        res.status(401);
        throw new Error('No refresh token provided');
    }

    // Verify JWT signature
    let decoded;
    try {
        const jwt = require('jsonwebtoken');
        decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    } catch {
        res.clearCookie(REFRESH_COOKIE, cookieOptions(0));
        res.status(401);
        throw new Error('Invalid or expired refresh token');
    }

    const user = await User.findById(decoded.id);
    if (!user) {
        res.clearCookie(REFRESH_COOKIE, cookieOptions(0));
        res.status(401);
        throw new Error('User not found');
    }

    // Validate and consume the old refresh token (rotation)
    const valid = user.consumeRefreshToken(token);
    if (!valid) {
        // Possible token reuse attack — clear all sessions
        user.clearRefreshTokens();
        await user.save({ validateBeforeSave: false });
        res.clearCookie(REFRESH_COOKIE, cookieOptions(0));
        res.status(401);
        throw new Error('Refresh token reuse detected. All sessions revoked.');
    }

    // Issue new token pair
    const newAccessToken  = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.addRefreshToken(newRefreshToken, req.headers['user-agent']);
    await user.save({ validateBeforeSave: false });

    res.cookie(REFRESH_COOKIE, newRefreshToken, cookieOptions());

    res.json({
        success: true,
        accessToken: newAccessToken,
        user: userResponse(user),
    });
});

// ─── POST /api/auth/logout ───────────────────────────────────────────────────

const logoutUser = asyncHandler(async (req, res) => {
    const token = req.cookies?.[REFRESH_COOKIE];

    if (token) {
        try {
            const jwt = require('jsonwebtoken');
            const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);
            if (user) {
                user.consumeRefreshToken(token);
                await user.save({ validateBeforeSave: false });
            }
        } catch {
            // Token invalid — just clear the cookie
        }
    }

    res.clearCookie(REFRESH_COOKIE, cookieOptions(0));
    res.json({ success: true, message: 'Logged out successfully' });
});

// ─── GET /api/auth/verifyemail/:token ────────────────────────────────────────

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

    try {
        await sendVerificationEmail(user, verificationToken);
        res.json({ success: true, message: 'Verification email sent! Please check your inbox.' });
    } catch (err) {
        console.error('❌ Resend verification email error:', err.message);
        res.status(500);
        throw new Error('Failed to send verification email. Please try again later.');
    }
});

// ─── GET /api/auth/profile ───────────────────────────────────────────────────

const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate('wishlist');
    if (!user) { res.status(404); throw new Error('User not found'); }
    res.json(userResponse(user));
});

// ─── PUT /api/auth/profile ───────────────────────────────────────────────────

const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) { res.status(404); throw new Error('User not found'); }

    user.name  = req.body.name  || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    if (req.body.password) user.password = req.body.password;

    const updated = await user.save();
    const accessToken = generateAccessToken(updated._id);

    res.json({
        success: true,
        accessToken,
        user: userResponse(updated),
    });
});

// ─── POST /api/auth/forgotpassword ───────────────────────────────────────────

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email?.trim()) { res.status(400); throw new Error('Please provide your email address'); }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (user) {
        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });
        fireEmail(sendPasswordResetEmail(user, resetToken), `password-reset → ${user.email}`);
    }

    // Always respond identically (security best practice)
    res.json({
        success: true,
        message: 'If an account exists with that email address, a password reset link has been sent.',
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
    // Revoke all sessions on password change
    user.clearRefreshTokens();
    await user.save();

    const accessToken  = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.addRefreshToken(refreshToken, req.headers['user-agent']);
    await user.save({ validateBeforeSave: false });

    res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions());

    res.json({
        success: true,
        message: 'Password reset successful! You can now log in with your new password.',
        accessToken,
    });
});

// ─── Google OAuth ────────────────────────────────────────────────────────────

const googleAuth = passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
});

const googleCallback = asyncHandler(async (req, res) => {
    // passport.authenticate populates req.user on success
    const user = req.user;

    const accessToken  = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.addRefreshToken(refreshToken, req.headers['user-agent']);
    await user.save({ validateBeforeSave: false });

    res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions());

    // Redirect to frontend with access token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/google/success?token=${accessToken}`);
});

// ─── 2FA Setup ───────────────────────────────────────────────────────────────

const setup2FA = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('+twoFactorSecret');

    const secret = speakeasy.generateSecret({
        name: `EstateElite (${user.email})`,
        issuer: 'EstateElite',
    });

    user.twoFactorSecret = secret.base32;
    await user.save({ validateBeforeSave: false });

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
        success: true,
        secret: secret.base32,
        qrCode: qrCodeUrl,
        message: 'Scan the QR code with your authenticator app, then verify with a code.',
    });
});

const verify2FA = asyncHandler(async (req, res) => {
    const { code } = req.body;
    if (!code) { res.status(400); throw new Error('Please provide a 2FA code'); }

    const user = await User.findById(req.user._id).select('+twoFactorSecret');

    const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: code,
        window: 1,
    });

    if (!verified) {
        res.status(400);
        throw new Error('Invalid 2FA code. Please try again.');
    }

    user.twoFactorEnabled = true;
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, message: 'Two-factor authentication enabled successfully!' });
});

const disable2FA = asyncHandler(async (req, res) => {
    const { code } = req.body;
    if (!code) { res.status(400); throw new Error('Please provide a 2FA code to disable'); }

    const user = await User.findById(req.user._id).select('+twoFactorSecret');

    const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: code,
        window: 1,
    });

    if (!verified) {
        res.status(400);
        throw new Error('Invalid 2FA code.');
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, message: 'Two-factor authentication disabled.' });
});

/**
 * 2FA login verification — called after initial login returns requiresTwoFactor.
 */
const verifyLoginWith2FA = asyncHandler(async (req, res) => {
    const { tempToken, code } = req.body;
    if (!tempToken || !code) {
        res.status(400);
        throw new Error('Please provide both the temporary token and 2FA code');
    }

    const hashedTemp = crypto.createHash('sha256').update(tempToken).digest('hex');
    const user = await User.findOne({
        resetPasswordToken: hashedTemp,
        resetPasswordExpire: { $gt: Date.now() },
    }).select('+twoFactorSecret');

    if (!user) {
        res.status(401);
        throw new Error('2FA session expired. Please log in again.');
    }

    const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: code,
        window: 1,
    });

    if (!verified) {
        res.status(400);
        throw new Error('Invalid 2FA code.');
    }

    // Clear temp token
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    // Issue tokens
    const accessToken  = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.addRefreshToken(refreshToken, req.headers['user-agent']);
    await user.save({ validateBeforeSave: false });

    res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions());

    res.json({
        success: true,
        accessToken,
        user: userResponse(user),
    });
});

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getUserProfile,
    updateUserProfile,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
    googleAuth,
    googleCallback,
    setup2FA,
    verify2FA,
    disable2FA,
    verifyLoginWith2FA,
};
