// ==========================================
// HOLIDAY MIRAGE — ADMIN SETUP SCRIPT (createAdmin.js)
// Tech Stack: Node.js, MongoDB Native Driver, bcryptjs
// ==========================================

const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Configuration
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/holiday_mirage';
const DB_NAME = process.env.DB_NAME || 'holiday_mirage';

// Credentials passed via CLI args OR environment variables OR defaults
// Usage: node createAdmin.js [email] [password] [name]
const adminEmail = (process.argv[2] || process.env.ADMIN_EMAIL || 'admin@holidaymirage.com').toLowerCase().trim();
const adminPassword = process.argv[3] || process.env.ADMIN_PASSWORD || 'Admin@123';
const adminName = process.argv[4] || process.env.ADMIN_NAME || 'Holiday Mirage Admin';

async function createAdmin() {
  const client = new MongoClient(MONGO_URI);

  try {
    console.log('Connecting to MongoDB database...');
    await client.connect();
    const db = client.db(DB_NAME);
    const usersCollection = db.collection('users');

    // 1. Basic input validation
    if (!adminEmail || !adminEmail.includes('@')) {
      console.error('[ERROR] Please provide a valid email address.');
      process.exit(1);
    }

    if (!adminPassword || adminPassword.length < 6) {
      console.error('[ERROR] Password must be at least 6 characters long.');
      process.exit(1);
    }

    // 2. Hash password with bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // 3. Check if user already exists
    const existingUser = await usersCollection.findOne({ email: adminEmail });

    if (existingUser) {
      // If user exists, elevate/reset credentials to ensure administrator access
      await usersCollection.updateOne(
        { _id: existingUser._id },
        {
          $set: {
            role: 'admin',
            name: adminName,
            password: hashedPassword,
            updatedAt: new Date()
          }
        }
      );
      console.log('----------------------------------------------------');
      console.log(' [SUCCESS] Existing account updated to Administrator:');
      console.log(` - Email:    ${adminEmail}`);
      console.log(` - Name:     ${adminName}`);
      console.log(` - Role:     admin`);
      console.log('----------------------------------------------------');
    } else {
      // Create fresh administrator document
      const newAdmin = {
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date()
      };

      await usersCollection.insertOne(newAdmin);
      console.log('----------------------------------------------------');
      console.log(' [SUCCESS] New Administrator created successfully:');
      console.log(` - Email:    ${adminEmail}`);
      console.log(` - Name:     ${adminName}`);
      console.log(` - Role:     admin`);
      console.log('----------------------------------------------------');
    }

    console.log('You can now log in using these credentials in the Holiday Mirage application.\n');
  } catch (error) {
    console.error('[ERROR] Failed to set up administrator:', error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

createAdmin();
