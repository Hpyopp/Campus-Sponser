const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Message = require('../models/Message');
const User = require('../models/User');

// 👇 1. Get Unread Message Count (Ye Naya Hai)
router.get('/unread/count', protect, async (req, res) => {
  try {
    const count = await Message.countDocuments({ 
        receiver: req.user._id, 
        isRead: false 
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. Get All Conversations (Sidebar ke liye)
router.get('/conversations/all', protect, async (req, res) => {
  try {
    // Find all unique users communicated with
    const sent = await Message.find({ sender: req.user._id }).distinct('receiver');
    const received = await Message.find({ receiver: req.user._id }).distinct('sender');
    
    // Combine and unique IDs
    const userIds = [...new Set([...sent, ...received].map(id => id.toString()))];
    
    const users = await User.find({ _id: { $in: userIds } }).select('name role email');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. Get Chat History with specific user
router.get('/:id', protect, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.id },
        { sender: req.params.id, receiver: req.user._id },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;