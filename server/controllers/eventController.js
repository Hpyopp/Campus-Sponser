// 👇 YE 3 LINES BAHUT ZAROORI HAIN - INHE MAT HATANA
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

// --- 3. CREATE EVENT ---
const createEvent = asyncHandler(async (req, res) => {
  const { title, description, date, location, budget, contactEmail, instagramLink } = req.body;

  if (!title || !budget || !contactEmail) {
    res.status(400);
    throw new Error('Please add Title, Budget and Contact Email');
  }

  const event = await Event.create({
    title, description, date, location, budget,
    contactEmail, instagramLink,
    user: req.user.id,
  });
  res.status(200).json(event);
});

// --- 4. DELETE EVENT (Fixed Logic) ---
const deleteEvent = asyncHandler(async (req, res) => {
  console.log(`🔥 DELETE REQUEST: Event ID ${req.params.id}`);

  // Event dhundo
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error('Event not found in Database');
  }

  // Permission Check: Admin ho ya Owner ho
  // Note: 'admin' check ko safe banaya hai (Case Insensitive)
  const isAdmin = req.user.role && req.user.role.toLowerCase() === 'admin';
  const isOwner = event.user.toString() === req.user.id;

  if (!isAdmin && !isOwner) {
    console.log("⛔ Access Denied");
    res.status(401);
    throw new Error('Not Authorized to Delete');
  }

  // 🔥 DIRECT DATABASE DELETE COMMAND
  await Event.findByIdAndDelete(req.params.id);
  
  console.log("✅ Event Deleted Successfully!");
  res.status(200).json({ id: req.params.id, message: "Event Deleted Permanently" });
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