const express = require('express');
const router = express.Router();
const { getEvents, createEvent } = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');

// 👇 Multer Setup
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });

router.get('/', getEvents);

// 👇 'upload.single' add kiya taaki file pakad sake
router.post('/', protect, upload.single('image'), createEvent);

module.exports = router;