const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Destination = require('../models/Destination');

// @route   POST /api/bookings
// @desc    Create a new trip booking
const createBooking = async (req, res) => {
  try {
    const { destinationId, checkInDate, checkOutDate, guests, totalPrice } = req.body;

    if (!destinationId || !checkInDate || !checkOutDate || !totalPrice) {
      return res.status(400).json({ success: false, message: 'Please provide all booking details' });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(destinationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid destination ID. If running locally, make sure database is seeded with "npm run seed".',
      });
    }

    // Verify destination exists
    const destination = await Destination.findById(destinationId);
    if (!destination) {
      return res.status(404).json({ success: false, message: 'Destination not found' });
    }

    // Create new booking record
    const booking = await Booking.create({
      user: req.user._id,
      destination: destinationId,
      checkInDate,
      checkOutDate,
      guests: guests || 1,
      totalPrice,
      status: 'Confirmed',
    });

    // Populate destination details for response
    const populatedBooking = await Booking.findById(booking._id).populate('destination');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: populatedBooking,
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ success: false, message: 'Server error creating booking' });
  }
};

// @route   GET /api/bookings/my-bookings
// @desc    Get logged in user's bookings
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('destination')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error('Fetch bookings error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching bookings' });
  }
};

// @route   DELETE /api/bookings/:id
// @desc    Cancel a booking (update status to Cancelled)
const cancelBooking = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid booking ID format' });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Ensure user owns this booking
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    booking.status = 'Cancelled';
    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking,
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ success: false, message: 'Server error cancelling booking' });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  cancelBooking,
};
