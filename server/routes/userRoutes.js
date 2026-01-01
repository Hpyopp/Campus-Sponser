const express = require('express');
const router = express.Router();
const multer = require('multer'); // 👈 Ye package installed hona chahiye
const { 
  registerUser, loginUser, verifyRegisterOTP, 
  uploadDoc, 
  getMe, getAllUsers, approveUser, unverifyUser, deleteUser
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// 👇 TERA CLOUDINARY CONFIG (Path check kar lena)
// Agar 'server/config/cloudinary.js' hai toh ye sahi hai
const { storage } = require('../config/cloudinary'); 

// 👇 MULTER SETUP
const upload = multer({ storage: storage });

// Routes
router.post('/', registerUser);
router.post('/login', loginUser);
router.post('/verify-otp', verifyRegisterOTP);

// 👇 UPLOAD ROUTE (Future-Proof: Cloudinary)
router.put('/upload-doc', protect, upload.single('docImage'), uploadDoc);

// Admin Routes
router.get('/me', protect, getMe);
router.get('/', getAllUsers); 
router.put('/approve/:id', protect, approveUser);
router.put('/unapprove/:id', protect, unverifyUser);
router.delete('/:id', protect, deleteUser);

module.exports = router;