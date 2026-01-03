const User = require('../models/User');
// 👇 YAHAN DEKH: Maine 'campusEvent' kar diya hai (Pehle ye 'Event' tha)
const Event = require('../models/campusEvent'); 
const asyncHandler = require('express-async-handler');

// 1. Get All Users
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// 2. Approve User (Verify)
const approveUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    user.isVerified = true;
    await user.save();
    res.json({ message: 'User Verified' });
  } else {
    res.status(404); throw new Error('User not found');
  }
});

// 3. Unverify User
const unverifyUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    user.isVerified = false;
    user.verificationDoc = ""; // Clear doc
    await user.save();
    res.json({ message: 'User Unverified/Rejected' });
  } else {
    res.status(404); throw new Error('User not found');
  }
});

// 4. Delete User
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    await user.deleteOne();
    res.json({ message: 'User Removed' });
  } else {
    res.status(404); throw new Error('User not found');
  }
});

// 5. Verify Sponsorship (Payment)
const verifySponsorship = asyncHandler(async (req, res) => {
    // Logic to update sponsorship status
    res.json({ message: "Sponsorship Verified by Admin" });
});

// 6. Approve Refund
const approveRefund = asyncHandler(async (req, res) => {
    res.json({ message: "Refund Approved" });
});

// 7. Reject Refund
const rejectRefund = asyncHandler(async (req, res) => {
    res.json({ message: "Refund Rejected" });
});

module.exports = {
  getAllUsers,
  approveUser,
  unverifyUser,
  deleteUser,
  verifySponsorship,
  approveRefund,
  rejectRefund
};