'use strict';

const xss = require('xss');

/**
 * Recursively sanitize an object's string properties using the xss library.
 */
const sanitizeObject = (obj) => {
    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    } else if (obj !== null && typeof obj === 'object') {
        Object.keys(obj).forEach(key => {
            obj[key] = sanitizeObject(obj[key]);
        });
        return obj;
    } else if (typeof obj === 'string') {
        // Sanitize string and trim
        return xss(obj).trim();
    }
    return obj;
};

const sanitizeMiddleware = (req, res, next) => {
    if (req.body) {
        req.body = sanitizeObject(req.body);
    }

    if (req.query) {
        req.query = sanitizeObject(req.query);
    }

    if (req.params) {
        req.params = sanitizeObject(req.params);
    }

    next();
};

module.exports = sanitizeMiddleware;