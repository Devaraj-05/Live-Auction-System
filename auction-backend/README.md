# AuctionHub Backend API

Real-time auction platform backend built with Node.js, Express, MySQL, and WebSocket.

## Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- Redis (optional, falls back to in-memory cache)

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure your database in .env
```

### Database Setup

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE auction_db"

# Run migrations
mysql -u root -p auction_db < src/db/migrations/001_initial_schema.sql

# Seed sample data (optional)
mysql -u root -p auction_db < src/db/seeds/sample_data.sql
```

### Run Server

```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

Server runs at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/profile` - Get profile (auth required)

### Auctions
- `GET /api/auctions` - List auctions (with filters)
- `GET /api/auctions/:id` - Get auction details
- `POST /api/auctions` - Create auction (auth required)
- `PUT /api/auctions/:id` - Update auction (owner only)
- `DELETE /api/auctions/:id` - Cancel auction (owner only)
- `GET /api/auctions/categories` - Get categories

### Bids
- `POST /api/bids` - Place bid (auth required)
- `GET /api/bids/auction/:auctionId` - Get bid history
- `GET /api/bids/my-bids` - Get user's bids (auth required)

### Users
- `GET /api/users/:id` - Get public profile
- `GET /api/users/me/watchlist` - Get watchlist (auth required)
- `POST /api/users/me/watchlist` - Add to watchlist
- `DELETE /api/users/me/watchlist/:auctionId` - Remove from watchlist
- `GET /api/users/me/notifications` - Get notifications
- `GET /api/users/me/dashboard` - Get dashboard stats

### Messages
- `GET /api/messages/conversations` - Get conversations
- `GET /api/messages/conversations/:id` - Get messages
- `POST /api/messages/send` - Send message

## WebSocket Events

### Client → Server
- `join_auction` - Join auction room for live updates
- `leave_auction` - Leave auction room

### Server → Client
- `bid_update` - New bid placed
- `auction_ended` - Auction completed
- `outbid` - User was outbid
- `notification` - New notification

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| DB_HOST | MySQL host | localhost |
| DB_NAME | Database name | auction_db |
| JWT_SECRET | JWT signing key | - |
| REDIS_HOST | Redis host (optional) | localhost |
| CORS_ORIGIN | Frontend URL | http://localhost:5500 |

## Project Structure

```
auction-backend/
├── src/
│   ├── config/      # Database, Redis, constants
│   ├── controllers/ # Route handlers
│   ├── middleware/  # Auth, validation, rate limit
│   ├── routes/      # API routes
│   ├── services/    # Email, notifications, fraud
│   ├── websocket/   # Socket.io handlers
│   ├── jobs/        # Cron schedulers
│   └── app.js       # Express configuration
├── server.js        # Entry point
└── package.json
```

## License

MIT
