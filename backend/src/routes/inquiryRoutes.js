'use strict';

const express = require('express');
const router = express.Router();
const { validate } = require('../middleware/validate');
const { inquirySchema } = require('../validators/propertyValidator');
const {
    createInquiry,
    getInquiries,
    updateInquiryStatus,
} = require('../controllers/inquiryController');
const { protect, admin, agentOrAdmin, resolveUser } = require('../middleware/authMiddleware');

router.route('/')
    .post(resolveUser, validate(inquirySchema), createInquiry)
    .get(protect, agentOrAdmin, getInquiries);

router.put('/:id', protect, agentOrAdmin, updateInquiryStatus);

module.exports = router;