const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

// 1. Auth Routes
router.post('/', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

// 2. Admin Dashboard Route (👇 YE SABSE ZAROORI HAI)
// Jab tak ye nahi hoga, Admin Dashboard 0 Users dikhayega
router.get('/', protect, async (req, res) => {
    try {
        console.log("🔍 Fetching all users for Admin...");
        const users = await User.find({}).select('-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// 3. Verification Route
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });

router.post('/verify', protect, upload.single('document'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'Please upload a file' });
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { verificationDoc: req.file.path, isVerified: true },
            { new: true }
        ).select('-password');
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;