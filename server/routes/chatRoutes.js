const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// 1. Get Chat History with a specific user
router.get('/:userId', protect, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id }
      ]
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 2. Get List of People I have chatted with (Sidebar)
router.get('/conversations/all', protect, async (req, res) => {
  try {
    // Find all messages where I am sender or receiver
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }]
    }).populate('sender', 'name role').populate('receiver', 'name role').sort({ createdAt: -1 });

    // Extract unique users
    const usersMap = new Map();
    messages.forEach(msg => {
      const otherUser = msg.sender._id.toString() === req.user._id.toString() ? msg.receiver : msg.sender;
      if (!usersMap.has(otherUser._id.toString())) {
        usersMap.set(otherUser._id.toString(), {
          _id: otherUser._id,
          name: otherUser.name,
          role: otherUser.role,
          lastMessage: msg.message,
          time: msg.createdAt
        });
      }
    });

    res.json(Array.from(usersMap.values()));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 3. Send Message (HTTP Backup for when Socket is flaky)
router.post('/', protect, async (req, res) => {
  const { receiverId, message } = req.body;
  try {
    const newMessage = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      message
    });
    res.json(newMessage);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;