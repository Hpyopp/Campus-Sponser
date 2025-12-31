const express = require('express');
const router = express.Router();
const { 
    getEvents, 
    createEvent, 
    deleteEvent, 
    sponsorEvent 
} = require('../controllers/eventController');

const { protect } = require('../middleware/authMiddleware');

// Public Route (Events dekhne ke liye)
router.get('/', getEvents);

// Student Only (Event banane ke liye)
router.post('/', protect, createEvent);

// Admin or Owner (Event delete karne ke liye)
router.delete('/:id', protect, deleteEvent);

// 👇 NEW ROUTE: Sponsor Deal Lock Karne Ke Liye
router.put('/sponsor/:id', protect, sponsorEvent);

module.exports = router;