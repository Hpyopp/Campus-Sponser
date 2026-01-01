const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role, companyName, collegeName } = req.body;

  if (!name || !email || !password || !phone) {
    res.status(400); throw new Error('Please add all fields');
  }

  const userExists = await User.findOne({ email });
  if (userExists) { res.status(400); throw new Error('User already exists'); }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const otp = Math.floor(100000 + Math.random() * 900000);

  const user = await User.create({
    name, email, password: hashedPassword, phone, role: role || 'student',
    
    // 👇 Logic: Agar Sponsor hai toh Company Name, Agar Student hai toh College Name
    companyName: (role === 'sponsor' && companyName) ? companyName : '',
    collegeName: (role === 'student' && collegeName) ? collegeName : '',
    
    otp, otpExpires: Date.now() + 10 * 60 * 1000, isVerified: false
  });

  res.status(200).json({ message: 'Registered!', debugOtp: otp });
});

// ... Baaki functions SAME rahenge (Unhe remove mat karna) ...
const loginUser = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) { res.status(404); throw new Error('User not found'); }
    const otp = Math.floor(100000 + Math.random() * 900000);
    user.otp = otp; user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();
    res.status(200).json({ message: 'OTP Sent', debugOtp: otp });
});
const verifyRegisterOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (user && user.otp === otp) {
        user.otp = undefined; user.isVerified = true; await user.save();
        res.json({ _id: user.id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id) });
    } else { res.status(400); throw new Error('Invalid OTP'); }
});
const verifyLoginOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (user && user.otp === otp) {
        user.otp = undefined; await user.save();
        res.json({ _id: user.id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id) });
    } else { res.status(400); throw new Error('Invalid OTP'); }
});
const getMe = asyncHandler(async (req, res) => { const user = await User.findById(req.user.id); res.status(200).json(user); });
const getAllUsers = asyncHandler(async (req, res) => { const users = await User.find().sort({ createdAt: -1 }); res.status(200).json(users); });
const approveUser = asyncHandler(async (req, res) => { await User.findByIdAndUpdate(req.params.id, { isVerified: true }); res.status(200).json({ message: 'Verified' }); });
const unverifyUser = asyncHandler(async (req, res) => { await User.findByIdAndUpdate(req.params.id, { isVerified: false }); res.status(200).json({ message: 'Revoked' }); });
const deleteUser = asyncHandler(async (req, res) => { await User.findByIdAndDelete(req.params.id); res.status(200).json({ message: 'Deleted' }); });
const generateToken = (id) => { return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' }); };

module.exports = { registerUser, loginUser, verifyRegisterOTP, verifyLoginOTP, getMe, getAllUsers, approveUser, unverifyUser, deleteUser };