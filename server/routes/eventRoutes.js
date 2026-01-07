const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  createEvent, getEvents, getTrendingEvents, getEventById, sponsorEvent,
  verifyPayment, requestRefund, processRefund, rejectSponsorship,
  approveEvent, revokeEvent, deleteEvent, getAllEventsForAdmin
} = require('../controllers/eventController');

// --- PUBLIC ROUTES ---
router.get('/', getEvents); 
router.get('/trending', getTrendingEvents); // 👈 Trending Route Added (Before :id)
router.get('/:id', getEventById); 

// --- PROTECTED ROUTES ---
router.post('/', protect, upload.single('permissionLetter'), createEvent);
router.post('/:id/sponsor', protect, sponsorEvent); 
router.put('/:id/request-refund', protect, requestRefund); 

// --- ADMIN ROUTES ---
router.get('/admin/all', protect, admin, getAllEventsForAdmin); 
router.put('/:id/approve', protect, admin, approveEvent); 
router.put('/:id/revoke', protect, admin, revokeEvent); 
router.put('/:id/verify-payment', protect, admin, verifyPayment); 
router.put('/:id/process-refund', protect, admin, processRefund); 
router.put('/:id/reject-sponsorship', protect, admin, rejectSponsorship); 
router.delete('/:id', protect, admin, deleteEvent); 

module.exports = router;