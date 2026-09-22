const mongoose = require('mongoose');

// Destination Schema for Travel Escapes
const destinationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    moodCategory: {
      type: String,
      required: true,
      enum: ['Tropical Oasis', 'Mountain Retreat', 'Urban Adventure', 'Desert Mirage', 'Cultural Escape'],
    },
    description: {
      type: String,
      required: true,
    },
    pricePerNight: {
      type: Number,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    ratings: {
      type: Number,
      default: 4.5,
    },
    amenities: {
      type: [String],
      default: ['Wi-Fi', 'Pool', 'Breakfast Included'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Destination', destinationSchema);
