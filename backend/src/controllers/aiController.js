'use strict';

const asyncHandler = require('express-async-handler');
const AIService    = require('../services/aiService');

// GET /api/ai/recommendations
const getRecommendations = asyncHandler(async (req, res) => {
    const result = await AIService.getRecommendations(req.user._id, {
        limit: Math.min(Number(req.query.limit) || 8, 20),
    });
    res.json({ success: true, ...result });
});

// POST /api/ai/predict-price
const predictPrice = asyncHandler(async (req, res) => {
    const { city, propertyType, bedrooms, bathrooms, area, type } = req.body;
    if (!city || !propertyType || !bedrooms || !area) {
        res.status(400);
        throw new Error('city, propertyType, bedrooms, and area are required');
    }
    const prediction = await AIService.predictPrice({
        city, propertyType,
        bedrooms:  Number(bedrooms),
        bathrooms: Number(bathrooms) || 1,
        area:      Number(area),
        type:      type || 'buy',
    });
    res.json({ success: true, ...prediction });
});

// POST /api/ai/chat
const chat = asyncHandler(async (req, res) => {
    const { message, history } = req.body;
    if (!message?.trim()) { res.status(400); throw new Error('Message is required'); }

    const userId  = req.user?._id || null;
    const response = await AIService.chatbot(message, userId, history || []);
    res.json({ success: true, ...response });
});

module.exports = { getRecommendations, predictPrice, chat };
