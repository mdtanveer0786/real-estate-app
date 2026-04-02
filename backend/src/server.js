'use strict';

const express    = require('express');
const path       = require('path');
const dotenv     = require('dotenv');
const cors       = require('cors');
const morgan     = require('morgan');
const helmet     = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const passport   = require('passport');
const connectDB  = require('./config/db');
require('./models/Message'); // ensure Message collection is registered
const { setupGoogleStrategy } = require('./config/passport');
const errorHandler = require('./middleware/errorMiddleware');
const { apiLimiter, authLimiter, contactLimiter, inquiryLimiter, aiLimiter } = require('./middleware/rateLimiter');
const logger     = require('./utils/logger');
const sanitize   = require('./middleware/sanitize');
const { verifyEmailConnection } = require('./utils/emailService');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

// Connect to database
connectDB();

// Initialize Passport Google OAuth strategy
setupGoogleStrategy();

// Route files
const authRoutes       = require('./routes/authRoutes');
const userRoutes       = require('./routes/userRoutes');
const propertyRoutes   = require('./routes/propertyRoutes');
const contactRoutes    = require('./routes/contactRoutes');
const inquiryRoutes    = require('./routes/inquiryRoutes');
const adminRoutes      = require('./routes/adminRoutes');
const searchRoutes     = require('./routes/searchRoutes');
const analyticsRoutes  = require('./routes/analyticsRoutes');
const paymentRoutes        = require('./routes/paymentRoutes');
const newsletterRoutes     = require('./routes/newsletterRoutes');
const reviewRoutes         = require('./routes/reviewRoutes');
const notificationRoutes   = require('./routes/notificationRoutes');
const conversationRoutes   = require('./routes/conversationRoutes');
const aiRoutes             = require('./routes/aiRoutes');
const subscriptionRoutes   = require('./routes/subscriptionRoutes');
const { initSocket }       = require('./config/socket');

const app = express();

// ── Trust proxy (required for rate limiting behind Vercel/Render/etc.) ────────
app.set('trust proxy', 1);

// ── Security & compression ───────────────────────────────────────────────────
app.use(helmet());
app.use(mongoSanitize());
app.use(compression());

// ── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ── Passport ─────────────────────────────────────────────────────────────────
app.use(passport.initialize());

// ── Sanitize body/query ──────────────────────────────────────────────────────
app.use(sanitize);

// ── Static folder ────────────────────────────────────────────────────────────
app.use('/public', express.static(path.join(__dirname, '../public')));

// ── Logging ──────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined', { stream: logger.stream }));
}

// ── CORS ──────────────────────────────────────────────────────────────────────
// credentials:true + specific origin (not *) is required for cross-origin cookies.
// FRONTEND_URL must be set to your exact Vercel URL (no trailing slash).
const normalizedFrontendUrl = (process.env.FRONTEND_URL || '').replace(/\/+$/, '');

const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:4173',
    normalizedFrontendUrl,
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow server-to-server (no origin) and curl during dev
        if (!origin) return callback(null, true);
        
        // Normalize the request origin for matching
        const requestOrigin = origin.replace(/\/+$/, '');
        
        if (allowedOrigins.includes(requestOrigin)) return callback(null, true);
        
        // In development, allow any localhost port
        if (process.env.NODE_ENV !== 'production' && requestOrigin.includes('localhost')) {
            return callback(null, true);
        }
        
        logger.warn(`CORS blocked origin: ${origin}`);
        return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    // Expose these headers so the browser can read them
    exposedHeaders: ['set-cookie'],
}));

// Ensure Vary: Origin header is set for proper CDN/proxy caching
app.use((req, res, next) => {
    res.setHeader('Vary', 'Origin');
    next();
});

// ── Rate limiting ────────────────────────────────────────────────────────────
app.use('/api/', apiLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/inquiries', inquiryLimiter);

// ── Mount routers ────────────────────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/users',      userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/contact',    contactLimiter, contactRoutes);
app.use('/api/inquiries',  inquiryRoutes);
app.use('/api/admin',      adminRoutes);
app.use('/api/search',     searchRoutes);
app.use('/api/analytics',  analyticsRoutes);
app.use('/api/payments',   paymentRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/reviews',       reviewRoutes);
app.use('/api/notifications', notificationRoutes);

// ── API v1 alias (forward-compatible versioning) ─────────────────────────────
app.use('/api/v1/auth',          authRoutes);
app.use('/api/v1/users',         userRoutes);
app.use('/api/v1/properties',    propertyRoutes);
app.use('/api/v1/reviews',       reviewRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/conversations',    conversationRoutes);
app.use('/api/v1/conversations', conversationRoutes);
app.use('/api/ai',               aiLimiter, aiRoutes);
app.use('/api/v1/ai',            aiLimiter, aiRoutes);
app.use('/api/subscriptions',    subscriptionRoutes);
app.use('/api/v1/subscriptions', subscriptionRoutes);

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
    });
});

// ── 404 handler ──────────────────────────────────────────────────────────────
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
    });
});

// ── Error handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    verifyEmailConnection();
});

// Initialize Socket.io on the HTTP server
initSocket(server);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger.error(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error(`Uncaught Exception: ${err.message}`);
    process.exit(1);
});