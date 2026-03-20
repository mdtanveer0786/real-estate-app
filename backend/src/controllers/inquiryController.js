'use strict';

const asyncHandler = require('express-async-handler');
const Inquiry = require('../models/Inquiry');
const { sendInquiryConfirmation, sendInquiryToAdmin } = require('../utils/emailService');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// @desc   Create new inquiry
// @route  POST /api/inquiries
// @access Public (optional auth)
const createInquiry = asyncHandler(async (req, res) => {
    const { propertyId, name, email, phone, message } = req.body;

    if (!propertyId)          { res.status(400); throw new Error('Property ID is required'); }
    if (!name?.trim())        { res.status(400); throw new Error('Name is required'); }
    if (!email?.trim())       { res.status(400); throw new Error('Email is required'); }
    if (!EMAIL_RE.test(email)){ res.status(400); throw new Error('Invalid email address'); }
    if (!phone?.trim())       { res.status(400); throw new Error('Phone number is required'); }
    if (!message?.trim())     { res.status(400); throw new Error('Message is required'); }

    const inquiry = await Inquiry.create({
        property: propertyId,
        user:     req.user?._id,
        name:     name.trim(),
        email:    email.trim().toLowerCase(),
        phone:    phone.trim(),
        message:  message.trim(),
    });

    if (inquiry) {
        // Increment inquiryCount on property
        const Property = require('../models/Property');
        await Property.findByIdAndUpdate(propertyId, { $inc: { inquiryCount: 1 } });

        // Populate property title then fire emails non-blocking
        Inquiry.findById(inquiry._id).populate('property', 'title').then(populated => {
            sendInquiryConfirmation(populated)
                .catch(err => console.error('Inquiry user email failed:', err.message));
            sendInquiryToAdmin(populated)
                .catch(err => console.error('Inquiry admin email failed:', err.message));
        }).catch(err => console.error('Inquiry email populate failed:', err.message));

        res.status(201).json({ success: true, inquiry });
    } else {
        res.status(400);
        throw new Error('Invalid inquiry data');
    }
});

// @desc   Get all inquiries
// @route  GET /api/inquiries
// @access Private/Agent/Admin
const getInquiries = asyncHandler(async (req, res) => {
    let filter = {};

    // Agents only see inquiries for their properties
    if (req.user.role === 'agent') {
        const Property = require('../models/Property');
        const agentProperties = await Property.find({ createdBy: req.user._id }).select('_id');
        const propertyIds = agentProperties.map(p => p._id);
        filter = { property: { $in: propertyIds } };
    }

    const inquiries = await Inquiry.find(filter)
        .populate('property', 'title price createdBy')
        .populate('user', 'name email')
        .sort({ createdAt: -1 });
    res.json({ success: true, inquiries });
});

// @desc   Update inquiry status
// @route  PUT /api/inquiries/:id
// @access Private/Agent/Admin
const updateInquiryStatus = asyncHandler(async (req, res) => {
    const inquiry = await Inquiry.findById(req.params.id).populate('property', 'createdBy');
    if (!inquiry) { res.status(404); throw new Error('Inquiry not found'); }

    // Agents can only update status for their own properties
    if (req.user.role === 'agent' && inquiry.property.createdBy.toString() !== req.user._id.toString()) {
        res.status(403); throw new Error('Not authorized to update this inquiry');
    }

    const allowed = ['new', 'contacted', 'closed'];
    if (req.body.status && !allowed.includes(req.body.status)) {
        res.status(400); throw new Error('Invalid status value');
    }

    inquiry.status = req.body.status || inquiry.status;
    const updated = await inquiry.save();
    res.json({ success: true, inquiry: updated });
});

module.exports = { createInquiry, getInquiries, updateInquiryStatus };
