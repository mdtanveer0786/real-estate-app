'use strict';

const rateLimit = require('express-rate-limit');

// ─── General API (100 req / 15 min per IP) ────────────────────────────────────
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many requests, please try again later.' },
});

// ─── Auth routes (30 req / 15 min per IP – brute-force protection) ────────────
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many authentication attempts, please try again in 15 minutes.' },
});

// ─── Contact form (5 submissions / hour per IP – anti-spam) ──────────────────
const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many contact form submissions. Please wait an hour before trying again.' },
});

// ─── Property inquiries (10 req / hour per IP) ────────────────────────────────
const inquiryLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many inquiries submitted. Please try again later.' },
});

// ─── AI chat/price endpoints (20 req / 15 min per IP) ────────────────────────
// Each AI request runs 2-3 DB queries – protect against abuse
const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many AI requests, please slow down.' },
});

module.exports = { apiLimiter, authLimiter, contactLimiter, inquiryLimiter, aiLimiter };
