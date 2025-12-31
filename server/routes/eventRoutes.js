const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { protect } = require('../middleware/authMiddleware');

// ✅ GET ALL EVENTS
router.get('/', async (req, res) => {
    try {
        const events = await Event.find({}).populate('createdBy', 'name email').sort({ createdAt: -1 });
        res.status(200).json(events);
    } catch (error) {
        console.error("Event Fetch Error:", error); // Console mein error dikhega
        res.status(500).json({ message: 'Server Error' });
    }
});

// ✅ CREATE EVENT (Crash Proof)
router.post('/', protect, async (req, res) => {
    try {
        const { title, date, location, budget, description } = req.body;
        const event = await Event.create({
            title, date, location, budget, description,
            createdBy: req.user.id // 👈 Logged in user ki ID automatically jayegi
        });
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: 'Event Create Failed' });
    }
});

module.exports = router;