'use strict';

const nodemailer = require('nodemailer');

// ─── Transporter (singleton, lazy-initialised) ────────────────────────────────
let _transporter = null;

const getTransporter = () => {
    if (_transporter) return _transporter;

    const user = process.env.EMAIL_USER;
    const pass = (process.env.EMAIL_PASS || '').replace(/\s+/g, '');
    const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.EMAIL_PORT, 10) || 587;
    const secure = process.env.EMAIL_SECURE === 'true' || port === 465;

    // Use 'service: gmail' if it's a gmail address or host
    const isGmail = host.includes('gmail.com') || (user && user.endsWith('@gmail.com'));

    if (isGmail) {
        _transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user, pass },
            tls: { rejectUnauthorized: false },
        });
    } else {
        _transporter = nodemailer.createTransport({
            host,
            port,
            secure,
            auth: { user, pass },
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 15000,
            tls: { rejectUnauthorized: false },
        });
    }
    return _transporter;
};

// ─── Connection health-check ─────────────────────────────────────────────────
const verifyEmailConnection = async () => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('⚠️ EMAIL_USER / EMAIL_PASS not set - email service disabled.');
        return false;
    }
    try {
        const t = getTransporter();
        
        // Log environment warning for FRONTEND_URL
        const frontendUrl = process.env.FRONTEND_URL;
        if (frontendUrl && frontendUrl.includes('vercel.app') && (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV)) {
            console.warn('⚠️  Warning: FRONTEND_URL points to a production site (vercel.app) but server is in development mode.');
            console.warn('   Email links (password reset, verification) will point to the deployed site, not localhost.');
        }

        await t.verify();
        console.info('✅ Email service connected and ready.');
        return true;
    } catch (err) {
        console.error('❌ Email service verification failed:', err.message);
        if (err.code === 'EAUTH') {
            console.error('   Hint: Check your EMAIL_USER and EMAIL_PASS. For Gmail, you may need an App Password.');
        }
        return false;
    }
};

// ─── Core send helper (with 1 automatic retry) ───────────────────────────────
const sendEmail = async (options, retries = 1) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error('Email credentials not configured.');
    }
    const to   = Array.isArray(options.to) ? options.to.join(', ') : options.to;
    const from = `"EstateElite" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`;
    try {
        const info = await getTransporter().sendMail({
            from,
            to,
            subject: options.subject,
            html: options.html,
            text: options.text || options.html.replace(/<[^>]+>/g, ' '),
        });
        console.info('Email sent to ' + to + ' msgId: ' + info.messageId);
        return info;
    } catch (err) {
        console.error(`❌ Email failed (attempt ${2 - retries}/2): ${err.message}`);
        
        if (['ECONNREFUSED','ESOCKET','EAUTH','ETIMEDOUT'].includes(err.code)) {
            _transporter = null;
        }

        if (err.code === 'EAUTH') {
            console.error('   Hint: Authentication failed. Check your EMAIL_USER/PASS or enable App Passwords for Gmail.');
        } else if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
            console.error('   Hint: Connection refused or timed out. Check your EMAIL_HOST and EMAIL_PORT.');
        }

        if (retries > 0) {
            await new Promise(r => setTimeout(r, 2000));
            return sendEmail(options, retries - 1);
        }
        throw new Error('Failed to send email: ' + err.message);
    }
};

// ─── Shared layout + helpers ─────────────────────────────────────────────────
const FRONTEND_URL = () => process.env.FRONTEND_URL || 'https://real-estateelite.vercel.app';
const YEAR = new Date().getFullYear();

const PRIMARY  = 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)';
const DANGER   = 'linear-gradient(135deg,#f093fb 0%,#f5576c 100%)';
const SUCCESS  = 'linear-gradient(135deg,#11998e 0%,#38ef7d 100%)';
const INFO     = 'linear-gradient(135deg,#4facfe 0%,#00f2fe 100%)';

const layout = (title, gradient, body) => `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>${title}</title></head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
<tr><td style="background:${gradient};padding:36px 40px;text-align:center;">
  <p style="margin:0 0 6px;font-size:12px;color:rgba(255,255,255,0.75);letter-spacing:2px;text-transform:uppercase;">EstateElite</p>
  <h1 style="margin:0;font-size:24px;font-weight:700;color:#fff;">${title}</h1>
</td></tr>
<tr><td style="padding:36px 40px;color:#374151;">${body}</td></tr>
<tr><td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;text-align:center;">
  <p style="margin:0;font-size:12px;color:#9ca3af;">
    &copy; ${YEAR} EstateElite &middot; All rights reserved<br/>
    <a href="${FRONTEND_URL()}/contact" style="color:#667eea;text-decoration:none;">Support</a>
    &nbsp;&middot;&nbsp;
    <a href="${FRONTEND_URL()}" style="color:#667eea;text-decoration:none;">Website</a>
  </p>
</td></tr>
</table></td></tr></table></body></html>`;

const btn = (href, label, g) =>
  `<div style="text-align:center;margin:32px 0;"><a href="${href}" style="display:inline-block;padding:14px 36px;background:${g || PRIMARY};color:#fff;font-size:15px;font-weight:700;border-radius:8px;text-decoration:none;">${label}</a></div>`;

const row = (k, v) =>
  `<tr><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:14px;color:#6b7280;width:130px;vertical-align:top;">${k}</td><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:14px;color:#111827;font-weight:500;vertical-align:top;">${v}</td></tr>`;

// ─── 1. Welcome (sent immediately after registration) ────────────────────────
const sendWelcomeEmail = (user) => {
    const html = layout('Welcome to EstateElite 🏠', PRIMARY, `
      <p style="font-size:16px;margin:0 0 8px;">Hi <strong>${user.name}</strong>,</p>
      <p style="font-size:14px;color:#6b7280;line-height:1.7;margin:0 0 20px;">
        Your EstateElite account has been created successfully. We are thrilled to have you on board.
      </p>
      <div style="background:#f0f4ff;border-left:4px solid #667eea;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:24px;">
        <p style="margin:0;font-size:13px;color:#374151;"><strong>Account Details</strong></p>
        <p style="margin:6px 0 0;font-size:13px;color:#6b7280;">Email: ${user.email}</p>
      </div>
      <p style="font-size:14px;font-weight:600;color:#374151;margin:0 0 10px;">Get started:</p>
      <ul style="font-size:14px;color:#6b7280;line-height:2;padding-left:20px;margin:0 0 28px;">
        <li>Browse our latest property listings</li>
        <li>Save favourites to your personal wishlist</li>
        <li>Contact property owners directly</li>
        <li>Reset your password anytime from the login page</li>
      </ul>
      ${btn(FRONTEND_URL() + '/properties', 'Explore Properties')}
      <p style="font-size:12px;color:#9ca3af;text-align:center;margin:0;">
        Need help? <a href="${FRONTEND_URL()}/contact" style="color:#667eea;">Contact our support team</a>
      </p>
    `);
    return sendEmail({ to: user.email, subject: 'Welcome to EstateElite – Your Account is Ready!', html });
};

// ─── 2. Email verification ────────────────────────────────────────────────────
const sendVerificationEmail = (user, verificationToken) => {
    const verifyUrl = FRONTEND_URL() + '/verify-email/' + verificationToken;
    const html = layout('Verify Your Email Address 📧', INFO, `
      <p style="font-size:16px;margin:0 0 8px;">Hi <strong>${user.name}</strong>,</p>
      <p style="font-size:14px;color:#6b7280;line-height:1.7;margin:0 0 24px;">
        Thank you for registering with EstateElite. Please verify your email address to activate your account.
      </p>
      ${btn(verifyUrl, 'Verify My Email Address', INFO)}
      <p style="font-size:12px;color:#9ca3af;word-break:break-all;margin:0 0 20px;">
        Or copy this link: <a href="${verifyUrl}" style="color:#4facfe;">${verifyUrl}</a>
      </p>
      <div style="background:#fff7ed;border-left:4px solid #f59e0b;padding:14px 18px;border-radius:0 8px 8px 0;">
        <p style="margin:0;font-size:13px;color:#92400e;">
          This link expires in <strong>24 hours</strong>. If you did not create an account, you can safely ignore this email.
        </p>
      </div>
    `);
    return sendEmail({ to: user.email, subject: 'Verify Your Email – EstateElite', html });
};

// ─── 3. Password reset ────────────────────────────────────────────────────────
const sendPasswordResetEmail = (user, resetToken) => {
    const resetUrl = FRONTEND_URL() + '/reset-password/' + resetToken;
    const html = layout('Password Reset Request 🔐', DANGER, `
      <p style="font-size:16px;margin:0 0 8px;">Hi <strong>${user.name}</strong>,</p>
      <p style="font-size:14px;color:#6b7280;line-height:1.7;margin:0 0 24px;">
        We received a request to reset your EstateElite password. Click the button below to set a new password.
      </p>
      ${btn(resetUrl, 'Reset My Password', DANGER)}
      <p style="font-size:12px;color:#9ca3af;word-break:break-all;margin:0 0 20px;">
        Or copy this link: <a href="${resetUrl}" style="color:#f5576c;">${resetUrl}</a>
      </p>
      <div style="background:#fff1f2;border-left:4px solid #f43f5e;padding:14px 18px;border-radius:0 8px 8px 0;">
        <p style="margin:0;font-size:13px;color:#9f1239;">
          This link expires in <strong>60 minutes</strong>. If you did not request a reset, please ignore this email.
        </p>
      </div>
    `);
    return sendEmail({ to: user.email, subject: 'Password Reset Request – EstateElite', html });
};

// ─── 4. Contact confirmation to user ─────────────────────────────────────────
const sendContactConfirmation = (contactData) => {
    const html = layout('We Received Your Message', PRIMARY, `
      <p style="font-size:16px;margin:0 0 8px;">Hi <strong>${contactData.name}</strong>,</p>
      <p style="font-size:14px;color:#6b7280;line-height:1.7;margin:0 0 20px;">
        Thank you for reaching out. We have received your message and will get back to you within <strong>24 hours</strong>.
      </p>
      <p style="font-size:14px;font-weight:600;color:#374151;margin:0 0 12px;">Your message summary:</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        ${row('Subject', contactData.subject)}
        ${row('Message', '<span style="color:#6b7280;font-weight:400;">' + contactData.message + '</span>')}
      </table>
      <p style="font-size:12px;color:#9ca3af;text-align:center;">Please do not reply directly to this email.</p>
    `);
    return sendEmail({ to: contactData.email, subject: 'Message Received – EstateElite', html });
};

// ─── 5. Contact notification to admin ────────────────────────────────────────
const sendContactToAdmin = (contactData) => {
    const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const html = layout('New Contact Form Submission', PRIMARY, `
      <p style="font-size:14px;color:#6b7280;margin:0 0 20px;">A visitor submitted the contact form at ${now} IST.</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        ${row('Name',    contactData.name)}
        ${row('Email',   '<a href="mailto:' + contactData.email + '" style="color:#667eea;">' + contactData.email + '</a>')}
        ${row('Phone',   contactData.phone || '<span style="color:#9ca3af;">Not provided</span>')}
        ${row('Subject', contactData.subject)}
        ${row('Message', '<span style="color:#6b7280;font-weight:400;">' + contactData.message + '</span>')}
      </table>
    `);
    return sendEmail({
        to: process.env.ADMIN_EMAIL || 'realestateeliteteam01@gmail.com',
        subject: 'Contact Form: ' + contactData.subject,
        html,
    });
};

// ─── 6. Inquiry confirmation to user ─────────────────────────────────────────
const sendInquiryConfirmation = (inquiry) => {
    const html = layout('Inquiry Received', SUCCESS, `
      <p style="font-size:16px;margin:0 0 8px;">Hi <strong>${inquiry.name}</strong>,</p>
      <p style="font-size:14px;color:#6b7280;line-height:1.7;margin:0 0 20px;">
        We have received your property inquiry. Our team will review it and reach out shortly.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        ${row('Property', inquiry.property ? inquiry.property.title : 'N/A')}
        ${row('Phone',    inquiry.phone)}
        ${row('Message',  '<span style="color:#6b7280;font-weight:400;">' + inquiry.message + '</span>')}
      </table>
      <p style="font-size:12px;color:#9ca3af;text-align:center;">Expected response time: within 24 hours.</p>
    `);
    return sendEmail({ to: inquiry.email, subject: 'Inquiry Received – EstateElite', html });
};

// ─── 7. Inquiry notification to admin ────────────────────────────────────────
const sendInquiryToAdmin = (inquiry) => {
    const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const html = layout('New Property Inquiry', SUCCESS, `
      <p style="font-size:14px;color:#6b7280;margin:0 0 20px;">New inquiry submitted at ${now} IST.</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        ${row('Property', inquiry.property ? inquiry.property.title : 'N/A')}
        ${row('Name',     inquiry.name)}
        ${row('Email',    '<a href="mailto:' + inquiry.email + '" style="color:#667eea;">' + inquiry.email + '</a>')}
        ${row('Phone',    inquiry.phone)}
        ${row('Message',  '<span style="color:#6b7280;font-weight:400;">' + inquiry.message + '</span>')}
      </table>
    `);
    return sendEmail({
        to: process.env.ADMIN_EMAIL || 'realestateeliteteam01@gmail.com',
        subject: 'New Inquiry: ' + (inquiry.property ? inquiry.property.title : 'Property'),
        html,
    });
};

module.exports = {
    sendEmail,
    verifyEmailConnection,
    sendWelcomeEmail,
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendContactConfirmation,
    sendContactToAdmin,
    sendInquiryConfirmation,
    sendInquiryToAdmin,
};
