const asyncHandler = require("express-async-handler");
const Message = require("../models/Message"); // Ensure Message model exists
const User = require("../models/User");

// 1. SEND MESSAGE
const sendMessage = asyncHandler(async (req, res) => {
  const { content, receiverId } = req.body;

  if (!content || !receiverId) {
    res.status(400);
    throw new Error("Invalid data passed");
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    receiver: receiverId,
    read: false
  };

  try {
    var message = await Message.create(newMessage);
    
    // Populate Sender & Receiver details
    message = await message.populate("sender", "name email imageUrl");
    message = await message.populate("receiver", "name email imageUrl");

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// 2. GET ALL MESSAGES (Between two users)
const allMessages = asyncHandler(async (req, res) => {
  try {
    const { otherUserId } = req.params;

    const messages = await Message.find({
        $or: [
            { sender: req.user._id, receiver: otherUserId },
            { sender: otherUserId, receiver: req.user._id }
        ]
    })
    .populate("sender", "name email imageUrl")
    .populate("receiver", "name email imageUrl")
    .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// 3. GET MY CONVERSATIONS (List of people I chatted with)
const getConversations = asyncHandler(async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [{ sender: req.user._id }, { receiver: req.user._id }]
        }).populate("sender", "name email imageUrl")
          .populate("receiver", "name email imageUrl")
          .sort({ createdAt: -1 });

        let users = [];
        let seen = new Set();

        messages.forEach(msg => {
            let otherUser = msg.sender._id.toString() === req.user._id.toString() 
                ? msg.receiver 
                : msg.sender;
            
            if(!seen.has(otherUser._id.toString())){
                seen.add(otherUser._id.toString());
                users.push({
                    user: otherUser,
                    lastMessage: msg.content,
                    date: msg.createdAt
                });
            }
        });

        res.json(users);

    } catch (error) {
        res.status(400); throw new Error(error.message);
    }
});

module.exports = { sendMessage, allMessages, getConversations };