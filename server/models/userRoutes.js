const express = require('express');
const router = express.Router();
// 👇 Dhyan de: Maine 'userController' ki jagah 'authController' likha hai kyunki tere PC pe wahi file hai
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User'); 

// 👇 Cloudinary Setup
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });

// Existing Routes
router.post('/', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

// 👇 VERIFICATION ROUTE
router.post('/verify', protect, upload.single('document'), async (req, res) => {
    try {
        console.log("📥 Verification Request Received..."); 

        if (!req.file) {
            console.log("❌ No file received!"); 
            return res.status(400).json({ message: 'Please upload an ID Card photo' });
        }

        console.log("✅ File Uploaded:", req.file.path); 

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
        console.error("🔥 Error:", error); 
        res.status(500).json({ message: error.message || 'Server Error' });
    }
});

module.exports = router;