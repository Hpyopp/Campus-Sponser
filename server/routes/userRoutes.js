const express = require('express');
const router = express.Router();
const { 
  registerUser, loginUser, verifyRegisterOTP, verifyLoginOTP, getMe,
  getAllUsers, approveUser, unverifyUser, deleteUser 
} = require('../controllers/authController');

const { protect, adminOnly } = require('../middleware/authMiddleware');
const User = require('../models/User');
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });

// ✅ Public Auth
router.post('/', registerUser);
router.post('/register/verify', verifyRegisterOTP);
router.post('/login', loginUser);
router.post('/login/verify', verifyLoginOTP);

// ✅ Private User
router.get('/me', protect, getMe);
router.post('/verify', protect, upload.single('document'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        await User.findByIdAndUpdate(req.user.id, { verificationDoc: req.file.path, isVerified: false });
        res.status(200).json({ message: 'Document Uploaded' });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// 🔐 ADMIN ROUTES (Full Control)
router.get('/', protect, adminOnly, getAllUsers);
router.put('/approve/:id', protect, adminOnly, approveUser);
router.put('/unapprove/:id', protect, adminOnly, unverifyUser); // 👈 New Unapprove Route
router.delete('/:id', protect, adminOnly, deleteUser);          // 👈 New Delete User Route

module.exports = router;