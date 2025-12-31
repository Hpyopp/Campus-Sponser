const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');
const User = require('../models/User');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = asyncHandler(async (req, res) => {
  // Sort by Date (Naya event pehle)
  const events = await Event.find().sort({ createdAt: -1 });
  res.status(200).json(events);
});

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Students Only)
const createEvent = asyncHandler(async (req, res) => {
  if (!req.body.title || !req.body.budget) {
    res.status(400);
    throw new Error('Please add title and budget');
  }

  const event = await Event.create({
    title: req.body.title,
    description: req.body.description,
    date: req.body.date,
    location: req.body.location,
    budget: req.body.budget,
    user: req.user.id,
  });

  res.status(200).json(event);
});

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Owner or Admin)
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  // Check user (Admin can delete anyone's event)
  if (event.user.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('User not authorized');
  }

  await event.deleteOne();
  res.status(200).json({ id: req.params.id });
});

// 👇 NEW: SPONSOR AN EVENT (THE DEAL MAKER)
// @desc    Sponsor an event
// @route   PUT /api/events/sponsor/:id
// @access  Private (Sponsors Only)
const sponsorEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  // 1. Check: Kya ye pehle se sponsored hai?
  if (event.isSponsored) {
    res.status(400);
    throw new Error('Too Late! This event is already sponsored.');
  }

  // 2. Check: Kya user sach mein Sponsor hai?
  // (req.user authMiddleware se aa raha hai)
  if (req.user.role !== 'sponsor') {
    res.status(401);
    throw new Error('Only Sponsors can fund events.');
  }

  // 3. LOCK THE DEAL
  event.isSponsored = true;
  event.sponsorBy = req.user.id;
  event.sponsorName = req.user.name;
  event.sponsorEmail = req.user.email;
  event.sponsoredAt = Date.now();

  await event.save();

  res.status(200).json({ 
    message: `Deal Locked! You are now sponsoring ${event.title}`, 
    event 
  });
});

module.exports = {
  getEvents,
  createEvent,
  deleteEvent,
  sponsorEvent, // 👈 Export kiya naya function
};