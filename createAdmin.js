const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function createAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bus_booking');
        
        const adminExists = await User.findOne({ email: 'admin@example.com' });
        if (adminExists) {
            console.log('✅ Admin user already exists');
            process.exit(0);
        }
        
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'admin123',
            phone: '1234567890',
            role: 'admin'
        });
        
        console.log('✅ Admin user created successfully!');
        console.log('Email: admin@example.com');
        console.log('Password: admin123');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

createAdmin();