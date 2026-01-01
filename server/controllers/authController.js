const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
// 👇 Tera utils wala sendEmail import kar
const sendEmail = require('../utils/sendEmail'); 

// --- 1. REGISTER USER (Email + Popup Backup) ---
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

  // OTP Generate
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const user = await User.create({
    name, email: cleanEmail, password: hashedPassword, phone, role: role || 'student',
    companyName: (role === 'sponsor' && companyName) ? companyName : '',
    collegeName: (role === 'student' && collegeName) ? collegeName : '',
    otp: otp,
    otpExpires: Date.now() + 10 * 60 * 1000,
    isVerified: false 
  });

  // 👇 TRY EMAIL (Agar Render block kare, toh server crash nahi hoga)
  try {
    await sendEmail({
      email: user.email,
      subject: 'Verify Your Account',
      message: otp
    });
  } catch (error) {
    console.log("⚠️ Email Failed (Block/Error). Using Popup Mode.");
  }

  console.log(`🔐 OTP FOR [${cleanEmail}]: ${otp}`);

  // 👇 RESPONSE (Popup ke liye OTP bhejo)
  res.status(200).json({ 
    message: 'OTP Generated', 
    email: user.email,
    debugOtp: otp // Frontend Popup isse dikhayega
  });
});

// --- 2. UPLOAD DOC (Cloudinary se URL pakdo) ---
const uploadDoc = asyncHandler(async (req, res) => {
  // Cloudinary middleware (Multer) file ko req.file me dalta hai
  if (!req.file || !req.file.path) {
    res.status(400);
    throw new Error('File upload failed. Cloudinary did not return URL.');
  }

  // 👇 Ye Direct Cloudinary URL hai
  const imageUrl = req.file.path; 

  const user = await User.findById(req.user.id);
  if (user) {
    user.verificationDoc = imageUrl;
    user.isVerified = false; // Doc upload kiya hai toh wapas verify karna padega admin ko
    await user.save();
    
    res.status(200).json({ 
      message: 'Document Uploaded Successfully!', 
      docUrl: imageUrl 
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// --- 3. VERIFY OTP ---
const verifyRegisterOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const cleanEmail = email ? email.toLowerCase().trim() : '';
  const inputOtp = otp ? otp.toString().replace(/\s/g, '') : ''; 

  const user = await User.findOne({ email: cleanEmail });
  if (!user) { res.status(404); throw new Error('User not found'); }

  const dbOtp = user.otp ? user.otp.toString().replace(/\s/g, '') : '';

  if (user.isVerified) { res.status(200).json({ message: 'Already verified' }); return; }

  if (dbOtp === inputOtp && user.otpExpires > Date.now()) {
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400); throw new Error('Invalid OTP');
  }
});

// --- 4. LOGIN USER ---
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const cleanEmail = email ? email.toLowerCase().trim() : '';
  const user = await User.findOne({ email: cleanEmail });

  if (user && (await bcrypt.compare(password, user.password))) {
    if (!user.isVerified) {
       res.status(401); throw new Error('Account Pending. Please Verify OTP.');
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

// Helpers & Exports
const getMe = asyncHandler(async (req, res) => { const user = await User.findById(req.user.id); res.status(200).json(user); });
const getAllUsers = asyncHandler(async (req, res) => { const users = await User.find().sort({ createdAt: -1 }); res.status(200).json(users); });
const approveUser = asyncHandler(async (req, res) => { await User.findByIdAndUpdate(req.params.id, { isVerified: true }); res.status(200).json({ message: 'Verified' }); });
const unverifyUser = asyncHandler(async (req, res) => { await User.findByIdAndUpdate(req.params.id, { isVerified: false }); res.status(200).json({ message: 'Revoked' }); });
const deleteUser = asyncHandler(async (req, res) => { await User.findByIdAndDelete(req.params.id); res.status(200).json({ message: 'Deleted' }); });
const generateToken = (id) => { return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' }); };

module.exports = { registerUser, verifyRegisterOTP, loginUser, uploadDoc, getMe, getAllUsers, approveUser, unverifyUser, deleteUser };