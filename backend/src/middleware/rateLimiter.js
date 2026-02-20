const rateLimit = require('express-rate-limit');

// General API rate limiter - INCREASE LIMITS
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Increase from 100 to 1000 requests per windowMs
    message: {
        success: false,
        error: 'Too many requests, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful requests
});

// Auth rate limiter - INCREASE LIMITS
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // Increase from 10 to 50 attempts per hour
    message: {
        success: false,
        error: 'Too many authentication attempts, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
});

// Inquiry rate limiter
const inquiryLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // Increase from 20 to 50
    message: {
        success: false,
        error: 'Too many inquiries, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
});

module.exports = {
    apiLimiter,
    authLimiter,
    inquiryLimiter,
};