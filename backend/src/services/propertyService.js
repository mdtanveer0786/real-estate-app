'use strict';

const Property = require('../models/Property');
const AppError = require('../utils/AppError');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

class PropertyService {
    /**
     * List properties with filters, pagination, and sorting.
     */
    static async list(query = {}) {
        const pageSize = Number(query.limit) || 12;
        const page = Number(query.page) || 1;

        const filter = {};

        // Status filter (default: available)
        if (query.status === 'all') {
            // Do not filter by status
        } else if (query.status) {
            filter.status = query.status;
        } else {
            filter.status = 'available';
        }

        // Keyword search
        if (query.keyword) {
            filter.$or = [
                { title: { $regex: query.keyword, $options: 'i' } },
                { description: { $regex: query.keyword, $options: 'i' } },
                { 'location.city': { $regex: query.keyword, $options: 'i' } },
                { 'location.address': { $regex: query.keyword, $options: 'i' } },
            ];
        }

        // Filter by type (buy/rent)
        if (query.type) filter.type = query.type;

        // Filter by property type
        if (query.propertyType) filter.propertyType = query.propertyType;

        // Price range
        if (query.minPrice || query.maxPrice) {
            filter.price = {};
            if (query.minPrice) filter.price.$gte = Number(query.minPrice);
            if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
        }

        // Bedrooms (minimum)
        if (query.bedrooms) filter.bedrooms = { $gte: Number(query.bedrooms) };

        // Bathrooms (minimum)
        if (query.bathrooms) filter.bathrooms = { $gte: Number(query.bathrooms) };

        // City
        if (query.city) {
            filter['location.city'] = { $regex: query.city, $options: 'i' };
        }

        // Amenities (must have all specified)
        if (query.amenities) {
            const amenitiesList = Array.isArray(query.amenities)
                ? query.amenities
                : query.amenities.split(',');
            filter.amenities = { $all: amenitiesList };
        }

        // Featured only
        if (query.featured === 'true') filter.featured = true;

        // Near coordinates (radius search in km)
        if (query.lat && query.lng && query.radius) {
            filter['location.coordinates'] = {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [Number(query.lng), Number(query.lat)],
                    },
                    $maxDistance: Number(query.radius) * 1000, // km to meters
                },
            };
        }

        // Filter by creator
        if (query.createdBy) {
            filter.createdBy = query.createdBy;
        }

        // Sort
        let sort = '-createdAt';
        if (query.sort === 'price_asc') sort = 'price';
        else if (query.sort === 'price_desc') sort = '-price';
        else if (query.sort === 'newest') sort = '-createdAt';
        else if (query.sort === 'oldest') sort = 'createdAt';
        else if (query.sort === 'rating') sort = '-avgRating';
        else if (query.sort === 'popular') sort = '-views';

        const [total, properties] = await Promise.all([
            Property.countDocuments(filter),
            Property.find(filter)
                .populate('createdBy', 'name email avatar')
                .limit(pageSize)
                .skip(pageSize * (page - 1))
                .sort(sort),
        ]);

        return {
            properties,
            page,
            pages: Math.ceil(total / pageSize),
            total,
        };
    }

    /**
     * Get a single property by ID or slug. Increments view count.
     */
    static async getById(idOrSlug) {
        let property;

        // Try slug first, then ObjectId
        property = await Property.findOne({ slug: idOrSlug })
            .populate('createdBy', 'name email phone avatar');

        if (!property) {
            property = await Property.findById(idOrSlug)
                .populate('createdBy', 'name email phone avatar');
        }

        if (!property) throw AppError.notFound('Property');

        // Increment views (fire-and-forget)
        Property.updateOne({ _id: property._id }, { $inc: { views: 1 } }).exec();

        return property;
    }

    /**
     * Create a new property listing.
     */
    static async create(data, userId) {
        const property = await Property.create({
            ...data,
            createdBy: userId,
        });

        return property;
    }

    /**
     * Update property (owner or admin validation should happen in controller).
     */
    static async update(id, data, userId, userRole) {
        const property = await Property.findById(id);
        if (!property) throw AppError.notFound('Property');

        // Agents can only update their own
        if (userRole === 'agent' && property.createdBy.toString() !== userId.toString()) {
            throw AppError.forbidden('You can only update your own properties');
        }

        // Handle Cloudinary cleanup for removed images
        if (data.images) {
            const removedImages = property.images.filter(
                oldImg => !data.images.some(newImg => newImg.public_id === oldImg.public_id)
            );
            await Promise.all(
                removedImages.filter(img => img.public_id).map(img => deleteFromCloudinary(img.public_id))
            );
        }

        const updated = await Property.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });

        return updated;
    }

    /**
     * Delete a property and its Cloudinary images.
     */
    static async delete(id, userId, userRole) {
        const property = await Property.findById(id);
        if (!property) throw AppError.notFound('Property');

        // Agents can only delete their own
        if (userRole === 'agent' && property.createdBy.toString() !== userId.toString()) {
            throw AppError.forbidden('You can only delete your own properties');
        }

        // Cleanup Cloudinary images
        await Promise.all(
            property.images.filter(img => img.public_id).map(img => deleteFromCloudinary(img.public_id))
        );

        await property.deleteOne();
        return { message: 'Property removed' };
    }

    /**
     * Upload images to Cloudinary and attach to property.
     */
    static async uploadImages(propertyId, files, userId, userRole) {
        const property = await Property.findById(propertyId);
        if (!property) throw AppError.notFound('Property');

        // Agents can only upload to their own
        if (userRole === 'agent' && property.createdBy.toString() !== userId.toString()) {
            throw AppError.forbidden('You can only upload images to your own properties');
        }

        if (!files?.length) throw AppError.badRequest('Please upload images');

        const uploaded = await Promise.all(
            files.map(file => {
                const b64 = Buffer.from(file.buffer).toString('base64');
                const dataURI = `data:${file.mimetype};base64,${b64}`;
                return uploadToCloudinary(dataURI, 'properties');
            })
        );

        property.images.push(...uploaded);
        await property.save();
        return property;
    }

    /**
     * Get featured properties.
     */
    static async getFeatured(limit = 6) {
        return Property.find({ featured: true, status: 'available' })
            .populate('createdBy', 'name email avatar')
            .limit(limit)
            .sort('-createdAt');
    }

    /**
     * Get similar properties (same city, type, price range).
     */
    static async getSimilar(propertyId, limit = 4) {
        const property = await Property.findById(propertyId);
        if (!property) return [];

        const priceRange = 0.3; // ±30%
        return Property.find({
            _id: { $ne: propertyId },
            status: 'available',
            type: property.type,
            'location.city': property.location.city,
            price: {
                $gte: property.price * (1 - priceRange),
                $lte: property.price * (1 + priceRange),
            },
        })
            .populate('createdBy', 'name avatar')
            .limit(limit)
            .sort('-createdAt');
    }
}

module.exports = PropertyService;
