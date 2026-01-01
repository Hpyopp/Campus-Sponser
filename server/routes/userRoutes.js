const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getMe, 
  getAllUsers, 
  verifyRegisterOTP, // 👈 YE IMPORT MISSING THA, ISLIYE CRASH HUA
  approveUser,
  unverifyUser,
  deleteUser
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');

// Public Routes
router.post('/', registerUser);
router.post('/login', loginUser);
router.post('/verify-otp', verifyRegisterOTP); // 👈 Ye Naya Route Hai

// Private Routes
router.get('/me', protect, getMe);
router.get('/', getAllUsers); // Admin logic handle in controller or frontend usually, or add protect/admin middleware here if needed

// Admin Actions
router.put('/approve/:id', protect, approveUser);
router.put('/unapprove/:id', protect, unverifyUser);
router.delete('/:id', protect, deleteUser);

module.exports = router;