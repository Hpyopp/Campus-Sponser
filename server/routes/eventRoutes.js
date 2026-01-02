const express = require('express');
const router = express.Router();
const { 
  getEvents, getEventById, createEvent, deleteEvent, 
  sponsorEvent, requestRefund, approveRefund, rejectRefund, 
  approveEvent, revokeEvent, verifySponsorship 
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', getEvents);
router.get('/:id', getEventById);
router.post('/', protect, upload.single('permissionLetter'), createEvent);
router.delete('/:id', protect, deleteEvent);

router.put('/sponsor/:id', protect, sponsorEvent);
router.put('/request-refund/:id', protect, requestRefund);

// Admin Actions
router.put('/admin/approve/:id', protect, approveEvent);
router.put('/admin/revoke/:id', protect, revokeEvent);
router.post('/admin/approve-refund', protect, approveRefund);
router.post('/admin/reject-refund', protect, rejectRefund);

// 👇 Verify Route
router.post('/admin/verify-payment', protect, verifySponsorship);

module.exports = router;