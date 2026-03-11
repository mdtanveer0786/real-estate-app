// Simple HTML sanitizer — strips all HTML tags (no external dependency needed)
const stripHtmlTags = (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/<[^>]*>/g, '').trim();
};

const sanitizeMiddleware = (req, res, next) => {
    // Sanitize request body
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = stripHtmlTags(req.body[key]);
            }
        });
    }

    // Sanitize query parameters
    if (req.query) {
        Object.keys(req.query).forEach(key => {
            if (typeof req.query[key] === 'string') {
                req.query[key] = stripHtmlTags(req.query[key]);
            }
        });
    }

    next();
};

module.exports = sanitizeMiddleware;