const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email',
        ],
    },
    password: {
        type: String,
        minlength: 6,
        select: false,
        // NOT required — Google OAuth users won't have a password
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'agent'],
        default: 'user',
    },
    phone: {
        type: String,
        trim: true,
    },
    avatar: {
        type: String,
        default: '',
    },

    // ── Google OAuth ──────────────────────────────────────────────────────────
    googleId: {
        type: String,
        unique: true,
        sparse: true, // allows multiple null values
    },

    // ── Wishlist ──────────────────────────────────────────────────────────────
    wishlist: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Property',
        },
    ],

    // ── Email verification ──────────────────────────────────────────────────
    isVerified: {
        type: Boolean,
        default: false,
    },
    verificationToken: String,
    verificationExpire: Date,

    // ── Password reset ──────────────────────────────────────────────────────
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    // ── Refresh tokens (array supports multiple devices) ────────────────────
    refreshTokens: [{
        token: { type: String, required: true },
        expiresAt: { type: Date, required: true },
        userAgent: String,
        createdAt: { type: Date, default: Date.now },
    }],

    // ── Two-factor authentication ──────────────────────────────────────────
    twoFactorSecret: {
        type: String,
        select: false,
    },
    twoFactorEnabled: {
        type: Boolean,
        default: false,
    },

    // ── Subscription ─────────────────────────────────────────────────────────
    subscription: {
        plan: {
            type: String,
            enum: ['free', 'basic', 'premium'],
            default: 'free',
        },
        expiresAt: Date,
        razorpaySubId: String,
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true
});

// ── Indexes ──────────────────────────────────────────────────────────────────
userSchema.index({ role: 1 });
userSchema.index({ 'refreshTokens.token': 1 });

// ── Pre-save: hash password ──────────────────────────────────────────────────
userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// ── Instance methods ────────────────────────────────────────────────────────

userSchema.methods.matchPassword = async function (enteredPassword) {
    if (!this.password) return false; // OAuth users have no password
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 60 minutes
    return resetToken;
};

userSchema.methods.getVerificationToken = function () {
    const verificationToken = crypto.randomBytes(20).toString('hex');
    this.verificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    this.verificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    return verificationToken;
};

/**
 * Store a hashed refresh token. Automatically prunes expired entries.
 */
userSchema.methods.addRefreshToken = function (rawToken, userAgent = '') {
    // Prune expired tokens
    this.refreshTokens = this.refreshTokens.filter(rt => rt.expiresAt > new Date());

    // Limit to 5 active sessions
    if (this.refreshTokens.length >= 5) {
        this.refreshTokens.shift();
    }

    const hashed = crypto.createHash('sha256').update(rawToken).digest('hex');
    this.refreshTokens.push({
        token: hashed,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        userAgent,
    });
};

/**
 * Validate and remove a refresh token (one-time use / rotation).
 */
userSchema.methods.consumeRefreshToken = function (rawToken) {
    const hashed = crypto.createHash('sha256').update(rawToken).digest('hex');
    const idx = this.refreshTokens.findIndex(rt => rt.token === hashed && rt.expiresAt > new Date());
    if (idx === -1) return false;
    this.refreshTokens.splice(idx, 1);
    return true;
};

/**
 * Remove all refresh tokens (logout from all devices).
 */
userSchema.methods.clearRefreshTokens = function () {
    this.refreshTokens = [];
};

module.exports = mongoose.model('User', userSchema);