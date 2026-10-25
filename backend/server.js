// ==========================================
// HOLIDAY MIRAGE — BACKEND SERVER (server.js)
// Tech Stack: Node.js, Express.js, MongoDB (Native Driver), JWT, bcryptjs
// ==========================================

const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Create Express application
const app = express();

// Configuration
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/holiday_mirage';
const DB_NAME = process.env.DB_NAME || 'holiday_mirage';
const JWT_SECRET = process.env.JWT_SECRET || 'holiday_mirage_jwt_secret_dev_key_2026';
const JWT_EXPIRES_IN = '24h';

// ------------------------------------------
// MIDDLEWARE
// ------------------------------------------
// Enable Cross-Origin Resource Sharing so the React frontend can talk to Express
app.use(cors());

// Parse incoming JSON request bodies into req.body
app.use(express.json());

// ------------------------------------------
// DATABASE CONNECTION & SERVER STARTUP
// ------------------------------------------
let db;

async function startServer() {
  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log(`Connected successfully to MongoDB database: "${DB_NAME}"`);

    // Optional: Seed initial administrator if configured via environment variables
    await seedInitialAdmin();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
}

// Helper: Seed initial admin safely if environment credentials are provided and no admin exists
async function seedInitialAdmin() {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@holidaymirage.com').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
    const adminName = process.env.ADMIN_NAME || 'Holiday Mirage Admin';

    const users = db.collection('users');
    const existingAdmin = await users.findOne({ role: 'admin' });

    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);

      await users.insertOne({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date(),
      });
      console.log(`[SEED] Initial administrator created: ${adminEmail}`);
    }
  } catch (err) {
    console.warn('[SEED] Could not verify/seed admin:', err.message);
  }
}

// ------------------------------------------
// AUTHENTICATION & AUTHORIZATION MIDDLEWARES
// ------------------------------------------

// 1. Verify JWT Authentication Token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  // Token is expected in standard "Bearer <token>" format
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No authentication token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Contains: { userId, email, role, name }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired authentication token. Please log in again.' });
  }
}

// 2. Enforce Administrator Role
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access forbidden. Administrator privileges required.' });
  }
  next();
}

// ------------------------------------------
// REST API ENDPOINTS
// ------------------------------------------

// Health Check Route (great for testing Render / hosting deployment)
app.get('/', (req, res) => {
  res.send('Holiday Mirage API Server is running successfully.');
});

// ==========================================
// AUTHENTICATION ENDPOINTS
// ==========================================

// 1. POST /api/auth/register — Public registration (Always registers as 'user')
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate inputs
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide full name, email address, and password.' });
    }

    const trimmedName = String(name).trim();
    const normalizedEmail = String(email).toLowerCase().trim();

    if (!normalizedEmail.includes('@') || !normalizedEmail.includes('.')) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    // Hash password with bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Build user object — ALWAYS set role to 'user' (never trust client input)
    const newUser = {
      name: trimmedName,
      email: normalizedEmail,
      password: hashedPassword,
      role: 'user',
      createdAt: new Date(),
    };

    const result = await db.collection('users').insertOne(newUser);

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: result.insertedId.toString(),
        email: newUser.email,
        role: newUser.role,
        name: newUser.name,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Return response without password
    res.status(201).json({
      message: 'Account registered successfully.',
      token,
      user: {
        id: result.insertedId,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to register user. Please try again.' });
  }
});

// 2. POST /api/auth/login — Login for both Admin and User
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter your email and password.' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    // Find user in database
    const user = await db.collection('users').findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Verify password with bcryptjs
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate JWT token with user identity and DB-verified role
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Return response without password hash
    res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process login. Please try again.' });
  }
});

// 3. POST /api/auth/logout — Client-side logout notification
app.post('/api/auth/logout', (req, res) => {
  res.status(200).json({ message: 'Logged out successfully.' });
});

// 4. GET /api/auth/me — Retrieve authenticated user profile using token
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(req.user.userId) },
      { projection: { password: 0 } }
    );

    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify user profile.' });
  }
});

// ==========================================
// DESTINATIONS ENDPOINTS
// ==========================================

// 1. GET /api/destinations — Retrieve all destinations (Accessible to all)
app.get('/api/destinations', async (req, res) => {
  try {
    const destinations = await db.collection('destinations').find().toArray();
    res.status(200).json(destinations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve destinations from database.' });
  }
});

// 2. POST /api/destinations — Add a new destination (ADMIN ONLY)
app.post('/api/destinations', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, location, days, budget, isAvailable } = req.body;

    // Validate required fields
    if (!name || !location || days === undefined || budget === undefined) {
      return res.status(400).json({ error: 'Please provide destination name, location, days, and budget.' });
    }

    // Build destination object
    const newDestination = {
      name: String(name).trim(),
      location: String(location).trim(),
      days: Number(days),
      budget: Number(budget),
      isAvailable: Boolean(isAvailable),
      createdBy: req.user.email,
      createdAt: new Date(),
    };

    // Insert into MongoDB collection
    const result = await db.collection('destinations').insertOne(newDestination);

    // Return created destination with generated _id
    res.status(201).json({
      _id: result.insertedId,
      ...newDestination,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add destination to database.' });
  }
});

// 3. PATCH /api/destinations/:id — Toggle availability (ADMIN ONLY)
app.patch('/api/destinations/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;

    // Validate MongoDB ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid destination ID format.' });
    }

    if (isAvailable === undefined) {
      return res.status(400).json({ error: 'Please provide the updated isAvailable status.' });
    }

    // Update in MongoDB
    const result = await db.collection('destinations').updateOne(
      { _id: new ObjectId(id) },
      { $set: { isAvailable: Boolean(isAvailable), updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Destination not found.' });
    }

    res.status(200).json({ message: 'Destination availability updated successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update destination availability.' });
  }
});

// 4. DELETE /api/destinations/:id — Delete a destination (ADMIN ONLY)
app.delete('/api/destinations/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid destination ID format.' });
    }

    // Delete from MongoDB
    const result = await db.collection('destinations').deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Destination not found.' });
    }

    res.status(200).json({ message: 'Destination deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete destination from database.' });
  }
});

// Start the server
startServer();
