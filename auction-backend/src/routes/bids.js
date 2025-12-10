const express = require('express');
const router = express.Router();
const bidController = require('../controllers/bidController');
const { authenticate } = require('../middleware/auth');
const { bidLimiter } = require('../middleware/rateLimiter');
const { bidValidation, paginationValidation } = require('../middleware/validation');

// Get bid history (public)
router.get('/auction/:auctionId', paginationValidation, bidController.getBidHistory);

// Protected routes
router.post('/', authenticate, bidLimiter, bidValidation.place, bidController.placeBid);
router.get('/my-bids', authenticate, paginationValidation, bidController.getUserBids);

module.exports = router;
