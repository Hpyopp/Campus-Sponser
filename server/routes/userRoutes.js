const express = require('express');
const router = express.Router();
const multer = require('multer'); 
const { 
  registerUser, 
  loginUser, 
  verifyLogin,      // 👈 NEW IMPORT
  verifyRegisterOTP, 
  uploadDoc, 
  getMe, getAllUsers, approveUser, unverifyUser, deleteUser
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const { storage } = require('../config/cloudinary'); 
const upload = multer({ storage: storage });

// Routes

// 1. REGISTER
router.post('/', registerUser);
router.post('/verify-otp', verifyRegisterOTP);

// 2. LOGIN (OTP Based)
router.post('/login', loginUser);       // Step 1: Send OTP
router.post('/login/verify', verifyLogin); // Step 2: Verify OTP 👈 (Frontend ye call kar raha tha)

// 3. UPLOAD (Matched with VerifyKYC.jsx)
// Route: /verify | Field Name: 'document' | Method: POST
router.post('/verify', protect, upload.single('document'), uploadDoc); 

// Admin Routes
router.get('/me', protect, getMe);
router.get('/', getAllUsers); 
router.put('/approve/:id', protect, approveUser);
router.put('/unapprove/:id', protect, unverifyUser);
router.delete('/:id', protect, deleteUser);

module.exports = router;