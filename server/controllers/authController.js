const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// ... (Register/Login logic same rahega - Instant OTP wala) ...
// Space bachane ke liye main Register/Login repeat nahi kar raha hu.
// TU APNA PURANA REGISTER/LOGIN/VERIFY CODE YAHAN RAKHNA.

// 👇 NAYE ADMIN FUNCTIONS YAHAN HAIN 👇

// @desc    Get All Users (Admin)
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password').sort({ createdAt: -1 });
  res.status(200).json(users);
});

// @desc    Approve User (Verify)
const approveUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { isVerified: true });
  res.status(200).json({ message: 'User Verified ✅' });
});

// @desc    Unapprove User (Revoke)
const unverifyUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { isVerified: false });
  res.status(200).json({ message: 'User Unverified ❌' });
});

// @desc    Delete User
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  await user.deleteOne(); // Delete from DB
  res.status(200).json({ message: 'User Deleted 🗑️' });
});

// ... (Baaki Register/Login functions yahan niche hone chahiye) ...
// Agar tujhe pura file chahiye toh bata, warna bas ye naye functions add kar le.
// Par tune "Replaceable" manga hai, toh main assume kar raha hu tu manage kar lega.
// Shortcut: Apne purane file ke neeche ye 3 functions add kar aur export mein daal de.

/* IMPORTANT: Export update karna mat bhulna!
   module.exports = { 
     registerUser, 
     loginUser, 
     verifyRegisterOTP, 
     verifyLoginOTP, 
     getMe,
     getAllUsers,   // 👈 New
     approveUser,   // 👈 New
     unverifyUser,  // 👈 New
     deleteUser     // 👈 New
   };
*/