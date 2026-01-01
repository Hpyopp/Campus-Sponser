const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail'); 

// 1. REGISTER
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role, companyName, collegeName } = req.body;
  if (!name || !email || !password || !phone) { res.status(400); throw new Error('Fill all fields'); }

  const cleanEmail = email.toLowerCase().trim();
  const userExists = await User.findOne({ email: cleanEmail });
  if (userExists) { res.status(400); throw new Error('User already exists'); }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const user = await User.create({
    name, email: cleanEmail, password: hashedPassword, phone, role: role || 'student',
    companyName: (role === 'sponsor' && companyName) ? companyName : '',
    collegeName: (role === 'student' && collegeName) ? collegeName : '',
    otp, otpExpires: Date.now() + 10 * 60 * 1000, isVerified: false
  });

  // ⚡ INSTANT RESPONSE (Background Email)
  sendEmail({ email: user.email, subject: 'Verify Account', message: `Your OTP is: ${otp}` })
    .catch(err => console.log("Background Email Failed (Check logs)"));

  // Wait mat karo, seedha OTP bhejo
  res.status(200).json({ 
    message: 'OTP Generated Instantly', 
    email: user.email, 
    debugOtp: otp // 👈 Green Box ke liye
  });
});

// 2. LOGIN (Instant OTP)
const loginUser = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const cleanEmail = email ? email.toLowerCase().trim() : '';
  const user = await User.findOne({ email: cleanEmail });
  if (!user) { res.status(404); throw new Error('User not found'); }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = otp;
  user.otpExpires = Date.now() + 10 * 60 * 1000;
  await user.save();

  // ⚡ FIRE AND FORGET (No 'await')
  // Email peeche chalta rahega, hum user ko nahi rokenge
  sendEmail({ email: user.email, subject: 'Login OTP', message: `Your OTP is: ${otp}` })
    .catch(err => console.log("Background Email Failed"));

  // Turant Jawab
  res.status(200).json({ 
    message: 'OTP Ready', 
    debugOtp: otp // 👈 Green Box turant dikhega
  });
});

// 3. VERIFY LOGIN
const verifyLogin = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  
  if (user && user.otp === otp.toString().trim()) {
    user.otp = undefined; user.otpExpires = undefined; await user.save();
    res.json({ _id: user.id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id), isVerified: user.isVerified });
  } else {
    res.status(400); throw new Error('Invalid OTP');
  }
});

// 4. VERIFY REGISTER
const verifyRegisterOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (user && user.otp === otp.toString().trim()) {
    user.otp = undefined; user.otpExpires = undefined; await user.save();
    res.status(200).json({ _id: user.id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id), isVerified: false });
  } else {
    res.status(400); throw new Error('Invalid OTP');
  }
});

// 5. UPLOAD DOC
const uploadDoc = asyncHandler(async (req, res) => {
  if (!req.file || !req.file.path) { res.status(400); throw new Error('Upload failed'); }
  const user = await User.findById(req.user.id);
  if (user) {
    user.verificationDoc = req.file.path;
    user.isVerified = false; 
    await user.save();
    res.status(200).json({ message: 'Uploaded', docUrl: req.file.path });
  } else { res.status(404); throw new Error('User not found'); }
});

// 6. GET ME
const getMe = asyncHandler(async (req, res) => { const user = await User.findById(req.user.id); res.status(200).json(user); });

// ADMIN FUNCTIONS
const getAllUsers = asyncHandler(async (req, res) => { const users = await User.find().sort({ createdAt: -1 }); res.status(200).json(users); });
const approveUser = asyncHandler(async (req, res) => { await User.findByIdAndUpdate(req.params.id, { isVerified: true }); res.status(200).json({ message: 'Verified' }); });
const unverifyUser = asyncHandler(async (req, res) => { await User.findByIdAndUpdate(req.params.id, { isVerified: false }); res.status(200).json({ message: 'Revoked' }); });
const deleteUser = asyncHandler(async (req, res) => { await User.findByIdAndDelete(req.params.id); res.status(200).json({ message: 'Deleted' }); });

const generateToken = (id) => { return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' }); };

module.exports = { registerUser, loginUser, verifyLogin, verifyRegisterOTP, uploadDoc, getMe, getAllUsers, approveUser, unverifyUser, deleteUser };