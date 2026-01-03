const express = require('express');
const router = express.Router();

// Import Controller
const controller = require('../controllers/eventController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// --- ROUTES ---

// Public Routes (Yehi 500 de raha tha)
router.get('/', controller.getEvents);
router.get('/:id', controller.getEventById);

// Organizer Routes
router.post('/', protect, upload.single('permissionLetter'), controller.createEvent);
router.delete('/:id', protect, controller.deleteEvent);
router.post('/organizer/reject-deal', protect, controller.rejectSponsorship);

// Admin Routes
router.put('/admin/approve/:id', protect, admin, controller.approveEvent);
router.put('/admin/revoke/:id', protect, admin, controller.revokeEvent);
router.post('/admin/verify-payment', protect, controller.verifySponsorship);
router.post('/admin/approve-refund', protect, controller.approveRefund);
router.post('/admin/reject-refund', protect, controller.rejectRefund);

// Sponsor Routes
router.put('/sponsor/:id', protect, controller.sponsorEvent);
router.put('/request-refund/:id', protect, controller.requestRefund);

module.exports = router;