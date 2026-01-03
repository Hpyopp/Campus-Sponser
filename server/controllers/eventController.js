const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');
const User = require('../models/User'); 
const jwt = require('jsonwebtoken');

// 1. GET ALL EVENTS
const getEvents = asyncHandler(async (req, res) => { 
  const events = await Event.find()
    .populate('user', 'name email collegeName')
    .populate('views', 'name email') 
    .sort({ createdAt: -1 }); 
  res.json(events); 
});

// 2. GET SINGLE EVENT
const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id)
    .populate('user', 'name email collegeName')
    .populate('views', 'name email'); 

  if(event) {
      let currentUser = null;
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
          try {
              const token = req.headers.authorization.split(' ')[1];
              const decoded = jwt.verify(token, process.env.JWT_SECRET);
              currentUser = await User.findById(decoded.id);
          } catch (error) {}
      }
      if (currentUser && currentUser.role !== 'admin') {
          const alreadyViewed = event.views.some(v => (v._id ? v._id.toString() : v.toString()) === currentUser._id.toString());
          if (!alreadyViewed) {
              event.views.push(currentUser._id);
              await event.save();
          }
      }
      res.json(event);
  } else {
      res.status(404); throw new Error('Not found');
  }
});

// 3. CREATE EVENT
const createEvent = asyncHandler(async (req, res) => {
  const {title, description, date, location, budget, contactEmail, instagramLink} = req.body;
  if(!req.user.isVerified){res.status(403); throw new Error('Not Verified');}
  
  const event = await Event.create({
      user: req.user.id, title, description, date, location, budget, contactEmail, instagramLink, 
      permissionLetter: req.file.path, isApproved: false
  });
  res.status(201).json(event);
});

// 4. DELETE EVENT
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if(!event){res.status(404); throw new Error('Not found');}
  if(event.user.toString() !== req.user.id && req.user.role !== 'admin'){res.status(401); throw new Error('Not Authorized');}
  await event.deleteOne();
  res.json({message:'Removed'});
});

// 5. ADMIN ACTIONS
const approveEvent = asyncHandler(async (req, res) => { const event = await Event.findById(req.params.id); if (!event) { res.status(404); throw new Error('Not Found'); } event.isApproved = true; await event.save(); res.status(200).json({ message: 'Event Approved & Live' }); });
const revokeEvent = asyncHandler(async (req, res) => { const event = await Event.findById(req.params.id); if (!event) { res.status(404); throw new Error('Not Found'); } event.isApproved = false; await event.save(); res.status(200).json({ message: 'Event Revoked' }); });

// 6. SPONSOR EVENT (Pledge)
const sponsorEvent = asyncHandler(async (req, res) => {
  const { amount, comment } = req.body;
  if (!req.user.isVerified) { res.status(403); throw new Error('Account Not Verified'); }
  
  const event = await Event.findById(req.params.id);
  if (!event) { res.status(404); throw new Error('Event not found'); }
  if (!event.isApproved) { res.status(400); throw new Error('Event not live yet'); }
  
  const payAmount = Number(amount);
  const currentRaised = event.raisedAmount || 0;
  
  if (payAmount < 500) { res.status(400); throw new Error('Minimum ₹500 required'); }
  if (currentRaised + payAmount > event.budget) { res.status(400); throw new Error('Amount exceeds budget'); }
  
  event.sponsors.push({ 
      sponsorId: req.user.id, name: req.user.name, email: req.user.email, 
      companyName: req.user.companyName || 'Individual Sponsor', 
      amount: payAmount, status: 'confirmed', comment: comment || '' 
  });
  
  event.raisedAmount = currentRaised + payAmount;
  await event.save();
  res.status(200).json(event);
});

// 7. REFUND ACTIONS
const requestRefund = asyncHandler(async (req, res) => { const event = await Event.findById(req.params.id); if (!event) { res.status(404); throw new Error('Not found'); } const idx = event.sponsors.findIndex(s => s.sponsorId.toString() === req.user.id); if (idx === -1) { res.status(400); throw new Error('Not a sponsor'); } event.sponsors[idx].status = 'refund_requested'; await event.save(); res.status(200).json({ message: 'Requested' }); });
const approveRefund = asyncHandler(async (req, res) => { const { eventId, sponsorId } = req.body; const event = await Event.findById(eventId); if (!event) { res.status(404); throw new Error('Not found'); } const idx = event.sponsors.findIndex(s => s.sponsorId.toString() === sponsorId); if (idx === -1) { res.status(400); throw new Error('Sponsor not found'); } event.raisedAmount -= event.sponsors[idx].amount; event.sponsors.splice(idx, 1); await event.save(); res.status(200).json({ message: 'Refund Approved' }); });
const rejectRefund = asyncHandler(async (req, res) => { const { eventId, sponsorId } = req.body; const event = await Event.findById(eventId); if (!event) { res.status(404); throw new Error('Not found'); } const idx = event.sponsors.findIndex(s => s.sponsorId.toString() === sponsorId); if (idx === -1) { res.status(400); throw new Error('Sponsor not found'); } event.sponsors[idx].status = 'confirmed'; await event.save(); res.status(200).json({ message: 'Rejected' }); });

// 8. VERIFY PAYMENT (Admin)
const verifySponsorship = asyncHandler(async (req, res) => { const { eventId, sponsorId } = req.body; const event = await Event.findById(eventId); if (!event) { res.status(404); throw new Error('Event not found'); } const sponsor = event.sponsors.find(s => s.sponsorId.toString() === sponsorId); if (!sponsor) { res.status(404); throw new Error('Sponsor not found'); } sponsor.status = 'verified'; await event.save(); res.status(200).json({ message: 'Payment Verified Successfully' }); });

// 👇 9. NEW: REJECT SPONSORSHIP (For Organizer/Student)
const rejectSponsorship = asyncHandler(async (req, res) => {
  const { eventId, sponsorId } = req.body;

  const event = await Event.findById(eventId);
  if (!event) { res.status(404); throw new Error('Event not found'); }

  // Check if user is owner or admin
  if (event.user.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(401); throw new Error('Not Authorized');
  }

  const idx = event.sponsors.findIndex(s => s.sponsorId.toString() === sponsorId);
  if (idx === -1) { res.status(400); throw new Error('Sponsor not found'); }

  // Logic: Decrease Amount & Remove Sponsor
  event.raisedAmount -= event.sponsors[idx].amount;
  event.sponsors.splice(idx, 1);

  await event.save();
  res.status(200).json({ message: 'Sponsorship Rejected' });
});

module.exports = { 
    getEvents, getEventById, createEvent, deleteEvent, 
    sponsorEvent, requestRefund, approveRefund, rejectRefund, 
    approveEvent, revokeEvent, verifySponsorship, rejectSponsorship 
};