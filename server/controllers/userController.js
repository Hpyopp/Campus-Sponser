const mongoose = require('mongoose');
const User = require('../models/User');
const Event = require('../models/campusEvent'); // 👈 Event model imported
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// 1. REGISTER (Updated with GST & LinkedIn)
const registerUser = asyncHandler(async (req, res) => {
  // 👇 Ab hum gstNumber aur linkedinLink bhi accept kar rahe hain
  const { name, email, password, phone, role, companyName, collegeName, gstNumber, linkedinLink } = req.body;
  
  if (!name || !email || !password || !phone) { res.status(400); throw new Error('Please fill all fields'); }
  
  const cleanEmail = email.toLowerCase().trim();
  const userExists = await User.findOne({ email: cleanEmail });
  if (userExists) { res.status(400); throw new Error('User already exists'); }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  try {
    await sendEmail({
      email: cleanEmail,
      subject: "Verify Account - CampusSponsor",
      html: `<h1>Welcome ${name}!</h1><p>Your OTP is: <b>${otp}</b></p>`
    });
  } catch (error) { res.status(500); throw new Error("Email sending failed."); }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // 👇 Create User with new fields
  await User.create({
    name, 
    email: cleanEmail, 
    password: hashedPassword, 
    phone,
    role: role || 'student', 
    companyName, 
    collegeName,
    gstNumber,      // ✅ Save GST
    linkedinLink,   // ✅ Save LinkedIn
    otp, 
    otpExpires: Date.now() + 10 * 60 * 1000,
    isVerified: false, 
    verificationDoc: ""
  });
  
  res.status(201).json({ success: true, message: `OTP sent to ${cleanEmail}` });
});

// 2. LOGIN
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user.id, name: user.name, email: user.email, role: user.role,
      isVerified: user.isVerified, verificationDoc: user.verificationDoc || "",
      gstNumber: user.gstNumber, // Send GST info back if needed
      imageUrl: user.imageUrl || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
      token: generateToken(user._id)
    });
  } else { res.status(401); throw new Error('Invalid email or password'); }
});

// 3. FORGOT PASSWORD
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) { res.status(404); throw new Error('User not found'); }
  
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  try {
    await sendEmail({
      email: user.email,
      subject: "Reset Password",
      html: `<h1>Reset Password</h1><p>Your OTP is: <b style="color:red;">${otp}</b></p>`
    });
    user.otp = otp; user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();
    res.json({ success: true, message: "OTP sent." });
  } catch (error) { res.status(500); throw new Error("Email failed."); }
});

// 4. VERIFY OTP
const verifyRegisterOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });
  if (user && user.otp === otp) {
    user.isVerified = (user.role === 'admin'); user.otp = undefined;
    await user.save();
    res.json({ _id: user.id, token: generateToken(user._id), role: user.role });
  } else { res.status(400); throw new Error('Invalid OTP'); }
});

// 5. RESET PASSWORD
const resetPassword = asyncHandler(async (req, res) => { 
  const { email, otp, newPassword } = req.body;
  const user = await User.findOne({ email });
  if (user && user.otp === otp) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.otp = undefined; await user.save();
    res.json({ message: "Password Reset Successful" });
  } else { res.status(400); throw new Error('Invalid OTP'); }
});

// 🌟 6. PUBLIC PROFILE (LinkedIn Style)
const getUserProfilePublic = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password -otp');
  
  if (user) {
    let events = [];
    // Student: Created events | Sponsor: Sponsored events
    if (user.role === 'student') {
      events = await Event.find({ user: user._id }).sort({ createdAt: -1 });
    } else {
      // Find events where this user is a verified sponsor
      events = await Event.find({ 
          "sponsors": { 
              $elemMatch: { sponsorId: user._id, status: 'verified' } 
          } 
      }).sort({ createdAt: -1 });
    }
    res.json({ user, events });
  } else {
    res.status(404); throw new Error('User not found');
  }
});

// 🌟 7. SEARCH ALL USERS (For Chat)
const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
});

// Helpers
const getMe = asyncHandler(async (req, res) => { const user = await User.findById(req.user.id); if (user) res.json({_id:user._id,name:user.name,email:user.email,role:user.role,isVerified:user.isVerified,verificationDoc:user.verificationDoc||"",companyName:user.companyName, gstNumber: user.gstNumber}); else {res.status(404);throw new Error('User not found');}});
const uploadDoc = asyncHandler(async (req, res) => { if (!req.file) {res.status(400);throw new Error('No file');} const fileUrl = req.file.path||req.file.url; const user = await User.findById(req.user.id); if(user){user.verificationDoc=fileUrl;user.isVerified=false;await user.save();res.json({message:'Uploaded',docUrl:fileUrl});}else{res.status(404);throw new Error('User not found');}});
const getAllUsers = asyncHandler(async (req, res) => { const users = await User.find().sort({createdAt:-1}); res.json(users); });
const approveUser = asyncHandler(async (req, res) => { const user = await User.findById(req.params.id); if (user) { user.isVerified = true; await user.save(); res.json({message:'Verified'}); } else { res.status(404); throw new Error('User not found'); } });
const unverifyUser = asyncHandler(async (req, res) => { await User.findByIdAndUpdate(req.params.id, {isVerified:false}); res.json({message:'Unverified'}); });
const deleteUser = asyncHandler(async (req, res) => { await User.findByIdAndDelete(req.params.id); res.json({message:'User Deleted'}); });
const verifyLogin = asyncHandler(async (req, res) => { res.status(400).json({ message: "Use password login" }); });

module.exports = {
  registerUser, loginUser, verifyRegisterOTP, forgotPassword, resetPassword,
  getMe, uploadDoc, getAllUsers, approveUser, unverifyUser, deleteUser, verifyLogin,
  getUserProfilePublic, allUsers
};