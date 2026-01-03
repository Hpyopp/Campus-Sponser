const express = require('express');
const router = express.Router();
const controller = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// 👇 DEBUG BLOCK (Server Start Hote Hi Check Karega)
const requiredFunctions = ['getMe', 'getAllUsers', 'uploadDoc'];
requiredFunctions.forEach(func => {
    if (!controller[func]) {
        console.error(`❌ CRITICAL ERROR: '${func}' is MISSING in userController!`);
    } else {
        console.log(`✅ Loaded: ${func}`);
    }
});

if (!admin) console.error("❌ CRITICAL ERROR: 'admin' middleware is MISSING!");

// === ROUTES ===
router.post('/register', controller.registerUser);
router.post('/verify-otp', controller.verifyRegisterOTP);
router.post('/login', controller.loginUser);
router.post('/forgot-password', controller.forgotPassword);
router.post('/reset-password', controller.resetPassword);

// User
router.post('/upload-doc', protect, upload.single('verificationDoc'), controller.uploadDoc);
router.get('/me', protect, controller.getMe);

// Admin (Ye Line 32 thi jo Crash kar rahi thi)
// Ab hum ensure kar rahe hain ki 'admin' aur 'getAllUsers' dono exist karein
router.get('/', protect, admin, controller.getAllUsers);

router.put('/:id/approve', protect, admin, controller.approveUser);
router.put('/:id/unverify', protect, admin, controller.unverifyUser);
router.delete('/:id', protect, admin, controller.deleteUser);

module.exports = router;