'use strict';

const { ZodError } = require('zod');

/**
 * Zod validation middleware factory.
 *
 * Usage:
 *   router.post('/register', validate(registerSchema), registerUser);
 *
 * It validates `req.body` against the provided Zod schema.
 * On failure, returns a 400 with structured error details.
 */
const validate = (schema) => (req, res, next) => {
    try {
        // Parse and transform (e.g. lowercase, trim)
        const parsed = schema.parse(req.body);

        // Replace req.body with the cleaned data
        req.body = parsed;

        next();
    } catch (error) {
        if (error instanceof ZodError) {
            const errors = error.errors.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
            }));

            return res.status(400).json({
                success: false,
                error: errors[0]?.message || 'Validation failed',
                errors,
            });
        }

        // Unexpected error
        next(error);
    }
};

/**
 * Validate query parameters.
 */
const validateQuery = (schema) => (req, res, next) => {
    try {
        req.query = schema.parse(req.query);
        next();
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                success: false,
                error: error.errors[0]?.message || 'Invalid query parameters',
            });
        }
        next(error);
    }
};

/**
 * Validate route parameters.
 */
const validateParams = (schema) => (req, res, next) => {
    try {
        req.params = schema.parse(req.params);
        next();
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                success: false,
                error: error.errors[0]?.message || 'Invalid parameters',
            });
        }
        next(error);
    }
};

module.exports = { validate, validateQuery, validateParams };
