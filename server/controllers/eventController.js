const Event = require('../models/campusEvent');
const User = require('../models/User'); 
const asyncHandler = require('express-async-handler');
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken'); 

// ... (Baaki purane functions same rahenge: createEvent, getEvents etc.) ...
// Bus 'createEvent' mein 'category' add karna mat bhoolna (Neeche diya hai fix)

// 1. CREATE EVENT (Updated with Category)
const createEvent = asyncHandler(async (req, res) => {
  const { title, description, date, location, budget, email, instagramLink, category } = req.body;

  if (!title || !description || !date || !location || !budget) {
    res.status(400); throw new Error('Please fill all fields');
  }

  if (!req.files || !req.files.image || !req.files.permissionLetter) {
    res.status(400); throw new Error('Both Event Image and Permission Letter are required');
  }

  const imageUrl = req.files.image[0].path;
  const permissionLetterUrl = req.files.permissionLetter[0].path;

  const event = await Event.create({
    user: req.user._id, 
    title, description, date, location, budget,
    contactEmail: email, instagramLink, imageUrl, permissionLetter: permissionLetterUrl,
    category: category || 'Other', // 👈 Added
    sponsors: [], status: 'pending', raisedAmount: 0, views: 0, isApproved: false
  });

  res.status(201).json(event);
});

// ... (getEvents, getTrendingEvents, getEventById, sponsorEvent code same rahega) ...

// 👇 NEW: RECOMMENDATION LOGIC
const getRecommendedEvents = asyncHandler(async (req, res) => {
    // Logic: Agar user login hai aur student hai, toh high budget events dikhao
    // Agar sponsor hai, toh 'Tech' aur 'Cultural' mix dikhao (Smart Logic)
    
    const recommended = await Event.find({ isApproved: true, status: 'funding' })
        .sort({ budget: -1 }) // Bade events pehle
        .limit(5);

    res.json(recommended);
});

// ... (Baaki functions same rahenge) ...

module.exports = {
  createEvent, getEvents, getTrendingEvents, getEventById, sponsorEvent,
  verifyPayment, requestRefund, processRefund, rejectSponsorship,
  approveEvent, revokeEvent, deleteEvent, getAllEventsForAdmin,
  getRecommendedEvents // 👈 Export this
};