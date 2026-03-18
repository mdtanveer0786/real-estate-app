'use strict';

const jwt = require('jsonwebtoken');

/**
 * Generate a short-lived access token (15 minutes).
 * Sent in the JSON response body — stored in-memory on the client.
 */
const generateAccessToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m',
    });

/**
 * Generate a long-lived refresh token (7 days).
 * Sent in an HTTP-only cookie — never accessible from JavaScript.
 */
const generateRefreshToken = (id) =>
    jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
    });

/**
 * Legacy helper — returns an access token with the old 7d expiry.
 * Use only during transition; prefer generateAccessToken + generateRefreshToken.
 */
const generateToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d',
    });

module.exports = { generateAccessToken, generateRefreshToken, generateToken };