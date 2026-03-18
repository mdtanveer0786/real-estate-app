'use strict';

const logger = require('../utils/logger');

/**
 * Centralized error handler.
 *
 * Produces a consistent JSON shape:
 * {
 *   success: false,
 *   error: "Human-readable message",
 *   code: "MACHINE_READABLE_CODE",
 *   errors: [{ field, message }]   // optional — from Zod / Mongoose
 * }
 */
const errorHandler = (err, req, res, next) => {
    // If headers already sent, delegate to Express
    if (res.headersSent) return next(err);

    // Start with the error's own fields
    let statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
    let message    = err.message || 'Server Error';
    let code       = err.code || 'INTERNAL_ERROR';
    let errors     = err.errors || undefined; // Zod / custom field errors

    // ── Mongoose: CastError (bad ObjectId) ───────────────────────────────────
    if (err.name === 'CastError') {
        statusCode = 404;
        message = 'Resource not found';
        code = 'NOT_FOUND';
    }

    // ── Mongoose: Duplicate key ──────────────────────────────────────────────
    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue || {})[0] || 'field';
        message = field === 'email'
            ? 'An account with this email already exists'
            : `Duplicate value for "${field}"`;
        code = 'DUPLICATE_KEY';
    }

    // ── Mongoose: ValidationError ────────────────────────────────────────────
    if (err.name === 'ValidationError') {
        statusCode = 400;
        errors = Object.values(err.errors).map(e => ({
            field: e.path,
            message: e.message,
        }));
        message = errors[0]?.message || 'Validation failed';
        code = 'VALIDATION_ERROR';
    }

    // ── JWT Errors ───────────────────────────────────────────────────────────
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
        code = 'INVALID_TOKEN';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Access token expired';
        code = 'TOKEN_EXPIRED';
    }

    // ── Logging ──────────────────────────────────────────────────────────────
    if (statusCode >= 500) {
        logger.error(`[${code}] ${message}`, {
            url: req.originalUrl,
            method: req.method,
            ip: req.ip,
            stack: err.stack,
        });
    } else if (process.env.NODE_ENV === 'development') {
        logger.warn(`[${code}] ${statusCode} ${message}`);
    }

    // ── Response ─────────────────────────────────────────────────────────────
    const response = {
        success: false,
        error: message,
        code,
    };

    // Include field errors for 400s (helpful for form UX)
    if (errors && statusCode === 400) {
        response.errors = errors;
    }

    // Include stack in development
    if (process.env.NODE_ENV === 'development') {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
};

module.exports = errorHandler;