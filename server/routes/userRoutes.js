const express = require('express');
const router = express.Router();

// 👇 Imports wahi hone chahiye jo Controller me export kiye hain
const { 
    registerUser, 
    loginUser, 
    verifyLogin, 
    verifyRegisterOTP, 
    uploadDoc, // 👈 Ye ab Defined hai
    getMe, 
    getAllUsers, 
    approveUser, 
    unverifyUser, 
    deleteUser 
} = require('../controllers/userController');

const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Multer

// Public Routes
router.post('/', registerUser);
router.post('/login', loginUser);
router.post('/verify-login', verifyLogin);
router.post('/verify-otp', verifyRegisterOTP);

// Protected Routes (Logged in Users)
router.get('/me', protect, getMe);

// 👇 THE UPLOAD ROUTE (Sabke liye open - Students & Sponsors)
router.post('/upload-doc', protect, upload.single('doc'), uploadDoc);

// Admin Routes
router.get('/all', protect, getAllUsers);
router.put('/approve/:id', protect, approveUser);
router.put('/unverify/:id', protect, unverifyUser);
router.delete('/:id', protect, deleteUser);

module.exports = router;