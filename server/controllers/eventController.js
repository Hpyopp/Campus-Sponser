const Event = require('../models/Event');

// @desc    Create new event
const createEvent = async (req, res) => {
    try {
        const { title, description, date, location, budget, category } = req.body;
        if (!title || !description || !date || !budget) {
            return res.status(400).json({ message: 'Please add all required fields' });
        }
        const event = await Event.create({
            organizer: req.user.id,
            title, description, date, location, budget, category
        });
        res.status(201).json(event);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all events
const getEvents = async (req, res) => {
    try {
        const events = await Event.find()
            .populate('organizer', 'name email')
            .populate('sponsors', 'name'); // Sponsors ke naam bhi laao
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Sponsor an event (NAYA FEATURE)
const sponsorEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check agar pehle se sponsor kiya hai
        if (event.sponsors.includes(req.user.id)) {
            return res.status(400).json({ message: 'You have already sponsored this event' });
        }

        // Add sponsor ID to array
        event.sponsors.push(req.user.id);
        await event.save();

        res.status(200).json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createEvent, getEvents, sponsorEvent };