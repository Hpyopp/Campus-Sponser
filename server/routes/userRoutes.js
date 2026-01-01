const express = require('express');
const router = express.Router();
const multer = require('multer'); 
const { 
  registerUser, 
  loginUser, 
  verifyLogin,      // 👈 Ye wala upar controller se export hona zaroori hai
  verifyRegisterOTP, 
  uploadDoc, 
  getMe, getAllUsers, approveUser, unverifyUser, deleteUser
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Cloudinary Config
const { storage } = require('../config/cloudinary'); 
const upload = multer({ storage: storage });

// Routes
router.post('/', registerUser);
router.post('/verify-otp', verifyRegisterOTP);

router.post('/login', loginUser);
router.post('/login/verify', verifyLogin); // Login Verify Route

// Upload Route (Frontend 'document' bhej raha hai)
router.post('/verify', protect, upload.single('document'), uploadDoc); 

// Admin
router.get('/me', protect, getMe);
router.get('/', getAllUsers); 
router.put('/approve/:id', protect, approveUser);
router.put('/unapprove/:id', protect, unverifyUser);
router.delete('/:id', protect, deleteUser);

module.exports = router;