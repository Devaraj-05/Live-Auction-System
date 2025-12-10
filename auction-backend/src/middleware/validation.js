const { validationResult, body, param, query: queryValidator } = require('express-validator');

/**
 * Validation error handler middleware
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }

    next();
};

// Auth validations
const authValidation = {
    register: [
        body('username')
            .trim()
            .isLength({ min: 3, max: 50 })
            .withMessage('Username must be 3-50 characters')
            .matches(/^[a-zA-Z0-9_]+$/)
            .withMessage('Username can only contain letters, numbers, and underscores'),
        body('email')
            .trim()
            .isEmail()
            .normalizeEmail()
            .withMessage('Invalid email address'),
        body('password')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .withMessage('Password must contain uppercase, lowercase, and number'),
        body('full_name')
            .optional()
            .trim()
            .isLength({ max: 100 })
            .withMessage('Full name must be less than 100 characters'),
        handleValidationErrors
    ],

    login: [
        body('login')
            .trim()
            .notEmpty()
            .withMessage('Username or email is required'),
        body('password')
            .notEmpty()
            .withMessage('Password is required'),
        handleValidationErrors
    ]
};

// Auction validations
const auctionValidation = {
    create: [
        body('title')
            .trim()
            .isLength({ min: 5, max: 200 })
            .withMessage('Title must be 5-200 characters'),
        body('description')
            .trim()
            .isLength({ min: 20 })
            .withMessage('Description must be at least 20 characters'),
        body('category_id')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Invalid category'),
        body('condition_type')
            .isIn(['new', 'like_new', 'used_excellent', 'used_good', 'used_fair', 'for_parts'])
            .withMessage('Invalid condition type'),
        body('starting_price')
            .isFloat({ min: 0.01 })
            .withMessage('Starting price must be greater than 0'),
        body('reserve_price')
            .optional()
            .isFloat({ min: 0.01 })
            .withMessage('Reserve price must be greater than 0'),
        body('buy_now_price')
            .optional()
            .isFloat({ min: 0.01 })
            .withMessage('Buy now price must be greater than 0'),
        body('duration_days')
            .optional()
            .isInt({ min: 1, max: 30 })
            .withMessage('Duration must be 1-30 days'),
        handleValidationErrors
    ],

    update: [
        param('id')
            .isInt({ min: 1 })
            .withMessage('Invalid auction ID'),
        body('title')
            .optional()
            .trim()
            .isLength({ min: 5, max: 200 })
            .withMessage('Title must be 5-200 characters'),
        body('description')
            .optional()
            .trim()
            .isLength({ min: 20 })
            .withMessage('Description must be at least 20 characters'),
        handleValidationErrors
    ]
};

// Bid validations
const bidValidation = {
    place: [
        body('auction_id')
            .isInt({ min: 1 })
            .withMessage('Invalid auction ID'),
        body('bid_amount')
            .isFloat({ min: 0.01 })
            .withMessage('Bid amount must be greater than 0'),
        body('max_bid_amount')
            .optional()
            .isFloat({ min: 0.01 })
            .withMessage('Max bid amount must be greater than 0'),
        handleValidationErrors
    ]
};

// Message validations
const messageValidation = {
    send: [
        body('receiver_id')
            .isInt({ min: 1 })
            .withMessage('Invalid receiver ID'),
        body('message_text')
            .trim()
            .isLength({ min: 1, max: 5000 })
            .withMessage('Message must be 1-5000 characters'),
        body('auction_id')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Invalid auction ID'),
        handleValidationErrors
    ]
};

// Pagination validation
const paginationValidation = [
    queryValidator('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    queryValidator('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be 1-100'),
    handleValidationErrors
];

module.exports = {
    handleValidationErrors,
    authValidation,
    auctionValidation,
    bidValidation,
    messageValidation,
    paginationValidation
};
