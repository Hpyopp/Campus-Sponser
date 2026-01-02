const express = require('express');
const router = express.Router();
const { 
  getEvents, getEventById, createEvent, deleteEvent, 
  sponsorEvent, requestRefund, approveRefund, rejectRefund, approveEvent 
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Multer

router.get('/', getEvents);
router.get('/:id', getEventById);

// 👇 Create Event now handles File Upload
router.post('/', protect, upload.single('permissionLetter'), createEvent);
router.delete('/:id', protect, deleteEvent);

// Sponsorship
router.put('/sponsor/:id', protect, sponsorEvent);
router.put('/request-refund/:id', protect, requestRefund);

// Admin Actions
router.put('/admin/approve/:id', protect, approveEvent); // 🆕
router.post('/admin/approve-refund', protect, approveRefund);
router.post('/admin/reject-refund', protect, rejectRefund);

module.exports = router;