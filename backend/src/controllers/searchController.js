const asyncHandler = require('express-async-handler');
const Property = require('../models/Property');

// @desc    Search properties with autocomplete
// @route   GET /api/search/suggestions
// @access  Public
const getSearchSuggestions = asyncHandler(async (req, res) => {
    const { q } = req.query;

    if (!q || q.length < 2) {
        return res.json([]);
    }

    const suggestions = await Property.aggregate([
        {
            $match: {
                $or: [
                    { title: { $regex: q, $options: 'i' } },
                    { 'location.city': { $regex: q, $options: 'i' } },
                    { 'location.address': { $regex: q, $options: 'i' } },
                ],
                status: 'available',
            },
        },
        {
            $group: {
                _id: null,
                titles: { $addToSet: '$title' },
                cities: { $addToSet: '$location.city' },
                addresses: { $addToSet: '$location.address' },
            },
        },
        {
            $project: {
                suggestions: {
                    $concatArrays: ['$titles', '$cities', '$addresses'],
                },
            },
        },
        {
            $unwind: '$suggestions',
        },
        {
            $match: {
                suggestions: { $regex: q, $options: 'i' },
            },
        },
        {
            $limit: 10,
        },
        {
            $project: {
                _id: 0,
                text: '$suggestions',
            },
        },
    ]);

    // Get unique suggestions
    const uniqueSuggestions = [...new Set(suggestions.map(s => s.text))];

    res.json(uniqueSuggestions.slice(0, 10));
});

// @desc    Advanced search with filters
// @route   POST /api/search/advanced
// @access  Public
const advancedSearch = asyncHandler(async (req, res) => {
    const {
        keyword,
        minPrice,
        maxPrice,
        type,
        propertyType,
        bedrooms,
        bathrooms,
        city,
        amenities,
    } = req.body;

    const query = { status: 'available' };

    // Text search
    if (keyword) {
        query.$text = { $search: keyword };
    }

    // Price range
    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Property type
    if (type) query.type = type;
    if (propertyType) query.propertyType = propertyType;

    // Bedrooms and bathrooms
    if (bedrooms) query.bedrooms = { $gte: Number(bedrooms) };
    if (bathrooms) query.bathrooms = { $gte: Number(bathrooms) };

    // Location
    if (city) {
        query['location.city'] = { $regex: city, $options: 'i' };
    }

    // Amenities
    if (amenities && amenities.length > 0) {
        query.features = { $all: amenities };
    }

    const pageSize = 12;
    const page = Number(req.query.page) || 1;

    const count = await Property.countDocuments(query);
    const properties = await Property.find(query)
        .populate('createdBy', 'name email')
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .sort({ createdAt: -1 });

    res.json({
        properties,
        page,
        pages: Math.ceil(count / pageSize),
        total: count,
    });
});

module.exports = {
    getSearchSuggestions,
    advancedSearch,
};