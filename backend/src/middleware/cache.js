const NodeCache = require('node-cache');
const myCache = new NodeCache({ stdTTL: 600 }); // Cache for 10 minutes

const cacheMiddleware = (duration = 600) => {
    return (req, res, next) => {
        // Skip cache for non-GET requests
        if (req.method !== 'GET') {
            return next();
        }

        const key = req.originalUrl;
        const cachedResponse = myCache.get(key);

        if (cachedResponse) {
            return res.json(cachedResponse);
        } else {
            res.originalJson = res.json;
            res.json = (body) => {
                myCache.set(key, body, duration);
                res.originalJson(body);
            };
            next();
        }
    };
};

const clearCache = (pattern) => {
    const keys = myCache.keys();
    const matchingKeys = keys.filter(key => key.includes(pattern));
    myCache.del(matchingKeys);
};

module.exports = { cacheMiddleware, clearCache };