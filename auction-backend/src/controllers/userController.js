const { query, insert } = require('../config/database');

/**
 * Get user profile (public)
 */
exports.getUser = async (req, res, next) => {
    try {
        const { id: userId } = req.params;

        const users = await query(
            `SELECT user_id, username, profile_image, bio, location, 
              reputation_score, total_sales, total_wins, registration_date
       FROM users WHERE user_id = ? AND account_status = 'active'`,
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Get recent reviews
        const reviews = await query(
            `SELECT r.rating, r.review_text, r.created_at, u.username as reviewer_username
       FROM reviews r
       JOIN users u ON r.reviewer_id = u.user_id
       WHERE r.reviewee_id = ?
       ORDER BY r.created_at DESC LIMIT 5`,
            [userId]
        );

        res.json({
            success: true,
            data: { ...users[0], recent_reviews: reviews }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Get user's watchlist
 */
exports.getWatchlist = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const watchlist = await query(
            `SELECT a.auction_id, a.title, a.current_bid, a.starting_price, 
              a.bid_count, a.end_time, a.status,
              ai.image_url as thumbnail, w.added_date
       FROM watchlist w
       JOIN auctions a ON w.auction_id = a.auction_id
       LEFT JOIN auction_images ai ON a.auction_id = ai.auction_id AND ai.is_primary = TRUE
       WHERE w.user_id = ?
       ORDER BY w.added_date DESC
       LIMIT ? OFFSET ?`,
            [userId, parseInt(limit), offset]
        );

        res.json({ success: true, data: watchlist });

    } catch (error) {
        next(error);
    }
};

/**
 * Add to watchlist
 */
exports.addToWatchlist = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { auction_id } = req.body;

        // Check if auction exists
        const auctions = await query('SELECT auction_id FROM auctions WHERE auction_id = ?', [auction_id]);
        if (auctions.length === 0) {
            return res.status(404).json({ success: false, message: 'Auction not found' });
        }

        // Add to watchlist
        await insert(
            'INSERT IGNORE INTO watchlist (user_id, auction_id) VALUES (?, ?)',
            [userId, auction_id]
        );

        // Update watch count
        await query('UPDATE auctions SET watch_count = watch_count + 1 WHERE auction_id = ?', [auction_id]);

        res.json({ success: true, message: 'Added to watchlist' });

    } catch (error) {
        next(error);
    }
};

/**
 * Remove from watchlist
 */
exports.removeFromWatchlist = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { auctionId } = req.params;

        const result = await query(
            'DELETE FROM watchlist WHERE user_id = ? AND auction_id = ?',
            [userId, auctionId]
        );

        if (result.affectedRows > 0) {
            await query('UPDATE auctions SET watch_count = GREATEST(watch_count - 1, 0) WHERE auction_id = ?', [auctionId]);
        }

        res.json({ success: true, message: 'Removed from watchlist' });

    } catch (error) {
        next(error);
    }
};

/**
 * Get user notifications
 */
exports.getNotifications = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { page = 1, limit = 20, unread_only } = req.query;
        const offset = (page - 1) * limit;

        let whereCondition = 'user_id = ?';
        if (unread_only === 'true') whereCondition += ' AND is_read = FALSE';

        const notifications = await query(
            `SELECT notification_id, notification_type, title, message, link, is_read, created_at
       FROM notifications
       WHERE ${whereCondition}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
            [userId, parseInt(limit), offset]
        );

        // Get unread count
        const [{ unread_count }] = await query(
            'SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = ? AND is_read = FALSE',
            [userId]
        );

        res.json({ success: true, data: { notifications, unread_count } });

    } catch (error) {
        next(error);
    }
};

/**
 * Mark notifications as read
 */
exports.markNotificationsRead = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { notification_ids } = req.body;

        if (notification_ids && notification_ids.length > 0) {
            const placeholders = notification_ids.map(() => '?').join(',');
            await query(
                `UPDATE notifications SET is_read = TRUE, read_at = NOW() 
         WHERE user_id = ? AND notification_id IN (${placeholders})`,
                [userId, ...notification_ids]
            );
        } else {
            // Mark all as read
            await query(
                'UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE user_id = ?',
                [userId]
            );
        }

        res.json({ success: true, message: 'Notifications marked as read' });

    } catch (error) {
        next(error);
    }
};

/**
 * Get user dashboard stats
 */
exports.getDashboardStats = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        // Active bids (winning)
        const [{ active_bids }] = await query(
            `SELECT COUNT(DISTINCT b.auction_id) as active_bids
       FROM bids b
       JOIN auctions a ON b.auction_id = a.auction_id
       WHERE b.bidder_id = ? AND b.is_winning_bid = TRUE AND a.status = 'active'`,
            [userId]
        );

        // Watchlist count
        const [{ watchlist_count }] = await query(
            'SELECT COUNT(*) as watchlist_count FROM watchlist WHERE user_id = ?',
            [userId]
        );

        // Won auctions
        const [{ won_count }] = await query(
            'SELECT COUNT(*) as won_count FROM bids WHERE bidder_id = ? AND bid_status = "won"',
            [userId]
        );

        // Selling count
        const [{ selling_count }] = await query(
            'SELECT COUNT(*) as selling_count FROM auctions WHERE seller_id = ? AND status = "active"',
            [userId]
        );

        res.json({
            success: true,
            data: { active_bids, watchlist_count, won_count, selling_count }
        });

    } catch (error) {
        next(error);
    }
};
