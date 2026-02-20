const asyncHandler = require('express-async-handler');
const Inquiry = require('../models/Inquiry');

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
        res.status(201).json(inquiry);
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