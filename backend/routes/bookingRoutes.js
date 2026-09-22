const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  cancelBooking,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

// Protected Booking Endpoints
router.use(protect);

router.post('/', createBooking);
router.get('/my-bookings', getMyBookings);
router.delete('/:id', cancelBooking);

module.exports = router;
