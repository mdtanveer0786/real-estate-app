'use strict';

const asyncHandler = require('express-async-handler');
const { sendContactConfirmation, sendContactToAdmin } = require('../utils/emailService');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// @desc   Handle contact form submission
// @route  POST /api/contact
// @access Public
const submitContact = asyncHandler(async (req, res) => {
    const { name, email, phone, subject, message } = req.body;

    // ── Validation ──────────────────────────────────────────────────────────
    if (!name?.trim())    { res.status(400); throw new Error('Name is required'); }
    if (!email?.trim())   { res.status(400); throw new Error('Email is required'); }
    if (!EMAIL_RE.test(email)) { res.status(400); throw new Error('Please provide a valid email address'); }
    if (!subject?.trim()) { res.status(400); throw new Error('Subject is required'); }
    if (!message?.trim()) { res.status(400); throw new Error('Message is required'); }

    const contactData = {
        name:    name.trim(),
        email:   email.trim().toLowerCase(),
        phone:   phone?.trim() || '',
        subject: subject.trim(),
        message: message.trim(),
    };

    // ── Send emails concurrently ────────────────────────────────────────────
    // Both are fire-and-forget: a failed email never causes a 500 for the user.
    const [adminResult, userResult] = await Promise.allSettled([
        sendContactToAdmin(contactData),
        sendContactConfirmation(contactData),
    ]);

    if (adminResult.status === 'rejected') {
        console.error('Admin contact email failed:', adminResult.reason?.message);
    } else {
        console.info('Admin contact email sent.');
    }

    if (userResult.status === 'rejected') {
        console.error('User auto-reply email failed:', userResult.reason?.message);
    } else {
        console.info('User auto-reply email sent to:', contactData.email);
    }

    res.status(200).json({
        success: true,
        message: 'Your message has been received. We will get back to you within 24 hours.',
    });
});

module.exports = { submitContact };
