const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { sendMessage, allMessages, getConversations } = require("../controllers/messageController");

const router = express.Router();

router.post("/", protect, sendMessage);
router.get("/conversations", protect, getConversations);
router.get("/:otherUserId", protect, allMessages);

module.exports = router;