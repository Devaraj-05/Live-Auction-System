const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { paginationValidation } = require('../middleware/validation');

// Public routes
router.get('/:id', userController.getUser);

// Protected routes - Watchlist
router.get('/me/watchlist', authenticate, paginationValidation, userController.getWatchlist);
router.post('/me/watchlist', authenticate, userController.addToWatchlist);
router.delete('/me/watchlist/:auctionId', authenticate, userController.removeFromWatchlist);

// Protected routes - Notifications
router.get('/me/notifications', authenticate, paginationValidation, userController.getNotifications);
router.post('/me/notifications/read', authenticate, userController.markNotificationsRead);

// Dashboard
router.get('/me/dashboard', authenticate, userController.getDashboardStats);

module.exports = router;
