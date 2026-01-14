const Event = require('../models/campusEvent');
const User = require('../models/User'); 
const asyncHandler = require('express-async-handler');
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken'); 

// 1. CREATE EVENT (FIXED FOR 2 FILES)
const createEvent = asyncHandler(async (req, res) => {
  const { title, description, date, location, budget, email, instagramLink } = req.body;

  // Validation: Check fields
  if (!title || !description || !date || !location || !budget) {
    res.status(400); throw new Error('Please fill all fields');
  }

  // Validation: Check Files (req.files use karein, req.file nahi)
  if (!req.files || !req.files.image || !req.files.permissionLetter) {
    res.status(400); throw new Error('Both Event Image and Permission Letter are required');
  }

  // Extract Paths from Cloudinary/Multer
  const imageUrl = req.files.image[0].path;
  const permissionLetterUrl = req.files.permissionLetter[0].path;

  const event = await Event.create({
    user: req.user._id, 
    title, 
    description, 
    date, 
    location, 
    budget,
    contactEmail: email,       // Added
    instagramLink: instagramLink, // Added
    imageUrl: imageUrl,        // Added
    permissionLetter: permissionLetterUrl, 
    sponsors: [], 
    status: 'pending', 
    raisedAmount: 0, 
    views: 0,
    isApproved: false
  });

  res.status(201).json(event);
});

// 2. GET ALL APPROVED EVENTS
const getEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ isApproved: true }).populate('user', 'name email').sort({ createdAt: -1 });
  res.json(events);
});

// 2.5 GET TRENDING EVENTS
const getTrendingEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ isApproved: true })
    .sort({ views: -1 }) 
    .limit(3) 
    .populate('user', 'name email');
  res.json(events);
});

// 3. GET SINGLE EVENT
const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate('user', 'name email');
  if (event) {
    // View Counter Logic
    let shouldCount = true;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded.id === event.user._id.toString()) { shouldCount = false; } 
        } catch (error) {}
    }
    if (shouldCount) {
        event.views = (event.views || 0) + 1;
        await event.save();
    }
    res.json(event);
  } else { res.status(404); throw new Error('Event not found'); }
});

// 4. SPONSOR EVENT
const sponsorEvent = asyncHandler(async (req, res) => {
  const { amount, comment } = req.body;
  const event = await Event.findById(req.params.id);
  if (event) {
    event.sponsors.push({
      sponsorId: req.user._id, name: req.user.name, email: req.user.email,
      companyName: req.user.companyName, amount: Number(amount), comment, status: 'pending'
    });
    await event.save();
    res.status(201).json({ message: 'Pledged Successfully' });
  } else { res.status(404); throw new Error('Event not found'); }
});

// 5. VERIFY PAYMENT
const verifyPayment = asyncHandler(async (req, res) => {
  const { sponsorId } = req.body;
  const event = await Event.findById(req.params.id);
  if (!event) { res.status(404); throw new Error('Event not found'); }
  const sponsor = event.sponsors.find(s => s.sponsorId.toString() === sponsorId);
  if (sponsor) {
    sponsor.status = 'verified'; 
    event.raisedAmount = event.sponsors.filter(s => s.status === 'verified').reduce((acc, curr) => acc + curr.amount, 0);
    if (event.raisedAmount >= event.budget) event.status = 'completed';
    await event.save();
    res.json({ message: 'Payment Verified', status: 'verified' });
  } else { res.status(404); throw new Error('Sponsor not found'); }
});

// 6. REQUEST REFUND
const requestRefund = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  const sponsor = event.sponsors.find(s => s.sponsorId.toString() === req.user._id.toString());
  if (sponsor) {
    sponsor.status = 'refund_requested';
    await event.save();
    res.json({ message: 'Refund Requested' });
  } else { res.status(404); throw new Error('Not found'); }
});

// 7. PROCESS REFUND
const processRefund = asyncHandler(async (req, res) => {
    const { sponsorId } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) { res.status(404); throw new Error('Event not found'); }
    const sponsorDetails = event.sponsors.find(s => s.sponsorId.toString() === sponsorId);
    event.sponsors = event.sponsors.filter(s => s.sponsorId.toString() !== sponsorId);
    event.raisedAmount = event.sponsors.filter(s => s.status === 'verified').reduce((acc, curr) => acc + curr.amount, 0);
    if (event.raisedAmount < event.budget && event.status === 'completed') event.status = 'funding';
    await event.save();
    if (sponsorDetails) {
        try { await sendEmail({ email: sponsorDetails.email, subject: 'Refund Processed', html: `<p>Refund of ₹${sponsorDetails.amount} processed.</p>` }); } catch (e) {}
    }
    res.json({ message: 'Refunded successfully' });
});

// 8. REJECT SPONSORSHIP
const rejectSponsorship = asyncHandler(async (req, res) => {
  const { sponsorId } = req.body;
  const event = await Event.findById(req.params.id);
  event.sponsors = event.sponsors.filter(s => s.sponsorId.toString() !== sponsorId);
  await event.save();
  res.json({ message: 'Offer Declined' });
});

// 9. APPROVE EVENT
const approveEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) { res.status(404); throw new Error('Event not found'); }
  
  // FIX: Ensure old events don't crash due to missing fields
  if(!event.imageUrl) event.imageUrl = "https://via.placeholder.com/500";
  if(!event.budget) event.budget = 0;

  event.isApproved = true;
  event.status = 'funding';
  await event.save(); 
  try {
      const creator = await User.findById(event.user);
      if(creator) await sendEmail({ email: creator.email, subject: 'Event Approved! 🚀', html: `<h2>Your Event is Live!</h2>` });
  } catch(e) {}
  res.json({ message: 'Approved' });
});

// 10. REVOKE EVENT
const revokeEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  event.isApproved = false;
  event.status = 'pending';
  await event.save(); 
  res.json({ message: 'Revoked' });
});

// 11. DELETE EVENT
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) { res.status(404); throw new Error('Event not found'); }
  await event.deleteOne(); 
  res.json({ message: 'Deleted' });
});

// 12. ADMIN GET ALL
const getAllEventsForAdmin = asyncHandler(async (req, res) => {
  const events = await Event.find().populate('user', 'name email').sort({ createdAt: -1 });
  res.json(events);
});

module.exports = {
  createEvent, getEvents, getTrendingEvents, getEventById, sponsorEvent,
  verifyPayment, requestRefund, processRefund, rejectSponsorship,
  approveEvent, revokeEvent, deleteEvent, getAllEventsForAdmin
};