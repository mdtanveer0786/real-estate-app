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

<<<<<<< HEAD
    // Populate property title then fire emails non-blocking
    Inquiry.findById(inquiry._id).populate('property', 'title').then(populated => {
        sendInquiryConfirmation(populated)
            .catch(err => console.error('Inquiry user email failed:', err.message));
        sendInquiryToAdmin(populated)
            .catch(err => console.error('Inquiry admin email failed:', err.message));
    }).catch(err => console.error('Inquiry email populate failed:', err.message));

    res.status(201).json({ success: true, inquiry });
=======
    if (inquiry) {
        // Send emails (await to ensure they are sent or errors are caught)
        try {
            const populatedInquiry = await Inquiry.findById(inquiry._id).populate('property', 'title');
            
            // Send confirmation to user
            try {
                await sendInquiryConfirmation(populatedInquiry);
                console.log('✅ User inquiry confirmation sent.');
            } catch (err) {
                console.warn('⚠️ User inquiry email failed:', err.message);
            }
            
            // Send notification to admin (mandatory)
            await sendInquiryToAdmin(populatedInquiry);
            console.log('✅ Admin inquiry notification sent.');

            res.status(201).json(inquiry);
        } catch (error) {
            console.error('❌ Inquiry email error:', error.message);
            // We already created the inquiry in DB, but let's inform the user that notification failed
            res.status(201).json({
                ...inquiry.toObject(),
                warning: 'Inquiry saved but notification email failed to send. Our team will still see it in the dashboard.',
            });
        }
    } else {
        res.status(400);
        throw new Error('Invalid inquiry data');
    }
>>>>>>> f09f67a4d9c30a8a79cb18e0aff6098a770e46e2
});

// @desc   Get all inquiries
// @route  GET /api/inquiries
// @access Private/Admin
const getInquiries = asyncHandler(async (req, res) => {
    const inquiries = await Inquiry.find({})
        .populate('property', 'title price')
        .populate('user', 'name email')
        .sort({ createdAt: -1 });
    res.json({ success: true, inquiries });
});

// @desc   Update inquiry status
// @route  PUT /api/inquiries/:id
// @access Private/Admin
const updateInquiryStatus = asyncHandler(async (req, res) => {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) { res.status(404); throw new Error('Inquiry not found'); }

    const allowed = ['new', 'contacted', 'closed'];
    if (req.body.status && !allowed.includes(req.body.status)) {
        res.status(400); throw new Error('Invalid status value');
    }

    inquiry.status = req.body.status || inquiry.status;
    const updated = await inquiry.save();
    res.json({ success: true, inquiry: updated });
});

module.exports = { createInquiry, getInquiries, updateInquiryStatus };
