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

// 👇 LOCAL STORAGE SETUP (Ye hona chahiye)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Folder name
  },
  filename: (req, file, cb) => {
    cb(null, 'doc-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Only Images/PDF Allowed!');
    }
  }
});

// Routes...
router.post('/', registerUser);
router.post('/register/verify', verifyRegisterOTP);
router.post('/login', loginUser);
router.post('/login/verify', verifyLoginOTP);
router.get('/me', protect, getMe);

// 👇 UPLOAD ROUTE
router.post('/verify', protect, upload.single('document'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        
        // Windows/Mac path issue fix karne ke liye replace lagaya
        const filePath = `uploads/${req.file.filename}`;
        
        await User.findByIdAndUpdate(req.user.id, { 
            verificationDoc: filePath, 
            isVerified: false 
        });
        
        res.status(200).json({ message: 'Document Uploaded Successfully ✅' });
    } catch (error) { 
        console.error("Upload Error:", error); // Console mein error dikhega
        res.status(500).json({ message: 'Server Upload Error' }); 
    }
});

// Admin Routes...
router.get('/', protect, adminOnly, getAllUsers);
router.put('/approve/:id', protect, adminOnly, approveUser);
router.put('/unapprove/:id', protect, adminOnly, unverifyUser);
router.delete('/:id', protect, adminOnly, deleteUser);

module.exports = router;