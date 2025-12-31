const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });

// 1. Auth & Admin Routes
router.post('/', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.get('/', protect, async (req, res) => {
    const users = await User.find({}).select('-password');
    res.json(users);
});

// 2. Verification Upload (Pending Status)
router.post('/verify', protect, upload.single('document'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { 
                verificationDoc: req.file.path, 
                isVerified: false // 👈 Approval ke liye rukega
            },
            { new: true }
        );
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 3. Admin Approval Action (Naya Route)
router.put('/approve/:id', protect, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Approval failed' });
    }
});

module.exports = router;