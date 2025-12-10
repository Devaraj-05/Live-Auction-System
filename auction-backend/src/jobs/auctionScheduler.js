const cron = require('node-cron');
const { query, insert, executeTransaction } = require('../config/database');
const { AUCTION_STATUS, BID_STATUS, NOTIFICATION_TYPES } = require('../config/constants');
const { sendAuctionWonEmail } = require('../services/emailService');
const { notifyAuctionWon, notifyAuctionEnding } = require('../services/notificationService');

/**
 * Initialize scheduled jobs
 */
const initializeScheduler = (io) => {
    console.log('✓ Auction scheduler initialized');

    // Process ended auctions - every minute
    cron.schedule('* * * * *', async () => {
        await processEndedAuctions(io);
    });

    // Activate scheduled auctions - every minute
    cron.schedule('* * * * *', async () => {
        await activateScheduledAuctions();
    });

    // Send ending soon notifications - every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
        await sendEndingSoonNotifications(io);
    });

    // Clean up expired refresh tokens - daily at 3am
    cron.schedule('0 3 * * *', async () => {
        await cleanupExpiredTokens();
    });
};

/**
 * Process auctions that have ended
 */
const processEndedAuctions = async (io) => {
    try {
        // Get auctions that have ended but not processed
        const endedAuctions = await query(
            `SELECT a.auction_id, a.title, a.current_bid, a.reserve_price, a.seller_id,
              b.bidder_id as winner_id, b.bid_amount as winning_bid,
              u_seller.email as seller_email, u_seller.username as seller_username,
              u_winner.email as winner_email, u_winner.username as winner_username
       FROM auctions a
       LEFT JOIN bids b ON a.auction_id = b.auction_id AND b.is_winning_bid = TRUE
       LEFT JOIN users u_seller ON a.seller_id = u_seller.user_id
       LEFT JOIN users u_winner ON b.bidder_id = u_winner.user_id
       WHERE a.status = 'active' AND a.end_time <= NOW()
       LIMIT 50`
        );

        for (const auction of endedAuctions) {
            await executeTransaction(async (connection) => {
                // Determine if auction sold or just ended
                const hasBids = auction.winner_id !== null;
                const metReserve = !auction.reserve_price ||
                    (auction.current_bid >= auction.reserve_price);

                const newStatus = hasBids && metReserve
                    ? AUCTION_STATUS.SOLD
                    : AUCTION_STATUS.ENDED;

                // Update auction status
                await connection.execute(
                    'UPDATE auctions SET status = ? WHERE auction_id = ?',
                    [newStatus, auction.auction_id]
                );

                if (hasBids && metReserve) {
                    // Update winning bid status
                    await connection.execute(
                        'UPDATE bids SET bid_status = ? WHERE auction_id = ? AND is_winning_bid = TRUE',
                        [BID_STATUS.WON, auction.auction_id]
                    );

                    // Update losing bids
                    await connection.execute(
                        'UPDATE bids SET bid_status = ? WHERE auction_id = ? AND is_winning_bid = FALSE',
                        [BID_STATUS.LOST, auction.auction_id]
                    );

                    // Create transaction record
                    const [transResult] = await connection.execute(
                        `INSERT INTO transactions (auction_id, buyer_id, seller_id, final_price, total_amount)
             VALUES (?, ?, ?, ?, ?)`,
                        [auction.auction_id, auction.winner_id, auction.seller_id,
                        auction.winning_bid, auction.winning_bid]
                    );

                    // Update winner's stats
                    await connection.execute(
                        'UPDATE users SET total_wins = total_wins + 1 WHERE user_id = ?',
                        [auction.winner_id]
                    );

                    // Update seller's stats
                    await connection.execute(
                        'UPDATE users SET total_sales = total_sales + 1 WHERE user_id = ?',
                        [auction.seller_id]
                    );
                }
            });

            // Send notifications (outside transaction)
            if (auction.winner_id && (!auction.reserve_price || auction.current_bid >= auction.reserve_price)) {
                // Notify winner
                await notifyAuctionWon(auction.winner_id, auction.title, auction.winning_bid, auction.auction_id, io);

                // Send email to winner
                if (auction.winner_email) {
                    await sendAuctionWonEmail(
                        auction.winner_email,
                        auction.winner_username,
                        auction.title,
                        auction.auction_id,
                        auction.winning_bid
                    );
                }
            }
        }

    } catch (error) {
        console.error('Error processing ended auctions:', error);
    }
};

/**
 * Activate scheduled auctions
 */
const activateScheduledAuctions = async () => {
    try {
        await query(
            `UPDATE auctions SET status = 'active' 
       WHERE status = 'scheduled' AND start_time <= NOW()`
        );
    } catch (error) {
        console.error('Error activating scheduled auctions:', error);
    }
};

/**
 * Send notifications for auctions ending soon
 */
const sendEndingSoonNotifications = async (io) => {
    try {
        // Get auctions ending in next hour with watchers
        const endingSoon = await query(
            `SELECT DISTINCT a.auction_id, a.title, w.user_id
       FROM auctions a
       JOIN watchlist w ON a.auction_id = w.auction_id
       WHERE a.status = 'active' 
       AND a.end_time BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 1 HOUR)
       AND NOT EXISTS (
         SELECT 1 FROM notifications n 
         WHERE n.user_id = w.user_id 
         AND n.notification_type = 'auction_ending'
         AND n.link LIKE CONCAT('%', a.auction_id, '%')
         AND n.created_at > DATE_SUB(NOW(), INTERVAL 2 HOUR)
       )
       LIMIT 100`
        );

        for (const item of endingSoon) {
            await notifyAuctionEnding(item.user_id, item.title, item.auction_id, io);
        }

    } catch (error) {
        console.error('Error sending ending soon notifications:', error);
    }
};

/**
 * Clean up expired tokens
 */
const cleanupExpiredTokens = async () => {
    try {
        const result = await query('DELETE FROM refresh_tokens WHERE expires_at < NOW()');
        console.log(`Cleaned up ${result.affectedRows} expired tokens`);
    } catch (error) {
        console.error('Error cleaning up tokens:', error);
    }
};

module.exports = { initializeScheduler };
