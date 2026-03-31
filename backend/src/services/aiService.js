'use strict';

const Property = require('../models/Property');
const logger   = require('../utils/logger');

const escapeRegex = (str) => str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

// ── OpenAI helper (optional – gracefully degrades if key not set) ─────────────
const callOpenAI = async (messages, { maxTokens = 500, temperature = 0.7 } = {}) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return null;   // fallback to rule-based

    try {
        const fetch  = require('node-fetch');
        const res    = await fetch('https://api.openai.com/v1/chat/completions', {
            method:  'POST',
            headers: {
                'Content-Type':  'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model:       'gpt-3.5-turbo',
                messages,
                max_tokens:  maxTokens,
                temperature,
            }),
            signal: AbortSignal.timeout(15000), // 15s timeout
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            logger.warn(`OpenAI error ${res.status}: ${err?.error?.message}`);
            return null;
        }

        const data = await res.json();
        return data.choices?.[0]?.message?.content?.trim() || null;
    } catch (err) {
        logger.warn(`OpenAI call failed: ${err.message}`);
        return null;
    }
};

class AIService {

    // ── 1. PROPERTY RECOMMENDATIONS ──────────────────────────────────────────
    static async getRecommendations(userId, { limit = 8 } = {}) {
        const User = require('../models/User');
        const user = await User.findById(userId).select('wishlist');

        let preferences = { cities: [], types: [], propertyTypes: [], priceRange: {} };

        if (user?.wishlist?.length > 0) {
            const wishlisted = await Property.find({ _id: { $in: user.wishlist } })
                .select('location.city type propertyType price bedrooms');

            if (wishlisted.length > 0) {
                preferences.cities        = [...new Set(wishlisted.map(p => p.location?.city).filter(Boolean))];
                preferences.types         = [...new Set(wishlisted.map(p => p.type))];
                preferences.propertyTypes = [...new Set(wishlisted.map(p => p.propertyType))];

                const prices = wishlisted.map(p => p.price).filter(Boolean);
                if (prices.length) {
                    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
                    preferences.priceRange = { min: avg * 0.5, max: avg * 1.8 };
                }
            }
        }

        const pipeline = [];

        const matchStage = {
            status: 'available',
            ...(user?.wishlist?.length ? { _id: { $nin: user.wishlist } } : {}),
        };
        pipeline.push({ $match: matchStage });

        const addFieldsStage = {
            recommendationScore: {
                $add: [
                    preferences.cities.length
                        ? { $cond: [{ $in: ['$location.city', preferences.cities] }, 30, 0] } : 0,
                    preferences.types.length
                        ? { $cond: [{ $in: ['$type', preferences.types] }, 20, 0] } : 0,
                    preferences.propertyTypes.length
                        ? { $cond: [{ $in: ['$propertyType', preferences.propertyTypes] }, 20, 0] } : 0,
                    preferences.priceRange.min ? {
                        $cond: [{
                            $and: [
                                { $gte: ['$price', preferences.priceRange.min] },
                                { $lte: ['$price', preferences.priceRange.max] },
                            ]
                        }, 15, 0],
                    } : 0,
                    { $min: [{ $multiply: ['$views', 0.01] }, 5] },
                    { $multiply: [{ $ifNull: ['$avgRating', 0] }, 2] },
                    { $cond: ['$featured', 10, 0] },
                    {
                        $divide: [1, { $add: [1, { $divide: [
                            { $subtract: [new Date(), '$createdAt'] }, 86400000 * 30,
                        ]}] }],
                    },
                ],
            },
        };

        pipeline.push(
            { $addFields: addFieldsStage },
            { $sort: { recommendationScore: -1 } },
            { $limit: limit },
            { $lookup: { from: 'users', localField: 'createdBy', foreignField: '_id', as: 'createdBy',
                pipeline: [{ $project: { name: 1, email: 1, avatar: 1 } }] } },
            { $unwind: { path: '$createdBy', preserveNullAndEmptyArrays: true } }
        );

        const recommendations = await Property.aggregate(pipeline);

        return {
            recommendations,
            basedOn: {
                cities:         preferences.cities,
                types:          preferences.types,
                propertyTypes:  preferences.propertyTypes,
                wishlistCount:  user?.wishlist?.length || 0,
            },
        };
    }

    // ── 2. PRICE PREDICTION (CMA – Comparable Market Analysis) ────────────────
    static async predictPrice({ city, propertyType, bedrooms, bathrooms, area, type = 'buy' }) {
        const comparables = await Property.find({
            'location.city': { $regex: escapeRegex(city), $options: 'i' },
            propertyType,
            type,
            status:   { $in: ['available', 'sold', 'rented'] },
            bedrooms: { $gte: Math.max(0, bedrooms - 1), $lte: bedrooms + 1 },
            'area.value': { $gt: 0 },
            price:    { $gt: 0 },
        })
            .select('price area bedrooms bathrooms location.city amenities')
            .limit(50);

        if (comparables.length < 3) {
            return {
                estimatedPrice: null,
                confidence: 'low',
                message: `Not enough comparable properties found in ${city} (need at least 3, found ${comparables.length})`,
                comparablesCount: comparables.length,
            };
        }

        // Weighted CMA: closer bedroom/bathroom match = higher weight
        const comps = comparables
            .filter(p => p.area?.value > 0 && p.price > 0)
            .map(p => ({
                pricePerSqft:  p.price / p.area.value,
                bedroomDiff:   Math.abs(p.bedrooms - bedrooms),
                bathroomDiff:  Math.abs((p.bathrooms || 1) - (bathrooms || 1)),
                amenityBonus:  (p.amenities?.length || 0) * 0.5,
            }));

        if (comps.length < 3) {
            return { estimatedPrice: null, confidence: 'low', message: 'Insufficient data', comparablesCount: comps.length };
        }

        let totalWeight = 0, weightedSum = 0;
        comps.forEach(c => {
            const w = 1 / (1 + c.bedroomDiff + c.bathroomDiff * 0.5);
            weightedSum += c.pricePerSqft * w;
            totalWeight += w;
        });

        const avgPpsf          = weightedSum / totalWeight;
        const estimatedPrice   = Math.round(avgPpsf * area);
        const prices           = comps.map(c => c.pricePerSqft);
        const mean             = prices.reduce((a, b) => a + b, 0) / prices.length;
        const variance         = prices.reduce((a, b) => a + (b - mean) ** 2, 0) / prices.length;
        const cv               = Math.sqrt(variance) / mean;

        let confidence = 'high';
        if (cv > 0.5 || comparables.length < 10) confidence = 'medium';
        if (cv > 0.8 || comparables.length < 5)  confidence = 'low';

        return {
            estimatedPrice,
            pricePerSqft:     Math.round(avgPpsf),
            confidence,
            comparablesCount: comparables.length,
            priceRange: {
                low:  Math.round(estimatedPrice * 0.85),
                high: Math.round(estimatedPrice * 1.15),
            },
            marketInsight: confidence === 'high'
                ? 'Strong market data – estimate is reliable.'
                : confidence === 'medium'
                ? 'Moderate data – estimate is approximate.'
                : 'Limited data – treat estimate as a rough guide.',
        };
    }

    // ── 3. AI CHATBOT ─────────────────────────────────────────────────────────
    static async chatbot(message, userId = null, conversationHistory = []) {
        const msg = message.toLowerCase().trim();

        // Try OpenAI first
        const systemPrompt = `You are EstateElite's helpful AI property assistant for Indian real estate.
You help users find properties, understand pricing, and answer real estate questions.
Keep responses concise (under 150 words), helpful, and focused on Indian real estate.
Format prices in ₹ (INR). Use Crore/Lakh notation.
If you don't know something specific, guide users to browse EstateElite's listings.`;

        const openaiMessages = [
            { role: 'system', content: systemPrompt },
            ...conversationHistory.slice(-6), // last 3 exchanges
            { role: 'user', content: message },
        ];

        const aiReply = await callOpenAI(openaiMessages, { maxTokens: 200, temperature: 0.6 });
        if (aiReply) {
            return { reply: aiReply, type: 'ai', powered_by: 'openai' };
        }

        // ── Rule-based fallback ───────────────────────────────────────────────
        if (this._matchesIntent(msg, ['hi', 'hello', 'hey', 'help', 'what can'])) {
            return {
                reply: "👋 Hi! I'm your AI property assistant. I can help you with:\n\n🔍 **Search** — \"Find 3BHK in Mumbai\"\n💰 **Prices** — \"Average price in Bangalore?\"\n⭐ **Recommendations** — \"Suggest properties for me\"\n📊 **Stats** — \"How many villas available?\"",
                type: 'help',
                powered_by: 'rules',
            };
        }

        if (this._matchesIntent(msg, ['price', 'cost', 'how much', 'expensive', 'cheap', 'budget', 'affordable'])) {
            return this._handlePriceQuery(msg);
        }

        if (this._matchesIntent(msg, ['recommend', 'suggest', 'best', 'top', 'popular'])) {
            return this._handleRecommendQuery(msg, userId);
        }

        if (this._matchesIntent(msg, ['search', 'find', 'looking for', 'want', 'show me'])) {
            return this._handleSearchQuery(msg);
        }

        if (this._matchesIntent(msg, ['how many', 'count', 'total', 'available'])) {
            return this._handleCountQuery(msg);
        }

        return {
            reply: "I'm not sure I understand. Try asking about properties, prices, or recommendations. Type \"help\" to see what I can do! 🏠",
            type: 'fallback',
            powered_by: 'rules',
        };
    }

    // ── Private helpers ───────────────────────────────────────────────────────
    static _matchesIntent(msg, keywords) {
        return keywords.some(kw => msg.includes(kw));
    }

    static async _handlePriceQuery(msg) {
        const cities = ['mumbai', 'delhi', 'bangalore', 'pune', 'hyderabad', 'chennai', 'kolkata', 'noida', 'gurgaon', 'jaipur', 'goa'];
        const city   = cities.find(c => msg.includes(c));
        const filter = { status: 'available' };
        if (city) filter['location.city'] = { $regex: escapeRegex(city), $options: 'i' };

        const stats = await Property.aggregate([
            { $match: filter },
            { $group: { _id: null, avg: { $avg: '$price' }, min: { $min: '$price' }, max: { $max: '$price' }, count: { $sum: 1 } } },
        ]);

        if (!stats.length || stats[0].count === 0) {
            return { reply: `Sorry, no data available${city ? ` for ${city}` : ''}.`, type: 'price', powered_by: 'rules' };
        }
        const s = stats[0];
        const fmt = n => '₹' + (n >= 10000000 ? (n/10000000).toFixed(1)+'Cr' : n >= 100000 ? (n/100000).toFixed(1)+'L' : Math.round(n).toLocaleString('en-IN'));

        return {
            reply: `📊 **Price Stats${city ? ` — ${city.charAt(0).toUpperCase()+city.slice(1)}` : ''}**\n\n• Average: **${fmt(s.avg)}**\n• Range: ${fmt(s.min)} – ${fmt(s.max)}\n• ${s.count} properties analyzed`,
            type: 'price', powered_by: 'rules',
        };
    }

    static async _handleRecommendQuery(msg, userId) {
        if (userId) {
            const result = await this.getRecommendations(userId, { limit: 4 });
            if (result.recommendations.length > 0) {
                const fmt = n => '₹' + (n >= 10000000 ? (n/10000000).toFixed(1)+'Cr' : n >= 100000 ? (n/100000).toFixed(1)+'L' : n.toLocaleString('en-IN'));
                const list = result.recommendations
                    .map(p => `• **${p.title}** — ${fmt(p.price)} (${p.location?.city})`)
                    .join('\n');
                return { reply: `⭐ **Recommended for You**\n\n${list}`, type: 'recommendations', data: result.recommendations, powered_by: 'rules' };
            }
        }
        const popular = await Property.find({ status: 'available' }).sort('-views -avgRating').limit(4).select('title price location.city');
        const fmt = n => '₹' + (n >= 10000000 ? (n/10000000).toFixed(1)+'Cr' : n >= 100000 ? (n/100000).toFixed(1)+'L' : n.toLocaleString('en-IN'));
        const list = popular.map(p => `• **${p.title}** — ${fmt(p.price)} (${p.location?.city})`).join('\n');
        return { reply: `🔥 **Popular Properties**\n\n${list}`, type: 'recommendations', powered_by: 'rules' };
    }

    static async _handleSearchQuery(msg) {
        const filter = { status: 'available' };
        const bedroomMatch = msg.match(/(\d+)\s*bhk/i) || msg.match(/(\d+)\s*bed/i);
        if (bedroomMatch) filter.bedrooms = Number(bedroomMatch[1]);
        const types = ['apartment','house','villa','commercial','plot','penthouse'];
        const found = types.find(t => msg.includes(t));
        if (found) filter.propertyType = found;
        const cities = ['mumbai','delhi','bangalore','pune','hyderabad','chennai','kolkata','noida','gurgaon'];
        const city = cities.find(c => msg.includes(c));
        if (city) filter['location.city'] = { $regex: escapeRegex(city), $options: 'i' };
        if (msg.includes('rent')) filter.type = 'rent';
        if (msg.includes('buy') || msg.includes('sale')) filter.type = 'buy';

        const results = await Property.find(filter).limit(5).select('title price location.city type propertyType bedrooms');
        if (!results.length) return { reply: 'No properties found. Try broadening your search! 🔍', type: 'search', powered_by: 'rules' };

        const fmt = n => '₹' + (n >= 10000000 ? (n/10000000).toFixed(1)+'Cr' : n >= 100000 ? (n/100000).toFixed(1)+'L' : n.toLocaleString('en-IN'));
        const list = results.map(p => `• **${p.title}** — ${fmt(p.price)} | ${p.bedrooms}BHK ${p.propertyType} (${p.location?.city})`).join('\n');
        return { reply: `🔍 **Found ${results.length} Properties**\n\n${list}`, type: 'search', data: results, powered_by: 'rules' };
    }

    static async _handleCountQuery(msg) {
        const filter = { status: 'available' };
        const types = ['apartment','house','villa','commercial','plot','penthouse'];
        const found = types.find(t => msg.includes(t));
        if (found) filter.propertyType = found;
        const cities = ['mumbai','delhi','bangalore','pune','hyderabad','chennai'];
        const city = cities.find(c => msg.includes(c));
        if (city) filter['location.city'] = { $regex: escapeRegex(city), $options: 'i' };
        const count = await Property.countDocuments(filter);
        const desc  = [found ? found+'s' : 'properties', city ? `in ${city.charAt(0).toUpperCase()+city.slice(1)}` : ''].filter(Boolean).join(' ');
        return { reply: `📊 There are **${count}** ${desc} currently available.`, type: 'count', powered_by: 'rules' };
    }
}

module.exports = AIService;
