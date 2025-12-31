const express = require('express');
const router = express.Router();
const {
  registerUser, loginUser, verifyRegisterOTP, verifyLoginOTP, getMe,
  getAllUsers, approveUser, unverifyUser, deleteUser
} = require('../controllers/authController');

const { protect, adminOnly } = require('../middleware/authMiddleware');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- SIMPLEST MULTER SETUP (Render /tmp) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Render ke liye /tmp best hai
    const dir = '/tmp';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, 'doc-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// --- ROUTES ---

router.post('/', registerUser);
router.post('/register/verify', verifyRegisterOTP);
router.post('/login', loginUser);
router.post('/login/verify', verifyLoginOTP);
router.get('/me', protect, getMe);

// 👇 DEBUG UPLOAD ROUTE
router.post('/verify', protect, upload.single('document'), async (req, res) => {
    console.log("🔥 HIT: Upload Route Reached!"); // Server Console mein dikhega

    try {
        if (!req.file) {
            console.log("❌ No File Received");
            return res.status(400).json({ message: 'No file selected!' });
        }

        console.log("✅ File Uploaded to:", req.file.path);

        await User.findByIdAndUpdate(req.user.id, {
            verificationDoc: req.file.path,
            isVerified: false
        });

        res.status(200).json({ message: 'Upload Successful!' });
    } catch (error) {
        console.error("💥 Upload Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Admin Routes
router.get('/', protect, adminOnly, getAllUsers);
router.put('/approve/:id', protect, adminOnly, approveUser);
router.put('/unapprove/:id', protect, adminOnly, unverifyUser);
router.delete('/:id', protect, adminOnly, deleteUser);

module.exports = router;