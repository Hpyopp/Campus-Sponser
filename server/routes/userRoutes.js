const express = require('express');
const router = express.Router();
const { 
    registerUser, loginUser, verifyRegisterOTP, 
    uploadDoc, getMe, getAllUsers, approveUser, unverifyUser, deleteUser,
    forgotPassword, resetPassword, verifyLogin 
} = require('../controllers/userController');

const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Auth
router.post('/', registerUser);
router.post('/login', loginUser); 
router.post('/verify-otp', verifyRegisterOTP); 

// Password Reset
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Placeholders
router.post('/verify-login', verifyLogin);

// Protected
router.get('/me', protect, getMe);
router.post('/upload-doc', protect, upload.single('doc'), uploadDoc);

// Admin
router.get('/all', protect, getAllUsers);
router.put('/approve/:id', protect, approveUser);
router.put('/unverify/:id', protect, unverifyUser);
router.delete('/:id', protect, deleteUser);

module.exports = router;