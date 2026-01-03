// 👇 YAHAN DEKH: campusEvent hona chahiye
const Event = require('../models/campusEvent'); 
const asyncHandler = require('express-async-handler');

const getEvents = asyncHandler(async (req, res) => {
  try {
    const events = await Event.find().populate('organizer', 'name email');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Error fetching events", error: error.message });
  }
});

const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate('organizer', 'name email');
  if (event) { res.json(event); } 
  else { res.status(404); throw new Error('Event not found'); }
});

const createEvent = asyncHandler(async (req, res) => {
  const { title, description, date, venue, requiredAmount, category } = req.body;
  let permissionLetter = "";
  if (req.file) { permissionLetter = req.file.path || req.file.url; }

  const event = await Event.create({
    organizer: req.user.id,
    title, description, date, venue, requiredAmount, category,
    permissionLetter,
    status: 'pending', sponsors: []
  });
  res.status(201).json(event);
});

const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) { res.status(404); throw new Error('Not Found'); }
  await event.deleteOne();
  res.json({ message: 'Event Removed' });
});

const sponsorEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (event) {
      event.sponsors.push({ sponsorId: req.user.id, amount: req.body.amount, status: 'pending' });
      await event.save();
      res.json({ message: 'Sponsorship Requested' });
  } else { res.status(404); throw new Error('Event not found'); }
});

// Admin Actions inside Event Controller (Linked via Routes)
const approveEvent = asyncHandler(async (req, res) => { 
    const event = await Event.findById(req.params.id);
    if(event) { event.status = 'approved'; await event.save(); res.json({message: 'Event Approved'}); }
});

const revokeEvent = asyncHandler(async (req, res) => { 
    const event = await Event.findById(req.params.id);
    if(event) { event.status = 'rejected'; await event.save(); res.json({message: 'Event Revoked'}); }
});

// Helpers
const requestRefund = asyncHandler(async (req, res) => { res.json({message: 'Refund Requested'}); });
const approveRefund = asyncHandler(async (req, res) => { res.json({message: 'Refund Approved'}); });
const rejectRefund = asyncHandler(async (req, res) => { res.json({message: 'Refund Rejected'}); });
const verifySponsorship = asyncHandler(async (req, res) => { res.json({ message: "Verified" }); });
const rejectSponsorship = asyncHandler(async (req, res) => { res.json({ message: "Rejected" }); });

module.exports = {
  getEvents, getEventById, createEvent, deleteEvent,
  sponsorEvent, requestRefund, approveRefund, rejectRefund,
  approveEvent, revokeEvent, verifySponsorship, rejectSponsorship
};