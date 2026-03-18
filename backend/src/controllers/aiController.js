'use strict';

const asyncHandler = require('express-async-handler');
const AIService = require('../services/aiService');

// @desc    Get personalized recommendations
// @route   GET /api/ai/recommendations
// @access  Private
const getRecommendations = asyncHandler(async (req, res) => {
    const result = await AIService.getRecommendations(req.user._id, {
        limit: Number(req.query.limit) || 8,
    });
    res.json({ success: true, ...result });
});

// @desc    Predict property price
// @route   POST /api/ai/predict-price
// @access  Public
const predictPrice = asyncHandler(async (req, res) => {
    const { city, propertyType, bedrooms, bathrooms, area, type } = req.body;

    if (!city || !propertyType || !bedrooms || !area) {
        res.status(400);
        throw new Error('city, propertyType, bedrooms, and area are required');
    }

    const prediction = await AIService.predictPrice({
        city, propertyType,
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms) || 1,
        area: Number(area),
        type: type || 'buy',
    });

    res.json({ success: true, ...prediction });
});

// @desc    AI chatbot
// @route   POST /api/ai/chat
// @access  Public (userId optional)
const chat = asyncHandler(async (req, res) => {
    const { message } = req.body;
    if (!message?.trim()) {
        res.status(400);
        throw new Error('Message is required');
    }

    const userId = req.user?._id || null;
    const response = await AIService.chatbot(message, userId);
    res.json({ success: true, ...response });
});

module.exports = { getRecommendations, predictPrice, chat };
