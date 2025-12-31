const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { protect } = require('../middleware/authMiddleware');

// ✅ GET ALL EVENTS (With Organizer Names)
router.get('/', async (req, res) => {
    try {
        // createdBy field se User ka name aur email nikaalo
        const events = await Event.find({}).populate('createdBy', 'name email').sort({ createdAt: -1 });
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: 'Fetch failed' });
    }
});

module.exports = router;