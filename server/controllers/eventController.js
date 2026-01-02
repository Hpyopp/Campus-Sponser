const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');

// 1. GET ALL (Returns ALL events, Frontend filters for public)
const getEvents = asyncHandler(async (req, res) => {
  const events = await Event.find().sort({ createdAt: -1 });
  res.json(events);
});

// 2. GET ONE
const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate('user', 'name email collegeName');
  if(event) res.json(event); else {res.status(404); throw new Error('Not found');}
});

// 3. CREATE EVENT (Handles File Upload 📄)
const createEvent = asyncHandler(async (req, res) => {
  const { title, description, date, location, budget, contactEmail, instagramLink } = req.body;
  
  if (!req.user.isVerified) { res.status(403); throw new Error('Account Not Verified'); }
  if (!req.file) { res.status(400); throw new Error('Permission Letter is required'); }

  const event = await Event.create({
    user: req.user.id,
    title, description, date, location, budget, contactEmail, instagramLink,
    permissionLetter: req.file.path, // Cloudinary URL
    isApproved: false // Default Pending
  });
  
  res.status(201).json(event);
});

// 4. APPROVE EVENT (Admin Only 🟢)
const approveEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) { res.status(404); throw new Error('Not Found'); }
  
  event.isApproved = true;
  await event.save();
  res.status(200).json({ message: 'Event Approved & Live' });
});

// 5. DELETE EVENT
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if(!event){res.status(404); throw new Error('Not found');}
  if(event.user.toString() !== req.user.id && req.user.role !== 'admin'){
      res.status(401); throw new Error('Not Authorized');
  }
  await event.deleteOne();
  res.json({message:'Removed'});
});

// ... OTHER FUNCTIONS (Same as before) ...
const sponsorEvent = asyncHandler(async (req, res) => { const { amount } = req.body; if (!req.user.isVerified) { res.status(403); throw new Error('Not Verified'); } const event = await Event.findById(req.params.id); if (!event) { res.status(404); throw new Error('Not found'); } const payAmount = Number(amount); const currentRaised = event.raisedAmount || 0; if (payAmount < 500) { res.status(400); throw new Error('Min 500'); } if (currentRaised + payAmount > event.budget) { res.status(400); throw new Error('Over Budget'); } event.sponsors.push({ sponsorId: req.user.id, name: req.user.name, email: req.user.email, amount: payAmount, status: 'confirmed' }); event.raisedAmount = currentRaised + payAmount; await event.save(); res.status(200).json(event); });
const requestRefund = asyncHandler(async (req, res) => { const event = await Event.findById(req.params.id); if (!event) { res.status(404); throw new Error('Not found'); } const idx = event.sponsors.findIndex(s => s.sponsorId.toString() === req.user.id); if (idx === -1) { res.status(400); throw new Error('Not a sponsor'); } event.sponsors[idx].status = 'refund_requested'; await event.save(); res.status(200).json({ message: 'Requested' }); });
const approveRefund = asyncHandler(async (req, res) => { const { eventId, sponsorId } = req.body; const event = await Event.findById(eventId); if (!event) { res.status(404); throw new Error('Not found'); } const idx = event.sponsors.findIndex(s => s.sponsorId.toString() === sponsorId); if (idx === -1) { res.status(400); throw new Error('Sponsor not found'); } event.raisedAmount -= event.sponsors[idx].amount; event.sponsors.splice(idx, 1); await event.save(); res.status(200).json({ message: 'Refund Approved' }); });
const rejectRefund = asyncHandler(async (req, res) => { const { eventId, sponsorId } = req.body; const event = await Event.findById(eventId); if (!event) { res.status(404); throw new Error('Not found'); } const idx = event.sponsors.findIndex(s => s.sponsorId.toString() === sponsorId); if (idx === -1) { res.status(400); throw new Error('Sponsor not found'); } event.sponsors[idx].status = 'confirmed'; await event.save(); res.status(200).json({ message: 'Rejected' }); });

module.exports = { getEvents, getEventById, createEvent, deleteEvent, sponsorEvent, requestRefund, approveRefund, rejectRefund, approveEvent };