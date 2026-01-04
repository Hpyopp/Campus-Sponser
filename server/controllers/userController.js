const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail'); // ✅ Uses Brevo

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ======================================================
// 1. REGISTER (✅ WORKING)
// ======================================================
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

  try {
    console.log(`Sending Register OTP to ${cleanEmail}...`);
    await sendEmail({
      email: cleanEmail,
      subject: "Verify Account - CampusSponsor",
      html: `<div style="padding:20px; border:1px solid #ddd;">
              <h2>Welcome, ${name}!</h2>
              <p>Your OTP is:</p>
              <h1 style="color:#2563eb; letter-spacing:5px;">${otp}</h1>
              <p>Valid for 10 minutes.</p>
             </div>`
    });
    console.log("Register Email Sent!");
  } catch (error) {
    console.error("Register Email Failed:", error);
    res.status(500); throw new Error("Email sending failed. Check email address.");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  await User.create({
    name, email: cleanEmail, password: hashedPassword, phone,
    role: role || 'student',
    companyName, collegeName,
    otp, otpExpires: Date.now() + 10 * 60 * 1000,
    isVerified: false, verificationDoc: ""
  });

  res.status(201).json({ success: true, message: `OTP sent to ${cleanEmail}` });
});

// ======================================================
// 2. LOGIN
// ======================================================
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

// ======================================================
// 3. FORGOT PASSWORD (✅ FULLY FIXED)
// ======================================================
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const cleanEmail = email.toLowerCase().trim();
  
  console.log(`Forgot Password Request for: ${cleanEmail}`); // Log 1

  const user = await User.findOne({ email: cleanEmail });

  if (!user) { 
    console.log("User not found in DB");
    res.status(404); throw new Error('User not found'); 
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  try {
    console.log("Attempting to send Reset Email..."); // Log 2
    
    // Send Email
    await sendEmail({
        email: user.email,
        subject: "Reset Password - CampusSponsor",
        html: `<div style="padding:20px; border:1px solid #ddd;">
                <h2 style="color:red;">Reset Password</h2>
                <p>Your OTP to reset password is:</p>
                <h1 style="color:red; letter-spacing:5px;">${otp}</h1>
                <p>If you didn't request this, ignore it.</p>
               </div>`
    });
    
    console.log("Reset Email Sent Successfully!"); // Log 3

    // ✅ FIX: Update OTP AND Expiry
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 Minutes from now
    await user.save();
    
    console.log("User OTP updated in DB"); // Log 4

    res.json({ success: true, message: "OTP sent to your email." });

  } catch (error) {
    console.error("Forgot Password Failed:", error); // Log Error
    res.status(500); throw new Error(`Server Error: ${error.message}`);
  }
});

// ======================================================
// 4. VERIFY OTP
// ======================================================
const verifyRegisterOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  
  if (user && user.otp === otp) {
    // Check Expiry
    if (user.otpExpires < Date.now()) {
        res.status(400); throw new Error('OTP Expired');
    }

    user.isVerified = (user.role === 'admin'); 
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    
    res.json({ _id: user.id, token: generateToken(user._id), role: user.role });
  } else { res.status(400); throw new Error('Invalid OTP'); }
});

// ======================================================
// 5. RESET PASSWORD
// ======================================================
const resetPassword = asyncHandler(async (req, res) => { 
  const { email, otp, newPassword } = req.body;
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  
  if (user && user.otp === otp) {
    // Check Expiry
    if (user.otpExpires < Date.now()) {
        res.status(400); throw new Error('OTP Expired');
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.otp = undefined; 
    user.otpExpires = undefined;
    await user.save();
    
    res.json({ message: "Password Reset Successful" });
  } else { res.status(400); throw new Error('Invalid OTP'); }
});

// ======================================================
// HELPERS
// ======================================================
const approveUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    user.isVerified = true; await user.save();
    try { await sendEmail({ email: user.email, subject: 'Approved!', html: '<p>Account Approved</p>' }); } catch(e){}
    res.json({ message: 'User Verified' });
  } else { res.status(404); throw new Error('User not found'); }
});

const getMe = asyncHandler(async (req, res) => { const user = await User.findById(req.user.id); if (user) res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified, verificationDoc: user.verificationDoc || "", companyName: user.companyName }); else { res.status(404); throw new Error('User not found'); } });
const uploadDoc = asyncHandler(async (req, res) => { if (!req.file) { res.status(400); throw new Error('No file uploaded'); } const fileUrl = req.file.path || req.file.url; const user = await User.findById(req.user.id); if (user) { user.verificationDoc = fileUrl; user.isVerified = false; await user.save(); res.json({ message: 'Doc Uploaded', docUrl: fileUrl }); } else { res.status(404); throw new Error('User not found'); } });
const getAllUsers = asyncHandler(async (req, res) => { const users = await User.find().sort({ createdAt: -1 }); res.json(users); });
const unverifyUser = asyncHandler(async (req, res) => { await User.findByIdAndUpdate(req.params.id, { isVerified: false }); res.json({ message: 'Unverified' }); });
const deleteUser = asyncHandler(async (req, res) => { await User.findByIdAndDelete(req.params.id); res.json({ message: 'User Deleted' }); });
const verifyLogin = asyncHandler(async (req, res) => { res.status(400).json({ message: "Use password login" }); });

module.exports = {
  registerUser, loginUser, verifyRegisterOTP, forgotPassword, resetPassword,
  getMe, uploadDoc, getAllUsers, approveUser, unverifyUser, deleteUser, verifyLogin
};