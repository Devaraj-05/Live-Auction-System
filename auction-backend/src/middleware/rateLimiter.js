const rateLimit = require('express-rate-limit');
const { RATE_LIMITS } = require('../config/constants');

/**
 * Create rate limiter with custom options
 * @param {Object} options - Rate limit options
 * @returns {Function} Rate limiter middleware
 */
const createRateLimiter = (options = {}) => {
    return rateLimit({
        windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes
        max: options.max || 100,
        message: {
            success: false,
            message: 'Too many requests, please try again later',
            retryAfter: Math.ceil((options.windowMs || 15 * 60 * 1000) / 1000)
        },
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req) => {
            // Use user ID if authenticated, otherwise use IP
            return req.user?.userId || req.ip;
        },
        skip: (req) => {
            // Skip rate limiting in test environment
            return process.env.NODE_ENV === 'test';
        },
        ...options
    });
};

// Standard API rate limiter
const apiLimiter = createRateLimiter(RATE_LIMITS.API);

// Stricter limiter for auth endpoints
const authLimiter = createRateLimiter({
    ...RATE_LIMITS.AUTH,
    message: {
        success: false,
        message: 'Too many login attempts, please try again after 15 minutes'
    }
});

// Bid rate limiter (more lenient for real-time bidding)
const bidLimiter = createRateLimiter({
    ...RATE_LIMITS.BIDS,
    message: {
        success: false,
        message: 'You are bidding too fast, please slow down'
    }
});

// Strict limiter for sensitive operations
const strictLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: {
        success: false,
        message: 'Too many attempts, please try again later'
    }
});

module.exports = {
    createRateLimiter,
    apiLimiter,
    authLimiter,
    bidLimiter,
    strictLimiter
};
