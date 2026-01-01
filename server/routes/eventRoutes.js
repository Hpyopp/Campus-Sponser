const express = require('express');
const router = express.Router();
const { 
    getEvents, 
    getEventById, 
    createEvent, 
    deleteEvent, 
    sponsorEvent 
} = require('../controllers/eventController');

const { protect } = require('../middleware/authMiddleware');

// 1. GET ALL EVENTS (Public - Home Page)
router.get('/', getEvents);

// 2. GET SINGLE EVENT (Public - Details Page)
// Dhyan rakhna: Agar future me '/search' ya '/myevents' route banaye, 
// toh usse is '/:id' wali line ke UPAR rakhna padega.
router.get('/:id', getEventById); 

// 3. CREATE EVENT (Protected - Students Only)
router.post('/', protect, createEvent);

// 4. DELETE EVENT (Protected - Creator/Admin Only)
router.delete('/:id', protect, deleteEvent);

// 5. SPONSOR EVENT (Protected - Sponsors Only)
router.put('/sponsor/:id', protect, sponsorEvent);

module.exports = router;