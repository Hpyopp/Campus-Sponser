const express = require('express');
const router = express.Router();
const { 
    registerUser, loginUser, verifyLogin, verifyRegisterOTP, 
    uploadDoc, getMe, getAllUsers, approveUser, unverifyUser, deleteUser 
} = require('../controllers/userController');

const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', registerUser);
router.post('/login', loginUser);
router.post('/verify-login', verifyLogin);
router.post('/verify-otp', verifyRegisterOTP);

// 👇 SYNC ROUTE (Iske bina auto-update nahi hoga)
router.get('/me', protect, getMe);

router.post('/upload-doc', protect, upload.single('doc'), uploadDoc);

// Admin Routes
router.get('/all', protect, getAllUsers);
router.put('/approve/:id', protect, approveUser);
router.put('/unverify/:id', protect, unverifyUser);
router.delete('/:id', protect, deleteUser);

module.exports = router;