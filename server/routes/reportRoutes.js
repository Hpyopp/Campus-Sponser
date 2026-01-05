const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const { protect } = require('../middleware/authMiddleware');

// 1. Submit a Report
router.post('/', protect, async (req, res) => {
  const { eventId, reason } = req.body;
  try {
    await Report.create({ event: eventId, reportedBy: req.user._id, reason });
    res.json({ message: "Report Submitted" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 2. Get All Reports (Admin Only)
router.get('/', protect, async (req, res) => {
    if(req.user.role !== 'admin') return res.status(401).json({message: "Not authorized"});
    try {
        const reports = await Report.find().populate('event', 'title').populate('reportedBy', 'name email');
        res.json(reports);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// 3. Resolve/Delete Report
router.delete('/:id', protect, async (req, res) => {
    if(req.user.role !== 'admin') return res.status(401).json({message: "Not authorized"});
    await Report.findByIdAndDelete(req.params.id);
    res.json({ message: "Report Resolved" });
});

module.exports = router;