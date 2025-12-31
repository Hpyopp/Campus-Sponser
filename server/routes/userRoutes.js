const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { protect } = require('../middleware/authMiddleware');

// ✅ 1. Get All Events (Populated)
router.get('/', async (req, res) => {
    try {
        const events = await Event.find({}).populate('createdBy', 'name email');
        res.json(events);
    } catch (error) {
        console.error("Event Fetch Error:", error);
        res.status(500).json({ message: 'Server Error Fetching Events' });
    }
});

// ✅ 2. Create Event (Link with User ID)
router.post('/', protect, async (req, res) => {
    try {
        const { title, date, location, budget, description } = req.body;
        
        const event = await Event.create({
            title,
            date,
            location,
            budget,
            description,
            createdBy: req.user.id // 👈 Ye ID save karega, String nahi
        });

        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: 'Event creation failed' });
    }
});

module.exports = router;