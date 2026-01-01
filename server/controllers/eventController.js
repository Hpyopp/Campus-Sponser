const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');
const User = require('../models/User');

// 👇 UPDATE 1: .populate() LAGAYA HAI (Student Email Lane Ke Liye)
const getEvents = asyncHandler(async (req, res) => {
  const events = await Event.find()
    .populate('user', 'name email') // <--- YE LINE SABSE IMPORTANT HAI
    .sort({ createdAt: -1 });
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

const sponsorEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) { res.status(404); throw new Error('Event not found'); }
  if (event.isSponsored) { res.status(400); throw new Error('Event already sponsored.'); }
  if (req.user.role !== 'sponsor') { res.status(401); throw new Error('Only Sponsors can fund.'); }

  event.isSponsored = true;
  event.sponsorBy = req.user.id;
  event.sponsorName = req.user.companyName || req.user.name || "Sponsor"; 
  event.sponsorEmail = req.user.email;
  event.sponsoredAt = Date.now();

  const updatedEvent = await event.save();
  res.status(200).json({ message: `Deal Locked!`, event: updatedEvent });
});

module.exports = { getEvents, createEvent, deleteEvent, sponsorEvent };