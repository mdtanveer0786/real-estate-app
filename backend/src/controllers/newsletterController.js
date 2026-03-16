const asyncHandler = require('express-async-handler');
const Newsletter = require('../models/Newsletter');
const { sendEmail } = require('../utils/emailService');

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
const subscribe = asyncHandler(async (req, res) => {
    const { email } = req.body;

    // Check if already subscribed
    const existingSubscriber = await Newsletter.findOne({ email });

    if (existingSubscriber) {
        if (existingSubscriber.isActive) {
            // Already active subscriber - return success (don't error)
            return res.json({
                message: 'Email already subscribed',
                alreadySubscribed: true
            });
        } else {
            // Reactivate subscription
            existingSubscriber.isActive = true;
            existingSubscriber.subscribedAt = new Date();
            await existingSubscriber.save();

            // Send email (non-blocking)
            sendEmail({
                to: email,
                subject: 'Welcome Back to EstateElite Newsletter',
                html: '<p>You have successfully resubscribed to our newsletter.</p>',
            }).catch(emailError => console.log('Email sending failed but subscription successful:', emailError.message));

            return res.json({ message: 'Successfully resubscribed' });
        }
    }

    // Create new subscription
    await Newsletter.create({
        email,
        subscribedAt: new Date(),
        isActive: true,
    });

    // Send welcome email (non-blocking)
    sendEmail({
        to: email,
        subject: 'Welcome to EstateElite Newsletter',
        html: '<p>Thank you for subscribing to our newsletter. You will receive updates about new properties and offers.</p>',
    }).catch(emailError => console.log('Email sending failed but subscription successful:', emailError.message));

    res.status(201).json({
        message: 'Successfully subscribed to newsletter',
        alreadySubscribed: false
    });
});

// @desc    Unsubscribe from newsletter
// @route   POST /api/newsletter/unsubscribe
// @access  Public
const unsubscribe = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const subscriber = await Newsletter.findOne({ email });

    if (!subscriber) {
        res.status(404);
        throw new Error('Email not found in newsletter list');
    }

    subscriber.isActive = false;
    subscriber.unsubscribedAt = new Date();
    await subscriber.save();

    // Send goodbye email (non-blocking)
    sendEmail({
        to: email,
        subject: 'Unsubscribed from EstateElite Newsletter',
        html: '<p>You have been successfully unsubscribed from our newsletter. We\'re sorry to see you go.</p>',
    }).catch(err => console.error('Unsubscribe email failed:', err.message));

    res.json({ message: 'Successfully unsubscribed' });
});

// @desc    Get all subscribers (Admin)
// @route   GET /api/newsletter/subscribers
// @access  Private/Admin
const getSubscribers = asyncHandler(async (req, res) => {
    const subscribers = await Newsletter.find({})
        .sort('-subscribedAt');

    const stats = {
        total: subscribers.length,
        active: subscribers.filter(s => s.isActive).length,
        inactive: subscribers.filter(s => !s.isActive).length,
    };

    res.json({
        subscribers,
        stats,
    });
});

// @desc    Send newsletter (Admin)
// @route   POST /api/newsletter/send
// @access  Private/Admin
const sendNewsletter = asyncHandler(async (req, res) => {
    const { subject, content, sendTo } = req.body;

    let subscribers = [];

    if (sendTo === 'all') {
        subscribers = await Newsletter.find({ isActive: true });
    } else if (sendTo === 'active') {
        subscribers = await Newsletter.find({ isActive: true });
    }

    if (subscribers.length === 0) {
        res.status(400);
        throw new Error('No subscribers to send newsletter');
    }

    const emails = subscribers.map(s => s.email);

    // In production, you'd want to queue this
    await sendEmail({
        to: emails,
        subject,
        html: content,
    });

    // Update lastSent
    await Newsletter.updateMany(
        { _id: { $in: subscribers.map(s => s._id) } },
        { lastSent: new Date() }
    );

    res.json({
        message: `Newsletter sent to ${emails.length} subscribers`,
        count: emails.length,
    });
});

module.exports = {
    subscribe,
    unsubscribe,
    getSubscribers,
    sendNewsletter,
};