const { query, insert, executeTransaction } = require('../config/database');
const { cache } = require('../config/redis');
const { BID_STATUS, NOTIFICATION_TYPES, WS_EVENTS } = require('../config/constants');

/**
 * Place a bid on an auction - WITH TRANSACTION & LOCKING
 */
exports.placeBid = async (req, res, next) => {
    try {
        const { auction_id, bid_amount, max_bid_amount } = req.body;
        const bidder_id = req.user.userId;
        const ip_address = req.ip;
        const user_agent = req.headers['user-agent'];

        const result = await executeTransaction(async (connection) => {
            // Lock auction row - CRITICAL FOR RACE CONDITION PREVENTION
            const [auctions] = await connection.execute(
                `SELECT a.*, u.username as seller_username
         FROM auctions a
         JOIN users u ON a.seller_id = u.user_id
         WHERE a.auction_id = ?
         FOR UPDATE`,
                [auction_id]
            );

            if (auctions.length === 0) {
                throw new Error('Auction not found');
            }

            const auction = auctions[0];

            // Validation checks
            if (auction.status !== 'active') {
                throw new Error('Auction is not active');
            }

            if (new Date() > new Date(auction.end_time)) {
                throw new Error('Auction has ended');
            }

            if (auction.seller_id === bidder_id) {
                throw new Error('Cannot bid on your own auction');
            }

            // Calculate minimum required bid
            const currentPrice = parseFloat(auction.current_bid || auction.starting_price);
            const bidIncrement = parseFloat(auction.bid_increment);
            const minBid = auction.current_bid ? currentPrice + bidIncrement : auction.starting_price;

            if (parseFloat(bid_amount) < minBid) {
                throw new Error(`Minimum bid is $${minBid.toFixed(2)}`);
            }

            // Check if user is already winning
            const [currentWinningBid] = await connection.execute(
                'SELECT bidder_id FROM bids WHERE auction_id = ? AND is_winning_bid = TRUE',
                [auction_id]
            );

            if (currentWinningBid.length > 0 && currentWinningBid[0].bidder_id === bidder_id) {
                throw new Error('You are already the highest bidder');
            }

            // Insert new bid
            const [bidResult] = await connection.execute(
                `INSERT INTO bids (auction_id, bidder_id, bid_amount, max_bid_amount, 
                          is_proxy_bid, ip_address, user_agent, is_winning_bid, bid_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, 'active')`,
                [auction_id, bidder_id, bid_amount, max_bid_amount || bid_amount,
                    max_bid_amount ? 1 : 0, ip_address, user_agent]
            );

            const bid_id = bidResult.insertId;

            // Mark previous winning bid as outbid
            await connection.execute(
                `UPDATE bids SET is_winning_bid = FALSE, bid_status = 'outbid'
         WHERE auction_id = ? AND bid_id != ? AND is_winning_bid = TRUE`,
                [auction_id, bid_id]
            );

            // Update auction
            await connection.execute(
                `UPDATE auctions SET current_bid = ?, bid_count = bid_count + 1 WHERE auction_id = ?`,
                [bid_amount, auction_id]
            );

            // Auto-extend if bid in final minutes
            if (auction.auto_extend) {
                const timeRemaining = new Date(auction.end_time) - new Date();
                const triggerTime = auction.auto_extend_trigger * 1000;

                if (timeRemaining < triggerTime && timeRemaining > 0) {
                    await connection.execute(
                        'UPDATE auctions SET end_time = DATE_ADD(end_time, INTERVAL ? SECOND) WHERE auction_id = ?',
                        [auction.auto_extend_duration, auction_id]
                    );
                }
            }

            // Update user bid count
            await connection.execute(
                'UPDATE users SET total_bids = total_bids + 1 WHERE user_id = ?',
                [bidder_id]
            );

            return {
                bid_id,
                bid_amount,
                auction_id,
                previous_bidder_id: currentWinningBid[0]?.bidder_id,
                new_bid_count: auction.bid_count + 1
            };
        });

        // Invalidate cache
        await cache.del(`auction:${auction_id}`);

        // Create notification for outbid user
        if (result.previous_bidder_id && result.previous_bidder_id !== bidder_id) {
            await insert(
                `INSERT INTO notifications (user_id, notification_type, title, message, link)
         VALUES (?, ?, ?, ?, ?)`,
                [
                    result.previous_bidder_id,
                    NOTIFICATION_TYPES.OUTBID,
                    "You've been outbid!",
                    `Someone outbid you on auction #${auction_id}`,
                    `/auction/${auction_id}`
                ]
            );
        }

        // Emit WebSocket event (to be implemented)
        const io = req.app.get('io');
        if (io) {
            io.to(`auction:${auction_id}`).emit(WS_EVENTS.BID_UPDATE, {
                auction_id,
                current_bid: bid_amount,
                bid_count: result.new_bid_count,
                bidder_username: req.user.username
            });
        }

        res.json({
            success: true,
            message: 'Bid placed successfully',
            data: {
                bid_id: result.bid_id,
                bid_amount,
                is_winning: true
            }
        });

    } catch (error) {
        if (error.message.includes('Duplicate entry')) {
            return res.status(409).json({
                success: false,
                message: 'This bid amount has already been placed. Please bid higher.'
            });
        }
        if (error.message.includes('minimum') || error.message.includes('already') ||
            error.message.includes('Cannot') || error.message.includes('not active') ||
            error.message.includes('ended')) {
            return res.status(400).json({ success: false, message: error.message });
        }
        next(error);
    }
};

/**
 * Get bid history for an auction
 */
exports.getBidHistory = async (req, res, next) => {
    try {
        const { auctionId } = req.params;
        const { limit = 50, page = 1 } = req.query;
        const offset = (page - 1) * limit;

        const bids = await query(
            `SELECT b.bid_id, b.bid_amount, b.bid_time, b.is_winning_bid,
              CONCAT(LEFT(u.username, 2), '***', RIGHT(u.username, 1)) as bidder_username
       FROM bids b
       JOIN users u ON b.bidder_id = u.user_id
       WHERE b.auction_id = ?
       ORDER BY b.bid_time DESC
       LIMIT ? OFFSET ?`,
            [auctionId, parseInt(limit), offset]
        );

        res.json({ success: true, data: bids });

    } catch (error) {
        next(error);
    }
};

/**
 * Get user's bids
 */
exports.getUserBids = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { status, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        let statusCondition = '';
        if (status === 'winning') statusCondition = 'AND b.is_winning_bid = TRUE';
        else if (status === 'outbid') statusCondition = 'AND b.is_winning_bid = FALSE AND a.status = "active"';
        else if (status === 'won') statusCondition = 'AND b.bid_status = "won"';
        else if (status === 'lost') statusCondition = 'AND b.bid_status = "lost"';

        const bids = await query(
            `SELECT a.auction_id, a.title, a.current_bid, a.end_time, a.status,
              b.bid_id, b.bid_amount, b.max_bid_amount, b.is_winning_bid, b.bid_time, b.bid_status,
              ai.image_url as thumbnail
       FROM bids b
       JOIN auctions a ON b.auction_id = a.auction_id
       LEFT JOIN auction_images ai ON a.auction_id = ai.auction_id AND ai.is_primary = TRUE
       WHERE b.bidder_id = ? ${statusCondition}
       GROUP BY a.auction_id
       ORDER BY b.bid_time DESC
       LIMIT ? OFFSET ?`,
            [userId, parseInt(limit), offset]
        );

        res.json({ success: true, data: bids });

    } catch (error) {
        next(error);
    }
};
