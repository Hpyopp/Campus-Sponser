const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { 
    sendMessage, 
    allMessages, 
    getConversations,
    getUnreadCount,   // 👈 Imported
    markMessagesRead  // 👈 Imported
} = require("../controllers/messageController");

const router = express.Router();

router.post("/", protect, sendMessage);
router.get("/conversations", protect, getConversations);
router.get("/unread", protect, getUnreadCount); // 👈 New Route
router.put("/read", protect, markMessagesRead);   // 👈 New Route
router.get("/:otherUserId", protect, allMessages);

module.exports = router;