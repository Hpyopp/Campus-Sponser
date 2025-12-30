const express = require('express');
const router = express.Router();
const { createEvent, getEvents, sponsorEvent } = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createEvent);
router.get('/', getEvents);

// 👇 Ye naya route hai: PUT request (Update karne ke liye)
router.put('/:id/sponsor', protect, sponsorEvent);

module.exports = router;