const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });

// ✅ GET ALL USERS (Admin Dashboard)
router.get('/', protect, async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// ✅ UPLOAD ID CARD (User)
router.post('/verify', protect, upload.single('document'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file selected' });

        // Cloudinary path ko verificationDoc mein save karna zaroori hai
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { 
                verificationDoc: req.file.path, // 👈 Cloudinary Secure URL
                isVerified: false 
            },
            { new: true }
        );

        res.status(200).json({ message: 'Upload Success! Wait for Admin.', user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ APPROVE USER (Admin Action)
router.put('/approve/:id', protect, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.id, { isVerified: true });
        res.status(200).json({ message: 'User Approved!' });
    } catch (error) {
        res.status(500).json({ message: 'Approval failed' });
    }
});

module.exports = router;