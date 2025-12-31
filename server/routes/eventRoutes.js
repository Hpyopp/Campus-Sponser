const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { protect } = require('../middleware/authMiddleware');

// ✅ Get All Events with Organizer Names
router.get('/', async (req, res) => {
    try {
        // 'createdBy' field ko populate karke User ka 'name' nikaalo
        const events = await Event.find({}).populate('createdBy', 'name');
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: 'Events fetch failed' });
    }
});

module.exports = router;