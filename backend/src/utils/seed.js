const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Property = require('../models/Property');
const Subscription = require('../models/Subscription');

dotenv.config();


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
