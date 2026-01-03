const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail'); 

// 1. REGISTER
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role, companyName, collegeName } = req.body;
  if (!name || !email || !password || !phone) { res.status(400); throw new Error('Fill all fields'); }
  const cleanEmail = email.toLowerCase().trim();
  const userExists = await User.findOne({ email: cleanEmail });
  if (userExists) { res.status(400); throw new Error('User exists'); }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  const user = await User.create({
    name, email: cleanEmail, password: hashedPassword, phone, role: role || 'student', 
    companyName: (role === 'sponsor' && companyName) ? companyName : '', 
    collegeName: (role === 'student' && collegeName) ? collegeName : '', 
    otp, otpExpires: Date.now() + 10 * 60 * 1000, 
    isVerified: false, verificationDoc: null 
  });
  
  sendEmail({ email: user.email, subject: 'Verify Account', message: `OTP: ${otp}` }).catch(err => console.log("Email skipped"));
  res.status(200).json({ message: 'OTP Generated', email: user.email, debugOtp: otp });
});

// 👇 2. UPLOAD DOC (FORCE UPDATE FIX)
const uploadDoc = asyncHandler(async (req, res) => {
  if (!req.file) { res.status(400); throw new Error('Upload failed - No File Recieved'); }
  
  // File URL/Path nikalo
  const fileUrl = req.file.path || req.file.url; 
  
  console.log("💾 Saving to DB:", fileUrl); // Server Terminal mein check karna

  // 🔥 FORCE UPDATE: Direct Database Query
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id, 
    { 
      verificationDoc: fileUrl, 
      isVerified: false 
    },
    { new: true } // Return updated doc
  );

  if (updatedUser) {
    res.status(200).json({ 
        message: 'Uploaded & Saved', 
        docUrl: updatedUser.verificationDoc, 
        isVerified: false 
    });
  } else {
    res.status(404); throw new Error('User update failed');
  }
});

// 3. GET ME (With Debugging)
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (user) {
    // console.log("🔍 Checking DB for User:", user.email, "Doc:", user.verificationDoc); 
    res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        verificationDoc: user.verificationDoc, 
        companyName: user.companyName
    });
  } else {
    res.status(404); throw new Error('User not found');
  }
});

// 4. ADMIN REJECT (Reset Doc)
const unverifyUser = asyncHandler(async (req, res) => { 
  await User.findByIdAndUpdate(req.params.id, { isVerified: false, verificationDoc: null }); 
  res.status(200).json({ message: 'Rejected & Reset' }); 
});

// ... (Shortened Common Functions) ...
const verifyRegisterOTP = asyncHandler(async (req, res) => { const { email, otp } = req.body; const user = await User.findOne({ email: email.toLowerCase().trim() }); if (user && user.otp === otp.toString().trim()) { user.isVerified = user.role === 'admin' ? true : false; user.otp = undefined; user.otpExpires = undefined; await user.save(); res.status(200).json({ _id: user.id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id), isVerified: user.isVerified, verificationDoc: user.verificationDoc }); } else { res.status(400); throw new Error('Invalid OTP'); } });
const loginUser = asyncHandler(async (req, res) => { const { email, password } = req.body; const user = await User.findOne({ email: email.toLowerCase().trim() }); if (user && (await bcrypt.compare(password, user.password))) { res.json({ _id: user.id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified, verificationDoc: user.verificationDoc, token: generateToken(user._id) }); } else { res.status(401); throw new Error('Invalid Credentials'); } });
const getAllUsers = asyncHandler(async (req, res) => { const users = await User.find().sort({ createdAt: -1 }); res.status(200).json(users); });
const approveUser = asyncHandler(async (req, res) => { await User.findByIdAndUpdate(req.params.id, { isVerified: true }); res.status(200).json({ message: 'Verified' }); });
const deleteUser = asyncHandler(async (req, res) => { await User.findByIdAndDelete(req.params.id); res.status(200).json({ message: 'Deleted' }); });
const forgotPassword = asyncHandler(async (req, res) => { const { email } = req.body; const user = await User.findOne({ email: email.toLowerCase().trim() }); if (!user) { res.status(404); throw new Error('User not found'); } const otp = Math.floor(100000 + Math.random() * 900000).toString(); user.otp = otp; user.otpExpires = Date.now() + 10 * 60 * 1000; await user.save(); sendEmail({ email: user.email, subject: 'Code', message: `OTP: ${otp}` }).catch(err => console.log("Email skipped")); res.json({ message: 'OTP Generated', debugOtp: otp }); });
const resetPassword = asyncHandler(async (req, res) => { const { email, otp, newPassword } = req.body; const user = await User.findOne({ email: email.toLowerCase().trim() }); if (user && user.otp === otp && user.otpExpires > Date.now()) { const salt = await bcrypt.genSalt(10); user.password = await bcrypt.hash(newPassword, salt); user.otp = undefined; user.otpExpires = undefined; await user.save(); res.json({ message: 'Success' }); } else { res.status(400); throw new Error('Invalid OTP'); } });
const verifyLogin = asyncHandler(async (req, res) => { res.status(400).json({message: "Use password login"}); });
const generateToken = (id) => { return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' }); };

module.exports = { registerUser, loginUser, verifyRegisterOTP, uploadDoc, getMe, getAllUsers, approveUser, unverifyUser, deleteUser, forgotPassword, resetPassword, verifyLogin };