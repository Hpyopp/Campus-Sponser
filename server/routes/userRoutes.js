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

// --- SIMPLE UPLOAD SETUP ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Seedha 'uploads' folder mein daalo (jo root mein hai)
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, 'doc-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      // Error handling without crashing
      cb(new Error('Only Images & PDFs Allowed!'));
    }
  }
});

// --- ROUTES ---
router.post('/', registerUser);
router.post('/register/verify', verifyRegisterOTP);
router.post('/login', loginUser);
router.post('/login/verify', verifyLoginOTP);
router.get('/me', protect, getMe);

// 👇 SECURE UPLOAD ROUTE
router.post('/verify', protect, (req, res, next) => {
    // Multer Error Handling Wrapper
    upload.single('document')(req, res, function (err) {
        if (err) {
            // Multer error pakad liya, ab server crash nahi hoga
            return res.status(400).json({ message: err.message });
        }
        next(); // Sab sahi hai, aage badho
    });
}, async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file selected!' });
        
        // Path fix karo taaki browser mein khul sake
        // Windows path backslash (\) ko forward slash (/) mein badlo
        const filePath = req.file.path.replace(/\\/g, "/");
        
        await User.findByIdAndUpdate(req.user.id, { 
            verificationDoc: filePath, 
            isVerified: false 
        });
        
        res.status(200).json({ message: 'Document Uploaded Successfully ✅' });
    } catch (error) { 
        console.error("DB Error:", error);
        res.status(500).json({ message: 'Database Error' }); 
    }
});

// Admin Routes
router.get('/', protect, adminOnly, getAllUsers);
router.put('/approve/:id', protect, adminOnly, approveUser);
router.put('/unapprove/:id', protect, adminOnly, unverifyUser);
router.delete('/:id', protect, adminOnly, deleteUser);

module.exports = router;