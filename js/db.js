require('dotenv').config();

const mongoose = require('mongoose');

const mongoURI = 'mongodb://localhost:27017/foodwebsite';

module.exports = { connectDB };

async function connectDB() {
    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB connected');
        return mongoose.connection;
    } catch (error) {
        console.error('Failed to connect to MongoDB', error);
        throw error;
    }
}

module.exports = { connectDB };
