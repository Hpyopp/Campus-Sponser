const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// 1. PUBLIC (Sabke liye)
router.get('/', eventController.getEvents);
router.get('/:id', eventController.getEventById);

// 2. PROTECTED (Login Zaroori)
router.post('/', protect, upload.single('permissionLetter'), eventController.createEvent);
router.put('/:id/sponsor', protect, eventController.sponsorEvent);

// 👇 IMPORTANT: Verify aur Reject ke Raste (Routes)
router.put('/:id/verify-payment', protect, eventController.verifyPayment);
router.put('/:id/reject-sponsor', protect, eventController.rejectSponsorship);

// 3. ADMIN ROUTES
router.put('/:id/approve', protect, admin, eventController.approveEvent);
router.put('/:id/revoke', protect, admin, eventController.revokeEvent);
router.delete('/:id', protect, admin, eventController.deleteEvent);

module.exports = router;