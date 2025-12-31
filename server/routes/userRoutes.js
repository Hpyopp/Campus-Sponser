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
const fs = require('fs'); // 👈 YE SABSE IMPORTANT HAI (Missing tha toh crash hoga)

// ---------------------------------------------
// 📂 MULTER SETUP (Crash Proof)
// ---------------------------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // '/tmp' folder Render par hamesha writable hota hai
    // Hum 'uploads' ki jagah '/tmp' use karenge taaki permission error na aaye
    const dir = '/tmp'; 
    
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, 'doc-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5000000 }, 
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

router.post('/', registerUser);
router.post('/register/verify', verifyRegisterOTP);
router.post('/login', loginUser);
router.post('/login/verify', verifyLoginOTP);
router.get('/me', protect, getMe);

// 👇 UPLOAD ROUTE (Crash Proof Logic)
router.post('/verify', protect, upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file selected!' });
        }
        
        // Render par /tmp folder se file serve nahi hoti easily, 
        // lekin kyunki ye demo hai, hum path save kar lenge.
        const filePath = req.file.path;
        
        await User.findByIdAndUpdate(req.user.id, { 
            verificationDoc: filePath, 
            isVerified: false 
        });
        
        res.status(200).json({ message: 'Document Uploaded Successfully ✅' });
    } catch (error) { 
        console.error("Upload Error:", error); 
        res.status(500).json({ message: 'Server Error during Upload' }); 
    }
});

router.get('/', protect, adminOnly, getAllUsers);
router.put('/approve/:id', protect, adminOnly, approveUser);
router.put('/unapprove/:id', protect, adminOnly, unverifyUser);
router.delete('/:id', protect, adminOnly, deleteUser);

module.exports = router;