const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const Event = require('../models/campusEvent');

// 1. GET ALL EVENTS (Public)
router.get('/', async (req, res) => {
  try {
    // Sirf Approved events dikhao public ko
    const events = await Event.find({ isApproved: true }).populate('user', 'name email');
    res.json(events);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// 2. GET ADMIN EVENTS (Protected)
router.get('/admin/all', protect, admin, async (req, res) => {
  try {
    const events = await Event.find({}).populate('user', 'name email');
    res.json(events);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// 3. GET SINGLE EVENT
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('user', 'name email');
    if (event) res.json(event);
    else res.status(404).json({ message: 'Event not found' });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// 4. SPONSOR REQUEST REFUND (New Route) 🆕
router.put('/:id/refund-request', protect, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: "Event not found" });

        const sponsor = event.sponsors.find(s => s.sponsorId.toString() === req.user._id.toString());
        
        if (!sponsor) return res.status(404).json({ message: "Sponsorship not found" });
        if (sponsor.status === 'refunded') return res.status(400).json({ message: "Already Refunded" });

        sponsor.status = 'refund_requested';
        await event.save();
        
        res.json({ message: "Refund Requested Successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 5. ADMIN PROCESS REFUND (New Route) 🆕
router.put('/:id/process-refund', protect, admin, async (req, res) => {
    try {
        const { sponsorId } = req.body;
        const event = await Event.findById(req.params.id);
        
        const sponsor = event.sponsors.find(s => s.sponsorId.toString() === sponsorId);
        if (!sponsor) return res.status(404).json({ message: "Sponsor not found" });

        // Amount wapas minus karo
        event.raisedAmount -= sponsor.amount;
        sponsor.status = 'refunded'; // Mark as refunded

        await event.save();
        res.json({ message: "Refund Processed & Sponsor Removed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 6. APPROVE EVENT (Admin)
router.put('/:id/approve', protect, admin, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if(event) {
            event.isApproved = true;
            await event.save();
            res.json(event);
        } else { res.status(404).json({ message: "Event Not Found" }); }
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// 7. CREATE EVENT
router.post('/', protect, async (req, res) => {
    const { title, date, location, description, budget, permissionLetter } = req.body;
    try {
        const event = new Event({
            user: req.user._id,
            title, date, location, description, budget, permissionLetter
        });
        const createdEvent = await event.save();
        res.status(201).json(createdEvent);
    } catch (error) { res.status(500).json({ message: 'Creation Failed' }); }
});

module.exports = router;