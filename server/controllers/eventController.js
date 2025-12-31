const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');

// @desc Create Event (Verified Only)
const createEvent = asyncHandler(async (req, res) => {
  if (!req.user.isVerified) { res.status(403); throw new Error('Access Denied! KYC Pending.'); }
  const { title, date, location, budget, description } = req.body;
  if (!title || !date || !location || !budget) { res.status(400); throw new Error('Please add all fields'); }

  const event = await Event.create({ user: req.user.id, title, date, location, budget, description });
  res.status(200).json(event);
});

// @desc Get Events
const getEvents = asyncHandler(async (req, res) => {
  const events = await Event.find().sort({ createdAt: -1 });
  res.status(200).json(events);
});

// @desc Update Event (Owner Only) 👇 NEW
const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) { res.status(404); throw new Error('Event not found'); }
  
  // Check Ownership
  if (event.user.toString() !== req.user.id) { res.status(401); throw new Error('Not authorized'); }

  const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.status(200).json(updatedEvent);
});

// @desc Delete My Event (Owner Only) 👇 NEW
const deleteMyEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) { res.status(404); throw new Error('Event not found'); }

  if (event.user.toString() !== req.user.id) { res.status(401); throw new Error('Not authorized'); }

  await event.deleteOne();
  res.status(200).json({ message: 'Event Deleted' });
});

// @desc Delete Event (Admin)
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) { res.status(404); throw new Error('Event not found'); }
  await event.deleteOne();
  res.status(200).json({ message: 'Event Deleted by Admin' });
});

module.exports = { createEvent, getEvents, updateEvent, deleteMyEvent, deleteEvent };