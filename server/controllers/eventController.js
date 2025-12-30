const Event = require('../models/Event');

// @desc    Get all events (Approved only)
// @route   GET /api/events
const getEvents = async (req, res) => {
    try {
        // Sirf approved events bhejo public ko
        const events = await Event.find({ status: 'approved' }).populate('organizer', 'name email');
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new event
// @route   POST /api/events
const createEvent = async (req, res) => {
    const { title, date, location, budget, description, category } = req.body;

    if (!title || !date || !location || !budget || !description || !category) {
        return res.status(400).json({ message: 'Please fill all fields' });
    }

    try {
        const event = new Event({
            title,
            date,
            location,
            budget,
            description,
            category,
            organizer: req.user._id,
            status: 'pending' // Naya event hamesha pending rahega
        });

        const createdEvent = await event.save();
        res.status(201).json(createdEvent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getEvents, createEvent };