const mongoose = require('mongoose');
const dns = require('dns');
const dotenv = require('dotenv');
const Destination = require('./models/Destination');
const User = require('./models/User');

dotenv.config();

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const sampleDestinations = [
  {
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

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/holiday_mirage');
    console.log('Connected to MongoDB for seeding...');

    // Clear existing destinations
    await Destination.deleteMany();
    console.log('Cleared existing destinations');

    // Insert sample destinations
    await Destination.insertMany(sampleDestinations);
    console.log('Sample destinations inserted successfully!');

    // Create a demo user if doesn't exist
    const userExists = await User.findOne({ email: 'alex@example.com' });
    if (!userExists) {
      await User.create({
        name: 'Alex Rivera',
        email: 'alex@example.com',
        password: 'userpassword123',
        role: 'user',
      });
      console.log('Demo user created (alex@example.com / userpassword123)');
    }

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
