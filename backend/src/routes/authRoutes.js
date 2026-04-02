'use strict';

const express = require('express');
const passport = require('passport');
const router = express.Router();
const { validate } = require('../middleware/validate');
const {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    updateProfileSchema,
    verify2FASchema,
    verifyLoginWith2FASchema,
} = require('../validators/authValidator');
const {
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
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// ── Public routes ─────────────────────────────────────────────────────────────
router.post('/register',       validate(registerSchema),       registerUser);
router.post('/login',          validate(loginSchema),          loginUser);
router.post('/logout',                                         logoutUser);
router.post('/refresh',                                        refreshAccessToken);
router.post('/forgotpassword', validate(forgotPasswordSchema), forgotPassword);
router.put('/resetpassword/:resettoken', validate(resetPasswordSchema), resetPassword);
router.get('/verifyemail/:token',                              verifyEmail);
router.post('/resendverification',                             resendVerification);

// ── Google OAuth ──────────────────────────────────────────────────────────────
router.get('/google', googleAuth);
router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    googleCallback
);

// ── 2FA login verification (public — user not yet authenticated) ─────────────
router.post('/2fa/verify-login', validate(verifyLoginWith2FASchema), verifyLoginWith2FA);

// ── Protected routes ──────────────────────────────────────────────────────────
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, validate(updateProfileSchema), updateUserProfile);

// ── 2FA management (protected) ────────────────────────────────────────────────
router.post('/2fa/setup',   protect, setup2FA);
router.post('/2fa/verify',  protect, validate(verify2FASchema), verify2FA);
router.post('/2fa/disable', protect, validate(verify2FASchema), disable2FA);

module.exports = router;
