const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// 1. REGISTER (✅ REAL EMAIL OTP)
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role, companyName, collegeName } = req.body;

  if (!name || !email || !password || !phone) {
    res.status(400);
    throw new Error('Please fill all fields');
  }
   
  const cleanEmail = email.toLowerCase().trim();
  const userExists = await User.findOne({ email: cleanEmail });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // OTP Generation
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Email Template
  const message = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #2563eb; text-align: center;">Welcome to CampusSponsor! 🚀</h2>
      <p style="font-size: 16px; color: #333;">Hi ${name},</p>
      <p style="font-size: 16px; color: #333;">Thank you for joining us. Please use the following OTP to verify your account:</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2563eb; background: #eff6ff; padding: 10px 20px; border-radius: 5px;">${otp}</span>
      </div>
      <p style="font-size: 14px; color: #666; text-align: center;">This code expires in 10 minutes.</p>
    </div>
  `;

  try {
    // 1. Email Bhejo
    await sendEmail({
      email: cleanEmail,
      subject: "Verify Your Email - CampusSponsor",
      html: message, // HTML wala version bhejenge
      message: `Your OTP is ${otp}` // Fallback text
    });

    // 2. Email chala gaya toh User Save karo
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({
      name, 
      email: cleanEmail, 
      password: hashedPassword, 
      phone,
      role: role || 'student',
      companyName, 
      collegeName,
      otp, 
      otpExpires: Date.now() + 10 * 60 * 1000,
      isVerified: false, 
      verificationDoc: ""
    });

    // 3. Response (Ab OTP yahan nahi dikhega!)
    res.status(201).json({ 
      success: true,
      message: `OTP sent to ${cleanEmail}. Please check your Inbox/Spam.` 
    });

  } catch (error) {
    console.error("Registration Failed during Email:", error);
    res.status(500);
    throw new Error("Email could not be sent. Please check if email is valid.");
  }
});

// 2. LOGIN
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user.id, 
      name: user.name, 
      email: user.email, 
      role: user.role,
      isVerified: user.isVerified, 
      verificationDoc: user.verificationDoc || "",
      token: generateToken(user._id)
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// 3. FORGOT PASSWORD (✅ REAL EMAIL OTP)
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Email Template
  const message = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color: #dc2626;">Password Reset Request</h2>
      <p>Your OTP to reset password is:</p>
      <h1 style="color: #dc2626; letter-spacing: 2px;">${otp}</h1>
      <p>Do not share this code with anyone.</p>
    </div>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: "Reset Password - CampusSponsor",
      html: message,
      message: `Your Reset OTP is ${otp}`
    });

    user.otp = otp;
    await user.save();

    res.json({ 
      success: true,
      message: "OTP sent to your email." 
    });

  } catch (error) {
    res.status(500);
    throw new Error("Email sending failed. Try again.");
  }
});

// 4. VERIFY OTP
const verifyRegisterOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });
   
  if (user && user.otp === otp) {
    user.isVerified = (user.role === 'admin'); // Only Admin auto-verified
    user.otp = undefined; // Clear OTP
    await user.save();
    
    res.json({ 
        _id: user.id, 
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id) 
    });
  } else {
    res.status(400);
    throw new Error('Invalid OTP');
  }
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
    res.json({ message: "Password Reset Successful. Login with new password." });
  } else {
    res.status(400);
    throw new Error('Invalid OTP or Email');
  }
});

// 6. ADMIN APPROVE USER (✅ REAL EMAIL NOTIFICATION)
const approveUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.isVerified = true;
    await user.save();

    const emailContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #16a34a; border-radius: 10px; background-color: #f0fdf4;">
        <h2 style="color: #16a34a;">🎉 Account Verified!</h2>
        <p>Hello <strong>${user.name}</strong>,</p>
        <p>Your account has been officially <strong>APPROVED</strong> by the Admin.</p>
        <p>You can now log in and access all features.</p>
        <a href="https://campussponsor.in/login" style="background-color: #16a34a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px; display:inline-block;">Login Now</a>
      </div>
    `;

    try {
        await sendEmail({
            email: user.email,
            subject: '✅ Account Approved - CampusSponsor',
            html: emailContent,
            message: "Your account has been verified!"
        });
    } catch (e) {
        console.log("Approval email failed, but user verified.");
    }

    res.json({ message: 'User Verified Successfully' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// Helpers
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (user) { 
      res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified, verificationDoc: user.verificationDoc || "", companyName: user.companyName }); 
  } else { 
      res.status(404); throw new Error('User not found'); 
  }
});

const uploadDoc = asyncHandler(async (req, res) => {
  if (!req.file) { res.status(400); throw new Error('No file uploaded'); }
  const fileUrl = req.file.path || req.file.url;
  const user = await User.findById(req.user.id);
  if (user) { 
      user.verificationDoc = fileUrl; 
      user.isVerified = false; 
      await user.save(); 
      res.json({ message: 'Document Uploaded', docUrl: fileUrl }); 
  } else { 
      res.status(404); throw new Error('User not found'); 
  }
});

const getAllUsers = asyncHandler(async (req, res) => { const users = await User.find().sort({ createdAt: -1 }); res.json(users); });
const unverifyUser = asyncHandler(async (req, res) => { await User.findByIdAndUpdate(req.params.id, { isVerified: false }); res.json({ message: 'Unverified' }); });
const deleteUser = asyncHandler(async (req, res) => { await User.findByIdAndDelete(req.params.id); res.json({ message: 'User Deleted' }); });
const verifyLogin = asyncHandler(async (req, res) => { res.status(400).json({ message: "Use password login" }); });

module.exports = {
  registerUser, loginUser, verifyRegisterOTP, forgotPassword, resetPassword,
  getMe, uploadDoc, getAllUsers, approveUser, unverifyUser, deleteUser, verifyLogin
};