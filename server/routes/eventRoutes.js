const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

router.get('/', async (req, res) => {
    try {
        // 'createdBy' field se User model ka 'name' khicho
        const events = await Event.find({}).populate('createdBy', 'name');
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Fetch failed' });
    }
});

module.exports = router;