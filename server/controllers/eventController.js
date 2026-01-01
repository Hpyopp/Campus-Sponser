const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');
const User = require('../models/User');

// Get All Events
const getEvents = asyncHandler(async (req, res) => {
  // 👇 IMP: Student ka Name, Email aur College Name sath bhejo
  const events = await Event.find()
    .populate('user', 'name email collegeName') 
    .sort({ createdAt: -1 });
  res.status(200).json(events);
});

// 👇 NEW: SINGLE EVENT FETCH (Details Page ke liye)
const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate('user', 'name email collegeName');
  if (event) {
    res.status(200).json(event);
  } else {
    res.status(404); throw new Error('Event not found');
  }
});

// Create Event
const createEvent = asyncHandler(async (req, res) => {
  const { title, description, date, location, budget, contactEmail, instagramLink } = req.body;

  if (!title || !budget || !contactEmail) {
    res.status(400); throw new Error('Please add Title, Budget and Contact Email');
  }

  const event = await Event.create({
    title, description, date, location, budget,
    contactEmail, instagramLink, // 👈 New Fields
    user: req.user.id,
  });
  res.status(200).json(event);
});

// Delete Event
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) { res.status(404); throw new Error('Event not found'); }
  if (event.user.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(401); throw new Error('Not authorized');
  }
  await event.deleteOne();
  res.status(200).json({ id: req.params.id });
});

// Sponsor Event
const sponsorEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) { res.status(404); throw new Error('Event not found'); }
  if (event.isSponsored) { res.status(400); throw new Error('Already Sponsored'); }
  if (req.user.role !== 'sponsor') { res.status(401); throw new Error('Only Sponsors allow'); }

  event.isSponsored = true;
  event.sponsorBy = req.user.id;
  event.sponsorName = req.user.companyName || req.user.name;
  event.sponsorEmail = req.user.email;
  event.sponsoredAt = Date.now();
  
  await event.save();
  res.status(200).json({ message: 'Deal Locked', event });
});

module.exports = { getEvents, getEventById, createEvent, deleteEvent, sponsorEvent };