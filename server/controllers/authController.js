const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');

// 1. GET ALL
const getEvents = asyncHandler(async (req, res) => { const events = await Event.find().sort({ createdAt: -1 }); res.json(events); });
// 2. GET ONE
const getEventById = asyncHandler(async (req, res) => { const event = await Event.findById(req.params.id).populate('user', 'name email collegeName'); if(event) res.json(event); else {res.status(404); throw new Error('Not found');} });
// 3. CREATE
const createEvent = asyncHandler(async (req, res) => { const {title, description, date, location, budget, contactEmail, instagramLink} = req.body; if(!req.user.isVerified){res.status(403); throw new Error('Not Verified');} const event = await Event.create({user: req.user.id, title, description, date, location, budget, contactEmail, instagramLink}); res.status(201).json(event); });
// 4. DELETE
const deleteEvent = asyncHandler(async (req, res) => { const event = await Event.findById(req.params.id); if(!event){res.status(404); throw new Error('Not found');} if(event.user.toString() !== req.user.id && req.user.role !== 'admin'){res.status(401); throw new Error('Not Authorized');} await event.deleteOne(); res.json({message:'Removed'}); });

// 5. SPONSOR EVENT
const sponsorEvent = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  
  // Security Check
  if (!req.user.isVerified) { res.status(403); throw new Error('Account Not Verified'); }

  const event = await Event.findById(req.params.id);
  if (!event) { res.status(404); throw new Error('Event not found'); }

  const payAmount = Number(amount);
  const currentRaised = event.raisedAmount || 0;

  if (payAmount < 500) { res.status(400); throw new Error('Minimum ₹500 required'); }
  if (currentRaised + payAmount > event.budget) { res.status(400); throw new Error('Amount exceeds remaining budget'); }

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

// 6. REQUEST REFUND (User Side - No Money Deduction)
const requestRefund = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) { res.status(404); throw new Error('Event not found'); }

  const idx = event.sponsors.findIndex(s => s.sponsorId.toString() === req.user.id);
  if (idx === -1) { res.status(400); throw new Error('Not a sponsor'); }

  event.sponsors[idx].status = 'refund_requested';
  await event.save();
  res.status(200).json({ message: 'Refund Requested' });
});

// --- ADMIN ACTIONS ---

// 7. APPROVE REFUND (Money Deducted Here)
const approveRefund = asyncHandler(async (req, res) => {
  const { eventId, sponsorId } = req.body;
  const event = await Event.findById(eventId);
  if (!event) { res.status(404); throw new Error('Event not found'); }

  const idx = event.sponsors.findIndex(s => s.sponsorId.toString() === sponsorId);
  if (idx === -1) { res.status(400); throw new Error('Sponsor not found'); }

  // Deduct Money
  const amount = event.sponsors[idx].amount;
  event.raisedAmount -= amount;
  
  // Remove User
  event.sponsors.splice(idx, 1);

  await event.save();
  res.status(200).json({ message: 'Refund Approved' });
});

// 8. REJECT REFUND (Reset Status)
const rejectRefund = asyncHandler(async (req, res) => {
  const { eventId, sponsorId } = req.body;
  const event = await Event.findById(eventId);
  if (!event) { res.status(404); throw new Error('Event not found'); }

  const idx = event.sponsors.findIndex(s => s.sponsorId.toString() === sponsorId);
  if (idx === -1) { res.status(400); throw new Error('Sponsor not found'); }

  // Reset Status
  event.sponsors[idx].status = 'confirmed';

  await event.save();
  res.status(200).json({ message: 'Refund Rejected' });
});

module.exports = { getEvents, getEventById, createEvent, deleteEvent, sponsorEvent, requestRefund, approveRefund, rejectRefund };