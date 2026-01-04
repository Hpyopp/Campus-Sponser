const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// 1. REGISTER
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role, companyName, collegeName } = req.body;

  if (!name || !email || !password || !phone) {
    res.status(400); throw new Error('Please fill all fields');
  }
   
  const cleanEmail = email.toLowerCase().trim();
  const userExists = await User.findOne({ email: cleanEmail });
  if (userExists) { res.status(400); throw new Error('User already exists'); }

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Email Template
  const message = `
    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #2563eb;">Welcome to CampusSponsor!</h2>
      <p>Hi ${name},</p>
      <p>Your OTP is:</p>
      <h1 style="background: #eff6ff; color: #2563eb; padding: 10px; text-align: center; letter-spacing: 5px; border-radius: 5px;">${otp}</h1>
      <p>Valid for 10 minutes.</p>
    </div>
  `;

  // 👇 AB HUM ERROR KO CHUPAYENGE NAHI
  try {
    await sendEmail({
      email: cleanEmail,
      subject: "Verify Account - CampusSponsor",
      html: message
    });
  } catch (error) {
    console.error("Email Failed:", error);
    res.status(500);
    // Ye error ab Frontend pe dikhega
    throw new Error(`Email Failed: ${error.message}`); 
  }

  // Agar Email chala gaya, tabhi User banega
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  await User.create({
    name, email: cleanEmail, password: hashedPassword, phone,
    role: role || 'student',
    companyName, collegeName,
    otp, otpExpires: Date.now() + 10 * 60 * 1000,
    isVerified: false, verificationDoc: ""
  });

  res.status(201).json({ 
      success: true,
      message: `OTP sent to ${cleanEmail}`
  });
});

// 2. LOGIN
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user.id, name: user.name, email: user.email, role: user.role,
      isVerified: user.isVerified, verificationDoc: user.verificationDoc || "",
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
        subject: "Reset Password - CampusSponsor",
        html: `<h1>Your Reset OTP: ${otp}</h1>`
    });
  } catch (error) {
    res.status(500); throw new Error(`Email Failed: ${error.message}`);
  }

  user.otp = otp;
  await user.save();
  res.json({ success: true, message: "OTP sent to your email." });
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

// Helpers (No changes needed here but including for completeness)
const approveUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    user.isVerified = true; await user.save();
    try { await sendEmail({ email: user.email, subject: 'Approved!', html: '<p>Account Approved</p>' }); } catch(e){}
    res.json({ message: 'User Verified' });
  } else { res.status(404); throw new Error('User not found'); }
});
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (user) res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified, verificationDoc: user.verificationDoc || "", companyName: user.companyName }); 
  else { res.status(404); throw new Error('User not found'); }
});
const uploadDoc = asyncHandler(async (req, res) => {
  if (!req.file) { res.status(400); throw new Error('No file uploaded'); }
  const fileUrl = req.file.path || req.file.url;
  const user = await User.findById(req.user.id);
  if (user) { user.verificationDoc = fileUrl; user.isVerified = false; await user.save(); res.json({ message: 'Doc Uploaded', docUrl: fileUrl }); } 
  else { res.status(404); throw new Error('User not found'); }
});
const getAllUsers = asyncHandler(async (req, res) => { const users = await User.find().sort({ createdAt: -1 }); res.json(users); });
const unverifyUser = asyncHandler(async (req, res) => { await User.findByIdAndUpdate(req.params.id, { isVerified: false }); res.json({ message: 'Unverified' }); });
const deleteUser = asyncHandler(async (req, res) => { await User.findByIdAndDelete(req.params.id); res.json({ message: 'User Deleted' }); });
const verifyLogin = asyncHandler(async (req, res) => { res.status(400).json({ message: "Use password login" }); });

module.exports = {
  registerUser, loginUser, verifyRegisterOTP, forgotPassword, resetPassword,
  getMe, uploadDoc, getAllUsers, approveUser, unverifyUser, deleteUser, verifyLogin
};