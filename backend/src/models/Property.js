const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: 150,
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: 5000,
    },
    price: {
        type: Number,
        required: [true, 'Please add price'],
        min: 0,
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
        // GeoJSON for map-based search (near me, radius search)
        coordinates: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                default: [0, 0],
            },
        },
    },
    type: {
        type: String,
        enum: ['buy', 'rent'],
        required: true,
    },
    propertyType: {
        type: String,
        enum: ['apartment', 'house', 'villa', 'commercial', 'plot', 'penthouse'],
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
            min: 0,
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

    // ── New fields ───────────────────────────────────────────────────────────
    amenities: [{
        type: String,
        enum: [
            'parking', 'gym', 'pool', 'garden', 'security',
            'elevator', 'power_backup', 'water_supply', 'clubhouse',
            'playground', 'wifi', 'ac', 'furnished', 'pet_friendly',
            'balcony', 'terrace', 'storage', 'cctv', 'intercom',
        ],
    }],
    featured: {
        type: Boolean,
        default: false,
    },
    verified: {
        type: Boolean,
        default: false,
    },

    // ── Reviews (computed from Review model) ─────────────────────────────────
    avgRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
    numReviews: {
        type: Number,
        default: 0,
    },

    // ── Analytics ────────────────────────────────────────────────────────────
    views: {
        type: Number,
        default: 0,
    },
    clicks: {
        type: Number,
        default: 0,
    },
    inquiryCount: {
        type: Number,
        default: 0,
    },

    status: {
        type: String,
        enum: ['available', 'sold', 'rented', 'pending', 'draft'],
        default: 'available',
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
});

// ── Indexes ──────────────────────────────────────────────────────────────────

// Text search
propertySchema.index({
    'location.city': 'text',
    'location.address': 'text',
    title: 'text',
    description: 'text',
});

// Geospatial (nearby search)
propertySchema.index({ 'location.coordinates': '2dsphere' });

// Common query patterns
propertySchema.index({ status: 1, type: 1, propertyType: 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ createdBy: 1 });
propertySchema.index({ featured: 1, status: 1 });
propertySchema.index({ slug: 1 });

// ── Pre-save: auto-generate slug ─────────────────────────────────────────────

propertySchema.pre('save', async function (next) {
    if (!this.isModified('title')) return next();

    let slug = this.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    // Ensure uniqueness
    const existing = await mongoose.model('Property').countDocuments({
        slug: new RegExp(`^${slug}(-\\d+)?$`),
        _id: { $ne: this._id },
    });

    if (existing > 0) {
        slug = `${slug}-${existing + 1}`;
    }

    this.slug = slug;
    next();
});

// ── Virtual: price per sqft ──────────────────────────────────────────────────

propertySchema.virtual('pricePerSqft').get(function () {
    if (this.area?.value > 0) {
        return Math.round(this.price / this.area.value);
    }
    return null;
});

propertySchema.set('toJSON', { virtuals: true });
propertySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Property', propertySchema);