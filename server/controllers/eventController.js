const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');
const User = require('../models/User'); // User model import zaroori hai

const getEvents = asyncHandler(async (req, res) => {
  const events = await Event.find().sort({ createdAt: -1 });
  res.status(200).json(events);
});

const createEvent = asyncHandler(async (req, res) => {
  if (!req.body.title || !req.body.budget) {
    res.status(400); throw new Error('Please add title and budget');
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

const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) { res.status(404); throw new Error('Event not found'); }
  if (event.user.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(401); throw new Error('User not authorized');
  }
  await event.deleteOne();
  res.status(200).json({ id: req.params.id });
});

// 👇 FIXED SPONSOR FUNCTION (WITH COMPANY NAME)
const sponsorEvent = asyncHandler(async (req, res) => {
  console.log("🔒 Trying to lock deal for User:", req.user._id);

  const event = await Event.findById(req.params.id);
  if (!event) { res.status(404); throw new Error('Event not found'); }

  if (event.isSponsored) {
    res.status(400); throw new Error('Too Late! Event is already sponsored.');
  }

  // Get Full User Data (To be safe)
  const sponsor = await User.findById(req.user.id);

  if (sponsor.role !== 'sponsor') {
    res.status(401); throw new Error('Only Sponsors can fund events.');
  }

  // UPDATE FIELDS
  event.isSponsored = true;
  event.sponsorBy = sponsor._id;
  
  // 👇 AGAR COMPANY NAME HAI TOH WO LO, WARNA USER NAME
  event.sponsorName = sponsor.companyName || sponsor.name || "Unknown Sponsor"; 
  event.sponsorEmail = sponsor.email;
  event.sponsoredAt = Date.now();

  const updatedEvent = await event.save();
  
  console.log("✅ Deal Locked! Saved Data:", updatedEvent); // Server Log Check

  res.status(200).json({ 
    message: `Deal Locked by ${event.sponsorName}!`, 
    event: updatedEvent 
  });
});

module.exports = { getEvents, createEvent, deleteEvent, sponsorEvent };