const mongoose = require('mongoose');
const dns = require('dns');

// Ensure reliable DNS resolution for MongoDB Atlas SRV records
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Use default if restricted
}

// Connect to MongoDB database
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/holiday_mirage', {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.log('⚠️ MongoDB is not accessible. Please ensure the MongoDB service is running (e.g., net start MongoDB or mongod) or update MONGO_URI in backend/.env');
  }
};

module.exports = connectDB;
