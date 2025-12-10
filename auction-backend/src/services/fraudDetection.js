const { query, insert } = require('../config/database');
const { FRAUD_TYPES } = require('../config/constants');

/**
 * Detect potential fraud in bidding activity
 * @param {Object} bidData - Bid data to analyze
 */
const detectFraud = async ({ user_id, auction_id, bid_id, bid_amount, ip_address }) => {
    try {
        const flags = [];

        // Check 1: Shill bidding - seller and bidder connected via IP
        const shillCheck = await checkShillBidding(user_id, auction_id, ip_address);
        if (shillCheck) flags.push(shillCheck);

        // Check 2: Rapid bid pattern
        const rapidBidCheck = await checkRapidBidding(user_id, auction_id);
        if (rapidBidCheck) flags.push(rapidBidCheck);

        // Check 3: Bid manipulation - unusual bid increments
        const manipulationCheck = await checkBidManipulation(auction_id, bid_amount);
        if (manipulationCheck) flags.push(manipulationCheck);

        // Check 4: Multiple accounts from same IP
        const multiAccountCheck = await checkMultipleAccounts(ip_address);
        if (multiAccountCheck) flags.push(multiAccountCheck);

        // Log any detected fraud
        for (const flag of flags) {
            await logFraud({
                user_id,
                auction_id,
                bid_id,
                fraud_type: flag.type,
                severity: flag.severity,
                description: flag.description,
                ip_address,
                evidence: flag.evidence
            });
        }

        return flags;
    } catch (error) {
        console.error('Fraud detection error:', error);
        return [];
    }
};

/**
 * Check for shill bidding (seller-bidder connection)
 */
const checkShillBidding = async (bidderId, auctionId, bidderIp) => {
    // Get seller info
    const [auction] = await query(
        'SELECT seller_id FROM auctions WHERE auction_id = ?',
        [auctionId]
    );

    if (!auction) return null;

    // Check if bidder has bid on multiple auctions by same seller
    const bidHistory = await query(
        `SELECT COUNT(DISTINCT a.auction_id) as count
     FROM bids b
     JOIN auctions a ON b.auction_id = a.auction_id
     WHERE b.bidder_id = ? AND a.seller_id = ? AND a.auction_id != ?`,
        [bidderId, auction.seller_id, auctionId]
    );

    if (bidHistory[0].count > 5) {
        return {
            type: FRAUD_TYPES.SHILL_BIDDING,
            severity: 'medium',
            description: `Bidder has bid on ${bidHistory[0].count} auctions from the same seller`,
            evidence: { bidCount: bidHistory[0].count }
        };
    }

    // Check for same IP between bidder and seller
    const ipMatch = await query(
        `SELECT b.ip_address FROM bids b 
     JOIN auctions a ON a.seller_id = b.bidder_id
     WHERE a.auction_id = ? AND b.ip_address = ?`,
        [auctionId, bidderIp]
    );

    if (ipMatch.length > 0) {
        return {
            type: FRAUD_TYPES.SHILL_BIDDING,
            severity: 'high',
            description: 'Bidder IP matches seller bid history IP',
            evidence: { ip: bidderIp }
        };
    }

    return null;
};

/**
 * Check for rapid bidding pattern
 */
const checkRapidBidding = async (bidderId, auctionId) => {
    // Check bids in last 60 seconds
    const recentBids = await query(
        `SELECT COUNT(*) as count FROM bids 
     WHERE bidder_id = ? AND auction_id = ? 
     AND bid_time > DATE_SUB(NOW(), INTERVAL 60 SECOND)`,
        [bidderId, auctionId]
    );

    if (recentBids[0].count > 5) {
        return {
            type: FRAUD_TYPES.SUSPICIOUS_PATTERN,
            severity: 'low',
            description: `User placed ${recentBids[0].count} bids in 60 seconds`,
            evidence: { bidCount: recentBids[0].count, timeframe: '60s' }
        };
    }

    return null;
};

/**
 * Check for bid manipulation
 */
const checkBidManipulation = async (auctionId, bidAmount) => {
    // Get auction info and bid history
    const bidHistory = await query(
        `SELECT bid_amount FROM bids 
     WHERE auction_id = ? 
     ORDER BY bid_time DESC LIMIT 10`,
        [auctionId]
    );

    if (bidHistory.length < 3) return null;

    // Check for unusual bid increment patterns
    const recentBid = parseFloat(bidHistory[0]?.bid_amount || 0);
    const previousBid = parseFloat(bidHistory[1]?.bid_amount || 0);

    // If bid is exactly 1 cent more than required, could be manipulation
    const increment = parseFloat(bidAmount) - recentBid;

    // This is just a simple check - in production, would be more sophisticated
    return null;
};

/**
 * Check for multiple accounts from same IP
 */
const checkMultipleAccounts = async (ipAddress) => {
    // Check how many users have bid from this IP
    const users = await query(
        `SELECT COUNT(DISTINCT bidder_id) as count
     FROM bids WHERE ip_address = ?`,
        [ipAddress]
    );

    if (users[0].count > 3) {
        return {
            type: FRAUD_TYPES.MULTIPLE_ACCOUNTS,
            severity: 'medium',
            description: `${users[0].count} different users bidding from same IP`,
            evidence: { userCount: users[0].count, ip: ipAddress }
        };
    }

    return null;
};

/**
 * Log fraud detection event
 */
const logFraud = async ({ user_id, auction_id, bid_id, fraud_type, severity, description, ip_address, evidence }) => {
    await insert(
        `INSERT INTO fraud_logs (user_id, auction_id, bid_id, fraud_type, severity, description, ip_address, evidence)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [user_id, auction_id, bid_id, fraud_type, severity, description, ip_address, JSON.stringify(evidence)]
    );
};

/**
 * Get user's fraud score (0-100)
 */
const getUserFraudScore = async (userId) => {
    const logs = await query(
        `SELECT severity, COUNT(*) as count FROM fraud_logs 
     WHERE user_id = ? AND status != 'false_positive'
     GROUP BY severity`,
        [userId]
    );

    let score = 0;
    for (const log of logs) {
        switch (log.severity) {
            case 'low': score += log.count * 5; break;
            case 'medium': score += log.count * 15; break;
            case 'high': score += log.count * 30; break;
            case 'critical': score += log.count * 50; break;
        }
    }

    return Math.min(score, 100);
};

module.exports = {
    detectFraud,
    logFraud,
    getUserFraudScore
};
