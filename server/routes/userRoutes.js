const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// --- Routes ---

// 1. REGISTER & LOGIN
router.post('/register', userController.registerUser);
router.post('/verify-otp', userController.verifyRegisterOTP);
router.post('/login', userController.loginUser);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

// 2. USER PROFILE (Protected)
router.get('/me', protect, userController.getMe);
router.post('/upload-doc', protect, upload.single('verificationDoc'), userController.uploadDoc);

// 3. ADMIN ROUTES (👇 YAHAN FIX KIYA HAI)
// Pehle ye '/' tha, ab maine '/all' kar diya kyunki Frontend '/all' maang raha hai
router.get('/all', protect, admin, userController.getAllUsers); 

// Baaki Admin Actions
router.put('/:id/approve', protect, admin, userController.approveUser);
router.put('/:id/unverify', protect, admin, userController.unverifyUser);
router.delete('/:id', protect, admin, userController.deleteUser);

module.exports = router;