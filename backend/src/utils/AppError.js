'use strict';

/**
 * Custom application error with HTTP status code and error code.
 *
 * Usage:
 *   throw new AppError('User not found', 404, 'USER_NOT_FOUND');
 *   throw AppError.badRequest('Email is required');
 *   throw AppError.notFound('Property');
 */
class AppError extends Error {
    constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = true; // Distinguishes from programming errors
        Error.captureStackTrace(this, this.constructor);
    }

    // ── Factory methods ──────────────────────────────────────────────────────

    static badRequest(message = 'Bad request', code = 'BAD_REQUEST') {
        return new AppError(message, 400, code);
    }

    static unauthorized(message = 'Not authorized', code = 'UNAUTHORIZED') {
        return new AppError(message, 401, code);
    }

    static forbidden(message = 'Not authorized to access this resource', code = 'FORBIDDEN') {
        return new AppError(message, 403, code);
    }

    static notFound(resource = 'Resource', code = 'NOT_FOUND') {
        return new AppError(`${resource} not found`, 404, code);
    }

    static conflict(message = 'Resource already exists', code = 'CONFLICT') {
        return new AppError(message, 409, code);
    }

    static tooMany(message = 'Too many requests. Please try again later.', code = 'RATE_LIMIT') {
        return new AppError(message, 429, code);
    }

    static internal(message = 'Internal server error', code = 'INTERNAL_ERROR') {
        return new AppError(message, 500, code);
    }
}

module.exports = AppError;
