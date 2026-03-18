'use strict';

const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

/**
 * Protect routes — verifies JWT access token from Authorization header.
 */
const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password -twoFactorSecret -refreshTokens');

            if (!req.user) {
                res.status(401);
                throw new Error('User no longer exists');
            }

            return next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                res.status(401);
                throw new Error('Access token expired');
            }
            res.status(401);
            throw new Error('Not authorized');
        }
    }

    res.status(401);
    throw new Error('Not authorized, no token');
});

/**
 * Optional auth — resolves user if token is present, otherwise continues as guest.
 */
const resolveUser = asyncHandler(async (req, res, next) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password -twoFactorSecret -refreshTokens');
        } catch {
            // Silently continue as guest
        }
    }
    next();
});

/**
 * Admin-only access.
 */
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403);
        throw new Error('Not authorized as admin');
    }
};

/**
 * Agent-or-admin access — agents can manage their own properties.
 */
const agentOrAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'agent')) {
        next();
    } else {
        res.status(403);
        throw new Error('Not authorized. Agent or admin access required.');
    }
};

/**
 * Authorize specific roles.
 * Usage: authorize('admin', 'agent')
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403);
            throw new Error(`Role '${req.user?.role}' is not authorized to access this route`);
        }
        next();
    };
};

module.exports = { protect, admin, agentOrAdmin, authorize, resolveUser };