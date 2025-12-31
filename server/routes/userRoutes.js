const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });

// ✅ Admin: Get all users
router.get('/', protect, async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// ✅ User: ID Upload Logic (Fix)
router.post('/verify', protect, upload.single('document'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        // Cloudinary ka 'path' hi URL hota hai
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { 
                verificationDoc: req.file.path, // 👈 Ye line database mein link save karegi
                isVerified: false 
            },
            { new: true }
        );

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ Admin: Approve Action
router.put('/approve/:id', protect, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.id, { isVerified: true });
        res.json({ message: 'User approved' });
    } catch (error) {
        res.status(500).json({ message: 'Approval failed' });
    }
});

module.exports = router;