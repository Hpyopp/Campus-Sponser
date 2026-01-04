const Event = require('../models/Event');
const asyncHandler = require('express-async-handler');
const path = require('path');

// 1. CREATE EVENT
const createEvent = asyncHandler(async (req, res) => {
  const { title, description, date, location, budget } = req.body;
  if (!title || !description || !date || !location || !budget) {
    res.status(400); throw new Error('Please fill all fields');
  }

  let permissionLetter = "";
  if (req.file) {
    permissionLetter = req.file.path || req.file.url; 
  }

  const event = await Event.create({
    user: req.user.id,
    title, description, date, location, budget,
    permissionLetter,
    sponsors: []
  });
  res.status(201).json(event);
});

// 2. GET ALL EVENTS
const getEvents = asyncHandler(async (req, res) => {
  const events = await Event.find().populate('user', 'name email').sort({ createdAt: -1 });
  res.json(events);
});

// 3. GET SINGLE EVENT
const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate('user', 'name email');
  if (event) res.json(event);
  else { res.status(404); throw new Error('Event not found'); }
});

// 4. SPONSOR EVENT (Pledge)
const sponsorEvent = asyncHandler(async (req, res) => {
  const { amount, comment } = req.body;
  const event = await Event.findById(req.params.id);

  if (event) {
    const alreadySponsored = event.sponsors.find(s => s.sponsorId.toString() === req.user.id.toString());
    if (alreadySponsored) { res.status(400); throw new Error('You have already pledged for this event'); }

    const sponsorship = {
      sponsorId: req.user.id,
      name: req.user.name,
      email: req.user.email,
      companyName: req.user.companyName,
      amount: Number(amount),
      comment,
      status: 'pending', // Default status
      date: Date.now()
    };

    event.sponsors.push(sponsorship);
    await event.save();
    res.status(201).json({ message: 'Sponsorship pledged' });
  } else { res.status(404); throw new Error('Event not found'); }
});

// 5. VERIFY PAYMENT (✅ FIXED FOR STUDENT/ADMIN)
const verifyPayment = asyncHandler(async (req, res) => {
  const { sponsorId } = req.body;
  const event = await Event.findById(req.params.id);

  if (!event) { res.status(404); throw new Error('Event not found'); }

  // Check: Sirf Owner (Student) ya Admin hi verify kar sakta hai
  if (event.user.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(401); throw new Error('Not authorized to verify');
  }

  const sponsor = event.sponsors.find(s => s.sponsorId.toString() === sponsorId);
  if (sponsor) {
    sponsor.status = 'verified';
    
    // Total Raised Update karo
    event.raisedAmount = event.sponsors
      .filter(s => s.status === 'verified')
      .reduce((acc, curr) => acc + curr.amount, 0);

    await event.save();
    res.json({ message: 'Payment Verified Successfully' });
  } else {
    res.status(404); throw new Error('Sponsor not found in this event');
  }
});

// 6. REJECT SPONSORSHIP (❌ FIXED FOR DECLINE BUTTON)
const rejectSponsorship = asyncHandler(async (req, res) => {
  const { sponsorId } = req.body;
  const event = await Event.findById(req.params.id);

  if (!event) { res.status(404); throw new Error('Event not found'); }

  // Check Permission
  if (event.user.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(401); throw new Error('Not authorized to reject');
  }

  // Sponsor ko array se filter out (delete) kar do
  const initialLength = event.sponsors.length;
  event.sponsors = event.sponsors.filter(s => s.sponsorId.toString() !== sponsorId);

  if (event.sponsors.length === initialLength) {
     res.status(404); throw new Error('Sponsor not found to delete');
  }

  await event.save();
  res.json({ message: 'Sponsorship Offer Rejected/Deleted' });
});

// --- ADMIN ONLY CONTROLLERS ---
const approveEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (event) { event.isApproved = true; await event.save(); res.json({ message: 'Event Approved' }); } 
  else { res.status(404); throw new Error('Event not found'); }
});

const revokeEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (event) { event.isApproved = false; await event.save(); res.json({ message: 'Event Revoked' }); } 
  else { res.status(404); throw new Error('Event not found'); }
});

const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (event) { await event.deleteOne(); res.json({ message: 'Event Deleted' }); } 
  else { res.status(404); throw new Error('Event not found'); }
});

module.exports = {
  createEvent, getEvents, getEventById, sponsorEvent,
  verifyPayment,    // ✅ Added
  rejectSponsorship, // ✅ Added
  approveEvent, revokeEvent, deleteEvent
};