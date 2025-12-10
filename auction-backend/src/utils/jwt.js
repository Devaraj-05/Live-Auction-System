const jwt = require('jsonwebtoken');
const { query, insert } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret';

/**
 * Generate access token
 * @param {Object} payload - Token payload
 * @param {string} expiresIn - Token expiration time
 * @returns {string} JWT token
 */
function generateToken(payload, expiresIn = process.env.JWT_EXPIRES_IN || '1h') {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Verify access token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded token or null
 */
function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

/**
 * Generate refresh token and store in database
 * @param {number} userId - User ID
 * @returns {string} Refresh token
 */
async function generateRefreshToken(userId) {
    const tokenId = uuidv4();
    const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
    const expiresMs = parseExpiration(expiresIn);
    const expiresAt = new Date(Date.now() + expiresMs);

    const token = jwt.sign({ userId, tokenId, type: 'refresh' }, JWT_REFRESH_SECRET, { expiresIn });

    // Store refresh token in database
    await insert(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
        [userId, token, expiresAt]
    );

    return token;
}

/**
 * Verify refresh token
 * @param {string} token - Refresh token
 * @returns {Object|null} Decoded token or null
 */
async function verifyRefreshToken(token) {
    try {
        const decoded = jwt.verify(token, JWT_REFRESH_SECRET);

        if (decoded.type !== 'refresh') {
            return null;
        }

        // Check if token exists in database
        const tokens = await query(
            'SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > NOW()',
            [token]
        );

        if (tokens.length === 0) {
            return null;
        }

        // Get user info
        const users = await query(
            'SELECT user_id, username, email FROM users WHERE user_id = ? AND account_status = "active"',
            [decoded.userId]
        );

        if (users.length === 0) {
            return null;
        }

        return {
            userId: users[0].user_id,
            username: users[0].username,
            email: users[0].email
        };
    } catch (error) {
        return null;
    }
}

/**
 * Revoke refresh token
 * @param {string} token - Refresh token to revoke
 */
async function revokeRefreshToken(token) {
    await query('DELETE FROM refresh_tokens WHERE token = ?', [token]);
}

/**
 * Revoke all refresh tokens for a user
 * @param {number} userId - User ID
 */
async function revokeAllRefreshTokens(userId) {
    await query('DELETE FROM refresh_tokens WHERE user_id = ?', [userId]);
}

/**
 * Parse expiration string to milliseconds
 * @param {string} exp - Expiration string (e.g., '1h', '7d')
 * @returns {number} Milliseconds
 */
function parseExpiration(exp) {
    const value = parseInt(exp);
    const unit = exp.slice(-1);

    switch (unit) {
        case 's': return value * 1000;
        case 'm': return value * 60 * 1000;
        case 'h': return value * 60 * 60 * 1000;
        case 'd': return value * 24 * 60 * 60 * 1000;
        default: return value * 1000;
    }
}

/**
 * Clean up expired refresh tokens
 */
async function cleanupExpiredTokens() {
    await query('DELETE FROM refresh_tokens WHERE expires_at < NOW()');
}

module.exports = {
    generateToken,
    verifyToken,
    generateRefreshToken,
    verifyRefreshToken,
    revokeRefreshToken,
    revokeAllRefreshTokens,
    cleanupExpiredTokens
};
