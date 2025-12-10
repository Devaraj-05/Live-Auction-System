// Redis client - optional, falls back to in-memory cache if not available
let Redis;
let redisClient = null;
let cache;

try {
    Redis = require('ioredis');

    redisClient = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        db: 0,
        retryStrategy: (times) => {
            if (times > 3) {
                console.log('Redis connection failed, using in-memory cache');
                return null; // Stop retrying
            }
            return Math.min(times * 100, 2000);
        },
        maxRetriesPerRequest: 3,
        lazyConnect: true
    });

    redisClient.on('connect', () => {
        console.log('✓ Redis connected successfully');
    });

    redisClient.on('error', (err) => {
        if (err.code !== 'ECONNREFUSED') {
            console.error('Redis error:', err.message);
        }
    });

    // Try to connect
    redisClient.connect().catch(() => {
        console.log('Redis not available, using in-memory cache fallback');
        redisClient = null;
    });

} catch (err) {
    console.log('Redis not installed, using in-memory cache');
}

// In-memory cache fallback
const memoryCache = new Map();
const memoryCacheTTL = new Map();

// Cache interface (works with Redis or in-memory)
cache = {
    async get(key) {
        try {
            if (redisClient && redisClient.status === 'ready') {
                const data = await redisClient.get(key);
                return data ? JSON.parse(data) : null;
            }

            // In-memory fallback
            if (memoryCacheTTL.has(key) && memoryCacheTTL.get(key) < Date.now()) {
                memoryCache.delete(key);
                memoryCacheTTL.delete(key);
                return null;
            }
            const data = memoryCache.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Cache GET error:', error);
            return null;
        }
    },

    async set(key, value, ttl = 3600) {
        try {
            const jsonValue = JSON.stringify(value);

            if (redisClient && redisClient.status === 'ready') {
                await redisClient.setex(key, ttl, jsonValue);
                return true;
            }

            // In-memory fallback
            memoryCache.set(key, jsonValue);
            memoryCacheTTL.set(key, Date.now() + (ttl * 1000));
            return true;
        } catch (error) {
            console.error('Cache SET error:', error);
            return false;
        }
    },

    async del(key) {
        try {
            if (redisClient && redisClient.status === 'ready') {
                await redisClient.del(key);
                return true;
            }

            // In-memory fallback
            memoryCache.delete(key);
            memoryCacheTTL.delete(key);
            return true;
        } catch (error) {
            console.error('Cache DEL error:', error);
            return false;
        }
    },

    async exists(key) {
        try {
            if (redisClient && redisClient.status === 'ready') {
                return await redisClient.exists(key);
            }

            // In-memory fallback
            if (memoryCacheTTL.has(key) && memoryCacheTTL.get(key) < Date.now()) {
                memoryCache.delete(key);
                memoryCacheTTL.delete(key);
                return false;
            }
            return memoryCache.has(key);
        } catch (error) {
            console.error('Cache EXISTS error:', error);
            return false;
        }
    },

    async flush() {
        try {
            if (redisClient && redisClient.status === 'ready') {
                await redisClient.flushdb();
                return true;
            }
            memoryCache.clear();
            memoryCacheTTL.clear();
            return true;
        } catch (error) {
            console.error('Cache FLUSH error:', error);
            return false;
        }
    }
};

module.exports = { redisClient, cache };
