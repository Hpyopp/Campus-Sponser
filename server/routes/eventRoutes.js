const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', eventController.getEvents);
router.get('/:id', eventController.getEventById);
router.post('/', protect, upload.single('permissionLetter'), eventController.createEvent);
router.put('/:id/sponsor', protect, eventController.sponsorEvent);

// 👇 Verify, Reject aur Refund ke Routes
router.put('/:id/verify-payment', protect, eventController.verifyPayment);
router.put('/:id/reject-sponsor', protect, eventController.rejectSponsorship);
router.put('/:id/request-refund', protect, eventController.requestRefund);
router.put('/:id/process-refund', protect, eventController.processRefund); // Admin/Organizer only

router.put('/:id/approve', protect, admin, eventController.approveEvent);
router.put('/:id/revoke', protect, admin, eventController.revokeEvent);
router.delete('/:id', protect, admin, eventController.deleteEvent);

module.exports = router;