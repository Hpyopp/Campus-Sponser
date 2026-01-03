const Event = require('../models/Event'); // ⚠️ Ensure file name is 'Event.js' in models folder
const asyncHandler = require('express-async-handler');

// 1. GET ALL EVENTS (Isime Error aa raha tha)
const getEvents = asyncHandler(async (req, res) => {
  try {
    console.log("📡 Request: Fetching all events...");
    
    // Check if Event model works
    if (!Event) {
      throw new Error("Event Model is not loaded check file name '../models/Event'");
    }

    const events = await Event.find().populate('organizer', 'name email');
    
    console.log(`✅ Success: Found ${events.length} events`);
    res.json(events);

  } catch (error) {
    console.error("❌ ERROR in getEvents:", error.message);
    res.status(500).json({ 
        message: "Server Error: Could not fetch events", 
        error: error.message 
    });
  }
});

// 2. GET SINGLE EVENT
const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate('organizer', 'name email');
  if (event) { res.json(event); } 
  else { res.status(404); throw new Error('Event not found'); }
});

// 3. CREATE EVENT
const createEvent = asyncHandler(async (req, res) => {
  const { title, description, date, venue, requiredAmount, category } = req.body;
  if (!title || !description || !date || !venue || !requiredAmount) { res.status(400); throw new Error('Fill all fields'); }

  let permissionLetter = "";
  if (req.file) { permissionLetter = req.file.path || req.file.url; }

  const event = await Event.create({
    organizer: req.user.id,
    title, description, date, venue, requiredAmount, category,
    permissionLetter,
    status: 'pending', sponsors: []
  });
  res.status(201).json(event);
});

// 4. DELETE EVENT
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) { res.status(404); throw new Error('Not Found'); }
  await event.deleteOne();
  res.json({ message: 'Event Removed' });
});

// 5. SPONSOR EVENT
const sponsorEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (event) {
      event.sponsors.push({ sponsorId: req.user.id, amount: req.body.amount, status: 'pending' });
      await event.save();
      res.json({ message: 'Sponsorship Requested' });
  } else { res.status(404); throw new Error('Event not found'); }
});

// --- HELPER FUNCTIONS ---
const requestRefund = asyncHandler(async (req, res) => { res.json({message: 'Refund Requested'}); });
const approveRefund = asyncHandler(async (req, res) => { res.json({message: 'Refund Approved'}); });
const rejectRefund = asyncHandler(async (req, res) => { res.json({message: 'Refund Rejected'}); });
const approveEvent = asyncHandler(async (req, res) => { 
    const event = await Event.findById(req.params.id);
    if(event) { event.status = 'approved'; await event.save(); res.json({message: 'Event Approved'}); }
});
const revokeEvent = asyncHandler(async (req, res) => { res.json({message: 'Event Revoked'}); });
const verifySponsorship = asyncHandler(async (req, res) => { res.json({ message: "Verified" }); });
const rejectSponsorship = asyncHandler(async (req, res) => { res.json({ message: "Rejected" }); });

// 👇 CLEAN EXPORTS (Jaise User Controller mein kiya tha)
module.exports = {
  getEvents, getEventById, createEvent, deleteEvent,
  sponsorEvent, requestRefund, approveRefund, rejectRefund,
  approveEvent, revokeEvent, verifySponsorship, rejectSponsorship
};