import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DestinationCard from '../components/DestinationCard';
import BookingModal from '../components/BookingModal';

const sampleDestinations = [
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

const Destinations = () => {
  const [destinations, setDestinations] = useState(sampleDestinations);
  const [selectedMood, setSelectedMood] = useState('All');
  const [maxPrice, setMaxPrice] = useState(1000);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const moodCategories = ['All', 'Tropical Oasis', 'Mountain Retreat', 'Urban Adventure', 'Desert Mirage', 'Cultural Escape'];

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/destinations');
        if (res.data.success && res.data.data.length > 0) {
          setDestinations(res.data.data);
        }
      } catch (err) {
        console.warn('API connection offline or unseeded, using sample destinations:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  // Filter destinations by mood, max price, and search query
  const filteredDestinations = destinations.filter((dest) => {
    const matchesMood = selectedMood === 'All' || dest.moodCategory === selectedMood;
    const matchesPrice = dest.pricePerNight <= maxPrice;
    const matchesSearch =
      searchQuery === '' ||
      dest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMood && matchesPrice && matchesSearch;
  });

  const handleBookClick = (destination) => {
    setSelectedDestination(destination);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div>
        <h1 className="text-3xl font-extrabold text-white">All Destination Escapes</h1>
        <p className="text-xs text-slate-400 mt-1">Browse our complete list of travel destinations.</p>
      </div>

      {/* Filter Controls */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Search Box */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Search Destination</label>
            <input
              type="text"
              placeholder="Search by title or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Price Range Slider */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
              <span>Max Price Per Night</span>
              <span className="text-teal-400 font-bold">${maxPrice}</span>
            </div>
            <input
              type="range"
              min="100"
              max="1000"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded appearance-none cursor-pointer accent-teal-400"
            />
          </div>

        </div>

        {/* Category Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2">Category Filter</label>
          <div className="flex flex-wrap gap-2">
            {moodCategories.map((mood) => (
              <button
                key={mood}
                onClick={() => setSelectedMood(mood)}
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                  selectedMood === mood
                    ? 'bg-teal-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {mood}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Destination Grid */}
      {loading ? (
        <div className="text-center py-10 text-slate-400">Loading destinations...</div>
      ) : filteredDestinations.length === 0 ? (
        <div className="bg-slate-900 p-8 rounded-xl text-center text-slate-400 border border-slate-800">
          No matching destinations found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDestinations.map((dest) => (
            <DestinationCard key={dest._id} destination={dest} onBookClick={handleBookClick} />
          ))}
        </div>
      )}

      {/* Booking Modal */}
      <BookingModal
        destination={selectedDestination}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

    </div>
  );
};

export default Destinations;
