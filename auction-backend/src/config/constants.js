// Application Constants

module.exports = {
    // Auction statuses
    AUCTION_STATUS: {
        DRAFT: 'draft',
        SCHEDULED: 'scheduled',
        ACTIVE: 'active',
        ENDED: 'ended',
        CANCELLED: 'cancelled',
        SOLD: 'sold'
    },

    // Bid statuses
    BID_STATUS: {
        ACTIVE: 'active',
        OUTBID: 'outbid',
        WON: 'won',
        LOST: 'lost',
        CANCELLED: 'cancelled'
    },

    // User account statuses
    ACCOUNT_STATUS: {
        ACTIVE: 'active',
        SUSPENDED: 'suspended',
        DELETED: 'deleted'
    },

    // Payment statuses
    PAYMENT_STATUS: {
        PENDING: 'pending',
        PAID: 'paid',
        FAILED: 'failed',
        REFUNDED: 'refunded'
    },

    // Shipping statuses
    SHIPPING_STATUS: {
        NOT_SHIPPED: 'not_shipped',
        PROCESSING: 'processing',
        SHIPPED: 'shipped',
        IN_TRANSIT: 'in_transit',
        DELIVERED: 'delivered'
    },

    // Notification types
    NOTIFICATION_TYPES: {
        BID_PLACED: 'bid_placed',
        OUTBID: 'outbid',
        AUCTION_WON: 'auction_won',
        AUCTION_LOST: 'auction_lost',
        AUCTION_ENDING: 'auction_ending',
        PAYMENT_RECEIVED: 'payment_received',
        ITEM_SHIPPED: 'item_shipped',
        MESSAGE_RECEIVED: 'message_received',
        REVIEW_RECEIVED: 'review_received'
    },

    // Item conditions
    CONDITION_TYPES: {
        NEW: 'new',
        LIKE_NEW: 'like_new',
        USED_EXCELLENT: 'used_excellent',
        USED_GOOD: 'used_good',
        USED_FAIR: 'used_fair',
        FOR_PARTS: 'for_parts'
    },

    // Fraud types
    FRAUD_TYPES: {
        SHILL_BIDDING: 'shill_bidding',
        BID_MANIPULATION: 'bid_manipulation',
        MULTIPLE_ACCOUNTS: 'multiple_accounts',
        SUSPICIOUS_PATTERN: 'suspicious_pattern',
        PAYMENT_FRAUD: 'payment_fraud'
    },

    // Default values
    DEFAULTS: {
        BID_INCREMENT: 5.00,
        AUTO_EXTEND_DURATION: 120, // seconds
        AUTO_EXTEND_TRIGGER: 60,   // seconds before end
        RETURN_DAYS: 30,
        BUYER_PREMIUM_PERCENT: 10,
        SELLER_FEE_PERCENT: 5,
        LISTING_FEE: 0.35
    },

    // Pagination
    PAGINATION: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 20,
        MAX_LIMIT: 100
    },

    // JWT
    JWT: {
        ACCESS_TOKEN_EXPIRES: '1h',
        REFRESH_TOKEN_EXPIRES: '7d',
        EMAIL_VERIFICATION_EXPIRES: '24h',
        PASSWORD_RESET_EXPIRES: '1h'
    },

    // Rate limiting
    RATE_LIMITS: {
        AUTH: { windowMs: 15 * 60 * 1000, max: 10 },      // 10 per 15 min
        BIDS: { windowMs: 60 * 1000, max: 30 },           // 30 per minute
        API: { windowMs: 15 * 60 * 1000, max: 1000 }      // 1000 per 15 min
    },

    // WebSocket events
    WS_EVENTS: {
        BID_UPDATE: 'bid_update',
        AUCTION_UPDATE: 'auction_update',
        AUCTION_ENDED: 'auction_ended',
        OUTBID: 'outbid',
        NOTIFICATION: 'notification',
        MESSAGE: 'message'
    }
};
