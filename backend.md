# Live Auction System - Complete Backend Implementation Prompt

Build a robust, scalable, and secure Node.js backend for a real-time auction platform with WebSocket support, MySQL database, authentication, and anti-fraud systems.

---

## PROJECT STRUCTURE

```
auction-backend/
├── src/
│   ├── config/
│   │   ├── database.js          # MySQL connection pool
│   │   ├── websocket.js         # WebSocket server config
│   │   ├── redis.js             # Redis client setup
│   │   └── constants.js         # App constants
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication
│   │   ├── validation.js        # Request validation
│   │   ├── rateLimiter.js       # Rate limiting
│   │   ├── errorHandler.js      # Global error handling
│   │   └── logger.js            # Request logging
│   ├── models/
│   │   ├── User.js              # User model
│   │   ├── Auction.js           # Auction model
│   │   ├── Bid.js               # Bid model
│   │   └── Transaction.js       # Transaction model
│   ├── controllers/
│   │   ├── authController.js    # Auth endpoints
│   │   ├── auctionController.js # Auction CRUD
│   │   ├── bidController.js     # Bidding logic
│   │   ├── userController.js    # User management
│   │   └── messageController.js # Messaging system
│   ├── services/
│   │   ├── bidService.js        # Bid processing
│   │   ├── auctionService.js    # Auction business logic
│   │   ├── emailService.js      # Email notifications
│   │   ├── paymentService.js    # Payment processing
│   │   └── fraudDetection.js    # Anti-fraud logic
│   ├── websocket/
│   │   ├── handlers/
│   │   │   ├── bidHandler.js    # Real-time bid updates
│   │   │   ├── auctionHandler.js# Auction updates
│   │   │   └── notificationHandler.js
│   │   ├── rooms.js             # WebSocket room management
│   │   └── events.js            # Event definitions
│   ├── routes/
│   │   ├── auth.js              # Auth routes
│   │   ├── auctions.js          # Auction routes
│   │   ├── bids.js              # Bid routes
│   │   ├── users.js             # User routes
│   │   └── messages.js          # Message routes
│   ├── utils/
│   │   ├── jwt.js               # JWT utilities
│   │   ├── bcrypt.js            # Password hashing
│   │   ├── validators.js        # Input validators
│   │   └── helpers.js           # Helper functions
│   ├── jobs/
│   │   ├── auctionScheduler.js  # Cron jobs
│   │   └── emailQueue.js        # Email queue processor
│   ├── db/
│   │   ├── migrations/          # DB migrations
│   │   └── seeds/               # Seed data
│   └── app.js                   # Express app setup
├── tests/
│   ├── unit/                    # Unit tests
│   ├── integration/             # Integration tests
│   └── load/                    # Load tests
├── .env.example                 # Environment variables template
├── package.json
├── server.js                    # Entry point
└── README.md
```

---

## 1. DATABASE SETUP & SCHEMA

### MySQL Schema Design

**Create complete SQL schema with proper indexes, foreign keys, and constraints:**

```sql
-- Users Table
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    phone VARCHAR(20),
    profile_image VARCHAR(255),
    bio TEXT,
    location VARCHAR(100),
    account_status ENUM('active', 'suspended', 'deleted') DEFAULT 'active',
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    reputation_score DECIMAL(3,2) DEFAULT 0.00,
    total_bids INT DEFAULT 0,
    total_wins INT DEFAULT 0,
    total_sales INT DEFAULT 0,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_account_status (account_status),
    INDEX idx_registration_date (registration_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Auctions Table
CREATE TABLE auctions (
    auction_id INT PRIMARY KEY AUTO_INCREMENT,
    seller_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category_id INT,
    subcategory_id INT,
    condition_type ENUM('new', 'like_new', 'used_excellent', 'used_good', 'used_fair', 'for_parts') NOT NULL,
    starting_price DECIMAL(10,2) NOT NULL,
    reserve_price DECIMAL(10,2) DEFAULT NULL,
    current_bid DECIMAL(10,2) DEFAULT NULL,
    buy_now_price DECIMAL(10,2) DEFAULT NULL,
    bid_increment DECIMAL(10,2) DEFAULT 5.00,
    bid_count INT DEFAULT 0,
    view_count INT DEFAULT 0,
    watch_count INT DEFAULT 0,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status ENUM('draft', 'scheduled', 'active', 'ended', 'cancelled', 'sold') DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT FALSE,
    auto_extend BOOLEAN DEFAULT TRUE,
    auto_extend_duration INT DEFAULT 120, -- seconds
    auto_extend_trigger INT DEFAULT 60,   -- seconds before end
    shipping_cost DECIMAL(10,2) DEFAULT 0.00,
    free_shipping BOOLEAN DEFAULT FALSE,
    local_pickup BOOLEAN DEFAULT FALSE,
    international_shipping BOOLEAN DEFAULT FALSE,
    return_accepted BOOLEAN DEFAULT TRUE,
    return_days INT DEFAULT 30,
    location VARCHAR(100),
    item_location_city VARCHAR(100),
    item_location_state VARCHAR(50),
    item_location_country VARCHAR(50),
    item_location_zip VARCHAR(20),
    weight_lbs DECIMAL(5,2),
    dimensions VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_seller (seller_id),
    INDEX idx_status (status),
    INDEX idx_end_time (end_time),
    INDEX idx_category (category_id),
    INDEX idx_current_bid (current_bid),
    INDEX idx_start_end_time (start_time, end_time),
    INDEX idx_featured (is_featured),
    FULLTEXT INDEX idx_search (title, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bids Table
CREATE TABLE bids (
    bid_id INT PRIMARY KEY AUTO_INCREMENT,
    auction_id INT NOT NULL,
    bidder_id INT NOT NULL,
    bid_amount DECIMAL(10,2) NOT NULL,
    max_bid_amount DECIMAL(10,2) DEFAULT NULL, -- For proxy bidding
    is_proxy_bid BOOLEAN DEFAULT FALSE,
    is_winning_bid BOOLEAN DEFAULT FALSE,
    is_auto_bid BOOLEAN DEFAULT FALSE,
    bid_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_fingerprint VARCHAR(255),
    bid_status ENUM('active', 'outbid', 'won', 'lost', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (auction_id) REFERENCES auctions(auction_id) ON DELETE CASCADE,
    FOREIGN KEY (bidder_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_auction_bid (auction_id, bid_amount),
    INDEX idx_auction (auction_id),
    INDEX idx_bidder (bidder_id),
    INDEX idx_bid_time (bid_time),
    INDEX idx_winning (auction_id, is_winning_bid),
    INDEX idx_bidder_auction (bidder_id, auction_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Transactions Table
CREATE TABLE transactions (
    transaction_id INT PRIMARY KEY AUTO_INCREMENT,
    auction_id INT NOT NULL,
    buyer_id INT NOT NULL,
    seller_id INT NOT NULL,
    final_price DECIMAL(10,2) NOT NULL,
    shipping_cost DECIMAL(10,2) DEFAULT 0.00,
    buyer_premium DECIMAL(10,2) DEFAULT 0.00,
    seller_fee DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('credit_card', 'paypal', 'bank_transfer', 'other'),
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    payment_date TIMESTAMP NULL,
    shipping_status ENUM('not_shipped', 'processing', 'shipped', 'in_transit', 'delivered') DEFAULT 'not_shipped',
    tracking_number VARCHAR(100),
    shipped_date TIMESTAMP NULL,
    delivered_date TIMESTAMP NULL,
    transaction_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (auction_id) REFERENCES auctions(auction_id) ON DELETE CASCADE,
    FOREIGN KEY (buyer_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_auction (auction_id),
    INDEX idx_buyer (buyer_id),
    INDEX idx_seller (seller_id),
    INDEX idx_payment_status (payment_status),
    INDEX idx_transaction_time (transaction_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Categories Table
CREATE TABLE categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    parent_id INT DEFAULT NULL,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(category_id) ON DELETE CASCADE,
    INDEX idx_parent (parent_id),
    INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Auction Images Table
CREATE TABLE auction_images (
    image_id INT PRIMARY KEY AUTO_INCREMENT,
    auction_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    thumbnail_url VARCHAR(255),
    display_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (auction_id) REFERENCES auctions(auction_id) ON DELETE CASCADE,
    INDEX idx_auction (auction_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Watchlist Table
CREATE TABLE watchlist (
    watchlist_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    auction_id INT NOT NULL,
    added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    price_alert DECIMAL(10,2) DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (auction_id) REFERENCES auctions(auction_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_auction (user_id, auction_id),
    INDEX idx_user (user_id),
    INDEX idx_auction (auction_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Messages Table
CREATE TABLE messages (
    message_id INT PRIMARY KEY AUTO_INCREMENT,
    conversation_id INT NOT NULL,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    auction_id INT DEFAULT NULL,
    message_text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    is_deleted_sender BOOLEAN DEFAULT FALSE,
    is_deleted_receiver BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (auction_id) REFERENCES auctions(auction_id) ON DELETE SET NULL,
    INDEX idx_conversation (conversation_id),
    INDEX idx_sender (sender_id),
    INDEX idx_receiver (receiver_id),
    INDEX idx_auction (auction_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reviews Table
CREATE TABLE reviews (
    review_id INT PRIMARY KEY AUTO_INCREMENT,
    transaction_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    reviewee_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    review_type ENUM('buyer_to_seller', 'seller_to_buyer') NOT NULL,
    is_verified_purchase BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (reviewee_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_review (transaction_id, reviewer_id),
    INDEX idx_reviewee (reviewee_id),
    INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifications Table
CREATE TABLE notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    notification_type ENUM('bid_placed', 'outbid', 'auction_won', 'auction_lost', 'auction_ending', 'payment_received', 'item_shipped', 'message_received', 'review_received') NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_read (is_read),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Saved Searches Table
CREATE TABLE saved_searches (
    search_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    search_name VARCHAR(100) NOT NULL,
    search_query JSON NOT NULL,
    email_frequency ENUM('never', 'instant', 'daily', 'weekly') DEFAULT 'never',
    last_run TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Fraud Detection Logs Table
CREATE TABLE fraud_logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    auction_id INT,
    bid_id INT,
    fraud_type ENUM('shill_bidding', 'bid_manipulation', 'multiple_accounts', 'suspicious_pattern', 'payment_fraud'),
    severity ENUM('low', 'medium', 'high', 'critical'),
    description TEXT,
    ip_address VARCHAR(45),
    evidence JSON,
    status ENUM('flagged', 'investigating', 'resolved', 'false_positive') DEFAULT 'flagged',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id),
    INDEX idx_auction (auction_id),
    INDEX idx_severity (severity),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Refresh Tokens Table
CREATE TABLE refresh_tokens (
    token_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_token (token(255)),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sessions Table (if not using Redis)
CREATE TABLE sessions (
    session_id VARCHAR(255) PRIMARY KEY,
    user_id INT,
    session_data JSON,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 2. DATABASE CONNECTION & CONFIGURATION

### database.js (MySQL Connection Pool)

```javascript
const mysql = require('mysql2/promise');
const config = require('./constants');

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 100, // Adjust based on expected load
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // Handle timezone
  timezone: 'Z', // UTC
  // Enable multiple statements for transactions
  multipleStatements: false,
  // Charset
  charset: 'utf8mb4'
});

// Test connection
pool.getConnection()
  .then(connection => {
    console.log('✓ MySQL Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('✗ MySQL connection failed:', err.message);
    process.exit(1);
  });

// Helper function for transactions
async function executeTransaction(callback) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Query helper with error handling
async function query(sql, params) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Parameterized query builder helper
function buildWhereClause(filters) {
  const conditions = [];
  const params = [];
  
  Object.keys(filters).forEach(key => {
    if (filters[key] !== undefined && filters[key] !== null) {
      conditions.push(`${key} = ?`);
      params.push(filters[key]);
    }
  });
  
  return {
    whereClause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    params
  };
}

module.exports = {
  pool,
  query,
  executeTransaction,
  buildWhereClause
};
```

### redis.js (Redis Configuration for Caching & Sessions)

```javascript
const Redis = require('ioredis');

const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: 0,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3
});

redisClient.on('connect', () => {
  console.log('✓ Redis connected successfully');
});

redisClient.on('error', (err) => {
  console.error('✗ Redis connection error:', err);
});

// Cache helpers
const cache = {
  async get(key) {
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  },
  
  async set(key, value, ttl = 3600) {
    try {
      await redisClient.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Redis SET error:', error);
      return false;
    }
  },
  
  async del(key) {
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error('Redis DEL error:', error);
      return false;
    }
  },
  
  async exists(key) {
    try {
      return await redisClient.exists(key);
    } catch (error) {
      console.error('Redis EXISTS error:', error);
      return false;
    }
  }
};

module.exports = { redisClient, cache };
```

---

## 3. AUTHENTICATION SYSTEM

### authController.js (Registration, Login, JWT)

```javascript
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, executeTransaction } = require('../config/database');
const { sendVerificationEmail } = require('../services/emailService');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');

// User Registration
exports.register = async (req, res, next) => {
  try {
    const { username, email, password, full_name, phone } = req.body;
    
    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username, email, and password are required' 
      });
    }
    
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
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    // Insert user
    const result = await query(
      `INSERT INTO users (username, email, password_hash, full_name, phone, account_status)
       VALUES (?, ?, ?, ?, ?, 'active')`,
      [username, email, password_hash, full_name || null, phone || null]
    );
    
    const userId = result.insertId;
    
    // Generate email verification token
    const verificationToken = generateToken({ userId, type: 'email_verification' }, '24h');
    
    // Send verification email
    await sendVerificationEmail(email, username, verificationToken);
    
    // Generate auth tokens
    const accessToken = generateToken({ userId, username, email });
    const refreshToken = await generateRefreshToken(userId);
    
    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email.',
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

// User Login
exports.login = async (req, res, next) => {
  try {
    const { login, password } = req.body; // login can be username or email
    
    if (!login || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Login and password are required' 
      });
    }
    
    // Find user by username or email
    const users = await query(
      `SELECT user_id, username, email, password_hash, account_status, 
              email_verified, two_factor_enabled
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
    
    // Check if 2FA is enabled
    if (user.two_factor_enabled) {
      // Generate temporary token for 2FA
      const tempToken = generateToken({ 
        userId: user.user_id, 
        type: '2fa_pending' 
      }, '10m');
      
      return res.json({
        success: true,
        requires2FA: true,
        tempToken
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
          email_verified: user.email_verified
        },
        accessToken,
        refreshToken
      }
    });
    
  } catch (error) {
    next(error);
  }
};

// Refresh Access Token
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

// Logout
exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      // Delete refresh token from database
      await query('DELETE FROM refresh_tokens WHERE token = ?', [refreshToken]);
    }
    
    res.json({
      success: true,
      message: 'Logout successful'
    });
    
  } catch (error) {
    next(error);
  }
};

// Verify Email
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'email_verification') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid verification token' 
      });
    }
    
    // Update user
    await query(
      'UPDATE users SET email_verified = TRUE WHERE user_id = ?',
      [decoded.userId]
    );
    
    res.json({
      success: true,
      message: 'Email verified successfully'
    });
    
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Verification link has expired' 
      });
    }
    next(error);
  }
};

// Request Password Reset
exports.requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    // Find user
    const users = await query('SELECT user_id, username FROM users WHERE email = ?', [email]);
    
    // Always return success to prevent email enumeration
    if (users.length === 0) {
      return res.json({
        success: true,
        message: 'If the email exists, a reset link has been sent'
      });
    }
    
    const user = users[0];
    
    // Generate reset token
    const resetToken = generateToken({ 
      userId: user.user_id, 
      type: 'password_reset' 
    }, '1h');
    
    // Send reset email
    const { sendPasswordResetEmail } = require('../services/emailService');
    await sendPasswordResetEmail(email, user.username, resetToken);
    
    res.json({
      success: true,
      message: 'If the email exists, a reset link has been sent'
    });
    
  } catch (error) {
    next(error);
  }
};

// Reset Password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'password_reset') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid reset token' 
      });
    }
    
    // Hash new password
    const passwor_hash = await bcrypt.hash(newPassword, 12);
    
    // Update password
    await query(
      'UPDATE users SET password_hash = ? WHERE user_id = ?',
      [password_hash, decoded.userId]
    );
    
    // Invalidate all refresh tokens for this user
    await query('DELETE FROM refresh_tokens WHERE user_id = ?', [decoded.userId]);
    
    res.json({
      success: true,
      message: 'Password reset successful'
    });
    
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Reset link has expired' 
      });
    }
    next(error);
  }
};
```

### auth.js (JWT Middleware)

```javascript
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// Verify JWT token
exports.authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
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
        message: 'Token expired' 
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

// Optional authentication (doesn't fail if no token)
exports.optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
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
    // Continue without authentication
    next();
  }
};
```

---

## 4. AUCTION MANAGEMENT

### auctionController.js (CRUD Operations)

```javascript
const { query, executeTransaction } = require('../config/database');
const { cache } = require('../config/redis');

// Create Auction
exports.createAuction = async (req, res, next) => {
  try {
    const sellerId = req.user.userId;
    const {
      title,
      description,
      category_id,
      subcategory_id,
      condition_type,
      starting_price,
      reserve_price,
      buy_now_price,
      bid_increment,
      duration_days,
      start_immediately,
      start_time,
      auto_extend,
      shipping_cost,
      free_shipping,
      local_pickup,
      international_shipping,
      return_accepted,
      return_days,
      location,
      weight_lbs,
      dimensions,
      images
    } = req.body;
    
    // Validation
    if (!title || !description || !starting_price || !condition_type) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }
    
    // Calculate start and end times
    const startTime = start_immediately ? new Date() : new Date(start_time);
    const endTime = new Date(startTime.getTime() + (duration_days * 24 * 60 * 60 * 1000));
    
    const result = await executeTransaction(async (connection) => {
      // Insert auction
      const [auctionResult] = await connection.execute(
        `INSERT INTO auctions (
          seller_id, title, description, category_id, subcategory_id,
          condition_type, starting_price, reserve_price, buy_now_price,
          bid_increment, start_time, end_time, status, auto_extend,
          shipping_cost, free_shipping, local_pickup, international_shipping,
          return_accepted, return_days, location, weight_lbs, dimensions
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sellerId, title, description, category_id, subcategory_id || null,
          condition_type, starting_price, reserve_price || null, buy_now_price || null,
          bid_increment || 5.00, startTime, endTime, 
          start_immediately ? 'active' : 'scheduled', auto_extend || true,
          shipping_cost || 0, free_shipping || false, local_pickup || false,
          international_shipping || false, return_accepted !== false, return_days || 30,
          location || null, weight_lbs || null, dimensions || null
        ]
      );
      
      const auctionId = auctionResult.insertId;
      
      // Insert images if provided
      if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          await connection.execute(
            `INSERT INTO auction_images (auction_id, image_url, thumbnail_url, display_order, is_primary)
             VALUES (?, ?, ?, ?, ?)`,
            [
              auctionId,
              images[i].url,
              images[i].thumbnail || images[i].url,
              i,
              i === 0 // First image is primary
            ]
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

// Get Auction Details
exports.getAuction = async (req, res, next) => {
  try {
    const { auctionId } = req.params;
    const userId = req.user?.userId;
    
    // Try cache first
    const cacheKey = `auction:${auctionId}`;
    let auction = await cache.get(cacheKey);
    
    if (!auction) {
      // Fetch from database
      const auctions = await query(
        `SELECT a.*, u.username as seller_username, u.reputation_score as seller_rating,
                COUNT(DISTINCT b.bid_id) as total_bids,
                COUNT(DISTINCT w.watchlist_id) as total_watchers
         FROM auctions a
         LEFT JOIN users u ON a.seller_id = u.user_id
         LEFT JOIN bids b ON a.auction_id = b.auction_id
         LEFT JOIN watchlist w ON a.auction_id = w.auction_id
         WHERE a.auction_id = ?
         GROUP BY a.auction_id`,
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
        'SELECT image_url, thumbnail_url, is_primary FROM auction_images WHERE auction_id = ? ORDER BY display_order',
        [auctionId]
      );
      
      auction.images = images;
      
      // Cache for 5 minutes
      await cache.set(cacheKey, auction, 300);
    }
    
    // Increment view count (async, don't wait)
    query('UPDATE auctions SET view_count = view_count + 1 WHERE auction_id = ?', [auctionId])
      .catch(err => console.error('Error incrementing view count:', err));
    
    // Check if user is watching
    if (userId) {
      const watching = await query(
        'SELECT watchlist_id FROM watchlist WHERE user_id = ? AND auction_id = ?',
        [userId, auctionId]
      );
      auction.is_watching = watching.length > 0;
      
      // Check if user has bid
      const userBids = await query(
        'SELECT MAX(bid_amount) as highest_bid FROM bids WHERE bidder_id = ? AND auction_id = ?',
        [userId, auctionId]
      );
      auction.user_highest_bid = userBids[0]?.highest_bid || null;
    }
    
    res.json({
      success: true,
      data: auction
    });
    
  } catch (error) {
    next(error);
  }
};

// List Auctions with Filters
exports.listAuctions = async (req, res, next) => {
  try {
    const {
      category,
      search,
      min_price,
      max_price,
      condition,
      status = 'active',
      sort = 'end_time_asc',
      page = 1,
      limit = 50
    } = req.query;
    
    let whereConditions = ['a.status = ?'];
    let params = [status];
    
    // Category filter
    if (category) {
      whereConditions.push('a.category_id = ?');
      params.push(category);
    }
    
    // Search filter
    if (search) {
      whereConditions.push('MATCH(a.title, a.description) AGAINST(? IN NATURAL LANGUAGE MODE)');
      params.push(search);
    }
    
    // Price range
    if (min_price) {
      whereConditions.push('a.current_bid >= ? OR (a.current_bid IS NULL AND a.starting_price >= ?)');
      params.push(min_price, min_price);
    }
    if (max_price) {
      whereConditions.push('(a.current_bid <= ? OR (a.current_bid IS NULL AND a.starting_price <= ?))');
      params.push(max_price, max_price);
    }
    
    // Condition filter
    if (condition) {
      whereConditions.push('a.condition_type = ?');
      params.push(condition);
    }
    
    // Sort options
    let orderBy = 'a.end_time ASC';
    switch (sort) {
      case 'end_time_asc':
        orderBy = 'a.end_time ASC';
        break;
      case 'price_asc':
        orderBy = 'COALESCE(a.current_bid, a.starting_price) ASC';
        break;
      case 'price_desc':
        orderBy = 'COALESCE(a.current_bid, a.starting_price) DESC';
        break;
      case 'newest':
        orderBy = 'a.created_at DESC';
        break;
      case 'most_bids':
        orderBy = 'a.bid_count DESC';
        break;
    }
    
    // Pagination
    const offset = (page - 1) * limit;
    params.push(parseInt(limit), offset);
    
    // Build query
    const sql = `
      SELECT a.auction_id, a.title, a.current_bid, a.starting_price, 
             a.bid_count, a.end_time, a.status, a.free_shipping,
             ai.image_url as thumbnail,
             u.username as seller_username, u.reputation_score as seller_rating
      FROM auctions a
      LEFT JOIN auction_images ai ON a.auction_id = ai.auction_id AND ai.is_primary = TRUE
      LEFT JOIN users u ON a.seller_id = u.user_id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;
    
    const auctions = await query(sql, params);
    
    // Get total count
    const countSql = `
      SELECT COUNT(*) as total
      FROM auctions a
      WHERE ${whereConditions.join(' AND ')}
    `;
    const [{ total }] = await query(countSql, params.slice(0, -2));
    
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

// Update Auction
exports.updateAuction = async (req, res, next) => {
  try {
    const { auctionId } = req.params;
    const sellerId = req.user.userId;
    const updates = req.body;
    
    // Check ownership
    const auctions = await query(
      'SELECT seller_id, bid_count, status FROM auctions WHERE auction_id = ?',
      [auctionId]
    );
    
    if (auctions.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Auction not found' 
      });
    }
    
    const auction = auctions[0];
    
    if (auction.seller_id !== sellerId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this auction' 
      });
    }
    
    // Restrict updates if bids exist
    if (auction.bid_count > 0) {
      const allowedFields = ['description', 'shipping_cost', 'location'];
      const updateFields = Object.keys(updates);
      const hasRestrictedUpdate = updateFields.some(field => !allowedFields.includes(field));
      
      if (hasRestrictedUpdate) {
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
      if (allowedUpdates.includes(key)) {
        updateFields.push(`${key} = ?`);
        params.push(updates[key]);
      }
    });
    
    if (updateFields.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No valid fields to update' 
      });
    }
    
    params.push(auctionId);
    
    await query(
      `UPDATE auctions SET ${updateFields.join(', ')}, updated_at = NOW() WHERE auction_id = ?`,
      params
    );
    
    // Invalidate cache
    await cache.del(`auction:${auctionId}`);
    
    res.json({
      success: true,
      message: 'Auction updated successfully'
    });
    
  } catch (error) {
    next(error);
  }
};

// Delete/Cancel Auction
exports.cancelAuction = async (req, res, next) => {
  try {
    const { auctionId } = req.params;
    const sellerId = req.user.userId;
    
    const auctions = await query(
      'SELECT seller_id, bid_count, status FROM auctions WHERE auction_id = ?',
      [auctionId]
    );
    
    if (auctions.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Auction not found' 
      });
    }
    
    const auction = auctions[0];
    
    if (auction.seller_id !== sellerId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to cancel this auction' 
      });
    }
    
    if (auction.status === 'ended' || auction.status === 'sold') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot cancel completed auction' 
      });
    }
    
    if (auction.bid_count > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot cancel auction with active bids. Contact support.' 
      });
    }
    
    // Update status to cancelled
    await query(
      'UPDATE auctions SET status = "cancelled", updated_at = NOW() WHERE auction_id = ?',
      [auctionId]
    );
    
    // Invalidate cache
    await cache.del(`auction:${auctionId}`);
    
    res.json({
      success: true,
      message: 'Auction cancelled successfully'
    });
    
  } catch (error) {
    next(error);
  }
};
```

---

## 5. BIDDING SYSTEM WITH RACE CONDITION PREVENTION

### bidController.js (Critical Bidding Logic)

```javascript
const { query, executeTransaction } = require('../config/database');
const { broadcastToAuction } = require('../websocket/rooms');
const { detectFraud } = require('../services/fraudDetection');
const { cache } = require('../config/redis');

// Place Bid (WITH TRANSACTION & LOCKING)
exports.placeBid = async (req, res, next) => {
  try {
    const { auction_id, bid_amount, max_bid_amount } = req.body;
    const bidder_id = req.user.userId;
    const ip_address = req.ip;
    const user_agent = req.headers['user-agent'];
    
    // Validate input
    if (!auction_id || !bid_amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Auction ID and bid amount are required' 
      });
    }
    
    // Execute bid placement in transaction with row locking
    const result = await executeTransaction(async (connection) => {
      // LOCK auction row for update - CRITICAL FOR RACE CONDITION PREVENTION
      const [auctions] = await connection.execute(
        `SELECT a.*, u.username as seller_username
         FROM auctions a
         JOIN users u ON a.seller_id = u.user_id
         WHERE a.auction_id = ?
         FOR UPDATE`, // ROW-LEVEL LOCK
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
      const currentPrice = auction.current_bid || auction.starting_price;
      const minBid = parseFloat(currentPrice) + parseFloat(auction.bid_increment);
      
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
        [
          auction_id,
          bidder_id,
          bid_amount,
          max_bid_amount || bid_amount,
          max_bid_amount ? true : false,
          ip_address,
          user_agent
        ]
      );
      
      const bid_id = bidResult.insertId;
      
      // Mark previous winning bid as outbid
      await connection.execute(
        `UPDATE bids 
         SET is_winning_bid = FALSE, bid_status = 'outbid'
         WHERE auction_id = ? AND bid_id != ? AND is_winning_bid = TRUE`,
        [auction_id, bid_id]
      );
      
      // Update auction current bid and bid count
      await connection.execute(
        `UPDATE auctions 
         SET current_bid = ?, bid_count = bid_count + 1, updated_at = NOW()
         WHERE auction_id = ?`,
        [bid_amount, auction_id]
      );
      
      // Check if bid was placed in final minutes (auto-extend)
      if (auction.auto_extend) {
        const timeRemaining = new Date(auction.end_time) - new Date();
        const triggerTime = auction.auto_extend_trigger * 1000; // Convert to ms
        
        if (timeRemaining < triggerTime) {
          const extensionMs = auction.auto_extend_duration * 1000;
          await connection.execute(
            'UPDATE auctions SET end_time = DATE_ADD(end_time, INTERVAL ? SECOND) WHERE auction_id = ?',
            [auction.auto_extend_duration, auction_id]
          );
        }
      }
      
      return {
        bid_id,
        bid_amount,
        bidder_id,
        auction_id,
        seller_id: auction.seller_id,
        previous_bidder_id: currentWinningBid[0]?.bidder_id
      };
    });
    
    // Run fraud detection asynchronously (don't block response)
    detectFraud({
      user_id: bidder_id,
      auction_id: auction_id,
      bid_id: result.bid_id,
      bid_amount: bid_amount,
      ip_address: ip_address
    }).catch(err => console.error('Fraud detection error:', err));
    
    // Invalidate cache
    await cache.del(`auction:${auction_id}`);
    
    // Broadcast bid update via WebSocket
    broadcastToAuction(auction_id, {
      type: 'bid_update',
      data: {
        auction_id: auction_id,
        current_bid: bid_amount,
        bid_count: result.bid_count,
        bidder_username: req.user.username
      }
    });
    
    // Send notification to previous bidder (async)
    if (result.previous_bidder_id) {
      const { createNotification } = require('../services/notificationService');
      createNotification({
        user_id: result.previous_bidder_id,
        type: 'outbid',
        title: 'You\'ve been outbid!',
        message: `Someone outbid you on auction #${auction_id}`,
        link: `/auctions/${auction_id}`
      }).catch(err => console.error('Notification error:', err));
    }
    
    res.json({
      success: true,
      message: 'Bid placed successfully',
      data: {
        bid_id: result.bid_id,
        bid_amount: bid_amount,
        is_winning: true
      }
    });
    
  } catch (error) {
    // Handle specific bid errors
    if (error.message.includes('Duplicate entry')) {
      return res.status(409).json({ 
        success: false, 
        message: 'This bid amount has already been placed. Please bid higher.' 
      });
    }
    next(error);
  }
};

// Get Bid History
exports.getBidHistory = async (req, res, next) => {
  try {
    const { auctionId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const bids = await query(
      `SELECT b.bid_id, b.bid_amount, b.bid_time, b.is_winning_bid,
              CONCAT(LEFT(u.username, 1), '***', RIGHT(u.username, 1)) as bidder_username
       FROM bids b
       JOIN users u ON b.bidder_id = u.user_id
       WHERE b.auction_id = ?
       ORDER BY b.bid_time DESC
       LIMIT ? OFFSET ?`,
      [auctionId, parseInt(limit), parseInt(offset)]
    );
    
    res.json({
      success: true,
      data: bids
    });
    
  } catch (error) {
    next(error);
  }
};

// Get User's Active Bids
exports.getUserBids = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { status = 'active' } = req.query;
    
    let statusCondition = '';
    if (status === 'winning') {
      statusCondition = 'AND b.is_winning_bid = TRUE';
    } else if (status === 'outbid') {
      statusCondition = 'AND b.is_winning_bid = FALSE AND a.status = "active"';
    }
    
    const bids = await query(
      `SELECT a.auction_id, a.title, a.current_bid, a.end_time, a.status,
              b.bid_amount, b.max_bid_amount, b.is_winning_bid, b.bid_time,
              ai.image_url as thumbnail
       FROM bids b
       JOIN auctions a ON b.auction_id = a.auction_id
       LEFT JOIN auction_images ai ON a.auction_id = ai.auction_id AND ai.is_primary = TRUE
       WHERE b.bidder_id = ? AND a.status IN ('active', 'ended')
       ${statusCondition}
       ORDER BY a.end_time ASC`,
      [userId]
    );
    
    res.json({
      success: true,
      data: bids
    });
    
  } catch (error) {
    next(error);
  }
};
```

---

**Continue with Part 2: WebSocket Implementation, Fraud Detection, Email Service, and remaining backend modules...**

Would you like me to continue with:
1. WebSocket real-time bidding implementation
2. Fraud detection algorithms
3. Email notification service
4. Payment processing integration
5. Cron jobs for auction management
6. Rate limiting & security
7. Testing strategies
8. Deployment configuration