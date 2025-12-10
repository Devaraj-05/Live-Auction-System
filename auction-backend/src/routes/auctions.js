const express = require('express');
const router = express.Router();
const auctionController = require('../controllers/auctionController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { auctionValidation, paginationValidation } = require('../middleware/validation');

// Public routes
router.get('/', paginationValidation, auctionController.listAuctions);
router.get('/categories', auctionController.getCategories);
router.get('/:id', optionalAuth, auctionController.getAuction);

// Protected routes
router.post('/', authenticate, auctionValidation.create, auctionController.createAuction);
router.put('/:id', authenticate, auctionValidation.update, auctionController.updateAuction);
router.delete('/:id', authenticate, auctionController.cancelAuction);

module.exports = router;
