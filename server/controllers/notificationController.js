const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');

// 1. GET MY NOTIFICATIONS
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 }); // Newest first
  res.json(notifications);
});

// 2. MARK ALL AS READ
const markRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, isRead: false },
    { $set: { isRead: true } }
  );
  res.json({ message: 'All read' });
});

module.exports = { getNotifications, markRead };