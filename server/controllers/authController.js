const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  
  // 1. User dhundo
  const user = await User.findOne({ email });

  // 2. Password check karo (Bina salt issue ke)
  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' }),
    });
  } else {
    res.status(400).json({ message: 'Email ya Password galat hai!' });
  }
};

module.exports = { loginUser, registerUser: require('./registerLogic'), getMe: require('./meLogic') };