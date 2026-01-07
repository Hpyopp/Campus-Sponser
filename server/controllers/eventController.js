const Event = require('../models/campusEvent');
const asyncHandler = require('express-async-handler');
const sendEmail = require('../utils/sendEmail');

// 1. CREATE EVENT
const createEvent = asyncHandler(async (req, res) => {
  const { title, description, date, location, budget } = req.body;
  if (!title || !description || !date || !location || !budget) {
    res.status(400); throw new Error('Please fill all fields');
  }

  // Cloudinary File Check
  if (!req.file) {
    res.status(400); throw new Error('Please upload permission letter');
  }
  const permissionLetter = req.file.path || req.file.url;

  const event = await Event.create({
    user: req.user._id,
    title, description, date, location, budget,
    permissionLetter, 
    sponsors: [], 
    status: 'pending',
    raisedAmount: 0,
    views: 0
  });

  res.status(201).json(event);
});

// 2. GET ALL APPROVED EVENTS (Public)
const getEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ isApproved: true }).populate('user', 'name email').sort({ createdAt: -1 });
  res.json(events);
});

// 3. GET SINGLE EVENT (Updated with Views)
const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate('user', 'name email');
  
  if (event) {
    // 👇 Views Count Logic
    event.views = (event.views || 0) + 1;
    await event.save();
    
    res.json(event);
  } else { 
    res.status(404); throw new Error('Event not found'); 
  }
});

// 4. SPONSOR EVENT (Pledge)
const sponsorEvent = asyncHandler(async (req, res) => {
  const { amount, comment } = req.body;
  const event = await Event.findById(req.params.id);
  if (event) {
    event.sponsors.push({
      sponsorId: req.user._id, 
      name: req.user.name, 
      email: req.user.email,
      companyName: req.user.companyName, 
      amount: Number(amount),
      comment, 
      status: 'pending'
    });
    await event.save();
    res.status(201).json({ message: 'Pledged Successfully' });
  } else { res.status(404); throw new Error('Event not found'); }
});

// 5. VERIFY PAYMENT (Admin Action)
const verifyPayment = asyncHandler(async (req, res) => {
  const { sponsorId } = req.body;
  const event = await Event.findById(req.params.id);
  
  if (!event) { res.status(404); throw new Error('Event not found'); }

  const sponsor = event.sponsors.find(s => s.sponsorId.toString() === sponsorId);
  
  if (sponsor) {
    sponsor.status = 'verified'; 
    event.raisedAmount = event.sponsors
      .filter(s => s.status === 'verified')
      .reduce((acc, curr) => acc + curr.amount, 0);

    if (event.raisedAmount >= event.budget) {
        event.status = 'completed';
    }

    await event.save();
    res.json({ message: 'Payment Verified', status: 'verified' });
  } else { res.status(404); throw new Error('Sponsor not found'); }
});

// 6. REQUEST REFUND (User)
const requestRefund = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  const sponsor = event.sponsors.find(s => s.sponsorId.toString() === req.user._id.toString());
  if (sponsor) {
    sponsor.status = 'refund_requested';
    await event.save();
    res.json({ message: 'Refund Requested' });
  } else { res.status(404); throw new Error('Not found'); }
});

// 7. PROCESS REFUND (Admin)
const processRefund = asyncHandler(async (req, res) => {
    const { sponsorId } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) { res.status(404); throw new Error('Event not found'); }

    const sponsorDetails = event.sponsors.find(s => s.sponsorId.toString() === sponsorId);
    event.sponsors = event.sponsors.filter(s => s.sponsorId.toString() !== sponsorId);
    event.raisedAmount = event.sponsors
      .filter(s => s.status === 'verified')
      .reduce((acc, curr) => acc + curr.amount, 0);
      
    if (event.raisedAmount < event.budget && event.status === 'completed') {
        event.status = 'funding';
    }

    await event.save();

    if (sponsorDetails) {
        try {
            await sendEmail({
                email: sponsorDetails.email,
                subject: 'Refund Processed - CampusSponsor',
                html: `<p>Refund of ₹${sponsorDetails.amount} for <b>${event.title}</b> has been processed.</p>`
            });
        } catch (e) { console.error("Email failed"); }
    }

    res.json({ message: 'Refunded successfully' });
});

// 8. REJECT SPONSORSHIP OFFER
const rejectSponsorship = asyncHandler(async (req, res) => {
  const { sponsorId } = req.body;
  const event = await Event.findById(req.params.id);
  event.sponsors = event.sponsors.filter(s => s.sponsorId.toString() !== sponsorId);
  await event.save();
  res.json({ message: 'Offer Declined' });
});

// 9. APPROVE EVENT (Admin)
const approveEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) { res.status(404); throw new Error('Event not found'); }
  
  event.isApproved = true;
  event.status = 'funding';
  await event.save(); 
  
  try {
      const creator = await require('../models/User').findById(event.user);
      await sendEmail({
          email: creator.email,
          subject: 'Event Approved! 🚀',
          html: `<h2>Your Event is Live!</h2><p>${event.title} is now visible to sponsors.</p>`
      });
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

// 12. ADMIN: GET ALL EVENTS
const getAllEventsForAdmin = asyncHandler(async (req, res) => {
  const events = await Event.find().populate('user', 'name email').sort({ createdAt: -1 });
  res.json(events);
});

module.exports = {
  createEvent, getEvents, getEventById, sponsorEvent,
  verifyPayment, requestRefund, processRefund, rejectSponsorship,
  approveEvent, revokeEvent, deleteEvent, 
  getAllEventsForAdmin
};