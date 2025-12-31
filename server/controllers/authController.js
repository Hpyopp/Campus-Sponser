const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// ------------------------------------------
// ✅ PUBLIC FUNCTIONS (Register, Login, OTP)
// ------------------------------------------

// @desc    Register (Generate OTP)
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  if (!name || !email || !password || !phone) { res.status(400); throw new Error('Please add all fields'); }
  if (!email.endsWith('@gmail.com')) { res.status(400); throw new Error('Only @gmail.com allowed'); }

  const userExists = await User.findOne({ email });
  // Agar user pehle se verified hai toh error do, warnaa re-register karne do
  if (userExists && userExists.isVerified) { res.status(400); throw new Error('User already exists'); }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const otp = Math.floor(100000 + Math.random() * 900000);
  const otpExpires = Date.now() + 10 * 60 * 1000;

  let user = await User.findOne({ email });
  if (user) {
    user.name = name; user.password = hashedPassword; user.phone = phone; 
    user.role = role || 'student'; 
    user.otp = otp; user.otpExpires = otpExpires;
    // Note: Hum yahan isVerified change nahi kar rahe, taaki purana status bana rahe
    await user.save();
  } else {
    user = await User.create({ 
      name, email, password: hashedPassword, phone, 
      role: role || 'student', 
      otp, otpExpires, 
      isVerified: false // 👈 Default: NOT VERIFIED
    });
  }

  res.status(200).json({ 
    message: 'Verification Code Generated (Dev Mode)', 
    debugOtp: otp 
  });
});

// @desc    Login (Generate OTP)
const loginUser = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) { res.status(404); throw new Error('User not found. Please Register.'); }

  const otp = Math.floor(100000 + Math.random() * 900000);
  user.otp = otp;
  user.otpExpires = Date.now() + 10 * 60 * 1000;
  await user.save();

  res.status(200).json({ 
    message: 'Login Code Generated (Dev Mode)', 
    debugOtp: otp 
  });
});

// @desc    Verify Register OTP (CRITICAL FIX HERE)
const verifyRegisterOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });

  if (user && user.otp == otp) {
    // 🛑 STOP: Pehle yahan 'user.isVerified = true' tha. Maine hata diya.
    // Ab OTP verify hone par sirf EMAIL confirm hoga, KYC nahi.
    
    user.otp = undefined; 
    user.otpExpires = undefined; 
    await user.save();

    res.status(201).json({ 
      _id: user.id, name: user.name, email: user.email, 
      role: user.role, isVerified: user.isVerified, // Ye ab FALSE jayega
      token: generateToken(user._id) 
    });
  } else { res.status(400); throw new Error('Invalid OTP'); }
});

// @desc    Verify Login OTP
const verifyLoginOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });

  if (user && user.otp == otp) {
    user.otp = undefined; user.otpExpires = undefined; await user.save();
    res.json({ 
      _id: user.id, name: user.name, email: user.email, 
      role: user.role, isVerified: user.isVerified, 
      token: generateToken(user._id) 
    });
  } else { res.status(400); throw new Error('Invalid OTP'); }
});

// @desc    Get Current User
const getMe = asyncHandler(async (req, res) => { 
  res.status(200).json(req.user); 
});

// ------------------------------------------
// 🔐 ADMIN FUNCTIONS
// ------------------------------------------

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password').sort({ createdAt: -1 });
  res.status(200).json(users);
});

const approveUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { isVerified: true });
  res.status(200).json({ message: 'User Verified ✅' });
});

const unverifyUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { isVerified: false });
  res.status(200).json({ message: 'User Unverified ❌' });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  await user.deleteOne(); 
  res.status(200).json({ message: 'User Deleted 🗑️' });
});

const generateToken = (id) => { 
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' }); 
};

module.exports = {
  registerUser, loginUser, verifyRegisterOTP, verifyLoginOTP, getMe,
  getAllUsers, approveUser, unverifyUser, deleteUser
};