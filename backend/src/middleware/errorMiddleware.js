const errorHandler = (err, req, res, next) => {
    // If headers are already sent, delegate to Express default error handler
    if (res.headersSent) {
        return next(err);
    }

    let error = { ...err };
    error.message = err.message;

    // Log to console for dev
    console.error('Error:', err.message);
    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    }

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = { message, statusCode: 404 };
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        // Extract the field that caused the duplicate
        const field = Object.keys(err.keyValue || {})[0] || 'field';
        const message = field === 'email'
            ? 'An account with this email already exists'
            : `Duplicate field value entered for ${field}`;
        error = { message, statusCode: 400 };
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = { message, statusCode: 400 };
    }

    const statusCode = error.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);

    res.status(statusCode).json({
        success: false,
        error: error.message || 'Server Error',
        message: error.message || 'Server Error', // Also include as 'message' for compatibility
    });
};

module.exports = errorHandler;