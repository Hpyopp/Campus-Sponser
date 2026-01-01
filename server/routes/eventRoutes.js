const express = require('express');
const router = express.Router();
const { 
  getEvents, 
  getEventById, 
  createEvent, 
  deleteEvent, 
  sponsorEvent,
  cancelSponsorship // 👈 Imported New Function
} = require('../controllers/eventController');

const { protect } = require('../middleware/authMiddleware');

// Public Routes
router.get('/', getEvents);
router.get('/:id', getEventById);

// Protected Routes
router.post('/', protect, createEvent);
router.delete('/:id', protect, deleteEvent);

// Sponsorship Routes
router.put('/sponsor/:id', protect, sponsorEvent);
router.put('/cancel-sponsor/:id', protect, cancelSponsorship); // 👈 New Route

module.exports = router;