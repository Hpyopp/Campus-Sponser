const express = require('express');
const router = express.Router();
const { 
    getEvents, 
    getEventById, // 👈 Import kiya
    createEvent, 
    deleteEvent, 
    sponsorEvent 
} = require('../controllers/eventController');

const { protect } = require('../middleware/authMiddleware');

router.get('/', getEvents);
router.get('/:id', getEventById); // 👈 Details Page Route
router.post('/', protect, createEvent);
router.delete('/:id', protect, deleteEvent);
router.put('/sponsor/:id', protect, sponsorEvent);

module.exports = router;