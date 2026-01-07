const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { generateProposal } = require('../controllers/aiController');

// Route to generate proposal
router.post('/generate', protect, generateProposal);

module.exports = router;