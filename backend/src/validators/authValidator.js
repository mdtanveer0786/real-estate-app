'use strict';

const { z } = require('zod');

// ─── Auth Schemas ────────────────────────────────────────────────────────────

const registerSchema = z.object({
    name: z.string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name cannot exceed 50 characters')
        .trim(),
    email: z.string()
        .email('Please provide a valid email address')
        .toLowerCase()
        .trim(),
    password: z.string()
        .min(6, 'Password must be at least 6 characters')
        .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'Password must contain at least one letter and one number'),
    role: z.enum(['user', 'agent']).optional().default('user'),
});

const loginSchema = z.object({
    email: z.string()
        .email('Please provide a valid email address')
        .toLowerCase()
        .trim(),
    password: z.string()
        .min(1, 'Password is required'),
});

const forgotPasswordSchema = z.object({
    email: z.string()
        .email('Please provide a valid email address')
        .toLowerCase()
        .trim(),
});

const resetPasswordSchema = z.object({
    password: z.string()
        .min(6, 'Password must be at least 6 characters')
        .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'Password must contain at least one letter and one number'),
});

const updateProfileSchema = z.object({
    name: z.string().min(2).max(50).trim().optional(),
    email: z.string().email().toLowerCase().trim().optional(),
    phone: z.string().regex(/^\d{10}$/, 'Phone must be a valid 10-digit number').optional().or(z.literal('')),
    password: z.string().min(6).optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
});

const verify2FASchema = z.object({
    code: z.string()
        .length(6, '2FA code must be exactly 6 digits')
        .regex(/^\d+$/, '2FA code must contain only numbers'),
});

const verifyLoginWith2FASchema = z.object({
    tempToken: z.string().min(32, 'Invalid session'),
    code: z.string()
        .length(6, '2FA code must be exactly 6 digits')
        .regex(/^\d+$/, '2FA code must contain only numbers'),
});

module.exports = {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    updateProfileSchema,
    verify2FASchema,
    verifyLoginWith2FASchema,
};
