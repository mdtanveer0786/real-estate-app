const asyncHandler = require('express-async-handler');
const { sendEmail } = require('../utils/emailService');

// @desc    Handle contact form submission
// @route   POST /api/contact
// @access  Public
const submitContact = asyncHandler(async (req, res) => {
    const { name, email, phone, subject, message } = req.body;

    // Send email to admin
    await sendEmail({
        to: process.env.ADMIN_EMAIL || 'admin@estateelite.com',
        subject: `New Contact Form Submission: ${subject}`,
        html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <h3>Message:</h3>
      <p>${message}</p>
    `,
    });

    // Send auto-reply to user
    await sendEmail({
        to: email,
        subject: 'Thank you for contacting EstateElite',
        html: `
      <h2>Thank you for reaching out, ${name}!</h2>
      <p>We have received your message and will get back to you within 24 hours.</p>
      <h3>Your Message:</h3>
      <p>${message}</p>
      <p>Best regards,<br/>EstateElite Team</p>
    `,
    });

    res.json({
        success: true,
        message: 'Message sent successfully'
    });
});

module.exports = {
    submitContact,
};