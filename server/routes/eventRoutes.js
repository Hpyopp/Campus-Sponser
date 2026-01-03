const express = require('express');
const router = express.Router();
const { 
    getEvents, getEventById, createEvent, deleteEvent, 
    sponsorEvent, requestRefund, approveRefund, rejectRefund,
    approveEvent, revokeEvent, verifySponsorship, rejectSponsorship 
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public Routes
router.get('/', getEvents);
router.get('/:id', getEventById);

// Organizer Routes
router.post('/', protect, upload.single('permissionLetter'), createEvent);
router.delete('/:id', protect, deleteEvent);
router.post('/organizer/reject-deal', protect, rejectSponsorship); // 👈 NEW ROUTE

// Admin Routes
router.put('/admin/approve/:id', protect, approveEvent);
router.put('/admin/revoke/:id', protect, revokeEvent);
router.post('/admin/verify-payment', protect, verifySponsorship);
router.post('/admin/approve-refund', protect, approveRefund);
router.post('/admin/reject-refund', protect, rejectRefund);

// Sponsor Routes
router.put('/sponsor/:id', protect, sponsorEvent);
router.put('/request-refund/:id', protect, requestRefund);

module.exports = router;