const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });

// Debugging ke liye (Agar login fail ho toh ise browser mein khol kar dekhna)
router.get('/test', (req, res) => res.send('User Route is Working'));

// ✅ Auth Routes
router.post('/', registerUser);
router.post('/login', loginUser); // Rasta: /api/users/login
router.get('/me', protect, getMe);

// ✅ Admin & Upload
router.get('/', protect, async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (err) { res.status(500).json({message: err.message}); }
});

router.post('/verify', protect, upload.single('document'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { verificationDoc: req.file.path, isVerified: false },
            { new: true }
        );
        res.status(200).json(updatedUser);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

router.put('/approve/:id', protect, async (req, res) => {
    await User.findByIdAndUpdate(req.params.id, { isVerified: true });
    res.status(200).json({ message: 'Approved' });
});

module.exports = router;