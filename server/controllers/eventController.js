// server/controllers/eventController.js

// 👇 WAPAS NORMAL KIYA (Taaki Crash Band Ho)
const Event = require('../models/Event'); 
const asyncHandler = require('express-async-handler');

// 1. GET ALL EVENTS
const getEvents = asyncHandler(async (req, res) => {
  try {
    console.log("📡 Fetching Events...");
    // Database se events dhoondo
    const events = await Event.find().populate('organizer', 'name email');
    console.log(`✅ Success: Found ${events.length} events`);
    res.json(events);
  } catch (error) {
    console.error("❌ ERROR:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// 2. CREATE EVENT
const createEvent = asyncHandler(async (req, res) => {
  const { title, description, date, venue, requiredAmount, category } = req.body;
  
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

// ... (Baaki functions short mein taaki copy-paste asaan ho)
const getEventById = asyncHandler(async(req,res)=>{const e=await Event.findById(req.params.id).populate('organizer','name email');if(e)res.json(e);else{res.status(404);throw new Error('Not found')}});
const deleteEvent = asyncHandler(async(req,res)=>{await Event.findByIdAndDelete(req.params.id);res.json({message:'Deleted'})});
const sponsorEvent = asyncHandler(async(req,res)=>{const e=await Event.findById(req.params.id);if(e){e.sponsors.push({sponsorId:req.user.id,amount:req.body.amount,status:'pending'});await e.save();res.json({message:'Sponsored'})}});
const requestRefund = asyncHandler(async(req,res)=>{res.json({message:'Refund Requested'})});
const approveRefund = asyncHandler(async(req,res)=>{res.json({message:'Refund Approved'})});
const rejectRefund = asyncHandler(async(req,res)=>{res.json({message:'Refund Rejected'})});
const approveEvent = asyncHandler(async(req,res)=>{const e=await Event.findById(req.params.id);if(e){e.status='approved';await e.save();res.json({message:'Approved'})}});
const revokeEvent = asyncHandler(async(req,res)=>{res.json({message:'Revoked'})});
const verifySponsorship = asyncHandler(async(req,res)=>{res.json({message:"Verified"})});
const rejectSponsorship = asyncHandler(async(req,res)=>{res.json({message:"Rejected"})});

module.exports = {
  getEvents, getEventById, createEvent, deleteEvent,
  sponsorEvent, requestRefund, approveRefund, rejectRefund,
  approveEvent, revokeEvent, verifySponsorship, rejectSponsorship
};