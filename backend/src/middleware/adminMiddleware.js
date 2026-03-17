'use strict';

/**
 * Admin guard middleware.
 * Must be used AFTER the `protect` middleware which populates req.user.
 */
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({
        success: false,
        error: 'Access denied. Admin privileges required.',
    });
};

module.exports = { admin };
