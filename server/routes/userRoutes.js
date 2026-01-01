const express = require('express');
const router = express.Router();
const multer = require('multer'); // 👈 Multer install hona chahiye
const { 
  registerUser, loginUser, verifyRegisterOTP, 
  uploadDoc, 
  getMe, getAllUsers, approveUser, unverifyUser, deleteUser
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// 👇 TERA PURANA CLOUDINARY CONFIG IMPORT KARO
// (Dhyan de: Agar file ka naam 'cloudinary.js' hai aur wo 'config' folder me hai)
// Agar 'uploads' folder me hai, toh '../uploads/cloudinary' likhna
const { storage } = require('../config/cloudinary'); 

// 👇 MULTER KO BATA KI TERA WALA STORAGE USE KARE
const upload = multer({ storage: storage });

// Routes
router.post('/', registerUser);
router.post('/login', loginUser);
router.post('/verify-otp', verifyRegisterOTP);

// 👇 UPLOAD ROUTE (Tera docImage field aayega)
router.put('/upload-doc', protect, upload.single('docImage'), uploadDoc);

// Admin Routes
router.get('/me', protect, getMe);
router.get('/', getAllUsers); 
router.put('/approve/:id', protect, approveUser);
router.put('/unapprove/:id', protect, unverifyUser);
router.delete('/:id', protect, deleteUser);

module.exports = router;