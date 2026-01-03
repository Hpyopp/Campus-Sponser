// server/controllers/eventController.js

// 👇 Green Box: Developer Verification Log ✅
console.log("✅ Loaded: eventController (Developer Mode Active)");

const Event = require('../models/campusEvent'); 
const asyncHandler = require('express-async-handler');

// 1. GET ALL EVENTS
const getEvents = asyncHandler(async (req, res) => {
  try {
    console.log("📡 Developer Log: Fetching events...");

    // FIX 1: Schema mein 'user' hai, 'organizer' nahi
    const events = await Event.find().populate('user', 'name email');
    
    console.log(`✅ Developer Log: Found ${events.length} events`);
    res.json(events);

  } catch (error) {
    console.error("❌ Error in getEvents:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// 2. CREATE EVENT
const createEvent = asyncHandler(async (req, res) => {
  console.log("📝 Developer Log: Creating new event...");
  const { title, description, date, venue, requiredAmount, category, instagramLink, contactEmail } = req.body;

  // Validation
  if (!title || !description || !date || !venue || !requiredAmount || !contactEmail) {
      res.status(400); throw new Error('Fill all required fields'); 
  }

  let permissionLetter = "";
  if (req.file) { permissionLetter = req.file.path || req.file.url; }

  // 👇 MAIN FIX: Mapping Frontend Data -> Backend Schema
  const event = await Event.create({
    user: req.user.id,         // Schema: user | Controller: organizer (Fixed)
    title,
    description,
    date,
    location: venue,           // Schema: location | Controller: venue (Fixed)
    budget: requiredAmount,    // Schema: budget | Controller: requiredAmount (Fixed)
    contactEmail,
    instagramLink: instagramLink || "",
    category,
    permissionLetter,
    isApproved: false,         // Schema: isApproved (Boolean) | Controller: status (Fixed)
    sponsors: []
  });

  console.log("✅ Developer Log: Event Created Successfully");
  res.status(201).json(event);
});

// 3. GET SINGLE EVENT
const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate('user', 'name email');
  if (event) { res.json(event); } 
  else { res.status(404); throw new Error('Event not found'); }
});

// 4. DELETE EVENT
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) { res.status(404); throw new Error('Not Found'); }
  await event.deleteOne();
  console.log("🗑️ Developer Log: Event Deleted");
  res.json({ message: 'Event Removed' });
});

// 5. SPONSOR EVENT
const sponsorEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (event) {
      event.sponsors.push({ 
          sponsorId: req.user.id, 
          amount: req.body.amount, 
          name: req.user.name,
          email: req.user.email,
          status: 'confirmed' 
      });
      await event.save();
      console.log("💰 Developer Log: Sponsorship Added");
      res.json({ message: 'Sponsorship Added' });
  } else { res.status(404); throw new Error('Event not found'); }
});

// 6. ADMIN APPROVE
const approveEvent = asyncHandler(async (req, res) => { 
    const event = await Event.findById(req.params.id);
    if(event) { 
        event.isApproved = true; 
        await event.save(); 
        console.log("✅ Developer Log: Event Approved");
        res.json({message: 'Event Approved'}); 
    } else {
        res.status(404).json({message: 'Not found'});
    }
});

// 7. REVOKE EVENT
const revokeEvent = asyncHandler(async (req, res) => { 
    const event = await Event.findById(req.params.id);
    if(event) { 
        event.isApproved = false; 
        await event.save(); 
        console.log("🚫 Developer Log: Event Revoked");
        res.json({message: 'Event Revoked'}); 
    } 
});

// Helpers
const requestRefund = asyncHandler(async (req, res) => { res.json({ message: 'Refund Requested' }); });
const approveRefund = asyncHandler(async (req, res) => { res.json({ message: 'Refund Approved' }); });
const rejectRefund = asyncHandler(async (req, res) => { res.json({ message: 'Refund Rejected' }); });
const verifySponsorship = asyncHandler(async (req, res) => { res.json({ message: "Verified" }); });
const rejectSponsorship = asyncHandler(async (req, res) => { res.json({ message: "Rejected" }); });

module.exports = {
  getEvents, getEventById, createEvent, deleteEvent,
  sponsorEvent, requestRefund, approveRefund, rejectRefund,
  approveEvent, revokeEvent, verifySponsorship, rejectSponsorship
};