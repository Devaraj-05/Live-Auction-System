/* DASHBOARD PAGE - API INTEGRATED */

document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
});

async function initDashboard() {
    // Check auth
    if (!TokenManager?.isLoggedIn()) {
        window.location.href = '../index.html';
        return;
    }

    // Connect WebSocket
    if (typeof auctionSocket !== 'undefined') {
        auctionSocket.connect();
    }

    // Load dashboard data
    await Promise.all([
        loadDashboardStats(),
        loadActiveBids(),
        loadWatchlist(),
        loadSellingAuctions()
    ]);

    initTabs();
}

// Load dashboard stats
async function loadDashboardStats() {
    try {
        const result = await API.Users.getDashboard();

        if (result.success) {
            const data = result.data;

            setStatValue('activeBidsCount', data.active_bids);
            setStatValue('winningCount', data.active_bids); // Same for now
            setStatValue('watchlistCount', data.watchlist_count);
            setStatValue('sellingCount', data.selling_count);
        }
    } catch (error) {
        console.error('Load stats error:', error);
    }
}

function setStatValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value || 0;
}

// Load active bids
async function loadActiveBids() {
    const container = document.getElementById('activeBidsList');
    if (!container) return;

    try {
        const result = await API.Bids.getMyBids('winning');

        if (result.success && result.data.length > 0) {
            container.innerHTML = result.data.map(bid => renderBidItem(bid)).join('');
        } else {
            container.innerHTML = '<div class="empty-state">No active bids</div>';
        }
    } catch (error) {
        container.innerHTML = '<div class="empty-state">Error loading bids</div>';
    }
}

// Load watchlist
async function loadWatchlist() {
    const container = document.getElementById('watchlistItems');
    if (!container) return;

    try {
        const result = await API.Users.getWatchlist();

        if (result.success && result.data.length > 0) {
            container.innerHTML = result.data.map(item => renderWatchlistItem(item)).join('');
        } else {
            container.innerHTML = '<div class="empty-state">Your watchlist is empty</div>';
        }
    } catch (error) {
        container.innerHTML = '<div class="empty-state">Error loading watchlist</div>';
    }
}

// Load selling auctions
async function loadSellingAuctions() {
    const container = document.getElementById('sellingList');
    if (!container) return;

    try {
        const user = TokenManager.getUser();
        const result = await API.Auctions.list({ seller_id: user?.user_id, status: 'active' });

        if (result.success && result.data.auctions.length > 0) {
            container.innerHTML = result.data.auctions.map(item => renderSellingItem(item)).join('');
        } else {
            container.innerHTML = '<div class="empty-state">You have no active listings</div>';
        }
    } catch (error) {
        container.innerHTML = '<div class="empty-state">Error loading listings</div>';
    }
}

// Render functions
function renderBidItem(bid) {
    const price = bid.current_bid || bid.starting_price;
    const remaining = getTimeRemaining(bid.end_time);

    return `
    <div class="bid-item ${bid.is_winning_bid ? 'winning' : 'outbid'}">
      <img src="${bid.thumbnail || 'https://via.placeholder.com/80'}" alt="${bid.title}" class="bid-item-image">
      <div class="bid-item-info">
        <h4>${bid.title}</h4>
        <div class="bid-item-meta">
          <span class="status ${bid.is_winning_bid ? 'winning' : 'outbid'}">
            ${bid.is_winning_bid ? '✓ Winning' : '⚠ Outbid'}
          </span>
          <span class="timer" data-end="${bid.end_time}">${formatTimeRemaining(remaining)}</span>
        </div>
      </div>
      <div class="bid-item-price">
        <div class="current">$${parseFloat(price).toLocaleString()}</div>
        <div class="your-bid">Your bid: $${parseFloat(bid.bid_amount).toLocaleString()}</div>
      </div>
      <a href="auction.html?id=${bid.auction_id}" class="btn btn-sm btn-primary">View</a>
    </div>
  `;
}

function renderWatchlistItem(item) {
    const price = item.current_bid || item.starting_price;
    const remaining = getTimeRemaining(item.end_time);

    return `
    <div class="watchlist-item">
      <img src="${item.thumbnail || 'https://via.placeholder.com/80'}" alt="${item.title}" class="watchlist-item-image">
      <div class="watchlist-item-info">
        <h4>${item.title}</h4>
        <div class="watchlist-item-meta">
          <span>$${parseFloat(price).toLocaleString()}</span>
          <span class="timer" data-end="${item.end_time}">${formatTimeRemaining(remaining)}</span>
        </div>
      </div>
      <div class="watchlist-item-actions">
        <a href="auction.html?id=${item.auction_id}" class="btn btn-sm btn-orange">Bid Now</a>
        <button class="btn btn-sm btn-ghost" onclick="removeFromWatchlist(${item.auction_id}, this)">Remove</button>
      </div>
    </div>
  `;
}

function renderSellingItem(item) {
    const price = item.current_bid || item.starting_price;
    const remaining = getTimeRemaining(item.end_time);

    return `
    <div class="selling-item">
      <img src="${item.thumbnail || 'https://via.placeholder.com/80'}" alt="${item.title}" class="selling-item-image">
      <div class="selling-item-info">
        <h4>${item.title}</h4>
        <div class="selling-item-meta">
          <span>${item.bid_count || 0} bids</span>
          <span class="timer" data-end="${item.end_time}">${formatTimeRemaining(remaining)}</span>
        </div>
      </div>
      <div class="selling-item-price">$${parseFloat(price).toLocaleString()}</div>
      <a href="auction.html?id=${item.auction_id}" class="btn btn-sm btn-outline">Manage</a>
    </div>
  `;
}

// Remove from watchlist
async function removeFromWatchlist(auctionId, btn) {
    const result = await API.Users.removeFromWatchlist(auctionId);
    if (result.success) {
        btn.closest('.watchlist-item')?.remove();
        showToast('Removed from watchlist', 'info');
    }
}

// Tabs
function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;

            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(tabId)?.classList.add('active');
        });
    });
}

// Helpers
function getTimeRemaining(endTime) {
    const total = new Date(endTime) - new Date();
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    return { total, days, hours, minutes, seconds };
}

function formatTimeRemaining(time) {
    if (time.total <= 0) return 'Ended';
    if (time.days > 0) return `${time.days}d ${time.hours}h`;
    if (time.hours > 0) return `${time.hours}h ${time.minutes}m`;
    return `${time.minutes}m ${time.seconds}s`;
}

function showToast(message, type = 'info') {
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
    }
}

// Update timers
setInterval(() => {
    document.querySelectorAll('[data-end]').forEach(timer => {
        const remaining = getTimeRemaining(timer.dataset.end);
        timer.textContent = formatTimeRemaining(remaining);
    });
}, 1000);
