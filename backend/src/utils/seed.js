const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Property = require('../models/Property');
const bcrypt = require('bcryptjs');

dotenv.config();

const sampleProperties = [
    {
        title: 'Luxury 3BHK Apartment with Sea View',
        description: 'Beautiful apartment with panoramic sea views, modern amenities, and premium finishes. Located in the heart of the city with easy access to schools, hospitals, and shopping centers.',
        price: 25000000,
        location: {
            address: '123 Marine Drive',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001',
            coordinates: { lat: 18.943, lng: 72.823 }
        },
        type: 'buy',
        propertyType: 'apartment',
        bedrooms: 3,
        bathrooms: 3,
        area: { value: 1850, unit: 'sqft' },
        features: ['Sea View', 'Modular Kitchen', 'Gym', 'Swimming Pool', 'Parking'],
        images: [
            {
                public_id: 'sample1',
                url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            },
            {
                public_id: 'sample2',
                url: 'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            }
        ],
        status: 'available',
        views: 150
    },
    {
        title: 'Modern Villa with Garden',
        description: 'Spacious villa with lush garden, perfect for family living and entertainment. Features include modern architecture, high ceilings, and premium finishes throughout.',
        price: 45000000,
        location: {
            address: '456 Green Acres',
            city: 'Bangalore',
            state: 'Karnataka',
            pincode: '560001',
            coordinates: { lat: 12.971, lng: 77.594 }
        },
        type: 'buy',
        propertyType: 'villa',
        bedrooms: 4,
        bathrooms: 5,
        area: { value: 3500, unit: 'sqft' },
        features: ['Garden', 'Private Pool', 'Home Theater', 'Staff Quarters', 'Security System'],
        images: [
            {
                public_id: 'sample3',
                url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            },
            {
                public_id: 'sample4',
                url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            }
        ],
        status: 'available',
        views: 89
    },
    {
        title: 'Downtown 2BHK for Rent',
        description: 'Centrally located apartment with easy access to offices, shopping, and entertainment. Fully furnished with modern amenities.',
        price: 45000,
        location: {
            address: '789 Business District',
            city: 'Gurgaon',
            state: 'Haryana',
            pincode: '122001',
            coordinates: { lat: 28.459, lng: 77.026 }
        },
        type: 'rent',
        propertyType: 'apartment',
        bedrooms: 2,
        bathrooms: 2,
        area: { value: 1200, unit: 'sqft' },
        features: ['Fully Furnished', 'Power Backup', 'Security', 'Parking', 'Gym'],
        images: [
            {
                public_id: 'sample5',
                url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            },
            {
                public_id: 'sample6',
                url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            }
        ],
        status: 'available',
        views: 234
    },
    {
        title: 'Penthouse with Rooftop Garden',
        description: 'Luxurious penthouse with private rooftop garden, stunning city views, and premium amenities.',
        price: 65000000,
        location: {
            address: '321 Skyline Towers',
            city: 'Delhi',
            state: 'Delhi',
            pincode: '110001',
            coordinates: { lat: 28.613, lng: 77.209 }
        },
        type: 'buy',
        propertyType: 'apartment',
        bedrooms: 4,
        bathrooms: 4,
        area: { value: 2800, unit: 'sqft' },
        features: ['Rooftop Garden', 'Private Terrace', 'Jacuzzi', 'Smart Home', 'Concierge'],
        images: [
            {
                public_id: 'sample7',
                url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            },
            {
                public_id: 'sample8',
                url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            }
        ],
        status: 'available',
        views: 67
    },
    {
        title: 'Commercial Office Space',
        description: 'Prime commercial office space in business district. Perfect for startups or established companies.',
        price: 120000,
        location: {
            address: '555 Business Park',
            city: 'Pune',
            state: 'Maharashtra',
            pincode: '411001',
            coordinates: { lat: 18.520, lng: 73.856 }
        },
        type: 'rent',
        propertyType: 'commercial',
        bedrooms: 0,
        bathrooms: 2,
        area: { value: 1500, unit: 'sqft' },
        features: ['Reception Area', 'Conference Room', 'Pantry', '24/7 Access', 'Security'],
        images: [
            {
                public_id: 'sample9',
                url: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            },
            {
                public_id: 'sample10',
                url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            }
        ],
        status: 'available',
        views: 45
    },
    {
        title: 'Beachfront Villa',
        description: 'Stunning beachfront villa with direct access to private beach. Perfect for luxury living.',
        price: 85000000,
        location: {
            address: '789 Beach Road',
            city: 'Goa',
            state: 'Goa',
            pincode: '403001',
            coordinates: { lat: 15.299, lng: 74.124 }
        },
        type: 'buy',
        propertyType: 'villa',
        bedrooms: 5,
        bathrooms: 6,
        area: { value: 4500, unit: 'sqft' },
        features: ['Private Beach', 'Infinity Pool', 'Spa', 'Home Theater', 'Wine Cellar'],
        images: [
            {
                public_id: 'sample11',
                url: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            },
            {
                public_id: 'sample12',
                url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            }
        ],
        status: 'available',
        views: 178
    }
];

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/realestate');
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await Property.deleteMany({});
        console.log('✅ Cleared existing properties');

        // Create admin user if not exists
        let admin = await User.findOne({ email: 'admin@estateelite.com' });

        if (!admin) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            admin = await User.create({
                name: 'Admin User',
                email: 'admin@estateelite.com',
                password: hashedPassword,
                role: 'admin'
            });
            console.log('✅ Admin user created');
        }

        // Add properties with admin as creator
        const propertiesWithOwner = sampleProperties.map(property => ({
            ...property,
            createdBy: admin._id
        }));

        await Property.insertMany(propertiesWithOwner);
        console.log(`✅ Added ${sampleProperties.length} sample properties`);

        // Create a test user
        const testUser = await User.findOne({ email: 'user@example.com' });
        if (!testUser) {
            const hashedPassword = await bcrypt.hash('user123', 10);
            await User.create({
                name: 'Test User',
                email: 'user@example.com',
                password: hashedPassword,
                role: 'user'
            });
            console.log('✅ Test user created');
        }

        console.log('\n🎉 Database seeded successfully!');
        console.log('\n📝 Login Credentials:');
        console.log('Admin - Email: admin@estateelite.com, Password: admin123');
        console.log('User - Email: user@example.com, Password: user123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();