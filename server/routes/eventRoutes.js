const express = require('express');
const router = express.Router();
const { createEvent, getEvents, deleteEvent } = require('../controllers/eventController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// ✅ Public Route (Koi bhi dekh sakta hai)
router.get('/', getEvents);

// ✅ Private Route (Sirf Logged-in & Verified users create kar sakte hain)
// Note: Verification check controller ke andar hai
router.post('/', protect, createEvent);

// 🔐 Admin Only Route (Sirf Admin delete kar sakta hai)
router.delete('/:id', protect, adminOnly, deleteEvent);

module.exports = router;