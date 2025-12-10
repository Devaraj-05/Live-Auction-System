const { query, insert, executeTransaction } = require('../config/database');
const { cache } = require('../config/redis');
const { AUCTION_STATUS, DEFAULTS } = require('../config/constants');

/**
 * Create new auction
 */
exports.createAuction = async (req, res, next) => {
    try {
        const sellerId = req.user.userId;
        const {
            title,
            description,
            category_id,
            condition_type,
            starting_price,
            reserve_price,
            buy_now_price,
            bid_increment = DEFAULTS.BID_INCREMENT,
            duration_days = 7,
            start_immediately = true,
            start_time,
            auto_extend = true,
            shipping_cost = 0,
            free_shipping = false,
            local_pickup = false,
            international_shipping = false,
            return_accepted = true,
            return_days = 30,
            location,
            images = []
        } = req.body;

        // Calculate start and end times
        const startTime = start_immediately ? new Date() : new Date(start_time);
        const endTime = new Date(startTime.getTime() + (duration_days * 24 * 60 * 60 * 1000));
        const status = start_immediately ? AUCTION_STATUS.ACTIVE : AUCTION_STATUS.SCHEDULED;

        const result = await executeTransaction(async (connection) => {
            // Insert auction
            const [auctionResult] = await connection.execute(
                `INSERT INTO auctions (
          seller_id, title, description, category_id, condition_type,
          starting_price, reserve_price, buy_now_price, bid_increment,
          start_time, end_time, status, auto_extend, auto_extend_duration,
          auto_extend_trigger, shipping_cost, free_shipping, local_pickup,
          international_shipping, return_accepted, return_days, location
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    sellerId, title, description, category_id || null, condition_type,
                    starting_price, reserve_price || null, buy_now_price || null, bid_increment,
                    startTime, endTime, status, auto_extend, DEFAULTS.AUTO_EXTEND_DURATION,
                    DEFAULTS.AUTO_EXTEND_TRIGGER, shipping_cost, free_shipping, local_pickup,
                    international_shipping, return_accepted, return_days, location || null
                ]
            );

            const auctionId = auctionResult.insertId;

            // Insert images if provided
            if (images.length > 0) {
                for (let i = 0; i < images.length; i++) {
                    await connection.execute(
                        `INSERT INTO auction_images (auction_id, image_url, thumbnail_url, display_order, is_primary)
             VALUES (?, ?, ?, ?, ?)`,
                        [auctionId, images[i].url, images[i].thumbnail || images[i].url, i, i === 0]
                    );
                }
            }

            return { auctionId };
        });

        res.status(201).json({
            success: true,
            message: 'Auction created successfully',
            data: { auction_id: result.auctionId }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Get auction by ID
 */
exports.getAuction = async (req, res, next) => {
    try {
        const { id: auctionId } = req.params;
        const userId = req.user?.userId;

        // Try cache first
        const cacheKey = `auction:${auctionId}`;
        let auction = await cache.get(cacheKey);

        if (!auction) {
            const auctions = await query(
                `SELECT a.*, u.username as seller_username, u.reputation_score as seller_rating,
                u.profile_image as seller_image,
                (SELECT COUNT(*) FROM bids WHERE auction_id = a.auction_id) as total_bids,
                (SELECT COUNT(*) FROM watchlist WHERE auction_id = a.auction_id) as total_watchers
         FROM auctions a
         LEFT JOIN users u ON a.seller_id = u.user_id
         WHERE a.auction_id = ?`,
                [auctionId]
            );

            if (auctions.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Auction not found'
                });
            }

            auction = auctions[0];

            // Get images
            const images = await query(
                'SELECT image_id, image_url, thumbnail_url, is_primary FROM auction_images WHERE auction_id = ? ORDER BY display_order',
                [auctionId]
            );
            auction.images = images;

            // Cache for 5 minutes
            await cache.set(cacheKey, auction, 300);
        }

        // Increment view count
        query('UPDATE auctions SET view_count = view_count + 1 WHERE auction_id = ?', [auctionId]).catch(() => { });

        // Check if user is watching
        if (userId) {
            const watching = await query(
                'SELECT watchlist_id FROM watchlist WHERE user_id = ? AND auction_id = ?',
                [userId, auctionId]
            );
            auction.is_watching = watching.length > 0;

            // Get user's highest bid
            const userBids = await query(
                'SELECT MAX(bid_amount) as highest_bid, is_winning_bid FROM bids WHERE bidder_id = ? AND auction_id = ? GROUP BY auction_id',
                [userId, auctionId]
            );
            auction.user_highest_bid = userBids[0]?.highest_bid || null;
            auction.user_is_winning = userBids[0]?.is_winning_bid || false;
        }

        res.json({
            success: true,
            data: auction
        });

    } catch (error) {
        next(error);
    }
};

/**
 * List auctions with filters
 */
exports.listAuctions = async (req, res, next) => {
    try {
        const {
            category,
            search,
            min_price,
            max_price,
            condition,
            status = 'active',
            seller_id,
            sort = 'end_time_asc',
            page = 1,
            limit = 20
        } = req.query;

        let whereConditions = ['a.status = ?'];
        let params = [status];

        if (category) {
            whereConditions.push('a.category_id = ?');
            params.push(category);
        }

        if (search) {
            whereConditions.push('(a.title LIKE ? OR a.description LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }

        if (min_price) {
            whereConditions.push('COALESCE(a.current_bid, a.starting_price) >= ?');
            params.push(min_price);
        }

        if (max_price) {
            whereConditions.push('COALESCE(a.current_bid, a.starting_price) <= ?');
            params.push(max_price);
        }

        if (condition) {
            whereConditions.push('a.condition_type = ?');
            params.push(condition);
        }

        if (seller_id) {
            whereConditions.push('a.seller_id = ?');
            params.push(seller_id);
        }

        // Sort
        let orderBy = 'a.end_time ASC';
        switch (sort) {
            case 'end_time_asc': orderBy = 'a.end_time ASC'; break;
            case 'end_time_desc': orderBy = 'a.end_time DESC'; break;
            case 'price_asc': orderBy = 'COALESCE(a.current_bid, a.starting_price) ASC'; break;
            case 'price_desc': orderBy = 'COALESCE(a.current_bid, a.starting_price) DESC'; break;
            case 'newest': orderBy = 'a.created_at DESC'; break;
            case 'most_bids': orderBy = 'a.bid_count DESC'; break;
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const sql = `
      SELECT a.auction_id, a.title, a.current_bid, a.starting_price, 
             a.bid_count, a.end_time, a.status, a.free_shipping, a.condition_type,
             ai.image_url as thumbnail,
             u.username as seller_username, u.reputation_score as seller_rating
      FROM auctions a
      LEFT JOIN auction_images ai ON a.auction_id = ai.auction_id AND ai.is_primary = TRUE
      LEFT JOIN users u ON a.seller_id = u.user_id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;

        const auctions = await query(sql, [...params, parseInt(limit), offset]);

        // Get total count
        const countSql = `SELECT COUNT(*) as total FROM auctions a WHERE ${whereConditions.join(' AND ')}`;
        const [{ total }] = await query(countSql, params);

        res.json({
            success: true,
            data: {
                auctions,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Update auction
 */
exports.updateAuction = async (req, res, next) => {
    try {
        const { id: auctionId } = req.params;
        const sellerId = req.user.userId;
        const updates = req.body;

        // Check ownership and status
        const auctions = await query(
            'SELECT seller_id, bid_count, status FROM auctions WHERE auction_id = ?',
            [auctionId]
        );

        if (auctions.length === 0) {
            return res.status(404).json({ success: false, message: 'Auction not found' });
        }

        const auction = auctions[0];

        if (auction.seller_id !== sellerId) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Restrict updates if bids exist
        if (auction.bid_count > 0) {
            const allowedFields = ['description', 'shipping_cost', 'location'];
            const updateFields = Object.keys(updates).filter(k => allowedFields.includes(k));

            if (updateFields.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot modify price or core details after bids have been placed'
                });
            }
        }

        // Build update query
        const allowedUpdates = ['title', 'description', 'shipping_cost', 'free_shipping', 'location'];
        const updateFields = [];
        const params = [];

        Object.keys(updates).forEach(key => {
            if (allowedUpdates.includes(key) && updates[key] !== undefined) {
                updateFields.push(`${key} = ?`);
                params.push(updates[key]);
            }
        });

        if (updateFields.length === 0) {
            return res.status(400).json({ success: false, message: 'No valid fields to update' });
        }

        params.push(auctionId);

        await query(`UPDATE auctions SET ${updateFields.join(', ')}, updated_at = NOW() WHERE auction_id = ?`, params);

        // Invalidate cache
        await cache.del(`auction:${auctionId}`);

        res.json({ success: true, message: 'Auction updated successfully' });

    } catch (error) {
        next(error);
    }
};

/**
 * Cancel auction
 */
exports.cancelAuction = async (req, res, next) => {
    try {
        const { id: auctionId } = req.params;
        const sellerId = req.user.userId;

        const auctions = await query(
            'SELECT seller_id, bid_count, status FROM auctions WHERE auction_id = ?',
            [auctionId]
        );

        if (auctions.length === 0) {
            return res.status(404).json({ success: false, message: 'Auction not found' });
        }

        const auction = auctions[0];

        if (auction.seller_id !== sellerId) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        if (auction.status === 'ended' || auction.status === 'sold') {
            return res.status(400).json({ success: false, message: 'Cannot cancel completed auction' });
        }

        if (auction.bid_count > 0) {
            return res.status(400).json({ success: false, message: 'Cannot cancel auction with active bids' });
        }

        await query('UPDATE auctions SET status = "cancelled" WHERE auction_id = ?', [auctionId]);
        await cache.del(`auction:${auctionId}`);

        res.json({ success: true, message: 'Auction cancelled successfully' });

    } catch (error) {
        next(error);
    }
};

/**
 * Get categories
 */
exports.getCategories = async (req, res, next) => {
    try {
        const cacheKey = 'categories:all';
        let categories = await cache.get(cacheKey);

        if (!categories) {
            categories = await query(
                `SELECT category_id, parent_id, name, slug, description, icon, display_order
         FROM categories WHERE is_active = TRUE ORDER BY display_order`
            );
            await cache.set(cacheKey, categories, 3600);
        }

        res.json({ success: true, data: categories });

    } catch (error) {
        next(error);
    }
};
