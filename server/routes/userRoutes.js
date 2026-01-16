const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); 
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// 1. PUBLIC ROUTES (No Login Required)
router.post('/', userController.registerUser); 
router.post('/login', userController.loginUser);
router.post('/verify-otp', userController.verifyRegisterOTP);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

// 👇 NEW: Search Users (Global Search for Chat)
router.get('/', protect, userController.allUsers); 

// 👇 NEW: Public Profile Route (LinkedIn Style)
router.get('/u/:id', userController.getUserProfilePublic);

// 2. PROTECTED ROUTES (Login Required)
router.get('/me', protect, userController.getMe);
router.post('/upload-doc', protect, upload.single('verificationDoc'), userController.uploadDoc);

// 3. ADMIN ROUTES (Only Admin)
router.get('/all', protect, admin, userController.getAllUsers);
router.put('/:id/approve', protect, admin, userController.approveUser);
router.put('/:id/unverify', protect, admin, userController.unverifyUser);
router.delete('/:id', protect, admin, userController.deleteUser);

module.exports = router;