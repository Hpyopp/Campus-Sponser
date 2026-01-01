const express = require('express');
const router = express.Router();
const { 
  getEvents, getEventById, createEvent, deleteEvent, 
  sponsorEvent, requestRefund, approveRefund, rejectRefund 
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getEvents);
router.get('/:id', getEventById);
router.post('/', protect, createEvent);
router.delete('/:id', protect, deleteEvent);

// Sponsorship Actions
router.put('/sponsor/:id', protect, sponsorEvent);
router.put('/request-refund/:id', protect, requestRefund);

// Admin Actions
router.post('/admin/approve-refund', protect, approveRefund);
router.post('/admin/reject-refund', protect, rejectRefund);

module.exports = router;