const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// @desc    Step 1: Register Data lo aur OTP bhejo
// @route   POST /api/users
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password || !phone) {
    res.status(400); throw new Error('Please add all fields');
  }
  if (!email.endsWith('@gmail.com')) {
    res.status(400); throw new Error('Only @gmail.com allowed');
  }

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists && userExists.isVerified) {
    res.status(400); throw new Error('User already exists');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // OTP Generate karo
  const otp = Math.floor(100000 + Math.random() * 900000);
  const otpExpires = Date.now() + 10 * 60 * 1000; // 10 mins

  // Agar user pehle se hai par verify nahi hua, toh update karo
  // Agar naya hai toh create karo
  let user = await User.findOne({ email });
  
  if (user) {
    user.name = name;
    user.password = hashedPassword;
    user.phone = phone;
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();
  } else {
    user = await User.create({
      name, email, password: hashedPassword, phone,
      otp, otpExpires, isVerified: false
    });
  }

  // Email Bhejo
  try {
    await sendEmail({
      email: user.email,
      subject: '📩 Verify Your Email - CampusSponsor',
      message: `${otp}`,
    });
    res.status(200).json({ message: 'OTP sent to email for verification' });
  } catch (error) {
    res.status(500); throw new Error('Email sending failed');
  }
});

// @desc    Step 2: Verify Registration OTP
// @route   POST /api/users/register/verify
const verifyRegisterOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });

  if (user && user.otp == otp && user.otpExpires > Date.now()) {
    
    // Verify Success
    user.isVerified = true; // Email Verified
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid or Expired OTP');
  }
});

// --- LOGIN (Ye purana wala hi hai, same rakhna) ---
const loginUser = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) { res.status(404); throw new Error('User not found.'); }

  const otp = Math.floor(100000 + Math.random() * 900000);
  user.otp = otp;
  user.otpExpires = Date.now() + 10 * 60 * 1000;
  await user.save();

  try {
    await sendEmail({ email: user.email, subject: '🔐 Login OTP', message: `${otp}` });
    res.status(200).json({ message: 'OTP sent' });
  } catch (error) { res.status(500); throw new Error('Email failed'); }
});

const verifyLoginOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });
  if (user && user.otp == otp && user.otpExpires > Date.now()) {
    user.otp = undefined; user.otpExpires = undefined; await user.save();
    res.json({ _id: user.id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified, token: generateToken(user._id) });
  } else { res.status(400); throw new Error('Invalid OTP'); }
});

const getMe = asyncHandler(async (req, res) => { res.status(200).json(req.user); });
const generateToken = (id) => { return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' }); };

module.exports = { registerUser, verifyRegisterOTP, loginUser, verifyLoginOTP, getMe };