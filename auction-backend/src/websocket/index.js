const jwt = require('jsonwebtoken');
const { WS_EVENTS } = require('../config/constants');

/**
 * Initialize WebSocket handlers
 * @param {Object} io - Socket.io server instance
 */
const initializeWebSocket = (io) => {
    // Authentication middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth.token || socket.handshake.query.token;

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-jwt-secret');
                socket.user = decoded;
            } catch (err) {
                // Continue without auth - some events are public
            }
        }
        next();
    });

    io.on('connection', (socket) => {
        console.log(`WebSocket connected: ${socket.id}${socket.user ? ` (User: ${socket.user.userId})` : ''}`);

        // Join user's personal room for notifications
        if (socket.user) {
            socket.join(`user:${socket.user.userId}`);
            console.log(`User ${socket.user.userId} joined personal room`);
        }

        // Join auction room for live updates
        socket.on('join_auction', (auctionId) => {
            socket.join(`auction:${auctionId}`);
            console.log(`${socket.id} joined auction:${auctionId}`);
        });

        // Leave auction room
        socket.on('leave_auction', (auctionId) => {
            socket.leave(`auction:${auctionId}`);
            console.log(`${socket.id} left auction:${auctionId}`);
        });

        // Handle real-time bid (for UI updates)
        socket.on('watching_auction', (auctionId) => {
            socket.join(`auction:${auctionId}`);
        });

        // Handle disconnect
        socket.on('disconnect', () => {
            console.log(`WebSocket disconnected: ${socket.id}`);
        });
    });

    console.log('✓ WebSocket handlers initialized');
};

/**
 * Broadcast bid update to auction room
 */
const broadcastBidUpdate = (io, auctionId, bidData) => {
    io.to(`auction:${auctionId}`).emit(WS_EVENTS.BID_UPDATE, {
        auction_id: auctionId,
        current_bid: bidData.bid_amount,
        bid_count: bidData.bid_count,
        bidder_username: bidData.bidder_username,
        timestamp: new Date()
    });
};

/**
 * Broadcast auction ended
 */
const broadcastAuctionEnded = (io, auctionId, winnerData) => {
    io.to(`auction:${auctionId}`).emit(WS_EVENTS.AUCTION_ENDED, {
        auction_id: auctionId,
        winner_id: winnerData.winner_id,
        winner_username: winnerData.winner_username,
        final_price: winnerData.final_price,
        timestamp: new Date()
    });
};

/**
 * Send notification to specific user
 */
const sendUserNotification = (io, userId, notification) => {
    io.to(`user:${userId}`).emit(WS_EVENTS.NOTIFICATION, notification);
};

/**
 * Send outbid notification
 */
const sendOutbidNotification = (io, userId, auctionId, newBid) => {
    io.to(`user:${userId}`).emit(WS_EVENTS.OUTBID, {
        auction_id: auctionId,
        new_bid: newBid,
        timestamp: new Date()
    });
};

module.exports = {
    initializeWebSocket,
    broadcastBidUpdate,
    broadcastAuctionEnded,
    sendUserNotification,
    sendOutbidNotification
};
