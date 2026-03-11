const asyncHandler = require('express-async-handler');
const { sendEmail, sendContactConfirmation } = require('../utils/emailService');

// @desc    Handle contact form submission
// @route   POST /api/contact
// @access  Public
const submitContact = asyncHandler(async (req, res) => {
    const { name, email, phone, subject, message } = req.body;

    // Validate required fields
    if (!name || !name.trim()) {
        res.status(400);
        throw new Error('Name is required');
    }
    if (!email || !email.trim()) {
        res.status(400);
        throw new Error('Email is required');
    }
    if (!subject || !subject.trim()) {
        res.status(400);
        throw new Error('Subject is required');
    }
    if (!message || !message.trim()) {
        res.status(400);
        throw new Error('Message is required');
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        res.status(400);
        throw new Error('Please provide a valid email address');
    }

    try {
        // Send email to admin
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
        `,
        });

        // Send auto-reply to user
        await sendContactConfirmation({ name, email, subject, message });

        res.json({
            success: true,
            message: 'Message sent successfully',
        });
    } catch (error) {
        console.error('Contact form email error:', error.message);
        res.status(500);
        throw new Error('Failed to send message. Please try again later.');
    }
});

module.exports = {
    submitContact,
};