'use strict';

const asyncHandler = require('express-async-handler');
const Newsletter   = require('../models/Newsletter');
const { sendEmail } = require('../utils/emailService');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const subscribeHtml = (email) => `
<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f4f6fb;padding:30px;">
<div style="max-width:500px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">
  <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:28px;text-align:center;">
    <h2 style="color:#fff;margin:0;">EstateElite Newsletter</h2>
  </div>
  <div style="padding:28px;">
    <p style="font-size:15px;color:#374151;">You've successfully subscribed to the EstateElite newsletter.</p>
    <p style="font-size:14px;color:#6b7280;">You'll receive updates on new properties, market insights, and exclusive offers.</p>
    <p style="font-size:12px;color:#9ca3af;border-top:1px solid #f3f4f6;padding-top:16px;margin-top:20px;">
      To unsubscribe at any time, reply with "unsubscribe" or visit our website.
    </p>
  </div>
</div></body></html>`;

// @desc   Subscribe
// @route  POST /api/newsletter/subscribe
// @access Public
const subscribe = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email?.trim())       { res.status(400); throw new Error('Email is required'); }
    if (!EMAIL_RE.test(email)){ res.status(400); throw new Error('Invalid email address'); }

    const existing = await Newsletter.findOne({ email: email.toLowerCase().trim() });

    if (existing) {
        if (existing.isActive) {
            return res.json({ success: true, message: 'You are already subscribed.', alreadySubscribed: true });
        }
        // Reactivate
        existing.isActive       = true;
        existing.subscribedAt   = new Date();
        existing.unsubscribedAt = undefined;
        await existing.save();

        sendEmail({ to: email, subject: 'Welcome Back – EstateElite Newsletter', html: subscribeHtml(email) })
            .catch(err => console.error('Newsletter re-subscribe email failed:', err.message));

        return res.json({ success: true, message: 'Welcome back! You have been resubscribed.' });
    }

    await Newsletter.create({ email: email.toLowerCase().trim(), isActive: true, subscribedAt: new Date() });

    sendEmail({ to: email, subject: 'Subscribed – EstateElite Newsletter', html: subscribeHtml(email) })
        .catch(err => console.error('Newsletter subscribe email failed:', err.message));

    res.status(201).json({ success: true, message: 'Successfully subscribed to our newsletter!', alreadySubscribed: false });
});

// @desc   Unsubscribe
// @route  POST /api/newsletter/unsubscribe
// @access Public
const unsubscribe = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email?.trim()) { res.status(400); throw new Error('Email is required'); }

    const subscriber = await Newsletter.findOne({ email: email.toLowerCase().trim() });
    if (!subscriber) { res.status(404); throw new Error('Email not found in our subscriber list'); }
    if (!subscriber.isActive) {
        return res.json({ success: true, message: 'You are already unsubscribed.' });
    }

    subscriber.isActive        = false;
    subscriber.unsubscribedAt  = new Date();
    await subscriber.save();

    // Send goodbye email (non-blocking)
    sendEmail({
        to: email,
        subject: 'Unsubscribed from EstateElite Newsletter',
        html: '<p>You have been successfully unsubscribed from our newsletter. We\'re sorry to see you go.</p>',
    }).catch(err => console.error('Unsubscribe email failed:', err.message));

    res.json({ success: true, message: 'You have been successfully unsubscribed.' });
});

// @desc   Get all subscribers (admin)
// @route  GET /api/newsletter/subscribers
// @access Private/Admin
const getSubscribers = asyncHandler(async (req, res) => {
    const subscribers = await Newsletter.find({}).sort('-subscribedAt');
    res.json({
        success: true,
        stats: {
            total:    subscribers.length,
            active:   subscribers.filter(s => s.isActive).length,
            inactive: subscribers.filter(s => !s.isActive).length,
        },
        subscribers,
    });
});

// @desc   Send newsletter (admin)
// @route  POST /api/newsletter/send
// @access Private/Admin
const sendNewsletter = asyncHandler(async (req, res) => {
    const { subject, content } = req.body;
    if (!subject?.trim()) { res.status(400); throw new Error('Subject is required'); }
    if (!content?.trim()) { res.status(400); throw new Error('Content is required'); }

    const subscribers = await Newsletter.find({ isActive: true });
    if (subscribers.length === 0) { res.status(400); throw new Error('No active subscribers to send to'); }

    const emails = subscribers.map(s => s.email);

    await sendEmail({ to: emails, subject, html: content });

    await Newsletter.updateMany(
        { _id: { $in: subscribers.map(s => s._id) } },
        { lastSent: new Date() }
    );

    res.json({ success: true, message: `Newsletter sent to ${emails.length} subscribers`, count: emails.length });
});

module.exports = { subscribe, unsubscribe, getSubscribers, sendNewsletter };
