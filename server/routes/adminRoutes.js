const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { 
    getAllUsers, 
    getAllEvents, 
    deleteEvent, 
    deleteUser, 
    approveEvent 
} = require('../controllers/adminController');

// Saare routes pehle login check karenge, fir admin check karenge
router.get('/users', protect, adminOnly, getAllUsers);
router.get('/events', protect, adminOnly, getAllEvents);
router.delete('/events/:id', protect, adminOnly, deleteEvent);
router.delete('/users/:id', protect, adminOnly, deleteUser);
router.put('/events/:id/approve', protect, adminOnly, approveEvent); // 👈 Approval Route

module.exports = router;