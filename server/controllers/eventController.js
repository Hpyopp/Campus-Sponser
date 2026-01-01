const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');
const User = require('../models/User');

// 1. GET ALL EVENTS
const getEvents = asyncHandler(async (req, res) => {
  const events = await Event.find().sort({ createdAt: -1 });
  res.json(events);
});

// 2. GET SINGLE EVENT
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

  // 👇 SECURITY CHECK: Only Verified Students
  if (!req.user.isVerified) {
    res.status(403);
    throw new Error('Action Restricted: Your account is not verified yet.');
  }

  if (!title || !description || !date || !location || !budget || !contactEmail) {
    res.status(400);
    throw new Error('Please fill all fields');
  }

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
    throw new Error('User not authorized');
  }
  await event.deleteOne();
  res.json({ message: 'Event removed' });
});

// 5. SPONSOR EVENT (Flexible Amount + Security Check 🔒)
const sponsorEvent = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  
  // 👇 MAIN SECURITY FIX: Unverified users CANNOT sponsor
  if (!req.user.isVerified) {
    res.status(403);
    throw new Error('⛔ Access Denied! Your account must be verified by Admin to sponsor events.');
  }

  const event = await Event.findById(req.params.id);
  if (!event) { res.status(404); throw new Error('Event not found'); }

  const payAmount = Number(amount);
  const currentRaised = event.raisedAmount || 0;

  // Checks
  if (payAmount < 500) { 
    res.status(400); throw new Error('Minimum sponsorship amount is ₹500'); 
  }
  
  if (currentRaised + payAmount > event.budget) { 
    res.status(400); 
    throw new Error(`Amount exceeds remaining budget! Need only ₹${event.budget - currentRaised}`); 
  }

  // Add Sponsor to List
  event.sponsors.push({
    sponsorId: req.user.id,
    name: req.user.name,
    email: req.user.email,
    amount: payAmount
  });

  // Update Total
  event.raisedAmount = currentRaised + payAmount;
  
  await event.save();
  res.status(200).json(event);
});

// 6. CANCEL SPONSORSHIP
const cancelSponsorship = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) { res.status(404); throw new Error('Event not found'); }

  const sponsorIndex = event.sponsors.findIndex(s => s.sponsorId.toString() === req.user.id);

  if (sponsorIndex === -1) {
    res.status(400); throw new Error('You have not sponsored this event');
  }

  const amountToRefund = event.sponsors[sponsorIndex].amount;
  event.raisedAmount -= amountToRefund;
  event.sponsors.splice(sponsorIndex, 1);
  
  await event.save();
  res.status(200).json({ message: 'Sponsorship Cancelled', refundedAmount: amountToRefund });
});

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  deleteEvent,
  sponsorEvent,
  cancelSponsorship
};