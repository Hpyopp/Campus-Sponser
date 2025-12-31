const Event = require('../models/Event');

// GET EVENTS (only approved)
const getEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: 'approved' }).sort({
      createdAt: -1,
    });

    res.status(200).json(events);
  } catch (error) {
    console.error('EVENT FETCH ERROR:', error);
    res.status(500).json({ message: 'Failed to fetch events' });
  }
};

// CREATE EVENT
const createEvent = async (req, res) => {
  try {
    const { title, date, location, budget, description, category } = req.body;

    if (!title || !date || !location || !budget || !description || !category) {
      return res.status(400).json({ message: 'All fields required' });
    }

    const event = await Event.create({
      title,
      date,
      location,
      budget,
      description,
      category,
      image: req.file ? req.file.path : undefined,
      organizer: req.user._id,
    });

    res.status(201).json(event);
  } catch (error) {
    console.error('EVENT CREATE ERROR:', error);
    res.status(500).json({ message: 'Event creation failed' });
  }
};

module.exports = { getEvents, createEvent };
