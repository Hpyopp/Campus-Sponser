const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });

// ✅ Auth Routes
router.post('/', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

// ✅ Admin Route: Get Users (Force Refresh)
router.get('/', protect, async (req, res) => {
    try {
        // Explicitly verificationDoc mangwa rahe hain
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// ✅ Upload Route (The Main Fix)
router.post('/verify', protect, upload.single('document'), async (req, res) => {
    try {
        console.log("Upload Request Received from:", req.user.name);

        if (!req.file) {
            console.log("❌ No file received by server");
            return res.status(400).json({ message: 'No file uploaded' });
        }

        console.log("✅ File at Cloudinary:", req.file.path);

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { 
                verificationDoc: req.file.path, // Save URL
                verificationStatus: 'pending'   // Optional flag
            },
            { new: true }
        );

        console.log("💾 Database Updated:", updatedUser.verificationDoc);
        res.status(200).json(updatedUser);

    } catch (error) {
        console.error("🔥 Upload Error:", error);
        res.status(500).json({ message: error.message });
    }
});

// ✅ Approve Route
router.put('/approve/:id', protect, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.id, { isVerified: true });
        res.status(200).json({ message: 'Approved' });
    } catch (error) { res.status(500).json({ message: 'Failed' }); }
});

module.exports = router;