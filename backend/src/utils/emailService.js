const nodemailer = require('nodemailer');

// Lazy transporter - created on first use to ensure env vars are loaded
let transporter = null;

const getTransporter = () => {
    if (!transporter) {
        const isSecure = process.env.EMAIL_SECURE === 'true';
        transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.EMAIL_PORT) || 587,
            secure: isSecure,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            // Connection timeout settings
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 15000,
            tls: {
                rejectUnauthorized: false // Often needed for some SMTP servers to prevent SSL errors
            }
        });
    }
    return transporter;
};

// Verify transporter connection (call on server startup)
const verifyEmailConnection = async () => {
    try {
        const t = getTransporter();
        await t.verify();
        console.log('✅ Email service is ready to send emails');
        return true;
    } catch (error) {
        console.error('❌ Email service verification failed:', error.message);
        console.error('   Check EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS in .env');
        return false;
    }
};

// Send email with retry
const sendEmail = async (options, retries = 2) => {
    try {
        const t = getTransporter();
        const recipients = Array.isArray(options.to) ? options.to.join(', ') : options.to;

        const mailOptions = {
            from: `"EstateElite" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
            to: recipients,
            subject: options.subject,
            html: options.html,
        };

        const info = await t.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', info.messageId, 'to:', recipients);
        return info;
    } catch (error) {
        console.error(`❌ Email send failed (attempt ${3 - retries}/3):`, error.message);
        
        if (retries > 0) {
            // Reset transporter on connection errors
            if (error.code === 'ECONNREFUSED' || error.code === 'ESOCKET' || error.code === 'EAUTH') {
                transporter = null;
            }
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 2000));
            return sendEmail(options, retries - 1);
        }
        
        throw new Error(`Failed to send email: ${error.message}`);
    }
};

// Send inquiry confirmation to user
const sendInquiryConfirmation = async (inquiry) => {
    const html = `
    <h2>Thank you for your inquiry</h2>
    <p>Dear ${inquiry.name},</p>
    <p>We have received your inquiry regarding the property. Our team will contact you shortly.</p>
    <h3>Inquiry Details:</h3>
    <ul>
      <li>Property: ${inquiry.property?.title || 'N/A'}</li>
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

// Send inquiry notification to admin
const sendInquiryToAdmin = async (inquiry) => {
    const html = `
    <h2>New Property Inquiry</h2>
    <p>A new inquiry has been submitted for a property.</p>
    <h3>Inquiry Details:</h3>
    <ul>
      <li><strong>Property:</strong> ${inquiry.property?.title || 'N/A'}</li>
      <li><strong>Name:</strong> ${inquiry.name}</li>
      <li><strong>Email:</strong> ${inquiry.email}</li>
      <li><strong>Phone:</strong> ${inquiry.phone}</li>
    </ul>
    <h3>Message:</h3>
    <p>${inquiry.message}</p>
    <p>Please log in to the admin dashboard to manage this inquiry.</p>
  `;

    return sendEmail({
        to: process.env.ADMIN_EMAIL || 'realestateeliteteam01@gmail.com',
        subject: `New Inquiry: ${inquiry.property?.title || 'Property'}`,
        html,
    });
};

// Send welcome email
const sendWelcomeEmail = async (user) => {
    const frontendUrl = process.env.FRONTEND_URL || 'https://real-estateelite.vercel.app';
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">Welcome to EstateElite! 🏠</h1>
      </div>
      <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px;">Dear ${user.name},</p>
        <p style="font-size: 14px; color: #555;">Thank you for registering with EstateElite. We're excited to help you find your dream property.</p>
        <h3 style="color: #667eea;">Get Started:</h3>
        <ul style="font-size: 14px; color: #555;">
          <li>Browse our <a href="${frontendUrl}/properties" style="color: #667eea;">properties</a></li>
          <li>Save your favorite properties to your wishlist</li>
          <li>Contact property owners directly</li>
        </ul>
        <p style="font-size: 14px; color: #555;">If you have any questions, feel free to contact our support team.</p>
        <p style="font-size: 14px; color: #555;">Best regards,<br/><strong>EstateElite Team</strong></p>
      </div>
    </div>
  `;

    return sendEmail({
        to: user.email,
        subject: 'Welcome to EstateElite! 🏠',
        html,
    });
};

// Send password reset email
const sendPasswordResetEmail = async (user, resetToken) => {
    const frontendUrl = process.env.FRONTEND_URL || 'https://real-estateelite.vercel.app';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">Password Reset Request 🔐</h1>
      </div>
      <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px;">Dear ${user.name},</p>
        <p style="font-size: 14px; color: #555;">You requested a password reset. Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">Reset Password</a>
        </div>
        <p style="font-size: 12px; color: #999;">Or copy and paste this link: <a href="${resetUrl}" style="color: #667eea;">${resetUrl}</a></p>
        <p style="font-size: 14px; color: #e74c3c;"><strong>This link will expire in 10 minutes.</strong></p>
        <p style="font-size: 14px; color: #555;">If you didn't request this, please ignore this email.</p>
        <p style="font-size: 14px; color: #555;">Best regards,<br/><strong>EstateElite Team</strong></p>
      </div>
    </div>
  `;

    return sendEmail({
        to: user.email,
        subject: 'Password Reset - EstateElite',
        html,
    });
};

// Send contact form confirmation
const sendContactConfirmation = async (contactData) => {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">Message Received! ✉️</h1>
      </div>
      <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px;">Dear ${contactData.name},</p>
        <p style="font-size: 14px; color: #555;">Thank you for reaching out to us. We have received your message and will get back to you within 24 hours.</p>
        <h3 style="color: #667eea;">Your Message:</h3>
        <div style="background: #f7f7f7; padding: 15px; border-radius: 8px; margin: 10px 0;">
          <p style="font-size: 14px; color: #555; margin: 0;"><strong>Subject:</strong> ${contactData.subject}</p>
          <p style="font-size: 14px; color: #555; margin: 10px 0 0;">${contactData.message}</p>
        </div>
        <p style="font-size: 14px; color: #555;">Best regards,<br/><strong>EstateElite Team</strong></p>
      </div>
    </div>
  `;

    return sendEmail({
        to: contactData.email,
        subject: 'Thank you for contacting EstateElite',
        html,
    });
};

module.exports = {
    sendEmail,
    sendInquiryConfirmation,
    sendInquiryToAdmin,
    sendWelcomeEmail,
    sendPasswordResetEmail,
    sendContactConfirmation,
    verifyEmailConnection,
};