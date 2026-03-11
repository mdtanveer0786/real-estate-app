// Simple in-memory cache using a Map (no external dependency needed)
const cache = new Map();

const cacheMiddleware = (duration = 600) => {
    return (req, res, next) => {
        // Skip cache for non-GET requests
        if (req.method !== 'GET') {
            return next();
        }

        const key = req.originalUrl;
        const cached = cache.get(key);

        if (cached && cached.expiry > Date.now()) {
            return res.json(cached.data);
        }

        // Store original json method
        const originalJson = res.json.bind(res);
        res.json = (body) => {
            cache.set(key, {
                data: body,
                expiry: Date.now() + duration * 1000,
            });
            return originalJson(body);
        };
        next();
    };
};

const clearCache = (pattern) => {
    for (const key of cache.keys()) {
        if (key.includes(pattern)) {
            cache.delete(key);
        }
    }
};

module.exports = { cacheMiddleware, clearCache };