const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Send email
const sendEmail = async (options) => {
    try {
        const mailOptions = {
            from: `"EstateElite" <${process.env.EMAIL_FROM}>`,
            to: options.to,
            subject: options.subject,
            html: options.html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('Email error:', error);
        throw new Error('Failed to send email');
    }
};

// Send inquiry confirmation
const sendInquiryConfirmation = async (inquiry) => {
    const html = `
    <h2>Thank you for your inquiry</h2>
    <p>Dear ${inquiry.name},</p>
    <p>We have received your inquiry regarding the property. Our team will contact you shortly.</p>
    <h3>Inquiry Details:</h3>
    <ul>
      <li>Property: ${inquiry.property?.title}</li>
      <li>Message: ${inquiry.message}</li>
      <li>Phone: ${inquiry.phone}</li>
    </ul>
    <p>Best regards,<br/>EstateElite Team</p>
  `;

    return sendEmail({
        to: inquiry.email,
        subject: 'Inquiry Received - EstateElite',
        html,
    });
};

// Send welcome email
const sendWelcomeEmail = async (user) => {
    const html = `
    <h2>Welcome to EstateElite!</h2>
    <p>Dear ${user.name},</p>
    <p>Thank you for registering with EstateElite. We're excited to help you find your dream property.</p>
    <h3>Get Started:</h3>
    <ul>
      <li>Browse our <a href="${process.env.FRONTEND_URL}/properties">properties</a></li>
      <li>Save your favorite properties to your wishlist</li>
      <li>Contact property owners directly</li>
    </ul>
    <p>If you have any questions, feel free to contact our support team.</p>
    <p>Best regards,<br/>EstateElite Team</p>
  `;

    return sendEmail({
        to: user.email,
        subject: 'Welcome to EstateElite!',
        html,
    });
};

// Send password reset email
const sendPasswordResetEmail = async (user, resetToken) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const html = `
    <h2>Password Reset Request</h2>
    <p>Dear ${user.name},</p>
    <p>You requested a password reset. Click the link below to reset your password:</p>
    <p><a href="${resetUrl}">Reset Password</a></p>
    <p>This link will expire in 1 hour.</p>
    <p>If you didn't request this, please ignore this email.</p>
    <p>Best regards,<br/>EstateElite Team</p>
  `;

    return sendEmail({
        to: user.email,
        subject: 'Password Reset - EstateElite',
        html,
    });
};

module.exports = {
    sendEmail,
    sendInquiryConfirmation,
    sendWelcomeEmail,
    sendPasswordResetEmail,
};