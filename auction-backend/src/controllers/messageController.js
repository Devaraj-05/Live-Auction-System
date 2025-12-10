const { query, insert } = require('../config/database');
const { WS_EVENTS } = require('../config/constants');

/**
 * Get user's conversations
 */
exports.getConversations = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        // Get distinct conversations
        const conversations = await query(
            `SELECT 
        m.conversation_id,
        CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END as other_user_id,
        u.username as other_username,
        u.profile_image as other_user_image,
        a.auction_id,
        a.title as auction_title,
        (SELECT message_text FROM messages WHERE conversation_id = m.conversation_id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM messages WHERE conversation_id = m.conversation_id ORDER BY created_at DESC LIMIT 1) as last_message_time,
        (SELECT COUNT(*) FROM messages WHERE conversation_id = m.conversation_id AND receiver_id = ? AND is_read = FALSE) as unread_count
       FROM messages m
       JOIN users u ON (CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END) = u.user_id
       LEFT JOIN auctions a ON m.auction_id = a.auction_id
       WHERE (m.sender_id = ? OR m.receiver_id = ?)
         AND NOT (m.sender_id = ? AND is_deleted_sender = TRUE)
         AND NOT (m.receiver_id = ? AND is_deleted_receiver = TRUE)
       GROUP BY m.conversation_id
       ORDER BY last_message_time DESC
       LIMIT ? OFFSET ?`,
            [userId, userId, userId, userId, userId, userId, userId, parseInt(limit), offset]
        );

        res.json({ success: true, data: conversations });

    } catch (error) {
        next(error);
    }
};

/**
 * Get messages in a conversation
 */
exports.getMessages = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { conversationId } = req.params;
        const { page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;

        const messages = await query(
            `SELECT m.message_id, m.sender_id, m.receiver_id, m.message_text, 
              m.is_read, m.created_at,
              u.username as sender_username, u.profile_image as sender_image
       FROM messages m
       JOIN users u ON m.sender_id = u.user_id
       WHERE m.conversation_id = ?
         AND ((m.sender_id = ? AND is_deleted_sender = FALSE) OR (m.receiver_id = ? AND is_deleted_receiver = FALSE))
       ORDER BY m.created_at ASC
       LIMIT ? OFFSET ?`,
            [conversationId, userId, userId, parseInt(limit), offset]
        );

        // Mark as read
        await query(
            'UPDATE messages SET is_read = TRUE, read_at = NOW() WHERE conversation_id = ? AND receiver_id = ? AND is_read = FALSE',
            [conversationId, userId]
        );

        res.json({ success: true, data: messages });

    } catch (error) {
        next(error);
    }
};

/**
 * Send a message
 */
exports.sendMessage = async (req, res, next) => {
    try {
        const senderId = req.user.userId;
        const { receiver_id, message_text, auction_id } = req.body;

        if (senderId === receiver_id) {
            return res.status(400).json({ success: false, message: 'Cannot message yourself' });
        }

        // Check if receiver exists
        const receivers = await query('SELECT user_id FROM users WHERE user_id = ? AND account_status = "active"', [receiver_id]);
        if (receivers.length === 0) {
            return res.status(404).json({ success: false, message: 'Recipient not found' });
        }

        // Get or create conversation ID
        const existingConv = await query(
            `SELECT conversation_id FROM messages 
       WHERE ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))
       AND (auction_id = ? OR (? IS NULL AND auction_id IS NULL))
       LIMIT 1`,
            [senderId, receiver_id, receiver_id, senderId, auction_id, auction_id]
        );

        const conversationId = existingConv.length > 0
            ? existingConv[0].conversation_id
            : Date.now(); // Simple unique ID

        // Insert message
        const result = await insert(
            `INSERT INTO messages (conversation_id, sender_id, receiver_id, auction_id, message_text)
       VALUES (?, ?, ?, ?, ?)`,
            [conversationId, senderId, receiver_id, auction_id || null, message_text]
        );

        const messageId = result.insertId;

        // Create notification for receiver
        await insert(
            `INSERT INTO notifications (user_id, notification_type, title, message, link)
       VALUES (?, 'message_received', ?, ?, ?)`,
            [receiver_id, 'New message', `Message from ${req.user.username}`, `/messages/${conversationId}`]
        );

        // Emit WebSocket event
        const io = req.app.get('io');
        if (io) {
            io.to(`user:${receiver_id}`).emit(WS_EVENTS.MESSAGE, {
                message_id: messageId,
                conversation_id: conversationId,
                sender_id: senderId,
                sender_username: req.user.username,
                message_text,
                created_at: new Date()
            });
        }

        res.status(201).json({
            success: true,
            message: 'Message sent',
            data: { message_id: messageId, conversation_id: conversationId }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Delete conversation (soft delete)
 */
exports.deleteConversation = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { conversationId } = req.params;

        // Mark messages as deleted for this user
        await query(
            `UPDATE messages
       SET is_deleted_sender = CASE WHEN sender_id = ? THEN TRUE ELSE is_deleted_sender END,
           is_deleted_receiver = CASE WHEN receiver_id = ? THEN TRUE ELSE is_deleted_receiver END
       WHERE conversation_id = ?`,
            [userId, userId, conversationId]
        );

        res.json({ success: true, message: 'Conversation deleted' });

    } catch (error) {
        next(error);
    }
};

/**
 * Get unread message count
 */
exports.getUnreadCount = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        const [{ unread_count }] = await query(
            'SELECT COUNT(*) as unread_count FROM messages WHERE receiver_id = ? AND is_read = FALSE AND is_deleted_receiver = FALSE',
            [userId]
        );

        res.json({ success: true, data: { unread_count } });

    } catch (error) {
        next(error);
    }
};
