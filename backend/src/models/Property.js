const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
    },
    price: {
        type: Number,
        required: [true, 'Please add price'],
    },
    location: {
        address: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        pincode: {
            type: String,
            required: true,
        },
        coordinates: {
            lat: Number,
            lng: Number,
        },
    },
    type: {
        type: String,
        enum: ['buy', 'rent'],
        required: true,
    },
    propertyType: {
        type: String,
        enum: ['apartment', 'house', 'villa', 'commercial'],
        required: true,
    },
    bedrooms: {
        type: Number,
        required: true,
        min: 0,
    },
    bathrooms: {
        type: Number,
        required: true,
        min: 0,
    },
    area: {
        value: {
            type: Number,
            required: true,
        },
        unit: {
            type: String,
            enum: ['sqft', 'sqm'],
            default: 'sqft',
        },
    },
    images: [{
        public_id: String,
        url: String,
    }],
    features: [String],
    status: {
        type: String,
        enum: ['available', 'sold', 'rented'],
        default: 'available',
    },
    views: {
        type: Number,
        default: 0,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

// Index for search functionality
propertySchema.index({
    'location.city': 'text',
    'location.address': 'text',
    title: 'text',
    description: 'text'
});

module.exports = mongoose.model('Property', propertySchema);