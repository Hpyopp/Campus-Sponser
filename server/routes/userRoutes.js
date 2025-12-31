const express = require('express');
const router = express.Router();
const { registerUser, verifyRegisterOTP, loginUser, verifyLoginOTP, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });

// ✅ Auth Routes
router.post('/', registerUser);               // Step 1 Register (Send OTP)
router.post('/register/verify', verifyRegisterOTP); // Step 2 Register (Verify OTP)

router.post('/login', loginUser);             // Step 1 Login
router.post('/login/verify', verifyLoginOTP); // Step 2 Login

router.get('/me', protect, getMe);

// ✅ Upload Route
router.post('/verify', protect, upload.single('document'), async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.user.id, { verificationDoc: req.file.path }, { new: true });
        res.status(200).json(updatedUser);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// ✅ Admin Routes
router.get('/', protect, async (req, res) => {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.status(200).json(users);
});

router.put('/approve/:id', protect, async (req, res) => {
    await User.findByIdAndUpdate(req.params.id, { isVerified: true });
    res.status(200).json({ message: 'Approved' });
});

module.exports = router;