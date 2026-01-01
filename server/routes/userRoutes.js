const express = require('express');
const router = express.Router();
const multer = require('multer'); 
const { 
  registerUser, 
  loginUser, 
  verifyLogin, 
  verifyRegisterOTP, 
  uploadDoc, 
  getMe, // 👈 IMPORTED!
  getAllUsers, approveUser, unverifyUser, deleteUser
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Cloudinary Config
const { storage } = require('../config/cloudinary'); 
const upload = multer({ storage: storage });

// Public Routes
router.post('/', registerUser);
router.post('/verify-otp', verifyRegisterOTP);
router.post('/login', loginUser);
router.post('/login/verify', verifyLogin);

// Protected Routes
router.post('/verify', protect, upload.single('document'), uploadDoc); 

// 👇 YE ROUTE "CHECK STATUS" BUTTON KE LIYE HAI
router.get('/me', protect, getMe);

// Admin Routes
router.get('/', getAllUsers); 
router.put('/approve/:id', protect, approveUser);
router.put('/unapprove/:id', protect, unverifyUser);
router.delete('/:id', protect, deleteUser);

module.exports = router;