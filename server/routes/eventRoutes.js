const express = require('express');
const router = express.Router();

// Controller Import
// (Make sure eventController.js exists and exports these functions)
const { 
  getEvents, getEventById, createEvent, deleteEvent, 
  sponsorEvent, requestRefund, approveRefund, rejectRefund,
  approveEvent, revokeEvent, verifySponsorship, rejectSponsorship 
} = require('../controllers/eventController');

const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Ensure path correct

// --- ROUTES ---

// Public
router.get('/', getEvents);
router.get('/:id', getEventById);

// Organizer
router.post('/', protect, upload.single('permissionLetter'), createEvent);
router.delete('/:id', protect, deleteEvent);
router.post('/organizer/reject-deal', protect, rejectSponsorship);

// Admin
router.put('/admin/approve/:id', protect, admin, approveEvent);
router.put('/admin/revoke/:id', protect, revokeEvent);
router.post('/admin/verify-payment', protect, verifySponsorship);
router.post('/admin/approve-refund', protect, approveRefund);
router.post('/admin/reject-refund', protect, rejectRefund);

// Sponsor
router.put('/sponsor/:id', protect, sponsorEvent);
router.put('/request-refund/:id', protect, requestRefund);

// 👇 MOST IMPORTANT FIX: Ye 'router' function hona chahiye, object nahi
module.exports = router;