const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { generateProposal } = require('../controllers/aiController');

router.post('/generate', protect, generateProposal);

module.exports = router;