// Load environment variables first
require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const { initializeWebSocket } = require('./src/websocket');
const { initializeScheduler } = require('./src/jobs/auctionScheduler');

const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5500',
        methods: ['GET', 'POST'],
        credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
});

// Initialize WebSocket handlers
initializeWebSocket(io);

// Make io available to routes
app.set('io', io);

// Initialize scheduler
initializeScheduler(io);

// Start server
server.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════╗
║       AuctionHub Backend Server          ║
╠══════════════════════════════════════════╣
║  🚀 Server running on port ${PORT}           ║
║  📡 WebSocket enabled                    ║
║  🔄 Scheduler active                     ║
╠══════════════════════════════════════════╣
║  Environment: ${process.env.NODE_ENV || 'development'}               ║
╚══════════════════════════════════════════╝
  `);
});

// Handle graceful shutdown
const gracefulShutdown = (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);

    server.close(() => {
        console.log('HTTP server closed');

        // Close database connections
        const { pool } = require('./src/config/database');
        pool.end(() => {
            console.log('Database connections closed');
            process.exit(0);
        });
    });

    // Force close after 10 seconds
    setTimeout(() => {
        console.log('Forcing shutdown...');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = server;
