const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Ensure Multer setup is correct here
const {
  createEvent, getEvents, getTrendingEvents, getEventById, sponsorEvent,
  verifyPayment, requestRefund, processRefund, rejectSponsorship,
  approveEvent, revokeEvent, deleteEvent, getAllEventsForAdmin
} = require('../controllers/eventController');

// --- PUBLIC ROUTES ---
router.get('/', getEvents); 
router.get('/trending', getTrendingEvents); 
router.get('/:id', getEventById); 

// --- PROTECTED ROUTES ---

// 👇 IMPORTANT UPDATE HERE:
// Ab ye route 2 files accept karega: 'image' aur 'permissionLetter'
router.post('/create', protect, upload.fields([
  { name: 'image', maxCount: 1 }, 
  { name: 'permissionLetter', maxCount: 1 }
]), createEvent);

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