const { query, insert } = require('../config/database');
const { NOTIFICATION_TYPES, WS_EVENTS } = require('../config/constants');

/**
 * Create a notification
 * @param {Object} options - Notification options
 */
const createNotification = async ({ user_id, type, title, message, link, io }) => {
    try {
        const result = await insert(
            `INSERT INTO notifications (user_id, notification_type, title, message, link)
       VALUES (?, ?, ?, ?, ?)`,
            [user_id, type, title, message, link || null]
        );

        const notification = {
            notification_id: result.insertId,
            notification_type: type,
            title,
            message,
            link,
            is_read: false,
            created_at: new Date()
        };

        // Emit via WebSocket if available
        if (io) {
            io.to(`user:${user_id}`).emit(WS_EVENTS.NOTIFICATION, notification);
        }

        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
};

/**
 * Create bid notification
 */
const notifyBidPlaced = async (userId, auctionTitle, bidAmount, auctionId, io) => {
    return createNotification({
        user_id: userId,
        type: NOTIFICATION_TYPES.BID_PLACED,
        title: 'Bid placed successfully',
        message: `Your bid of $${bidAmount.toFixed(2)} on ${auctionTitle} was placed`,
        link: `/auction/${auctionId}`,
        io
    });
};

/**
 * Create outbid notification
 */
const notifyOutbid = async (userId, auctionTitle, currentBid, auctionId, io) => {
    return createNotification({
        user_id: userId,
        type: NOTIFICATION_TYPES.OUTBID,
        title: "You've been outbid!",
        message: `Someone outbid you on ${auctionTitle}. New bid: $${currentBid.toFixed(2)}`,
        link: `/auction/${auctionId}`,
        io
    });
};

/**
 * Create auction won notification
 */
const notifyAuctionWon = async (userId, auctionTitle, winningBid, auctionId, io) => {
    return createNotification({
        user_id: userId,
        type: NOTIFICATION_TYPES.AUCTION_WON,
        title: 'Congratulations! You won the auction',
        message: `You won ${auctionTitle} with a bid of $${winningBid.toFixed(2)}`,
        link: `/auction/${auctionId}`,
        io
    });
};

/**
 * Create auction ending soon notification
 */
const notifyAuctionEnding = async (userId, auctionTitle, auctionId, io) => {
    return createNotification({
        user_id: userId,
        type: NOTIFICATION_TYPES.AUCTION_ENDING,
        title: 'Auction ending soon!',
        message: `${auctionTitle} ends in less than 1 hour`,
        link: `/auction/${auctionId}`,
        io
    });
};

/**
 * Create message received notification
 */
const notifyMessageReceived = async (userId, senderUsername, conversationId, io) => {
    return createNotification({
        user_id: userId,
        type: NOTIFICATION_TYPES.MESSAGE_RECEIVED,
        title: 'New message',
        message: `You have a new message from ${senderUsername}`,
        link: `/messages/${conversationId}`,
        io
    });
};

/**
 * Get user's unread notification count
 */
const getUnreadCount = async (userId) => {
    const [result] = await query(
        'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
        [userId]
    );
    return result.count;
};

module.exports = {
    createNotification,
    notifyBidPlaced,
    notifyOutbid,
    notifyAuctionWon,
    notifyAuctionEnding,
    notifyMessageReceived,
    getUnreadCount
};
