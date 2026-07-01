const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Property = require('../models/Property');
const Subscription = require('../models/Subscription');

dotenv.config();


const sampleProperties = [
    {
        title: 'Luxurious 3 BHK Apartment in Downtown',
        description: 'A spacious and luxurious 3 BHK apartment located in the heart of the city with modern amenities and beautiful views.',
        price: 15000000,
        location: {
            address: '123 Downtown Street, Sector 5',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001',
            coordinates: {
                type: 'Point',
                coordinates: [72.8777, 19.0760]
            }
        },
        type: 'buy',
        propertyType: 'apartment',
        bedrooms: 3,
        bathrooms: 3,
        area: {
            value: 1800,
            unit: 'sqft'
        },
        images: [
            {
                public_id: 'sample_apartment_1',
                url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80'
            }
        ],
        features: ['Balcony', 'Modular Kitchen', 'Lift', 'Parking'],
        amenities: ['parking', 'gym', 'pool', 'security', 'elevator', 'power_backup'],
        featured: true,
        verified: true,
        status: 'available'
    },
    {
        title: 'Cozy 2 BHK House for Rent',
        description: 'A cozy independent house with a small garden, perfect for a family. Located in a quiet residential area.',
        price: 25000,
        location: {
            address: '45 Green Avenue, HSR Layout',
            city: 'Bangalore',
            state: 'Karnataka',
            pincode: '560102',
            coordinates: {
                type: 'Point',
                coordinates: [77.6413, 12.9116]
            }
        },
        type: 'rent',
        propertyType: 'house',
        bedrooms: 2,
        bathrooms: 2,
        area: {
            value: 1200,
            unit: 'sqft'
        },
        images: [
            {
                public_id: 'sample_house_1',
                url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80'
            }
        ],
        features: ['Garden', 'Private Terrace', 'Wardrobes'],
        amenities: ['parking', 'security', 'water_supply', 'pet_friendly'],
        featured: false,
        verified: true,
        status: 'available'
    },
    {
        title: 'Modern 4 BHK Villa with Private Pool',
        description: 'An exquisite 4 BHK villa featuring a private swimming pool, landscaped garden, and high-end security.',
        price: 45000000,
        location: {
            address: 'Plot 12, Palm Meadows, ECR',
            city: 'Chennai',
            state: 'Tamil Nadu',
            pincode: '600119',
            coordinates: {
                type: 'Point',
                coordinates: [80.2443, 12.8794]
            }
        },
        type: 'buy',
        propertyType: 'villa',
        bedrooms: 4,
        bathrooms: 4,
        area: {
            value: 3500,
            unit: 'sqft'
        },
        images: [
            {
                public_id: 'sample_villa_1',
                url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=600&q=80'
            }
        ],
        features: ['Private Pool', 'Lawn', 'Servant Quarters', 'Home Automation'],
        amenities: ['parking', 'gym', 'pool', 'garden', 'security', 'water_supply', 'cctv'],
        featured: true,
        verified: true,
        status: 'available'
    }
];

const seedDatabase = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('❌ MONGODB_URI is not defined in .env');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await Property.deleteMany({});
        await Subscription.deleteMany({});
        console.log('✅ Cleared existing properties and subscriptions');

        // Find or create admin
        let admin = await User.findOne({ role: 'admin' });
        if (!admin) {
            admin = await User.create({
                name: 'System Admin',
                email: process.env.ADMIN_EMAIL || 'realestateeliteteam01@gmail.com',
                password: 'AdminPassword123',
                role: 'admin',
                isVerified: true
            });
            console.log('✅ Admin user created');
        }

        // Find or create an agent
        let agent = await User.findOne({ role: 'agent' });
        if (!agent) {
            agent = await User.create({
                name: 'John Agent',
                email: 'agent@example.com',
                password: 'AgentPassword123',
                role: 'agent',
                isVerified: true
            });
            console.log('✅ Agent user created');
        }

        // Give agent a premium subscription
        await Subscription.create({
            user: agent._id,
            plan: 'premium',
            status: 'active',
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            amount: 999,
            razorpaySubscriptionId: 'seed_sub_1'
        });
        console.log('✅ Agent premium subscription added');

        // Add properties
        const propertiesWithOwner = sampleProperties.map((p, i) => ({
            ...p,
            createdBy: i % 2 === 0 ? admin._id : agent._id
        }));

        await Property.insertMany(propertiesWithOwner);
        console.log(`✅ Added ${sampleProperties.length} sample properties`);

        console.log('\n🎉 Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
