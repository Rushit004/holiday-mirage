const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes and verify JWT token
const protect = async (req, res, next) => {
  let token;

  // Check if Authorization header with Bearer token is present
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mirage_secret_123');

      // Find user by ID (exclude password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      next();
    } catch (error) {
      console.error('Auth Middleware Error:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };
