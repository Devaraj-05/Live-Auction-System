/* AUCTION DETAIL PAGE - API INTEGRATED */

// State
const AuctionState = {
    auction: null,
    bids: [],
    isLoading: false,
    auctionId: null
};

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    initAuctionPage();
});

async function initAuctionPage() {
    // Get auction ID from URL
    const params = new URLSearchParams(window.location.search);
    AuctionState.auctionId = params.get('id');

    if (!AuctionState.auctionId) {
        showError('Auction not found');
        return;
    }

    // Load auction data
    await loadAuction();

    // Connect WebSocket for real-time updates
    if (typeof auctionSocket !== 'undefined') {
        auctionSocket.connect();
        auctionSocket.joinAuction(AuctionState.auctionId);

        // Listen for bid updates
        auctionSocket.on('bid_update', handleBidUpdate);
        auctionSocket.on('auction_ended', handleAuctionEnded);
    }

    initGallery();
    initTabs();
    initBidForm();
    initWatchButton();
    initCountdown();
    loadBidHistory();
}

// Load auction from API
async function loadAuction() {
    AuctionState.isLoading = true;

    try {
        const result = await API.Auctions.get(AuctionState.auctionId);

        if (result.success) {
            AuctionState.auction = result.data;
            renderAuction();
        } else {
            showError('Auction not found');
        }
    } catch (error) {
        console.error('Load auction error:', error);
        showError('Error loading auction');
    }

    AuctionState.isLoading = false;
}

// Render auction details
function renderAuction() {
    const auction = AuctionState.auction;
    if (!auction) return;

    // Title
    const titleEl = document.querySelector('.auction-title');
    if (titleEl) titleEl.textContent = auction.title;

    // Price
    const priceEl = document.querySelector('.current-bid-amount');
    if (priceEl) priceEl.textContent = `$${parseFloat(auction.current_bid || auction.starting_price).toLocaleString()}`;

    // Bid count
    const bidCountEl = document.querySelector('.bid-count-value');
    if (bidCountEl) bidCountEl.textContent = `${auction.bid_count || 0} bids`;

    // Watch count
    const watchCountEl = document.querySelector('.watch-count-value');
    if (watchCountEl) watchCountEl.textContent = `${auction.watch_count || auction.total_watchers || 0} watching`;

    // Minimum bid
    const minBid = auction.current_bid
        ? parseFloat(auction.current_bid) + parseFloat(auction.bid_increment || 5)
        : parseFloat(auction.starting_price);
    const minBidEl = document.querySelector('.min-bid-amount');
    if (minBidEl) minBidEl.textContent = `$${minBid.toFixed(2)}`;

    // Update bid input
    const bidInput = document.getElementById('bidAmount');
    if (bidInput) {
        bidInput.min = minBid;
        bidInput.value = minBid;
        bidInput.placeholder = `Min: $${minBid.toFixed(2)}`;
    }

    // Description
    const descEl = document.querySelector('.auction-description');
    if (descEl) descEl.innerHTML = auction.description || '';

    // Condition
    const conditionEl = document.querySelector('.condition-value');
    if (conditionEl) conditionEl.textContent = formatCondition(auction.condition_type);

    // Seller info
    const sellerName = document.querySelector('.seller-name');
    if (sellerName) sellerName.textContent = auction.seller_username || 'Unknown Seller';

    const sellerRating = document.querySelector('.seller-rating');
    if (sellerRating) sellerRating.textContent = `⭐ ${auction.seller_rating || 0}`;

    // Images
    if (auction.images && auction.images.length > 0) {
        const mainImage = document.getElementById('mainImage');
        if (mainImage) mainImage.src = auction.images[0].image_url;

        const thumbsContainer = document.querySelector('.gallery-thumbs');
        if (thumbsContainer) {
            thumbsContainer.innerHTML = auction.images.map((img, i) => `
        <button class="gallery-thumb ${i === 0 ? 'active' : ''}" data-index="${i}">
          <img src="${img.thumbnail_url || img.image_url}" alt="Thumbnail ${i + 1}">
        </button>
      `).join('');

            thumbsContainer.querySelectorAll('.gallery-thumb').forEach(thumb => {
                thumb.addEventListener('click', () => {
                    const idx = parseInt(thumb.dataset.index);
                    mainImage.src = auction.images[idx].image_url;
                    thumbsContainer.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
                    thumb.classList.add('active');
                });
            });
        }
    }

    // User status
    if (auction.user_is_winning) {
        showBidStatus('winning', 'You are the highest bidder!');
    } else if (auction.user_highest_bid) {
        showBidStatus('outbid', `You were outbid. Your bid: $${auction.user_highest_bid}`);
    }

    // Watch button
    const watchBtn = document.getElementById('watchBtn');
    if (watchBtn && auction.is_watching) {
        watchBtn.classList.add('active');
        watchBtn.innerHTML = '❤️ Watching';
    }
}

// Bid form
function initBidForm() {
    const bidForm = document.getElementById('bidForm');
    if (!bidForm) return;

    bidForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!TokenManager?.isLoggedIn()) {
            showToast('Please login to place a bid', 'warning');
            return;
        }

        const bidAmount = parseFloat(document.getElementById('bidAmount').value);
        const maxBid = document.getElementById('maxBidAmount')?.value;

        if (!bidAmount || bidAmount <= 0) {
            showToast('Please enter a valid bid amount', 'error');
            return;
        }

        const submitBtn = bidForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Placing bid...';

        try {
            const result = await API.Bids.place(
                AuctionState.auctionId,
                bidAmount,
                maxBid ? parseFloat(maxBid) : null
            );

            if (result.success) {
                showToast('Bid placed successfully!', 'success');
                showBidStatus('winning', 'You are the highest bidder!');

                // Update UI immediately (WebSocket will also send update)
                updateBidUI(bidAmount, (AuctionState.auction?.bid_count || 0) + 1);

                // Reload to get fresh data
                setTimeout(() => loadAuction(), 1000);
            } else {
                showToast(result.message || 'Failed to place bid', 'error');
            }
        } catch (error) {
            showToast('Error placing bid', 'error');
        }

        submitBtn.disabled = false;
        submitBtn.textContent = 'Place Bid';
    });

    // Quick bid buttons
    document.querySelectorAll('.quick-bid-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const amount = parseFloat(btn.dataset.amount);
            const bidInput = document.getElementById('bidAmount');
            if (bidInput) bidInput.value = amount;
        });
    });
}

// Load bid history
async function loadBidHistory() {
    const container = document.getElementById('bidHistory');
    if (!container) return;

    try {
        const result = await API.Bids.getHistory(AuctionState.auctionId);

        if (result.success && result.data.length > 0) {
            AuctionState.bids = result.data;
            container.innerHTML = result.data.map(bid => `
        <div class="bid-history-item ${bid.is_winning_bid ? 'winning' : ''}">
          <span class="bid-history-user">${bid.bidder_username || 'Anonymous'}</span>
          <span class="bid-history-amount">$${parseFloat(bid.bid_amount).toLocaleString()}</span>
          <span class="bid-history-time">${formatTimeAgo(bid.bid_time)}</span>
        </div>
      `).join('');
        } else {
            container.innerHTML = '<p class="no-bids">No bids yet. Be the first!</p>';
        }
    } catch (error) {
        console.error('Load bid history error:', error);
    }
}

// WebSocket handlers
function handleBidUpdate(data) {
    if (String(data.auction_id) !== String(AuctionState.auctionId)) return;

    updateBidUI(data.current_bid, data.bid_count);

    // Check if current user was outbid
    if (TokenManager?.isLoggedIn()) {
        const user = TokenManager.getUser();
        if (data.bidder_username !== user?.username && AuctionState.auction?.user_is_winning) {
            showBidStatus('outbid', "You've been outbid!");
            showToast("You've been outbid!", 'warning');
        }
    }

    // Reload bid history
    loadBidHistory();
}

function handleAuctionEnded(data) {
    if (String(data.auction_id) !== String(AuctionState.auctionId)) return;

    showToast('This auction has ended', 'info');

    // Disable bid form
    const bidForm = document.getElementById('bidForm');
    if (bidForm) {
        bidForm.innerHTML = '<div class="auction-ended-msg">This auction has ended</div>';
    }

    // Reload page
    setTimeout(() => loadAuction(), 1000);
}

function updateBidUI(currentBid, bidCount) {
    const priceEl = document.querySelector('.current-bid-amount');
    if (priceEl) priceEl.textContent = `$${parseFloat(currentBid).toLocaleString()}`;

    const bidCountEl = document.querySelector('.bid-count-value');
    if (bidCountEl) bidCountEl.textContent = `${bidCount} bids`;

    // Update minimum bid
    const auction = AuctionState.auction;
    const minBid = parseFloat(currentBid) + parseFloat(auction?.bid_increment || 5);

    const minBidEl = document.querySelector('.min-bid-amount');
    if (minBidEl) minBidEl.textContent = `$${minBid.toFixed(2)}`;

    const bidInput = document.getElementById('bidAmount');
    if (bidInput) {
        bidInput.min = minBid;
        bidInput.value = minBid;
    }

    // Update state
    if (AuctionState.auction) {
        AuctionState.auction.current_bid = currentBid;
        AuctionState.auction.bid_count = bidCount;
    }
}

// Watch button
function initWatchButton() {
    const watchBtn = document.getElementById('watchBtn');
    if (!watchBtn) return;

    watchBtn.addEventListener('click', async () => {
        if (!TokenManager?.isLoggedIn()) {
            showToast('Please login to use watchlist', 'warning');
            return;
        }

        const isWatching = watchBtn.classList.contains('active');

        if (isWatching) {
            const result = await API.Users.removeFromWatchlist(AuctionState.auctionId);
            if (result.success) {
                watchBtn.classList.remove('active');
                watchBtn.innerHTML = '🤍 Watch';
                showToast('Removed from watchlist', 'info');
            }
        } else {
            const result = await API.Users.addToWatchlist(AuctionState.auctionId);
            if (result.success) {
                watchBtn.classList.add('active');
                watchBtn.innerHTML = '❤️ Watching';
                showToast('Added to watchlist', 'success');
            }
        }
    });
}

// Gallery
function initGallery() {
    // Already handled in renderAuction for dynamic images
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

// Countdown
function initCountdown() {
    setInterval(() => {
        if (!AuctionState.auction) return;

        const endTime = AuctionState.auction.end_time;
        const remaining = getTimeRemaining(endTime);

        const timerEl = document.querySelector('.auction-timer-value');
        if (timerEl) timerEl.textContent = formatTimeRemaining(remaining);

        // Countdown units
        const setUnit = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = String(val).padStart(2, '0');
        };

        setUnit('timer-days', remaining.days);
        setUnit('timer-hours', remaining.hours);
        setUnit('timer-mins', remaining.minutes);
        setUnit('timer-secs', remaining.seconds);

        // Ending soon warning
        if (remaining.total < 3600000 && remaining.total > 0) {
            document.querySelector('.bid-box')?.classList.add('ending-soon');
        }

        // Ended
        if (remaining.total <= 0) {
            handleAuctionEnded({ auction_id: AuctionState.auctionId });
        }
    }, 1000);
}

// Helpers
function showBidStatus(type, message) {
    const statusEl = document.querySelector('.bid-status');
    if (statusEl) {
        statusEl.className = `bid-status bid-status-${type}`;
        statusEl.textContent = message;
        statusEl.style.display = 'block';
    }
}

function showError(message) {
    const container = document.querySelector('.auction-main');
    if (container) {
        container.innerHTML = `<div class="error-message"><h2>${message}</h2><a href="browse.html" class="btn btn-primary">Browse Auctions</a></div>`;
    }
}

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
    if (time.days > 0) return `${time.days}d ${time.hours}h ${time.minutes}m`;
    if (time.hours > 0) return `${time.hours}h ${time.minutes}m ${time.seconds}s`;
    return `${time.minutes}m ${time.seconds}s`;
}

function formatCondition(condition) {
    const map = { new: 'New', like_new: 'Like New', used_excellent: 'Excellent', used_good: 'Good', used_fair: 'Fair', for_parts: 'For Parts' };
    return map[condition] || condition;
}

function formatTimeAgo(timestamp) {
    const diff = Date.now() - new Date(timestamp);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

function showToast(message, type = 'info') {
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
    } else {
        console.log(`Toast [${type}]: ${message}`);
    }
}

// Cleanup on page leave
window.addEventListener('beforeunload', () => {
    if (typeof auctionSocket !== 'undefined' && AuctionState.auctionId) {
        auctionSocket.leaveAuction(AuctionState.auctionId);
    }
});
