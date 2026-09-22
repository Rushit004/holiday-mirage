const Destination = require('../models/Destination');

// Fallback sample destinations if database is empty or offline
const defaultDestinations = [
  {
    _id: 'sample_001',
    title: 'Azure Lagoon Overwater Villa',
    location: 'Bora Bora, French Polynesia',
    moodCategory: 'Tropical Oasis',
    description: 'Immerse yourself in crystal blue waters, private sun decks, and vibrant coral reef vistas in this iconic turquoise haven.',
    pricePerNight: 450,
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    ratings: 4.9,
    amenities: ['Private Pool', 'Overwater Deck', 'Spa', 'Free Wi-Fi'],
  },
  {
    _id: 'sample_002',
    title: 'Swiss Alpine Glass Chalet',
    location: 'Zermatt, Switzerland',
    moodCategory: 'Mountain Retreat',
    description: 'Perched amidst snowy peaks with panoramic views of the Matterhorn, warm fireplace lounge, and world-class ski access.',
    pricePerNight: 380,
    imageUrl: 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=800&q=80',
    ratings: 4.8,
    amenities: ['Ski Access', 'Jacuzzi', 'Fireplace', 'Free Breakfast'],
  },
  {
    _id: 'sample_003',
    title: 'Neon Horizon Penthouse Suite',
    location: 'Tokyo, Japan',
    moodCategory: 'Urban Adventure',
    description: 'Ultra-modern high-rise living with floor-to-ceiling city views, sleek smart features, and steps away from Michelin dining.',
    pricePerNight: 290,
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
    ratings: 4.7,
    amenities: ['High-speed Wi-Fi', 'City View', 'Fitness Center'],
  },
  {
    _id: 'sample_004',
    title: 'Golden Sands Luxury Camp',
    location: 'Merzouga Desert, Morocco',
    moodCategory: 'Desert Mirage',
    description: 'Experience star-lit Arabian nights in luxury Berber tents with private en-suite baths, camel safaris, and bonfire feasts.',
    pricePerNight: 220,
    imageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
    ratings: 4.9,
    amenities: ['Desert Safari', 'Star-Gazing Deck', 'Traditional Dinner'],
  },
  {
    _id: 'sample_005',
    title: 'Palazzo Renaissance Estate',
    location: 'Florence, Italy',
    moodCategory: 'Cultural Escape',
    description: 'Historic Tuscan estate surrounded by cypress groves and vineyards, featuring authentic frescoes, wine cellar, and courtyard.',
    pricePerNight: 340,
    imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=800&q=80',
    ratings: 4.8,
    amenities: ['Wine Tasting', 'Olive Grove View', 'Swimming Pool'],
  },
  {
    _id: 'sample_006',
    title: 'Serengeti Safari Eco Lodge',
    location: 'Serengeti, Tanzania',
    moodCategory: 'Tropical Oasis',
    description: 'Luxury eco-lodge overlooking the wildlife migration path. Watch elephants and giraffes from your private veranda.',
    pricePerNight: 510,
    imageUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80',
    ratings: 5.0,
    amenities: ['Guided Safari', 'Infinity Pool', 'All-Inclusive Bar'],
  },
];

// @route   GET /api/destinations
// @desc    Get all destinations with mood & price filtering
const getDestinations = async (req, res) => {
  try {
    const { moodCategory, maxPrice, search } = req.query;

    let query = {};

    if (moodCategory && moodCategory !== 'All') {
      query.moodCategory = moodCategory;
    }

    if (maxPrice) {
      query.pricePerNight = { $lte: Number(maxPrice) };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    let destinations = await Destination.find(query).sort({ createdAt: -1 });

    // Fallback if database returns 0 results or is unseeded
    if (destinations.length === 0 && Object.keys(query).length === 0) {
      destinations = defaultDestinations;
    }

    res.json({
      success: true,
      count: destinations.length,
      data: destinations,
    });
  } catch (error) {
    console.error('Fetch destinations error:', error.message);
    // Return default sample destinations if MongoDB is offline
    res.json({
      success: true,
      count: defaultDestinations.length,
      data: defaultDestinations,
    });
  }
};

// @route   GET /api/destinations/:id
// @desc    Get single destination details by ID
const getDestinationById = async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);

    if (destination) {
      return res.json({ success: true, data: destination });
    }

    // Fallback check in default destinations
    const fallback = defaultDestinations.find((d) => d._id === req.params.id);
    if (fallback) {
      return res.json({ success: true, data: fallback });
    }

    res.status(404).json({ success: false, message: 'Destination not found' });
  } catch (error) {
    // Fallback search
    const fallback = defaultDestinations.find((d) => d._id === req.params.id);
    if (fallback) {
      return res.json({ success: true, data: fallback });
    }

    res.status(404).json({ success: false, message: 'Destination details not found' });
  }
};

// @route   POST /api/destinations
// @desc    Add a new destination
const createDestination = async (req, res) => {
  try {
    const { title, location, moodCategory, description, pricePerNight, imageUrl, ratings, amenities } = req.body;

    const destination = await Destination.create({
      title,
      location,
      moodCategory,
      description,
      pricePerNight,
      imageUrl,
      ratings: ratings || 4.5,
      amenities: amenities || ['Wi-Fi', 'Pool'],
    });

    res.status(201).json({ success: true, message: 'Destination created', data: destination });
  } catch (error) {
    console.error('Create destination error:', error);
    res.status(500).json({ success: false, message: 'Server error creating destination' });
  }
};

// @route   DELETE /api/destinations/:id
// @desc    Delete a destination
const deleteDestination = async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);

    if (destination) {
      await destination.deleteOne();
      res.json({ success: true, message: 'Destination removed' });
    } else {
      res.status(404).json({ success: false, message: 'Destination not found' });
    }
  } catch (error) {
    console.error('Delete destination error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting destination' });
  }
};

module.exports = {
  getDestinations,
  getDestinationById,
  createDestination,
  deleteDestination,
};
