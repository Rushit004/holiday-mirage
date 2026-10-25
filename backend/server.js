// ==========================================
// HOLIDAY MIRAGE — BACKEND SERVER (server.js)
// Tech Stack: Node.js, Express.js, MongoDB
// ==========================================

const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

// Create Express application
const app = express();

// Configuration
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/holiday_mirage';
const DB_NAME = 'holiday_mirage';

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

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
}

// ------------------------------------------
// REST API ENDPOINTS
// ------------------------------------------

// Health Check Route (great for testing Render deployment)
app.get('/', (req, res) => {
  res.send('Holiday Mirage API Server is running successfully.');
});

// 1. GET /api/destinations — Retrieve all destinations
app.get('/api/destinations', async (req, res) => {
  try {
    const destinations = await db.collection('destinations').find().toArray();
    res.status(200).json(destinations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve destinations from database.' });
  }
});

// 2. POST /api/destinations — Add a new destination
app.post('/api/destinations', async (req, res) => {
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
      isAvailable: Boolean(isAvailable)
    };

    // Insert into MongoDB collection
    const result = await db.collection('destinations').insertOne(newDestination);

    // Return the created destination with its generated _id
    res.status(201).json({
      _id: result.insertedId,
      ...newDestination
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add destination to database.' });
  }
});

// 3. PATCH /api/destinations/:id — Toggle availability
app.patch('/api/destinations/:id', async (req, res) => {
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
      { $set: { isAvailable: Boolean(isAvailable) } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Destination not found.' });
    }

    res.status(200).json({ message: 'Destination availability updated successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update destination availability.' });
  }
});

// 4. DELETE /api/destinations/:id — Delete a destination
app.delete('/api/destinations/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid destination ID format.' });
    }

    // Delete from MongoDB
    const result = await db.collection('destinations').deleteOne({
      _id: new ObjectId(id)
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
