const express = require('express');
const router = express.Router();
// 👇 Tere system mein authController hai, isliye wahi use kar raha hu
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

// 👇 Cloudinary Setup
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });

// --- ROUTES ---

// 1. Auth Routes (Register/Login)
router.post('/', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

// 2. Verification Route (ID Upload)
router.post('/verify', protect, upload.single('document'), async (req, res) => {
    try {
        console.log("📥 Verification Request Received..."); 

        if (!req.file) {
            console.log("❌ No file received!"); 
            return res.status(400).json({ message: 'Please upload an ID Card photo' });
        }

        console.log("✅ File Uploaded to Cloudinary:", req.file.path); 

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            {
                verificationDoc: req.file.path,
                isVerified: true
            },
            { new: true }
        ).select('-password');

        console.log("🎉 User Verified:", updatedUser.email); 

        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            isVerified: updatedUser.isVerified,
            token: req.headers.authorization.split(' ')[1]
        });

    } catch (error) {
        console.error("🔥 Server Error:", error); 
        res.status(500).json({ message: error.message || 'Server Error' });
    }
});

module.exports = router;