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
const fs = require('fs'); // 👈 FS Import karna zaroori hai folder check ke liye

// ---------------------------------------------
// 📂 MULTER SETUP (Local Storage + Auto Folder Create)
// ---------------------------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/';
    
    // 👇 CRASH FIX: Agar folder nahi hai, toh turant bana do
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // File ka naam unique rakho (doc-TIME.pdf)
    cb(null, 'doc-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB Limit
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

// ---------------------------------------------
// 🚀 ROUTES
// ---------------------------------------------

// 1. Auth Routes (Public)
router.post('/', registerUser);
router.post('/register/verify', verifyRegisterOTP);
router.post('/login', loginUser);
router.post('/login/verify', verifyLoginOTP);

// 2. User Routes (Private)
router.get('/me', protect, getMe);

// 3. KYC UPLOAD ROUTE (Crash Proof Logic)
router.post('/verify', protect, upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file selected! Please choose a document.' });
        }
        
        // File path save karo
        const filePath = `uploads/${req.file.filename}`;
        
        await User.findByIdAndUpdate(req.user.id, { 
            verificationDoc: filePath, 
            isVerified: false // Upload kiya hai, abhi verify nahi hua
        });
        
        res.status(200).json({ message: 'Document Uploaded Successfully ✅' });
    } catch (error) { 
        console.error("Upload Error:", error); // Console mein error dikhega server band nahi hoga
        res.status(500).json({ message: 'Server Error during Upload' }); 
    }
});

// 4. Admin Routes (Secured)
router.get('/', protect, adminOnly, getAllUsers);
router.put('/approve/:id', protect, adminOnly, approveUser);
router.put('/unapprove/:id', protect, adminOnly, unverifyUser);
router.delete('/:id', protect, adminOnly, deleteUser);

module.exports = router;