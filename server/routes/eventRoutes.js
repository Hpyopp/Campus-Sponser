const express = require('express');
const router = express.Router();
const { 
  createEvent, getEvents, deleteEvent, 
  updateEvent, deleteMyEvent 
} = require('../controllers/eventController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public
router.get('/', getEvents);

// Private (User)
router.post('/', protect, createEvent);
router.put('/:id', protect, updateEvent);      // 👈 Edit Route
router.delete('/my/:id', protect, deleteMyEvent); // 👈 User Delete Route

// Admin
router.delete('/:id', protect, adminOnly, deleteEvent);

module.exports = router;