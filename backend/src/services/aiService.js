'use strict';

const Property = require('../models/Property');
const logger = require('../utils/logger');

class AIService {
    /**
     * Get personalized property recommendations for a user based on their
     * browsing history, wishlist, and interaction patterns.
     */
    static async getRecommendations(userId, { limit = 8 } = {}) {
        const User = require('../models/User');
        const user = await User.findById(userId).select('wishlist');

        // Get user's wishlisted properties to learn preferences
        let preferences = { cities: [], types: [], propertyTypes: [], priceRange: {} };

        if (user?.wishlist?.length > 0) {
            const wishlistedProps = await Property.find({
                _id: { $in: user.wishlist },
            }).select('location.city type propertyType price bedrooms');

            if (wishlistedProps.length > 0) {
                // Extract preference signals
                preferences.cities = [...new Set(wishlistedProps.map(p => p.location?.city).filter(Boolean))];
                preferences.types = [...new Set(wishlistedProps.map(p => p.type))];
                preferences.propertyTypes = [...new Set(wishlistedProps.map(p => p.propertyType))];

                const prices = wishlistedProps.map(p => p.price).filter(Boolean);
                if (prices.length > 0) {
                    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
                    preferences.priceRange = {
                        min: avgPrice * 0.5,
                        max: avgPrice * 1.8,
                    };
                }
            }
        }

        // Build recommendation query with weighted scoring
        const pipeline = [];

        // Match available properties not already in wishlist
        const matchStage = {
            status: 'available',
            ...(user?.wishlist?.length > 0 ? { _id: { $nin: user.wishlist } } : {}),
        };

        pipeline.push({ $match: matchStage });

        // Add scoring based on preferences
        const addFieldsStage = {
            recommendationScore: {
                $add: [
                    // City match: +30 points
                    preferences.cities.length > 0
                        ? { $cond: [{ $in: ['$location.city', preferences.cities] }, 30, 0] }
                        : 0,
                    // Type match: +20 points
                    preferences.types.length > 0
                        ? { $cond: [{ $in: ['$type', preferences.types] }, 20, 0] }
                        : 0,
                    // Property type match: +20 points
                    preferences.propertyTypes.length > 0
                        ? { $cond: [{ $in: ['$propertyType', preferences.propertyTypes] }, 20, 0] }
                        : 0,
                    // Price range match: +15 points
                    preferences.priceRange.min
                        ? {
                            $cond: [
                                {
                                    $and: [
                                        { $gte: ['$price', preferences.priceRange.min] },
                                        { $lte: ['$price', preferences.priceRange.max] },
                                    ],
                                },
                                15,
                                0,
                            ],
                        }
                        : 0,
                    // Popularity bonus: views * 0.01 (max ~5 points)
                    { $min: [{ $multiply: ['$views', 0.01] }, 5] },
                    // Rating bonus: avgRating * 2 (max 10 points)
                    { $multiply: [{ $ifNull: ['$avgRating', 0] }, 2] },
                    // Recency bonus: newer properties score higher
                    {
                        $divide: [
                            1,
                            {
                                $add: [
                                    1,
                                    {
                                        $divide: [
                                            { $subtract: [new Date(), '$createdAt'] },
                                            86400000 * 30, // 30 days
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                    // Featured bonus
                    { $cond: ['$featured', 10, 0] },
                ],
            },
        };

        pipeline.push({ $addFields: addFieldsStage });
        pipeline.push({ $sort: { recommendationScore: -1 } });
        pipeline.push({ $limit: limit });
        pipeline.push({
            $lookup: {
                from: 'users',
                localField: 'createdBy',
                foreignField: '_id',
                as: 'createdBy',
                pipeline: [{ $project: { name: 1, email: 1, avatar: 1 } }],
            },
        });
        pipeline.push({ $unwind: { path: '$createdBy', preserveNullAndEmptyArrays: true } });

        const recommendations = await Property.aggregate(pipeline);

        return {
            recommendations,
            basedOn: {
                cities: preferences.cities,
                types: preferences.types,
                propertyTypes: preferences.propertyTypes,
            },
        };
    }

    /**
     * Predict the estimated price of a property based on similar listings.
     * Uses comparable properties analysis (CMA).
     */
    static async predictPrice({
        city, propertyType, bedrooms, bathrooms, area, type = 'buy',
    }) {
        // Find comparable properties
        const comparables = await Property.find({
            'location.city': { $regex: city, $options: 'i' },
            propertyType,
            type,
            status: { $in: ['available', 'sold', 'rented'] },
            bedrooms: { $gte: Math.max(0, bedrooms - 1), $lte: bedrooms + 1 },
        })
            .select('price area bedrooms bathrooms location.city')
            .limit(50);

        if (comparables.length < 3) {
            return {
                estimatedPrice: null,
                confidence: 'low',
                message: 'Not enough comparable properties in this area for an accurate estimate',
                comparablesCount: comparables.length,
            };
        }

        // Calculate price per sqft for each comparable
        const pricesPerSqft = comparables
            .filter(p => p.area?.value > 0 && p.price > 0)
            .map(p => ({
                pricePerSqft: p.price / p.area.value,
                bedroomDiff: Math.abs(p.bedrooms - bedrooms),
                bathroomDiff: Math.abs((p.bathrooms || 0) - (bathrooms || 0)),
            }));

        if (pricesPerSqft.length < 3) {
            return {
                estimatedPrice: null,
                confidence: 'low',
                message: 'Not enough data points for price estimation',
                comparablesCount: pricesPerSqft.length,
            };
        }

        // Weighted average (closer matches get higher weight)
        let totalWeight = 0;
        let weightedSum = 0;

        pricesPerSqft.forEach(comp => {
            const weight = 1 / (1 + comp.bedroomDiff + comp.bathroomDiff * 0.5);
            weightedSum += comp.pricePerSqft * weight;
            totalWeight += weight;
        });

        const avgPricePerSqft = weightedSum / totalWeight;
        const estimatedPrice = Math.round(avgPricePerSqft * area);

        // Calculate confidence based on sample size and price variance
        const prices = pricesPerSqft.map(p => p.pricePerSqft);
        const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
        const variance = prices.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / prices.length;
        const cv = Math.sqrt(variance) / mean; // Coefficient of variation

        let confidence = 'high';
        if (cv > 0.5 || comparables.length < 10) confidence = 'medium';
        if (cv > 0.8 || comparables.length < 5) confidence = 'low';

        return {
            estimatedPrice,
            pricePerSqft: Math.round(avgPricePerSqft),
            confidence,
            comparablesCount: comparables.length,
            priceRange: {
                low: Math.round(estimatedPrice * 0.85),
                high: Math.round(estimatedPrice * 1.15),
            },
        };
    }

    /**
     * AI chatbot — answer property-related questions using data.
     */
    static async chatbot(message, userId = null) {
        const msg = message.toLowerCase().trim();

        // Intent detection
        if (this._matchesIntent(msg, ['price', 'cost', 'how much', 'expensive', 'cheap', 'budget', 'affordable'])) {
            return this._handlePriceQuery(msg);
        }

        if (this._matchesIntent(msg, ['recommend', 'suggest', 'best', 'top', 'popular', 'trending'])) {
            return this._handleRecommendQuery(msg, userId);
        }

        if (this._matchesIntent(msg, ['search', 'find', 'looking for', 'want', 'need', 'show me'])) {
            return this._handleSearchQuery(msg);
        }

        if (this._matchesIntent(msg, ['how many', 'count', 'total', 'available'])) {
            return this._handleCountQuery(msg);
        }

        if (this._matchesIntent(msg, ['help', 'what can you', 'hi', 'hello', 'hey'])) {
            return {
                reply: "👋 Hi! I'm your AI property assistant. I can help you with:\n\n" +
                    "🔍 **Search properties** — \"Find 3BHK apartments in Mumbai\"\n" +
                    "💰 **Price insights** — \"What's the average price in Bangalore?\"\n" +
                    "⭐ **Recommendations** — \"Suggest properties for me\"\n" +
                    "📊 **Market stats** — \"How many villas are available?\"\n\n" +
                    "Just type your question!",
                type: 'help',
            };
        }

        return {
            reply: "I'm not sure I understand. Try asking about properties, prices, or recommendations. Type \"help\" to see what I can do! 🏠",
            type: 'fallback',
        };
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    static _matchesIntent(msg, keywords) {
        return keywords.some(kw => msg.includes(kw));
    }

    static async _handlePriceQuery(msg) {
        // Extract city from message
        const cities = ['mumbai', 'delhi', 'bangalore', 'pune', 'hyderabad', 'chennai', 'kolkata', 'ahmedabad', 'jaipur', 'goa', 'noida', 'gurgaon', 'lucknow', 'chandigarh'];
        const city = cities.find(c => msg.includes(c));

        const filter = { status: 'available' };
        if (city) filter['location.city'] = { $regex: city, $options: 'i' };

        const stats = await Property.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    avgPrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' },
                    count: { $sum: 1 },
                },
            },
        ]);

        if (!stats.length || stats[0].count === 0) {
            return {
                reply: city
                    ? `Sorry, I don't have enough data for ${city} yet. Try searching for a different city.`
                    : 'I need more details. Try asking "What\'s the average price in Mumbai?"',
                type: 'price',
            };
        }

        const s = stats[0];
        const format = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

        return {
            reply: `📊 **Price Stats${city ? ` — ${city.charAt(0).toUpperCase() + city.slice(1)}` : ''}**\n\n` +
                `• Average: **${format(s.avgPrice)}**\n` +
                `• Range: ${format(s.minPrice)} – ${format(s.maxPrice)}\n` +
                `• ${s.count} properties analyzed`,
            type: 'price',
            data: s,
        };
    }

    static async _handleRecommendQuery(msg, userId) {
        if (userId) {
            const result = await this.getRecommendations(userId, { limit: 4 });
            if (result.recommendations.length > 0) {
                const list = result.recommendations
                    .map(p => `• **${p.title}** — ₹${p.price?.toLocaleString('en-IN')} (${p.location?.city})`)
                    .join('\n');

                return {
                    reply: `⭐ **Recommended for You**\n\n${list}\n\nBased on your preferences: ${result.basedOn.cities.join(', ') || 'browsing history'}`,
                    type: 'recommendations',
                    data: result.recommendations,
                };
            }
        }

        // Fallback: top rated/popular
        const popular = await Property.find({ status: 'available' })
            .sort('-views -avgRating')
            .limit(4)
            .select('title price location.city views avgRating');

        const list = popular
            .map(p => `• **${p.title}** — ₹${p.price?.toLocaleString('en-IN')} (${p.location?.city})`)
            .join('\n');

        return {
            reply: `🔥 **Popular Properties**\n\n${list}`,
            type: 'recommendations',
            data: popular,
        };
    }

    static async _handleSearchQuery(msg) {
        const filter = { status: 'available' };

        // Extract bedrooms
        const bedroomMatch = msg.match(/(\d+)\s*bhk/i) || msg.match(/(\d+)\s*bed/i);
        if (bedroomMatch) filter.bedrooms = Number(bedroomMatch[1]);

        // Extract property type
        const types = ['apartment', 'house', 'villa', 'commercial', 'plot', 'penthouse'];
        const foundType = types.find(t => msg.includes(t));
        if (foundType) filter.propertyType = foundType;

        // Extract city
        const cities = ['mumbai', 'delhi', 'bangalore', 'pune', 'hyderabad', 'chennai', 'kolkata', 'noida', 'gurgaon'];
        const city = cities.find(c => msg.includes(c));
        if (city) filter['location.city'] = { $regex: city, $options: 'i' };

        // Rent or buy
        if (msg.includes('rent')) filter.type = 'rent';
        if (msg.includes('buy') || msg.includes('sale')) filter.type = 'buy';

        const results = await Property.find(filter).limit(5).select('title price location.city type propertyType bedrooms');

        if (results.length === 0) {
            return { reply: 'No properties found matching your criteria. Try broadening your search! 🔍', type: 'search' };
        }

        const list = results
            .map(p => `• **${p.title}** — ₹${p.price?.toLocaleString('en-IN')} | ${p.bedrooms}BHK ${p.propertyType} (${p.location?.city})`)
            .join('\n');

        return {
            reply: `🔍 **Found ${results.length} Properties**\n\n${list}`,
            type: 'search',
            data: results,
        };
    }

    static async _handleCountQuery(msg) {
        const filter = { status: 'available' };
        const types = ['apartment', 'house', 'villa', 'commercial', 'plot', 'penthouse'];
        const foundType = types.find(t => msg.includes(t));
        if (foundType) filter.propertyType = foundType;

        const cities = ['mumbai', 'delhi', 'bangalore', 'pune', 'hyderabad', 'chennai'];
        const city = cities.find(c => msg.includes(c));
        if (city) filter['location.city'] = { $regex: city, $options: 'i' };

        const count = await Property.countDocuments(filter);

        const desc = [
            foundType ? foundType + 's' : 'properties',
            city ? `in ${city.charAt(0).toUpperCase() + city.slice(1)}` : '',
        ].filter(Boolean).join(' ');

        return {
            reply: `📊 There are **${count}** ${desc} currently available.`,
            type: 'count',
        };
    }
}

module.exports = AIService;
