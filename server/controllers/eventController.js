const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');

// 1. GET ALL
const getEvents = asyncHandler(async (req, res) => {
  const events = await Event.find().sort({ createdAt: -1 });
  res.json(events);
});

// 2. GET ONE
const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate('user', 'name email collegeName');
  if (event) {
    res.json(event);
  } else {
    res.status(404);
    throw new Error('Event not found');
  }
});

// 3. CREATE EVENT
const createEvent = asyncHandler(async (req, res) => {
  const { title, description, date, location, budget, contactEmail, instagramLink } = req.body;
  if (!req.user.isVerified) { res.status(403); throw new Error('Account Not Verified'); }

  const event = await Event.create({
    user: req.user.id,
    title,
    description,
    date,
    location,
    budget,
    contactEmail,
    instagramLink
  });
  res.status(201).json(event);
});

// 4. DELETE EVENT
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) { res.status(404); throw new Error('Event not found'); }
  if (event.user.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not Authorized');
  }
  await event.deleteOne();
  res.json({ message: 'Event Removed' });
});

// 5. SPONSOR EVENT
const sponsorEvent = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  if (!req.user.isVerified) { res.status(403); throw new Error('Account Not Verified'); }

  const event = await Event.findById(req.params.id);
  if (!event) { res.status(404); throw new Error('Event not found'); }

  const payAmount = Number(amount);
  const currentRaised = event.raisedAmount || 0;

  if (payAmount < 500) { res.status(400); throw new Error('Minimum ₹500 required'); }
  if (currentRaised + payAmount > event.budget) { res.status(400); throw new Error('Amount exceeds budget'); }

  event.sponsors.push({
    sponsorId: req.user.id,
    name: req.user.name,
    email: req.user.email,
    amount: payAmount,
    status: 'confirmed'
  });

  event.raisedAmount = currentRaised + payAmount;
  await event.save();
  res.status(200).json(event);
});

// 6. REQUEST REFUND (Ye wala function missing tha isliye error aa raha tha)
const requestRefund = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) { res.status(404); throw new Error('Event not found'); }

  const idx = event.sponsors.findIndex(s => s.sponsorId.toString() === req.user.id);
  if (idx === -1) { res.status(400); throw new Error('Not a sponsor'); }

  event.sponsors[idx].status = 'refund_requested';
  await event.save();
  res.status(200).json({ message: 'Refund Requested' });
});

// 7. APPROVE REFUND
const approveRefund = asyncHandler(async (req, res) => {
  const { eventId, sponsorId } = req.body;
  const event = await Event.findById(eventId);
  if (!event) { res.status(404); throw new Error('Event not found'); }

  const idx = event.sponsors.findIndex(s => s.sponsorId.toString() === sponsorId);
  if (idx === -1) { res.status(400); throw new Error('Sponsor not found'); }

  const amount = event.sponsors[idx].amount;
  event.raisedAmount -= amount;
  event.sponsors.splice(idx, 1);

  await event.save();
  res.status(200).json({ message: 'Refund Approved' });
});

// 8. REJECT REFUND
const rejectRefund = asyncHandler(async (req, res) => {
  const { eventId, sponsorId } = req.body;
  const event = await Event.findById(eventId);
  if (!event) { res.status(404); throw new Error('Event not found'); }

  const idx = event.sponsors.findIndex(s => s.sponsorId.toString() === sponsorId);
  if (idx === -1) { res.status(400); throw new Error('Sponsor not found'); }

  event.sponsors[idx].status = 'confirmed';
  await event.save();
  res.status(200).json({ message: 'Refund Rejected' });
});

// ⚠️ IMPORTANT: Yahan dekh le ki saare naam listed hain ya nahi
module.exports = { 
  getEvents, 
  getEventById, 
  createEvent, 
  deleteEvent, 
  sponsorEvent, 
  requestRefund, // 👈 Ye zaroori hai
  approveRefund, 
  rejectRefund 
};