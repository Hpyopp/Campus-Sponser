const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // Controller import
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// 👇 1. PUBLIC ROUTES (Login/Register)
// IMPORTANT: Frontend hits '/api/users' -> Ye '/' route match karega
router.post('/', userController.registerUser); 
router.post('/login', userController.loginUser);
router.post('/verify-otp', userController.verifyRegisterOTP);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

// 2. PROTECTED ROUTES
router.get('/me', protect, userController.getMe);
router.post('/upload-doc', protect, upload.single('verificationDoc'), userController.uploadDoc);

// 3. ADMIN ROUTES
router.get('/all', protect, admin, userController.getAllUsers);
router.put('/:id/approve', protect, admin, userController.approveUser);
router.put('/:id/unverify', protect, admin, userController.unverifyUser);
router.delete('/:id', protect, admin, userController.deleteUser);

module.exports = router;