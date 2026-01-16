const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); 

// 👇 IMPORT UPDATE: 'postUpdate' yahan add kiya hai
const {
  createEvent, 
  getEvents, 
  getTrendingEvents, 
  getRecommendedEvents, 
  getEventById, 
  sponsorEvent,
  verifyPayment, 
  requestRefund, 
  processRefund, 
  rejectSponsorship,
  approveEvent, 
  revokeEvent, 
  deleteEvent, 
  getAllEventsForAdmin,
  postUpdate // 👈 Ye missing tha!
} = require('../controllers/eventController');

// --- PUBLIC ROUTES ---
router.get('/', getEvents); 
router.get('/trending', getTrendingEvents); 
router.get('/recommended', getRecommendedEvents);
router.get('/:id', getEventById); 

// --- PROTECTED ROUTES ---
router.post('/create', protect, upload.fields([
  { name: 'image', maxCount: 1 }, 
  { name: 'permissionLetter', maxCount: 1 }
]), createEvent);

router.post('/:id/sponsor', protect, sponsorEvent); 
router.put('/:id/request-refund', protect, requestRefund); 

// 👇 NEW: Live Updates Route
router.post('/:id/updates', protect, upload.single('updateImage'), postUpdate);

// --- ADMIN ROUTES ---
router.get('/admin/all', protect, admin, getAllEventsForAdmin); 
router.put('/:id/approve', protect, admin, approveEvent); 
router.put('/:id/revoke', protect, admin, revokeEvent); 
router.put('/:id/verify-payment', protect, admin, verifyPayment); 
router.put('/:id/process-refund', protect, admin, processRefund); 
router.put('/:id/reject-sponsorship', protect, admin, rejectSponsorship); 
router.delete('/:id', protect, admin, deleteEvent); 

module.exports = router;