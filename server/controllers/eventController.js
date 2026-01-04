const Event = require('../models/campusEvent'); 
const asyncHandler = require('express-async-handler');
const path = require('path');

// ... (Upar ke createEvent, getEvents, getEventById, sponsorEvent same rahenge) ...

// 5. VERIFY PAYMENT (UPDATED: Refund request ke baad bhi verify kar sakein)
const verifyPayment = asyncHandler(async (req, res) => {
  const { sponsorId } = req.body;
  const event = await Event.findById(req.params.id);
  if (!event) { res.status(404); throw new Error('Event not found'); }
  if (event.user.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(401); throw new Error('Not authorized to verify');
  }
  const sponsor = event.sponsors.find(s => s.sponsorId.toString() === sponsorId);
  if (sponsor) {
    sponsor.status = 'verified';
    event.raisedAmount = event.sponsors.filter(s => s.status === 'verified').reduce((acc, curr) => acc + curr.amount, 0);
    await event.save();
    res.json({ message: 'Payment Verified Successfully' });
  } else { res.status(404); throw new Error('Sponsor not found'); }
});

// 👇 NAYA: 6. REQUEST REFUND (Sponsor ke liye)
const requestRefund = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) { res.status(404); throw new Error('Event not found'); }
  const sponsor = event.sponsors.find(s => s.sponsorId.toString() === req.user.id.toString());
  if (sponsor) {
    sponsor.status = 'refund_requested';
    await event.save();
    res.json({ message: 'Refund Requested Successfully' });
  } else { res.status(404); throw new Error('Sponsorship record not found'); }
});

// 👇 NAYA: 7. PROCESS REFUND (Admin/Organizer ke liye - Sponsor hatane ke liye)
const processRefund = asyncHandler(async (req, res) => {
    const { sponsorId } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) { res.status(404); throw new Error('Event not found'); }
    // Check permission
    if (event.user.toString() !== req.user.id && req.user.role !== 'admin') {
        res.status(401); throw new Error('Not authorized');
    }
    // Remove sponsor and update amount
    event.sponsors = event.sponsors.filter(s => s.sponsorId.toString() !== sponsorId);
    event.raisedAmount = event.sponsors.filter(s => s.status === 'verified').reduce((acc, curr) => acc + curr.amount, 0);
    await event.save();
    res.json({ message: 'Refund Processed and Sponsor Removed' });
});

// ... (Baaki approveEvent, revokeEvent, deleteEvent same rahenge) ...

module.exports = {
  createEvent, getEvents, getEventById, sponsorEvent,
  verifyPayment, rejectSponsorship, requestRefund, processRefund, // 👈 Added
  approveEvent, revokeEvent, deleteEvent
};