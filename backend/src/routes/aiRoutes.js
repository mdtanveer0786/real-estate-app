'use strict';

const express = require('express');
const router = express.Router();
const { getRecommendations, predictPrice, chat } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

// Public endpoints
router.post('/predict-price', predictPrice);
router.post('/chat', chat);

// Protected endpoints
router.get('/recommendations', protect, getRecommendations);

module.exports = router;
