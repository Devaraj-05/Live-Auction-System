const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret';

/**
 * Authentication middleware - requires valid JWT
 */
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const token = authHeader.substring(7);

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Check if user still exists and is active
        const users = await query(
            'SELECT user_id, username, email, account_status FROM users WHERE user_id = ?',
            [decoded.userId]
        );

        if (users.length === 0 || users[0].account_status !== 'active') {
            return res.status(401).json({
                success: false,
                message: 'User not found or inactive'
            });
        }

        // Attach user to request
        req.user = {
            userId: users[0].user_id,
            username: users[0].username,
            email: users[0].email
        };

        next();

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired',
                code: 'TOKEN_EXPIRED'
            });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        next(error);
    }
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET);

        const users = await query(
            'SELECT user_id, username, email FROM users WHERE user_id = ? AND account_status = "active"',
            [decoded.userId]
        );

        if (users.length > 0) {
            req.user = {
                userId: users[0].user_id,
                username: users[0].username,
                email: users[0].email
            };
        }

        next();

    } catch (error) {
        // Continue without authentication on any error
        next();
    }
};

/**
 * Check if user owns resource
 * @param {string} resourceType - Type of resource (auction, bid, etc.)
 * @param {string} resourceIdParam - Request param name for resource ID
 */
const checkOwnership = (resourceType, resourceIdParam = 'id') => {
    return async (req, res, next) => {
        try {
            const resourceId = req.params[resourceIdParam];
            const userId = req.user.userId;

            let tableName, idColumn, ownerColumn;

            switch (resourceType) {
                case 'auction':
                    tableName = 'auctions';
                    idColumn = 'auction_id';
                    ownerColumn = 'seller_id';
                    break;
                case 'bid':
                    tableName = 'bids';
                    idColumn = 'bid_id';
                    ownerColumn = 'bidder_id';
                    break;
                case 'message':
                    tableName = 'messages';
                    idColumn = 'message_id';
                    ownerColumn = 'sender_id';
                    break;
                default:
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid resource type'
                    });
            }

            const results = await query(
                `SELECT ${ownerColumn} FROM ${tableName} WHERE ${idColumn} = ?`,
                [resourceId]
            );

            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: `${resourceType} not found`
                });
            }

            if (results[0][ownerColumn] !== userId) {
                return res.status(403).json({
                    success: false,
                    message: `Not authorized to access this ${resourceType}`
                });
            }

            next();

        } catch (error) {
            next(error);
        }
    };
};

module.exports = {
    authenticate,
    optionalAuth,
    checkOwnership
};
