const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail'); 

// 1. REGISTER USER
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role, companyName, collegeName } = req.body;

  // Validation
  if (!name || !email || !password || !phone) { 
      res.status(400); throw new Error('Please fill all fields including Phone Number'); 
  }

  const cleanEmail = email.toLowerCase().trim();
  const userExists = await User.findOne({ email: cleanEmail });
  
  if (userExists) { res.status(400); throw new Error('User already exists'); }

  // Hash Password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  // OTP Generation
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Create User
  const user = await User.create({
    name, 
    email: cleanEmail, 
    password: hashedPassword, 
    phone, // 👈 Phone Saved Here
    role: role || 'student',
    companyName: (role === 'sponsor' && companyName) ? companyName : '',
    collegeName: (role === 'student' && collegeName) ? collegeName : '',
    otp, 
    otpExpires: Date.now() + 10 * 60 * 1000, // 10 Minutes
    isVerified: false
  });
  
  // Send Email (Async - No blocking)
  sendEmail({ email: user.email, subject: 'Verify Account', message: `Your OTP is: ${otp}` })
    .catch(err => console.log("Email Dev Mode: Skipped waiting"));

  res.status(200).json({ message: 'OTP Generated', email: user.email, debugOtp: otp });
});

// ... (Baaki Functions As-Is rahenge, main full export de raha hu taaki error na aaye)
const loginUser = asyncHandler(async (req, res) => { const { email, password } = req.body; const user = await User.findOne({ email: email.toLowerCase().trim() }); if (user && (await bcrypt.compare(password, user.password))) { res.json({ _id: user.id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified, token: generateToken(user._id) }); } else { res.status(401); throw new Error('Invalid Email or Password'); } });
const forgotPassword = asyncHandler(async (req, res) => { const { email } = req.body; const user = await User.findOne({ email: email.toLowerCase().trim() }); if (!user) { res.status(404); throw new Error('User not found'); } const otp = Math.floor(100000 + Math.random() * 900000).toString(); user.otp = otp; user.otpExpires = Date.now() + 10 * 60 * 1000; await user.save(); sendEmail({ email: user.email, subject: 'Reset Password Code', message: `Your Password Reset Code is: ${otp}` }).catch(err => console.log("Email Dev Mode: Skipped waiting")); res.json({ message: 'OTP Generated', debugOtp: otp }); });
const resetPassword = asyncHandler(async (req, res) => { const { email, otp, newPassword } = req.body; const user = await User.findOne({ email: email.toLowerCase().trim() }); if (user && user.otp === otp && user.otpExpires > Date.now()) { const salt = await bcrypt.genSalt(10); user.password = await bcrypt.hash(newPassword, salt); user.otp = undefined; user.otpExpires = undefined; await user.save(); res.json({ message: 'Password Changed Successfully' }); } else { res.status(400); throw new Error('Invalid or Expired OTP'); } });
const verifyRegisterOTP = asyncHandler(async (req, res) => { const { email, otp } = req.body; const user = await User.findOne({ email: email.toLowerCase().trim() }); if (user && user.otp === otp.toString().trim()) { user.otp = undefined; user.otpExpires = undefined; await user.save(); res.status(200).json({ _id: user.id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id), isVerified: false }); } else { res.status(400); throw new Error('Invalid OTP'); } });
const uploadDoc = asyncHandler(async (req, res) => { if (!req.file || !req.file.path) { res.status(400); throw new Error('Upload failed'); } const user = await User.findById(req.user.id); if (user) { user.verificationDoc = req.file.path; user.isVerified = false; await user.save(); res.status(200).json({ message: 'Uploaded', docUrl: req.file.path }); } else { res.status(404); throw new Error('User not found'); } });
const getMe = asyncHandler(async (req, res) => { const user = await User.findById(req.user.id); if (user) { res.status(200).json({ _id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified, verificationDoc: user.verificationDoc, companyName: user.companyName }); } else { res.status(404); throw new Error('User not found'); } });
const getAllUsers = asyncHandler(async (req, res) => { const users = await User.find().sort({ createdAt: -1 }); res.status(200).json(users); });
const approveUser = asyncHandler(async (req, res) => { await User.findByIdAndUpdate(req.params.id, { isVerified: true }); res.status(200).json({ message: 'Verified' }); });
const unverifyUser = asyncHandler(async (req, res) => { await User.findByIdAndUpdate(req.params.id, { isVerified: false }); res.status(200).json({ message: 'Revoked' }); });
const deleteUser = asyncHandler(async (req, res) => { await User.findByIdAndDelete(req.params.id); res.status(200).json({ message: 'Deleted' }); });
const verifyLogin = asyncHandler(async (req, res) => { res.status(400).json({message: "Use password login"}); });
const generateToken = (id) => { return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' }); };

module.exports = { registerUser, loginUser, verifyRegisterOTP, uploadDoc, getMe, getAllUsers, approveUser, unverifyUser, deleteUser, forgotPassword, resetPassword, verifyLogin };