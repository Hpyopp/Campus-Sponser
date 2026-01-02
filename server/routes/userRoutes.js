const express = require('express');
const router = express.Router();
const { 
    registerUser, loginUser, verifyRegisterOTP, 
    uploadDoc, getMe, getAllUsers, approveUser, unverifyUser, deleteUser,
    forgotPassword, resetPassword, verifyLogin 
} = require('../controllers/userController');

const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', registerUser);
router.post('/login', loginUser); // 👈 Ab ye Password wala login hai
router.post('/verify-login', verifyLogin); // Keeping route but logic changed
router.post('/verify-otp', verifyRegisterOTP); // For Registration

// 👇 NEW ROUTES FOR FORGOT PASSWORD
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/me', protect, getMe);
router.post('/upload-doc', protect, upload.single('doc'), uploadDoc);

// Admin Routes
router.get('/all', protect, getAllUsers);
router.put('/approve/:id', protect, approveUser);
router.put('/unverify/:id', protect, unverifyUser);
router.delete('/:id', protect, deleteUser);

module.exports = router;