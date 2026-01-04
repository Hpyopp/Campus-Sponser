const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// 1. PUBLIC ROUTES (Bina Login ke dikhenge)
router.get('/', eventController.getEvents);
router.get('/:id', eventController.getEventById);

// 2. PROTECTED ROUTES (Login Zaroori Hai)
router.post('/', protect, upload.single('permissionLetter'), eventController.createEvent);

// 👇 YAHAN GALTI THI: Ye Line Missing thi, isliye Error aa raha tha
router.put('/:id/sponsor', protect, eventController.sponsorEvent);

// 3. ADMIN ROUTES
router.put('/:id/approve', protect, admin, eventController.approveEvent);
router.put('/:id/revoke', protect, admin, eventController.revokeEvent);
router.delete('/:id', protect, admin, eventController.deleteEvent);

module.exports = router;