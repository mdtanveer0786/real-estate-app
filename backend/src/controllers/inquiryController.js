const asyncHandler = require('express-async-handler');
const Inquiry = require('../models/Inquiry');
const { sendInquiryConfirmation, sendInquiryToAdmin } = require('../utils/emailService');

// @desc    Create new inquiry
// @route   POST /api/inquiries
// @access  Public
const createInquiry = asyncHandler(async (req, res) => {
    const { propertyId, name, email, phone, message } = req.body;

    const inquiry = await Inquiry.create({
        property: propertyId,
        user: req.user?._id,
        name,
        email,
        phone,
        message,
    });

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
});

// @desc    Get all inquiries (Admin)
// @route   GET /api/inquiries
// @access  Private/Admin
const getInquiries = asyncHandler(async (req, res) => {
    const inquiries = await Inquiry.find({})
        .populate('property', 'title price')
        .populate('user', 'name email')
        .sort({ createdAt: -1 });

    res.json(inquiries);
});

// @desc    Update inquiry status
// @route   PUT /api/inquiries/:id
// @access  Private/Admin
const updateInquiryStatus = asyncHandler(async (req, res) => {
    const inquiry = await Inquiry.findById(req.params.id);

    if (inquiry) {
        inquiry.status = req.body.status || inquiry.status;
        const updatedInquiry = await inquiry.save();
        res.json(updatedInquiry);
    } else {
        res.status(404);
        throw new Error('Inquiry not found');
    }
});

module.exports = {
    createInquiry,
    getInquiries,
    updateInquiryStatus,
};