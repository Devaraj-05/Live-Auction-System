const mysql = require('mysql2/promise');

// Create connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'auction_db',
    waitForConnections: true,
    connectionLimit: 100,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    timezone: 'Z',
    multipleStatements: false,
    charset: 'utf8mb4'
});

// Test connection
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✓ MySQL Database connected successfully');
        connection.release();
    } catch (err) {
        console.error('✗ MySQL connection failed:', err.message);
        // Don't exit in development - DB might not be set up yet
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
    }
};

// Initialize connection test
testConnection();

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
async function query(sql, params = []) {
    try {
        const [rows] = await pool.execute(sql, params);
        return rows;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

// Insert helper - returns insertId
async function insert(sql, params = []) {
    try {
        const [result] = await pool.execute(sql, params);
        return result;
    } catch (error) {
        console.error('Database insert error:', error);
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
        clause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
        params
    };
}

// Pagination helper
function buildPagination(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    return {
        clause: 'LIMIT ? OFFSET ?',
        params: [parseInt(limit), offset]
    };
}

module.exports = {
    pool,
    query,
    insert,
    executeTransaction,
    buildWhereClause,
    buildPagination
};
