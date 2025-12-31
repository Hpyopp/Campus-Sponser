const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });

// --- AUTH ROUTES ---

// Register User
router.post('/', registerUser);

// Login User
router.post('/login', loginUser);

// Get Current User Info
router.get('/me', protect, getMe);


// --- ADMIN & VERIFICATION ROUTES ---

// 1. Get All Users (For Admin Dashboard)
router.get('/', protect, async (req, res) => {
    try {
        // Users ko naye se purane order mein sort karke bhejo
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// 2. Upload Verification Document (For User)
router.post('/verify', protect, upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        console.log("File Uploaded to Cloudinary:", req.file.path); // Debugging log

        // Database update karo
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { 
                verificationDoc: req.file.path, // 👈 Ye URL database mein save hoga
                isVerified: false,              // Reset status to pending
                verificationStatus: 'pending'   // Optional: clear status
            },
            { new: true } // Return updated document
        ).select('-password');

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ message: 'Document upload failed' });
    }
});

// 3. Approve User (For Admin)
router.put('/approve/:id', protect, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id, 
            { isVerified: true }, 
            { new: true }
        );
        res.status(200).json({ message: 'User Approved Successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Approval failed' });
    }
});

module.exports = router;