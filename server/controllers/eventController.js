const Event = require('../models/campusEvent'); 
const asyncHandler = require('express-async-handler');
const sendEmail = require('../utils/sendEmail'); // 👈 Import Added

// 1. CREATE EVENT
const createEvent = asyncHandler(async (req, res) => {
  const { title, description, date, location, budget } = req.body;
  if (!title || !description || !date || !location || !budget) {
    res.status(400); throw new Error('Please fill all fields');
  }
  let permissionLetter = req.file ? (req.file.path || req.file.url) : "";
  const event = await Event.create({
    user: req.user.id, title, description, date, location, budget,
    permissionLetter, sponsors: []
  });
  res.status(201).json(event);
});

// 2. GET ALL APPROVED EVENTS (Public)
const getEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ isApproved: true }).populate('user', 'name email').sort({ createdAt: -1 });
  res.json(events);
});

// 3. GET SINGLE EVENT
const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate('user', 'name email');
  if (event) res.json(event);
  else { res.status(404); throw new Error('Event not found'); }
});

// 4. SPONSOR EVENT
const sponsorEvent = asyncHandler(async (req, res) => {
  const { amount, comment } = req.body;
  const event = await Event.findById(req.params.id);
  if (event) {
    event.sponsors.push({
      sponsorId: req.user.id, name: req.user.name, email: req.user.email,
      companyName: req.user.companyName, amount: Number(amount),
      comment, status: 'pending'
    });
    await event.save();
    res.status(201).json({ message: 'Pledged' });
  } else { res.status(404); throw new Error('Event not found'); }
});

// 5. VERIFY PAYMENT
const verifyPayment = asyncHandler(async (req, res) => {
  const { sponsorId } = req.body;
  const event = await Event.findById(req.params.id);
  const sponsor = event.sponsors.find(s => s.sponsorId.toString() === sponsorId);
  if (sponsor) {
    sponsor.status = 'verified';
    event.raisedAmount = event.sponsors.filter(s => s.status === 'verified').reduce((acc, curr) => acc + curr.amount, 0);
    await event.save();
    res.json({ message: 'Verified' });
  } else { res.status(404); throw new Error('Sponsor not found'); }
});

// 6. REQUEST REFUND
const requestRefund = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  const sponsor = event.sponsors.find(s => s.sponsorId.toString() === req.user.id.toString());
  if (sponsor) {
    sponsor.status = 'refund_requested';
    await event.save();
    res.json({ message: 'Requested' });
  } else { res.status(404); throw new Error('Not found'); }
});

// 7. PROCESS REFUND (Updated with Email)
const processRefund = asyncHandler(async (req, res) => {
    const { sponsorId } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) { res.status(404); throw new Error('Event not found'); }

    // Email Data Nikalo
    const sponsorDetails = event.sponsors.find(s => s.sponsorId.toString() === sponsorId);
    
    // Delete Sponsor
    event.sponsors = event.sponsors.filter(s => s.sponsorId.toString() !== sponsorId);
    event.raisedAmount = event.sponsors.filter(s => s.status === 'verified').reduce((acc, curr) => acc + curr.amount, 0);
    await event.save();

    // 👇 Send Email
    if (sponsorDetails) {
        const emailContent = `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #dc2626; border-radius: 10px; background-color: #fef2f2;">
                <h2 style="color: #dc2626;">💰 Refund Processed</h2>
                <p>Hello <strong>${sponsorDetails.name}</strong>,</p>
                <p>Your refund request for the event <strong>"${event.title}"</strong> has been processed.</p>
                <p><strong>Amount Refunded:</strong> ₹${sponsorDetails.amount}</p>
                <p style="font-size: 12px; color: #666;">CampusSponsor Admin Team</p>
            </div>
        `;
        // Background me email bhejo (await mat karo agar fast response chahiye)
        sendEmail({
            email: sponsorDetails.email,
            subject: 'Refund Processed - CampusSponsor',
            html: emailContent
        });
    }

    res.json({ message: 'Refunded' });
});

// 8. REJECT OFFER
const rejectSponsorship = asyncHandler(async (req, res) => {
  const { sponsorId } = req.body;
  const event = await Event.findById(req.params.id);
  event.sponsors = event.sponsors.filter(s => s.sponsorId.toString() !== sponsorId);
  await event.save();
  res.json({ message: 'Declined' });
});

// 9. ADMIN ACTIONS
const approveEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  event.isApproved = true; await event.save(); res.json({ message: 'Approved' });
});
const revokeEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  event.isApproved = false; await event.save(); res.json({ message: 'Revoked' });
});
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  await event.deleteOne(); res.json({ message: 'Deleted' });
});

// 10. ADMIN: Get All Events
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