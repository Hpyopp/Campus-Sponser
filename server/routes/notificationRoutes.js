const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/authMiddleware');

// 1. Get All Notifications for logged-in user
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 2. Mark all as Read (Jab user bell icon dabaye)
router.put('/read', protect, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 3. (TEST ONLY) Create Fake Notification manually
router.post('/test', protect, async (req, res) => {
    await Notification.create({
        user: req.user._id,
        message: "🎉 Test Notification: System is working!",
        type: "success",
        link: "/profile"
    });
    res.json({ msg: "Sent!" });
});

module.exports = router;