const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Register new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body; // 👈 Phone add kiya

  if (!name || !email || !password || !phone) {
    res.status(400);
    throw new Error('Please add all fields including Phone Number');
  }

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    phone // 👈 Save Phone
  });

  if (user) {
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone, // 👈 Return Phone
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// ... Login aur GetMe code same rahega (No Change needed there)

// ... baaki puraana loginUser aur getMe function same rakhna
// Bas upar ka registerUser replace karna hai.

// (Just helper function for token)
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Baaki functions (loginUser, getMe) ko touch mat karna
// Main yahan short mein export kar raha hu par tu file mein pura rakhna
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone, // Login pe bhi phone bhejo
            role: user.role,
            isVerified: user.isVerified,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid credentials');
    }
});

const getMe = asyncHandler(async (req, res) => {
    res.status(200).json(req.user);
});

module.exports = { registerUser, loginUser, getMe };