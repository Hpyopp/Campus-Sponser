const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// 1. REGISTER USER (SMART BYPASS MODE)
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role, companyName, collegeName } = req.body;

  if (!name || !email || !password || !phone) {
    res.status(400); throw new Error('Please add all fields');
  }

  const cleanEmail = email.toLowerCase().trim();
  const userExists = await User.findOne({ email: cleanEmail });
  if (userExists) { res.status(400); throw new Error('User already exists'); }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // OTP Generate (No spaces)
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const user = await User.create({
    name, email: cleanEmail, password: hashedPassword, phone, role: role || 'student',
    companyName: (role === 'sponsor' && companyName) ? companyName : '',
    collegeName: (role === 'student' && collegeName) ? collegeName : '',
    otp: otp,
    otpExpires: Date.now() + 10 * 60 * 1000,
    isVerified: false 
  });

  console.log(`🔐 OTP GENERATED FOR [${cleanEmail}]: ${otp}`);

  res.status(200).json({ 
    message: 'OTP Generated (Dev Mode)', 
    email: user.email,
    debugOtp: otp 
  });
});

// 2. VERIFY OTP (FIXED: WHITESPACE REMOVER 🧹)
const verifyRegisterOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  // Data Cleaning (Spaces hatao)
  const cleanEmail = email ? email.toLowerCase().trim() : '';
  const inputOtp = otp ? otp.toString().replace(/\s/g, '') : ''; // Remove ALL spaces

  console.log(`🔍 VERIFY ATTEMPT: Email=[${cleanEmail}] InputOTP=[${inputOtp}]`);

  const user = await User.findOne({ email: cleanEmail });

  if (!user) { 
    console.log("❌ User Not Found");
    res.status(404); throw new Error('User not found'); 
  }

  // Database OTP Cleaning
  const dbOtp = user.otp ? user.otp.toString().replace(/\s/g, '') : '';
  
  console.log(`💾 DB CHECK: DbOTP=[${dbOtp}] vs InputOTP=[${inputOtp}]`);

  if (user.isVerified) { 
    res.status(200).json({ message: 'User already verified. Login now.' }); 
    return; 
  }

  // STRICT COMPARISON
  if (dbOtp === inputOtp && user.otpExpires > Date.now()) {
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    console.log("✅ SUCCESS: OTP Matched!");

    res.status(200).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    console.log("❌ FAIL: OTP Mismatch");
    if (user.otpExpires <= Date.now()) {
        res.status(400); throw new Error('OTP Expired. Please Register Again.');
    } else {
        res.status(400); throw new Error(`Invalid OTP. You entered ${inputOtp}`);
    }
  }
});

// 3. LOGIN USER
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const cleanEmail = email ? email.toLowerCase().trim() : '';
  
  const user = await User.findOne({ email: cleanEmail });

  if (user && (await bcrypt.compare(password, user.password))) {
    if (!user.isVerified) {
       res.status(401); throw new Error('Account not verified. Please verify OTP first.');
    }
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400); throw new Error('Invalid credentials');
  }
});

const getMe = asyncHandler(async (req, res) => { const user = await User.findById(req.user.id); res.status(200).json(user); });
const getAllUsers = asyncHandler(async (req, res) => { const users = await User.find().sort({ createdAt: -1 }); res.status(200).json(users); });
const approveUser = asyncHandler(async (req, res) => { await User.findByIdAndUpdate(req.params.id, { isVerified: true }); res.status(200).json({ message: 'Verified' }); });
const unverifyUser = asyncHandler(async (req, res) => { await User.findByIdAndUpdate(req.params.id, { isVerified: false }); res.status(200).json({ message: 'Revoked' }); });
const deleteUser = asyncHandler(async (req, res) => { await User.findByIdAndDelete(req.params.id); res.status(200).json({ message: 'Deleted' }); });
const generateToken = (id) => { return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' }); };

module.exports = { registerUser, verifyRegisterOTP, loginUser, getMe, getAllUsers, approveUser, unverifyUser, deleteUser };