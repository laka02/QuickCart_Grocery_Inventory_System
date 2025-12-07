import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function connectDB() {
    try {
        const atlasUri = process.env.MONGODB_URI || 'mongodb+srv://imashasandanayaka:k2JFFJXaHwvs9Ew5@grocerystore.u8z94.mongodb.net/?retryWrites=true&w=majority&appName=groceryStore';
        
        await mongoose.connect(atlasUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB Atlas');
    } catch (err) {
        console.error('❌ MongoDB Atlas connection error:', err);
        process.exit(1);
    }
}

export default connectDB;