const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

// --- AUTH ROUTES ---
router.post('/', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

// --- ADMIN ROUTES (Ye missing tha) ---
// Isse admin dashboard ko data milega
router.get('/', protect, async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// --- VERIFICATION ROUTE ---
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });

router.post('/verify', protect, upload.single('document'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
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