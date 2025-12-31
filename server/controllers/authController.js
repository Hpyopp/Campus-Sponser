const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// --- 1. REGISTER USER ---
// @desc    Register new user (Student or Sponsor)
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role, companyName } = req.body;

  if (!name || !email || !password || !phone) {
    res.status(400);
    throw new Error('Please add all required fields');
  }

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Hash Password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Generate 6 Digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000);

  // Create User
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    phone,
    role: role || 'student',
    // Agar Sponsor hai toh Company Name save karo, warna empty
    companyName: (role === 'sponsor' && companyName) ? companyName : '', 
    otp,
    otpExpires: Date.now() + 10 * 60 * 1000, // 10 Mins Valid
    isVerified: false
  });

  if (user) {
    console.log(`[DEV MODE] Register OTP for ${email}: ${otp}`);
    res.status(200).json({
      message: 'Registration Successful! Check Email for OTP.',
      debugOtp: otp // Frontend alert ke liye
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// --- 2. LOGIN USER ---
// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error('User not found. Please register first.');
  }

  // Generate New OTP for Login
  const otp = Math.floor(100000 + Math.random() * 900000);
  user.otp = otp;
  user.otpExpires = Date.now() + 10 * 60 * 1000;
  await user.save();

  console.log(`[DEV MODE] Login OTP for ${email}: ${otp}`);
  res.status(200).json({ 
    message: 'OTP Generated Successfully', 
    debugOtp: otp 
  });
});

// --- 3. VERIFY REGISTER OTP ---
const verifyRegisterOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });

  if (user && user.otp === otp && user.otpExpires > Date.now()) {
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyName: user.companyName,
      isVerified: user.isVerified,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid or Expired OTP');
  }
});

// --- 4. VERIFY LOGIN OTP ---
const verifyLoginOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });

  if (user && user.otp === otp && user.otpExpires > Date.now()) {
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyName: user.companyName,
      isVerified: user.isVerified,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid or Expired OTP');
  }
});

// --- 5. GET CURRENT USER ---
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.status(200).json(user);
});

// --- 6. ADMIN: GET ALL USERS ---
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password').sort({ createdAt: -1 });
  res.status(200).json(users);
});

// --- 7. ADMIN: APPROVE/REJECT KYC ---
const approveUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { isVerified: true });
  res.status(200).json({ message: 'User Verified Successfully' });
});

const unverifyUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { isVerified: false });
  res.status(200).json({ message: 'User Verification Revoked' });
});

// --- 8. ADMIN: DELETE USER ---
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  await user.deleteOne();
  res.status(200).json({ message: 'User Deleted' });
});

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = {
  registerUser,
  loginUser,
  verifyRegisterOTP,
  verifyLoginOTP,
  getMe,
  getAllUsers,
  approveUser,
  unverifyUser,
  deleteUser
};