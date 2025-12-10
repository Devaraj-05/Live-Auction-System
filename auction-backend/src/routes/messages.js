const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticate } = require('../middleware/auth');
const { messageValidation, paginationValidation } = require('../middleware/validation');

// All routes require authentication
router.use(authenticate);

router.get('/conversations', paginationValidation, messageController.getConversations);
router.get('/conversations/:conversationId', paginationValidation, messageController.getMessages);
router.delete('/conversations/:conversationId', messageController.deleteConversation);
router.post('/send', messageValidation.send, messageController.sendMessage);
router.get('/unread-count', messageController.getUnreadCount);

module.exports = router;
