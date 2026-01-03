// server/controllers/eventController.js

// 👇 Ensure ye path sahi ho
const Event = require('../models/campusEvent'); 
const asyncHandler = require('express-async-handler');

// 1. GET ALL EVENTS
const getEvents = asyncHandler(async (req, res) => {
  try {
    console.log("📡 Fetching events...");

    // FIX 1: Schema mein field ka naam 'user' hai, 'organizer' nahi.
    // Humne 'organizer' hata ke 'user' kar diya.
    const events = await Event.find().populate('user', 'name email');
    
    console.log(`✅ Success: Found ${events.length} events`);
    res.json(events);

  } catch (error) {
    console.error("❌ ERROR IN GET EVENTS:", error.message);
    res.status(500).json({ 
        message: "Server Error Fetching Events", 
        error: error.message 
    });
  }
});

// 2. CREATE EVENT
const createEvent = asyncHandler(async (req, res) => {
  // Frontend se ye data aa raha hai
  const { title, description, date, venue, requiredAmount, category, instagramLink, contactEmail } = req.body;

  // Validation: Basic check
  if (!title || !description || !date || !venue || !requiredAmount || !contactEmail) {
      res.status(400); 
      throw new Error('Please fill all required fields'); 
  }

  let permissionLetter = "";
  if (req.file) { permissionLetter = req.file.path || req.file.url; }

  // FIX 2: Mapping Controller Data to Schema Fields
  const event = await Event.create({
    user: req.user.id,        // Schema: 'user' | Controller was: 'organizer'
    title,
    description,
    date,
    location: venue,          // Schema: 'location' | Controller was: 'venue'
    budget: requiredAmount,   // Schema: 'budget' | Controller was: 'requiredAmount'
    contactEmail,             // Schema requires this
    instagramLink: instagramLink || '',
    permissionLetter,
    isApproved: false,        // Schema uses 'isApproved', not 'status'
    sponsors: []
  });

  res.status(201).json(event);
});

// 3. GET SINGLE EVENT
const getEventById = asyncHandler(async (req, res) => {
  // FIX 3: Populate 'user' instead of 'organizer'
  const event = await Event.findById(req.params.id).populate('user', 'name email');
  if (event) { res.json(event); } 
  else { res.status(404); throw new Error('Event not found'); }
});

// ... BAAKI SAARE FUNCTIONS (Ensure IDs match) ...

const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) { res.status(404); throw new Error('Not Found'); }
  await event.deleteOne();
  res.json({ message: 'Event Removed' });
});

const sponsorEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (event) {
      // Schema ke hisaab se sponsor add karo
      event.sponsors.push({ 
          sponsorId: req.user.id, 
          amount: req.body.amount, 
          status: 'confirmed', // Default confirmed rakha hai schema mein
          name: req.user.name,
          email: req.user.email
      });
      await event.save();
      res.json({ message: 'Sponsorship Added' });
  } else { res.status(404); throw new Error('Event not found'); }
});

// Helpers
const requestRefund = asyncHandler(async (req, res) => { res.json({ message: 'Refund Requested' }); });
const approveRefund = asyncHandler(async (req, res) => { res.json({ message: 'Refund Approved' }); });
const rejectRefund = asyncHandler(async (req, res) => { res.json({ message: 'Refund Rejected' }); });

// FIX 4: Approve Logic Update (Schema uses isApproved boolean)
const approveEvent = asyncHandler(async (req, res) => { 
    const event = await Event.findById(req.params.id);
    if(event) { 
        event.isApproved = true; // Status string nahi, boolean hai
        await event.save(); 
        res.json({message: 'Event Approved'}); 
    } else {
        res.status(404).json({message: 'Not found'});
    }
});

const revokeEvent = asyncHandler(async (req, res) => { 
    const event = await Event.findById(req.params.id);
    if(event) { 
        event.isApproved = false; 
        await event.save(); 
        res.json({message: 'Event Revoked'}); 
    } 
});

const verifySponsorship = asyncHandler(async (req, res) => { res.json({ message: "Verified" }); });
const rejectSponsorship = asyncHandler(async (req, res) => { res.json({ message: "Rejected" }); });

module.exports = {
  getEvents, getEventById, createEvent, deleteEvent,
  sponsorEvent, requestRefund, approveRefund, rejectRefund,
  approveEvent, revokeEvent, verifySponsorship, rejectSponsorship
};