const express = require('express');
const router = express.Router();
const { 
  registerUser, loginUser, verifyRegisterOTP, verifyLoginOTP, getMe,
  getAllUsers, approveUser, unverifyUser, deleteUser 
} = require('../controllers/authController');

const { protect, adminOnly } = require('../middleware/authMiddleware');
const User = require('../models/User');

// 👇 1. CLOUDINARY HATA DIYA, LOCAL MULTER LAGAYA
const multer = require('multer');
const path = require('path');

// Local Storage Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Files 'uploads' folder mein jayengi
  },
  filename: (req, file, cb) => {
    // File ka naam unique banao
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  // Sirf Images/PDF allow karo
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Only Images & PDFs Allowed!');
    }
  }
});

// ✅ PUBLIC ROUTES
router.post('/', registerUser);
router.post('/register/verify', verifyRegisterOTP);
router.post('/login', loginUser);
router.post('/login/verify', verifyLoginOTP);

// ✅ PRIVATE ROUTES
router.get('/me', protect, getMe);

// 👇 KYC Upload Route (Fixed)
router.post('/verify', protect, upload.single('document'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        
        // File Path Database mein save karo
        // Note: Render par ye file temporary rahegi, par demo ke liye chalega
        const filePath = `uploads/${req.file.filename}`;
        
        await User.findByIdAndUpdate(req.user.id, { 
            verificationDoc: filePath, 
            isVerified: false 
        });
        
        res.status(200).json({ message: 'Document Uploaded Successfully ✅' });
    } catch (error) { 
        console.error(error);
        res.status(500).json({ message: error.message }); 
    }
});

// 🔐 ADMIN ROUTES
router.get('/', protect, adminOnly, getAllUsers);
router.put('/approve/:id', protect, adminOnly, approveUser);
router.put('/unapprove/:id', protect, adminOnly, unverifyUser);
router.delete('/:id', protect, adminOnly, deleteUser);

module.exports = router;