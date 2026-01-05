const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  createEvent,
  getEvents,
  getEventById,
  sponsorEvent,
  verifyPayment,
  requestRefund,
  processRefund,
  rejectSponsorship,
  approveEvent,
  revokeEvent,
  deleteEvent,
  getAllEventsForAdmin
} = require('../controllers/eventController');

// --- PUBLIC ROUTES ---
router.get('/', getEvents); // Approved events dikhane ke liye
router.get('/:id', getEventById); // Single event details

// --- PROTECTED ROUTES (Logged-in Users) ---
// 1. Create Event (With Cloudinary Upload)
router.post('/', protect, upload.single('permissionLetter'), createEvent);

// 2. Sponsor/Payment Actions
router.post('/:id/sponsor', protect, sponsorEvent); // Sponsor banne ke liye
router.put('/:id/request-refund', protect, requestRefund); // Refund maangne ke liye

// --- ADMIN ONLY ROUTES ---
router.get('/admin/all', protect, admin, getAllEventsForAdmin); // Saare events dekhna
router.put('/:id/approve', protect, admin, approveEvent); // Approve karna
router.put('/:id/revoke', protect, admin, revokeEvent); // Un-approve karna
router.put('/:id/verify-payment', protect, admin, verifyPayment); // Payment verify karna
router.put('/:id/process-refund', protect, admin, processRefund); // Refund dena
router.put('/:id/reject-sponsorship', protect, admin, rejectSponsorship); // Offer mana karna
router.delete('/:id', protect, admin, deleteEvent); // Event delete karna

module.exports = router;