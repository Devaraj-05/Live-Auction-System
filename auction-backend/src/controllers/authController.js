const bcrypt = require('bcryptjs');
const { query, insert } = require('../config/database');
const {
    generateToken,
    generateRefreshToken,
    verifyRefreshToken,
    revokeRefreshToken,
    revokeAllRefreshTokens
} = require('../utils/jwt');

/**
 * Register new user
 */
exports.register = async (req, res, next) => {
    try {
        const { username, email, password, full_name, phone } = req.body;

        // Check if user already exists
        const existingUser = await query(
            'SELECT user_id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Username or email already exists'
            });
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, 12);

        // Insert user
        const result = await insert(
            `INSERT INTO users (username, email, password_hash, full_name, phone, account_status)
       VALUES (?, ?, ?, ?, ?, 'active')`,
            [username, email, password_hash, full_name || null, phone || null]
        );

        const userId = result.insertId;

        // Generate auth tokens
        const accessToken = generateToken({ userId, username, email });
        const refreshToken = await generateRefreshToken(userId);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                user: {
                    user_id: userId,
                    username,
                    email,
                    email_verified: false
                },
                accessToken,
                refreshToken
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * User login
 */
exports.login = async (req, res, next) => {
    try {
        const { login, password } = req.body;

        // Find user by username or email
        const users = await query(
            `SELECT user_id, username, email, password_hash, account_status, 
              email_verified, full_name, profile_image
       FROM users 
       WHERE (username = ? OR email = ?) AND account_status = 'active'`,
            [login, login]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const user = users[0];

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update last login
        await query('UPDATE users SET last_login = NOW() WHERE user_id = ?', [user.user_id]);

        // Generate tokens
        const accessToken = generateToken({
            userId: user.user_id,
            username: user.username,
            email: user.email
        });
        const refreshToken = await generateRefreshToken(user.user_id);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    user_id: user.user_id,
                    username: user.username,
                    email: user.email,
                    full_name: user.full_name,
                    profile_image: user.profile_image,
                    email_verified: Boolean(user.email_verified)
                },
                accessToken,
                refreshToken
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Refresh access token
 */
exports.refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token is required'
            });
        }

        // Verify refresh token
        const decoded = await verifyRefreshToken(refreshToken);

        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token'
            });
        }

        // Generate new access token
        const accessToken = generateToken({
            userId: decoded.userId,
            username: decoded.username,
            email: decoded.email
        });

        res.json({
            success: true,
            data: { accessToken }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Logout user
 */
exports.logout = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (refreshToken) {
            await revokeRefreshToken(refreshToken);
        }

        res.json({
            success: true,
            message: 'Logout successful'
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Get current user profile
 */
exports.getProfile = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        const users = await query(
            `SELECT user_id, username, email, full_name, phone, profile_image, 
              bio, location, email_verified, reputation_score, 
              total_bids, total_wins, total_sales, registration_date
       FROM users WHERE user_id = ?`,
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: users[0]
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Update user profile
 */
exports.updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { full_name, phone, bio, location } = req.body;

        await query(
            `UPDATE users 
       SET full_name = COALESCE(?, full_name),
           phone = COALESCE(?, phone),
           bio = COALESCE(?, bio),
           location = COALESCE(?, location),
           updated_at = NOW()
       WHERE user_id = ?`,
            [full_name, phone, bio, location, userId]
        );

        res.json({
            success: true,
            message: 'Profile updated successfully'
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Change password
 */
exports.changePassword = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { currentPassword, newPassword } = req.body;

        // Get current password hash
        const users = await query(
            'SELECT password_hash FROM users WHERE user_id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, users[0].password_hash);

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password and update
        const newHash = await bcrypt.hash(newPassword, 12);

        await query(
            'UPDATE users SET password_hash = ? WHERE user_id = ?',
            [newHash, userId]
        );

        // Revoke all refresh tokens
        await revokeAllRefreshTokens(userId);

        res.json({
            success: true,
            message: 'Password changed successfully. Please login again.'
        });

    } catch (error) {
        next(error);
    }
};
