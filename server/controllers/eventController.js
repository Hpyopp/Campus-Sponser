const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');
const User = require('../models/User');

const getEvents = asyncHandler(async (req, res) => {
  const events = await Event.find().populate('user', 'name email collegeName').sort({ createdAt: -1 });
  res.status(200).json(events);
});

const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate('user', 'name email collegeName');
  if (event) res.status(200).json(event);
  else { res.status(404); throw new Error('Event not found'); }
});

const createEvent = asyncHandler(async (req, res) => {
  const { title, description, date, location, budget, contactEmail, instagramLink } = req.body;
  if (!title || !budget || !contactEmail) { res.status(400); throw new Error('Missing fields'); }
  const event = await Event.create({
    title, description, date, location, budget, contactEmail, instagramLink, user: req.user.id,
  });
  res.status(200).json(event);
});

// 👇 FIXED DELETE LOGIC (POWERFUL DELETE)
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  // Debugging Log (Render Console mein dikhega)
  console.log(`[DELETE REQUEST] User Role: ${req.user.role}, Event Owner: ${event.user}`);

  // Check: Owner OR Admin (Case Insensitive)
  const isAdmin = req.user.role.toLowerCase() === 'admin';
  const isOwner = event.user.toString() === req.user.id;

  if (!isOwner && !isAdmin) {
    res.status(401);
    throw new Error('Not Authorized. You are not the Owner or Admin.');
  }

  // Direct Delete Command
  await Event.findByIdAndDelete(req.params.id);

  res.status(200).json({ id: req.params.id, message: "Deleted Successfully" });
});

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