// 👇 Imports (Bahut Zaroori)
const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');
const User = require('../models/User');

// --- 1. GET ALL EVENTS ---
const getEvents = asyncHandler(async (req, res) => {
  const events = await Event.find()
    .populate('user', 'name email collegeName') 
    .sort({ createdAt: -1 });
  res.status(200).json(events);
});

// --- 2. GET SINGLE EVENT ---
const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate('user', 'name email collegeName');
  if (event) {
    res.status(200).json(event);
  } else {
    res.status(404);
    throw new Error('Event not found');
  }
});

// --- 3. CREATE EVENT (With Contact Info) ---
const createEvent = asyncHandler(async (req, res) => {
  const { title, description, date, location, budget, contactEmail, instagramLink } = req.body;

  // Validation
  if (!title || !budget || !contactEmail) {
    res.status(400);
    throw new Error('Please add Title, Budget and Contact Email');
  }

  // Create
  const event = await Event.create({
    title, description, date, location, budget,
    contactEmail, // 👈 Ye ab Schema mein hai, toh save hoga
    instagramLink,
    user: req.user.id,
  });
  
  console.log("✅ Event Created:", event);
  res.status(200).json(event);
});

// --- 4. DELETE EVENT (Crash Proof) ---
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  // Safety Check for old events
  const eventOwnerId = event.user ? event.user.toString() : null;
  const isAdmin = req.user.role && req.user.role.toLowerCase() === 'admin';
  const isOwner = eventOwnerId === req.user.id;

  if (!isAdmin && !isOwner) {
    res.status(401);
    throw new Error('Not Authorized');
  }

  await Event.findByIdAndDelete(req.params.id);
  res.status(200).json({ id: req.params.id, message: "Deleted" });
});

// --- 5. SPONSOR EVENT ---
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

module.exports = { 
  getEvents, 
  getEventById, 
  createEvent, 
  deleteEvent, 
  sponsorEvent 
};