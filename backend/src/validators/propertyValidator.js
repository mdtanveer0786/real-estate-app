'use strict';

const { z } = require('zod');

// ─── Property Schemas ────────────────────────────────────────────────────────

const locationSchema = z.object({
    address: z.string().min(1, 'Address is required').max(300),
    city: z.string().min(1, 'City is required').max(100),
    state: z.string().min(1, 'State is required').max(100),
    pincode: z.string().regex(/^\d{6}$/, 'Pincode must be exactly 6 digits'),
    coordinates: z.object({
        type: z.literal('Point').optional().default('Point'),
        coordinates: z.tuple([z.number(), z.number()]).optional().default([0, 0]),
    }).optional(),
});

const areaSchema = z.object({
    value: z.number().positive('Area must be a positive number'),
    unit: z.enum(['sqft', 'sqm']).default('sqft'),
});

const amenityEnum = z.enum([
    'parking', 'gym', 'pool', 'garden', 'security',
    'elevator', 'power_backup', 'water_supply', 'clubhouse',
    'playground', 'wifi', 'ac', 'furnished', 'pet_friendly',
    'balcony', 'terrace', 'storage', 'cctv', 'intercom',
]);

const createPropertySchema = z.object({
    title: z.string()
        .min(5, 'Title must be at least 5 characters')
        .max(150, 'Title cannot exceed 150 characters')
        .trim(),
    description: z.string()
        .min(20, 'Description must be at least 20 characters')
        .max(5000)
        .trim(),
    price: z.number()
        .positive('Price must be a positive number'),
    location: locationSchema,
    type: z.enum(['buy', 'rent'], { errorMap: () => ({ message: 'Type must be "buy" or "rent"' }) }),
    propertyType: z.enum(
        ['apartment', 'house', 'villa', 'commercial', 'plot', 'penthouse'],
        { errorMap: () => ({ message: 'Invalid property type' }) }
    ),
    bedrooms: z.number().int().min(0, 'Bedrooms must be 0 or more'),
    bathrooms: z.number().int().min(0, 'Bathrooms must be 0 or more'),
    area: areaSchema,
    features: z.array(z.string().max(100)).max(20).optional().default([]),
    amenities: z.array(amenityEnum).max(19).optional().default([]),
    featured: z.boolean().optional().default(false),
    status: z.enum(['available', 'sold', 'rented', 'pending', 'draft']).optional().default('available'),
});

const updatePropertySchema = createPropertySchema.partial();

// ─── Inquiry / Contact Schemas ───────────────────────────────────────────────

const inquirySchema = z.object({
    propertyId: z.string().min(1, 'Property ID is required'),
    name: z.string().min(1, 'Name is required').max(100).trim(),
    email: z.string().email('Invalid email address').toLowerCase().trim(),
    phone: z.string().regex(/^\d{10}$/, 'Phone must be a valid 10-digit number'),
    message: z.string().min(1, 'Message is required').max(2000).trim(),
});

const contactSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100).trim(),
    email: z.string().email('Invalid email address').toLowerCase().trim(),
    subject: z.string().min(1, 'Subject is required').max(200).trim().optional(),
    phone: z.string().optional(),
    message: z.string().min(1, 'Message is required').max(5000).trim(),
});

// ─── Review Schema ───────────────────────────────────────────────────────────

const createReviewSchema = z.object({
    rating: z.number().int().min(1, 'Rating must be 1–5').max(5, 'Rating must be 1–5'),
    title: z.string().max(100).trim().optional(),
    comment: z.string().min(1, 'Comment is required').max(1000).trim(),
});

module.exports = {
    createPropertySchema,
    updatePropertySchema,
    inquirySchema,
    contactSchema,
    createReviewSchema,
};
