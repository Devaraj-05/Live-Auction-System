/* LIVE AUCTION SYSTEM - API SERVICE */

const API_BASE = 'http://localhost:3000/api';

// Token management
const TokenManager = {
    getAccessToken: () => localStorage.getItem('accessToken'),
    getRefreshToken: () => localStorage.getItem('refreshToken'),
    setTokens: (access, refresh) => {
        localStorage.setItem('accessToken', access);
        if (refresh) localStorage.setItem('refreshToken', refresh);
    },
    clearTokens: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    },
    getUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },
    setUser: (user) => localStorage.setItem('user', JSON.stringify(user)),
    isLoggedIn: () => !!localStorage.getItem('accessToken')
};

// API Request helper
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    // Add auth token if available
    const token = TokenManager.getAccessToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers
        });

        // Handle token expiry
        if (response.status === 401) {
            const data = await response.json();
            if (data.code === 'TOKEN_EXPIRED') {
                // Try to refresh token
                const refreshed = await refreshAccessToken();
                if (refreshed) {
                    // Retry original request
                    headers['Authorization'] = `Bearer ${TokenManager.getAccessToken()}`;
                    return fetch(url, { ...options, headers }).then(r => r.json());
                } else {
                    // Logout user
                    TokenManager.clearTokens();
                    window.location.href = '/index.html';
                    return null;
                }
            }
        }

        return await response.json();
    } catch (error) {
        console.error('API Request failed:', error);
        return { success: false, message: 'Network error. Please try again.' };
    }
}

// Refresh access token
async function refreshAccessToken() {
    const refreshToken = TokenManager.getRefreshToken();
    if (!refreshToken) return false;

    try {
        const response = await fetch(`${API_BASE}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
        });

        const data = await response.json();
        if (data.success) {
            TokenManager.setTokens(data.data.accessToken);
            return true;
        }
        return false;
    } catch {
        return false;
    }
}

// ========== AUTH API ==========
const AuthAPI = {
    async register(username, email, password, fullName = '') {
        return apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password, full_name: fullName })
        });
    },

    async login(login, password) {
        const result = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ login, password })
        });

        if (result.success) {
            TokenManager.setTokens(result.data.accessToken, result.data.refreshToken);
            TokenManager.setUser(result.data.user);
        }
        return result;
    },

    async logout() {
        await apiRequest('/auth/logout', {
            method: 'POST',
            body: JSON.stringify({ refreshToken: TokenManager.getRefreshToken() })
        });
        TokenManager.clearTokens();
    },

    async getProfile() {
        return apiRequest('/auth/profile');
    },

    async updateProfile(data) {
        return apiRequest('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }
};

// ========== AUCTIONS API ==========
const AuctionsAPI = {
    async list(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/auctions${query ? '?' + query : ''}`);
    },

    async get(id) {
        return apiRequest(`/auctions/${id}`);
    },

    async create(auctionData) {
        return apiRequest('/auctions', {
            method: 'POST',
            body: JSON.stringify(auctionData)
        });
    },

    async update(id, data) {
        return apiRequest(`/auctions/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    async cancel(id) {
        return apiRequest(`/auctions/${id}`, { method: 'DELETE' });
    },

    async getCategories() {
        return apiRequest('/auctions/categories');
    }
};

// ========== BIDS API ==========
const BidsAPI = {
    async place(auctionId, bidAmount, maxBidAmount = null) {
        return apiRequest('/bids', {
            method: 'POST',
            body: JSON.stringify({
                auction_id: auctionId,
                bid_amount: bidAmount,
                max_bid_amount: maxBidAmount
            })
        });
    },

    async getHistory(auctionId, limit = 50) {
        return apiRequest(`/bids/auction/${auctionId}?limit=${limit}`);
    },

    async getMyBids(status = '') {
        return apiRequest(`/bids/my-bids${status ? '?status=' + status : ''}`);
    }
};

// ========== USERS API ==========
const UsersAPI = {
    async getUser(id) {
        return apiRequest(`/users/${id}`);
    },

    async getWatchlist() {
        return apiRequest('/users/me/watchlist');
    },

    async addToWatchlist(auctionId) {
        return apiRequest('/users/me/watchlist', {
            method: 'POST',
            body: JSON.stringify({ auction_id: auctionId })
        });
    },

    async removeFromWatchlist(auctionId) {
        return apiRequest(`/users/me/watchlist/${auctionId}`, { method: 'DELETE' });
    },

    async getNotifications(unreadOnly = false) {
        return apiRequest(`/users/me/notifications${unreadOnly ? '?unread_only=true' : ''}`);
    },

    async markNotificationsRead(ids = null) {
        return apiRequest('/users/me/notifications/read', {
            method: 'POST',
            body: JSON.stringify({ notification_ids: ids })
        });
    },

    async getDashboard() {
        return apiRequest('/users/me/dashboard');
    }
};

// ========== MESSAGES API ==========
const MessagesAPI = {
    async getConversations() {
        return apiRequest('/messages/conversations');
    },

    async getMessages(conversationId) {
        return apiRequest(`/messages/conversations/${conversationId}`);
    },

    async send(receiverId, messageText, auctionId = null) {
        return apiRequest('/messages/send', {
            method: 'POST',
            body: JSON.stringify({
                receiver_id: receiverId,
                message_text: messageText,
                auction_id: auctionId
            })
        });
    },

    async getUnreadCount() {
        return apiRequest('/messages/unread-count');
    }
};

// ========== WEBSOCKET ==========
class AuctionSocket {
    constructor() {
        this.socket = null;
        this.listeners = new Map();
    }

    connect() {
        if (this.socket) return;

        // Load Socket.io client
        if (!window.io) {
            const script = document.createElement('script');
            script.src = 'https://cdn.socket.io/4.7.2/socket.io.min.js';
            script.onload = () => this._initSocket();
            document.head.appendChild(script);
        } else {
            this._initSocket();
        }
    }

    _initSocket() {
        this.socket = io('http://localhost:3000', {
            auth: { token: TokenManager.getAccessToken() },
            transports: ['websocket', 'polling']
        });

        this.socket.on('connect', () => {
            console.log('WebSocket connected');
        });

        this.socket.on('bid_update', (data) => {
            this._emit('bid_update', data);
        });

        this.socket.on('outbid', (data) => {
            this._emit('outbid', data);
            showToast("You've been outbid!", 'warning');
        });

        this.socket.on('notification', (data) => {
            this._emit('notification', data);
            showToast(data.message, 'info');
        });

        this.socket.on('auction_ended', (data) => {
            this._emit('auction_ended', data);
        });
    }

    joinAuction(auctionId) {
        if (this.socket) {
            this.socket.emit('join_auction', auctionId);
        }
    }

    leaveAuction(auctionId) {
        if (this.socket) {
            this.socket.emit('leave_auction', auctionId);
        }
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const idx = callbacks.indexOf(callback);
            if (idx > -1) callbacks.splice(idx, 1);
        }
    }

    _emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(cb => cb(data));
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

// Create singleton instance
const auctionSocket = new AuctionSocket();

// Export to window
window.API = {
    Auth: AuthAPI,
    Auctions: AuctionsAPI,
    Bids: BidsAPI,
    Users: UsersAPI,
    Messages: MessagesAPI
};
window.TokenManager = TokenManager;
window.auctionSocket = auctionSocket;
