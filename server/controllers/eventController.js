const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');
const User = require('../models/User');

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Verified Users Only)
const createEvent = asyncHandler(async (req, res) => {
  
  // 🔒 SECURITY CHECK: Kya User Verified hai?
  if (!req.user.isVerified) {
    res.status(403);
    throw new Error('🚫 Access Denied! Your KYC is NOT Verified. Please wait for Admin Approval.');
  }

  const { title, date, location, budget, description } = req.body;

  if (!title || !date || !location || !budget) {
    res.status(400);
    throw new Error('Please add all fields');
  }

  // Create Event
  const event = await Event.create({
    user: req.user.id,
    title,
    date,
    location,
    budget,
    description,
  });

  res.status(200).json(event);
});

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = asyncHandler(async (req, res) => {
  // Sort by latest date (Newest first)
  const events = await Event.find().sort({ createdAt: -1 });
  res.status(200).json(events);
});

// @desc    Delete Event (Admin Only)
// @route   DELETE /api/events/:id
// @access  Private/Admin
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  // Event database se uda do
  await event.deleteOne();

  res.status(200).json({ message: 'Event Deleted Successfully 🗑️' });
});

module.exports = {
  createEvent,
  getEvents,
  deleteEvent,
};