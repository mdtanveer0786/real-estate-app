'use strict';

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        index: true,
    },
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    title: {
        type: String,
        maxlength: 100,
        trim: true,
    },
    comment: {
        type: String,
        required: true,
        maxlength: 1000,
        trim: true,
    },
    helpful: {
        type: Number,
        default: 0,
    },
    reported: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

// Prevent duplicate reviews (one review per user per property/agent)
reviewSchema.index({ user: 1, property: 1 }, { unique: true, sparse: true });
reviewSchema.index({ user: 1, agent: 1 }, { unique: true, sparse: true });

// Static: Calculate average rating for a property
reviewSchema.statics.calcAverageRating = async function (propertyId) {
    const stats = await this.aggregate([
        { $match: { property: propertyId } },
        {
            $group: {
                _id: '$property',
                avgRating: { $avg: '$rating' },
                numReviews: { $sum: 1 },
            },
        },
    ]);

    if (stats.length > 0) {
        await mongoose.model('Property').findByIdAndUpdate(propertyId, {
            avgRating: Math.round(stats[0].avgRating * 10) / 10,
            numReviews: stats[0].numReviews,
        });
    } else {
        await mongoose.model('Property').findByIdAndUpdate(propertyId, {
            avgRating: 0,
            numReviews: 0,
        });
    }
};

// Trigger rating recalculation after save/remove
reviewSchema.post('save', function () {
    if (this.property) this.constructor.calcAverageRating(this.property);
});

reviewSchema.post('deleteOne', { document: true, query: false }, function () {
    if (this.property) this.constructor.calcAverageRating(this.property);
});

module.exports = mongoose.model('Review', reviewSchema);
