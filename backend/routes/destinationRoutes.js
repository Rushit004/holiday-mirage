const express = require('express');
const router = express.Router();
const {
  getDestinations,
  getDestinationById,
  createDestination,
  deleteDestination,
} = require('../controllers/destinationController');
const { protect } = require('../middleware/authMiddleware');

// Destination Endpoints
router.get('/', getDestinations);
router.get('/:id', getDestinationById);
router.post('/', protect, createDestination);
router.delete('/:id', protect, deleteDestination);

module.exports = router;
