const Event = require('../models/Event');

// @desc    Get all events (Approved only)
const getEvents = async (req, res) => {
    try {
        const events = await Event.find({ status: 'approved' }).populate('organizer', 'name email');
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new event (Supports File Upload & Social Links)
const createEvent = async (req, res) => {
    // Note: FormData se data aata hai toh req.body string ban jata hai kabhi kabhi
    const { title, date, location, budget, description, category, instagram, linkedin } = req.body;

    if (!title || !date || !location || !budget || !description || !category) {
        return res.status(400).json({ message: 'Please fill all fields' });
    }

    try {
        // 👇 File Check
        let imageUrl = undefined;
        if (req.file) {
            imageUrl = req.file.path; // Cloudinary URL
        }

        const event = new Event({
            title, date, location, budget, description, category,
            image: imageUrl, 
            socialLinks: {
                instagram: instagram || '',
                linkedin: linkedin || ''
            },
            organizer: req.user._id,
            status: 'pending'
        });

        const createdEvent = await event.save();
        res.status(201).json(createdEvent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getEvents, createEvent };