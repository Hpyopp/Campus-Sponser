const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // Ensure path correct
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// --- Routes ---

// Public
router.post('/register', userController.registerUser);
router.post('/verify-otp', userController.verifyRegisterOTP);
router.post('/login', userController.loginUser);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

// Protected (User)
// 👇 Ye lines crash kar rahi thi kyunki function missing thay
router.get('/me', protect, userController.getMe);
router.post('/upload-doc', protect, upload.single('verificationDoc'), userController.uploadDoc);

// Admin
router.get('/', protect, admin, userController.getAllUsers);
router.put('/:id/approve', protect, admin, userController.approveUser);
router.put('/:id/unverify', protect, admin, userController.unverifyUser);
router.delete('/:id', protect, admin, userController.deleteUser);

module.exports = router;