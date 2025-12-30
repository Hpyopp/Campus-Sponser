const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getAllUsers, getAllEvents, deleteEvent, deleteUser } = require('../controllers/adminController');

// Saare routes protect aur adminOnly honge
router.get('/users', protect, adminOnly, getAllUsers);
router.get('/events', protect, adminOnly, getAllEvents);
router.delete('/events/:id', protect, adminOnly, deleteEvent);
router.delete('/users/:id', protect, adminOnly, deleteUser);

module.exports = router;