const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail'); // 👈 Import Wapas aa gaya (Sirf Admin ke liye)

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// 1. REGISTER (⚡ INSTANT RESPONSE + GREEN BOX - NO EMAIL SENT)
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
    name, email: cleanEmail, password: hashedPassword, phone,
    role: role || 'student',
    companyName, collegeName,
    otp, otpExpires: Date.now() + 10 * 60 * 1000,
    isVerified: false, verificationDoc: ""
  });

  // 🚀 NO EMAIL WAIT. NO DELAY.
  console.log(`🚀 INSTANT REGISTER OTP: ${otp}`); 

  // ✅ FRONTEND RESPONSE (Green Box Data)
  res.status(201).json({ 
      success: true,
      message: 'OTP Generated Instantly', 
      email: user.email,
      otp: otp // 👈 Ye data Green Box mein dikhega
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

// 3. FORGOT PASSWORD (⚡ INSTANT RESPONSE + GREEN BOX - NO EMAIL SENT)
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) { res.status(404); throw new Error('User not found'); }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    await user.save();

    // 🚀 NO EMAIL WAIT.
    console.log(`🚀 INSTANT FORGOT OTP: ${otp}`);

    // ✅ FRONTEND RESPONSE (Green Box Data)
    res.json({ 
        success: true,
        message: "OTP Generated Instantly", 
        otp: otp // 👈 Ye data Green Box mein dikhega
    });
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
        user.otp = undefined;
        await user.save();
        res.json({ message: "Password Reset Successful" });
    } else { res.status(400); throw new Error('Invalid OTP or Email'); }
});

// 6. ADMIN APPROVE USER (🚨 EMAIL SENT HERE)
const approveUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.isVerified = true;
    await user.save();

    // 👇 EMAIL NOTIFICATION LOGIC (Background me chalega)
    const emailContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #16a34a; border-radius: 10px; background-color: #f0fdf4;">
            <h2 style="color: #16a34a;">🎉 Account Verified!</h2>
            <p>Hello <strong>${user.name}</strong>,</p>
            <p>Your account has been officially <strong>APPROVED</strong> by the Admin.</p>
            <p>You can now log in and access all features.</p>
            <a href="https://campus-sponser.vercel.app/login" style="background-color: #16a34a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px; display:inline-block;">Login Now</a>
        </div>
    `;

    // Send email without waiting (User ko instant response milega)
    sendEmail({
        email: user.email,
        subject: '✅ Account Approved - CampusSponsor',
        html: emailContent
    });

    res.json({ message: 'User Verified Successfully (Email Sent)' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// Helpers & Other Admin Actions
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (user) { res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified, verificationDoc: user.verificationDoc || "", companyName: user.companyName }); } 
  else { res.status(404); throw new Error('User not found'); }
});

const uploadDoc = asyncHandler(async (req, res) => {
  if (!req.file) { res.status(400); throw new Error('No file uploaded'); }
  const fileUrl = req.file.path || req.file.url;
  const user = await User.findById(req.user.id);
  if (user) { user.verificationDoc = fileUrl; user.isVerified = false; await user.save(); res.json({ message: 'Document Uploaded', docUrl: fileUrl }); } 
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