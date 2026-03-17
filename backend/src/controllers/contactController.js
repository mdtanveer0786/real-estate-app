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

<<<<<<< HEAD
    res.status(200).json({
        success: true,
        message: 'Your message has been received. We will get back to you within 24 hours.',
    });
=======
    try {
        // Send email to admin (mandatory)
        await sendEmail({
            to: process.env.ADMIN_EMAIL || 'realestateeliteteam01@gmail.com',
            subject: `New Contact Form Submission: ${subject}`,
            html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">New Contact Message 📩</h1>
        </div>
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <h3 style="color: #667eea;">Message:</h3>
          <div style="background: #f7f7f7; padding: 15px; border-radius: 8px;">
            <p style="margin: 0;">${message}</p>
          </div>
        </div>
      </div>
    `
        });
        console.log('✅ Admin email sent successfully.');

        // Send auto-reply to user (optional, don't throw if fails)
        try {
            await sendContactConfirmation({ name, email, subject, message });
            console.log('✅ User confirmation email sent successfully.');
        } catch (userErr) {
            console.warn('⚠️ Failed to send user confirmation email:', userErr.message);
        }

        res.json({
            success: true,
            message: 'Message sent successfully! Our team will contact you soon.',
        });
    } catch (error) {
        console.error('❌ Contact form email error:', error.message);
        res.status(500);
        throw new Error('Failed to send your message. Please try again or use the email/phone provided.');
    }
>>>>>>> f09f67a4d9c30a8a79cb18e0aff6098a770e46e2
});

module.exports = { submitContact };
