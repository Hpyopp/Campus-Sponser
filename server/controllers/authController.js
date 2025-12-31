const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// --- REGISTER USER ---
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password || !phone) { res.status(400); throw new Error('Please add all fields'); }
  
  // Check User
  const userExists = await User.findOne({ email });
  if (userExists && userExists.isVerified) { res.status(400); throw new Error('User already exists'); }

  // Hash Password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000);
  const otpExpires = Date.now() + 10 * 60 * 1000;

  // Save/Update User
  let user = await User.findOne({ email });
  if (user) {
    user.name = name; user.password = hashedPassword; user.phone = phone; user.otp = otp; user.otpExpires = otpExpires;
    await user.save();
  } else {
    user = await User.create({ name, email, password: hashedPassword, phone, otp, otpExpires, isVerified: false });
  }

  // 👇 BYPASS LOGIC: Try Email, if fail -> Send OTP in Response
  try {
    await sendEmail({ email: user.email, subject: 'Verification Code', message: `${otp}` });
    res.status(200).json({ message: 'OTP sent to email' });
  } catch (error) {
    console.log("⚠️ Email Failed. Sending Debug OTP.");
    res.status(200).json({ 
      message: 'Email Server Busy. USE THIS OTP:', 
      debugOtp: otp // 👈 Ye frontend pe dikhega
    });
  }
});

// --- LOGIN USER ---
const loginUser = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) { res.status(404); throw new Error('User not found.'); }

  const otp = Math.floor(100000 + Math.random() * 900000);
  user.otp = otp;
  user.otpExpires = Date.now() + 10 * 60 * 1000;
  await user.save();

  try {
    await sendEmail({ email: user.email, subject: 'Login OTP', message: `${otp}` });
    res.status(200).json({ message: 'OTP sent to email' });
  } catch (error) {
    console.log("⚠️ Email Failed. Sending Debug OTP.");
    res.status(200).json({ 
      message: 'Email Server Busy. USE THIS OTP:', 
      debugOtp: otp 
    });
  }
});

// --- VERIFY FUNCTIONS (Ye same rahenge) ---
const verifyRegisterOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });
  if (user && user.otp == otp) {
    user.isVerified = true; user.otp = undefined; user.otpExpires = undefined; await user.save();
    res.status(201).json({ _id: user.id, name: user.name, email: user.email, token: generateToken(user._id) });
  } else { res.status(400); throw new Error('Invalid OTP'); }
});

const verifyLoginOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });
  if (user && user.otp == otp) {
    user.otp = undefined; user.otpExpires = undefined; await user.save();
    res.json({ _id: user.id, name: user.name, email: user.email, token: generateToken(user._id) });
  } else { res.status(400); throw new Error('Invalid OTP'); }
});

const getMe = asyncHandler(async (req, res) => { res.status(200).json(req.user); });
const generateToken = (id) => { return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' }); };

module.exports = { registerUser, loginUser, verifyRegisterOTP, verifyLoginOTP, getMe };