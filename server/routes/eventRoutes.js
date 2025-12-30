const express = require('express');
const router = express.Router();
const { getEvents, createEvent } = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');

// 1. Sab events lao
router.get('/', getEvents);

// 2. Naya event banao
router.post('/', protect, createEvent);

module.exports = router;