const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Event = require('../models/campusEvent');

router.get('/dashboard', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    let stats = {};

    if (req.user.role === 'sponsor') {
      // --- SPONSOR DATA ---
      const events = await Event.find({ 
        "sponsors": { $elemMatch: { sponsorId: userId, status: 'verified' } } 
      });

      const totalSpent = events.reduce((acc, event) => {
        const mySponsorship = event.sponsors.find(s => s.sponsorId.toString() === userId.toString() && s.status === 'verified');
        return acc + (mySponsorship ? mySponsorship.amount : 0);
      }, 0);

      const totalReach = events.reduce((acc, event) => acc + (event.views || 0), 0);

      const graphData = events.map(event => {
        const mySponsorship = event.sponsors.find(s => s.sponsorId.toString() === userId.toString());
        return {
            name: event.title.substring(0, 10) + '...',
            amount: mySponsorship.amount,
            views: event.views || 0
        };
      });

      stats = { totalEvents: events.length, totalSpent, totalReach, graphData };

    } else {
      // --- STUDENT DATA ---
      const events = await Event.find({ user: userId });
      const totalRaised = events.reduce((acc, curr) => acc + (curr.raisedAmount || 0), 0);
      const totalViews = events.reduce((acc, curr) => acc + (curr.views || 0), 0);
      
      const graphData = events.map(e => ({
          name: e.title.substring(0, 10) + '...',
          raised: e.raisedAmount,
          views: e.views || 0
      }));

      stats = { totalEvents: events.length, totalRaised, totalViews, graphData };
    }

    res.json(stats);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;