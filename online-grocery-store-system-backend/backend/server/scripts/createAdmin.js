import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.model.js';
import connectDB from '../utils/util.js';

dotenv.config();

const createAdmin = async () => {
    try {
        await connectDB();
        
        const email = process.argv[2] || 'admin@inventory.com';
        const password = process.argv[3] || 'admin123';
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('⚠️  User with this email already exists!');
            console.log(`Email: ${email}`);
            console.log(`Role: ${existingUser.role}`);
            console.log('\n💡 If you forgot your password, use the password reset feature:');
            console.log('   1. Go to /forgot-password in the frontend');
            console.log('   2. Or use the API: POST /api/auth/forgot-password');
            console.log('\n💡 To reset the password directly, you can:');
            console.log('   1. Delete the user from the database');
            console.log('   2. Run this script again');
            process.exit(1);
        }
        
        // Create admin user
        const user = new User({
            email,
            password,
            role: 'admin'
        });
        
        await user.save();
        console.log('✅ Admin user created successfully!');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log('\n⚠️  Please change the password after first login!');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        process.exit(1);
    }
};

createAdmin();

