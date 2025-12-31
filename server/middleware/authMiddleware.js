const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token (Password hata ke)
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.log(error);
      res.status(401);
      throw new Error('Not authorized');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// 👇 NAYA ADMIN GUARD (Ye naya code hai)
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next(); // Jao bhai, tum admin ho
  } else {
    res.status(403); // Forbidden
    throw new Error('⛔ Not Authorized as Admin');
  }
};

module.exports = { protect, adminOnly };