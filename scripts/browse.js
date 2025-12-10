/* BROWSE PAGE - API INTEGRATED */

// State
const BrowseState = {
    auctions: [],
    filters: {
        category: null,
        search: '',
        min_price: null,
        max_price: null,
        condition: null,
        sort: 'end_time_asc'
    },
    pagination: {
        page: 1,
        limit: 12,
        total: 0,
        pages: 0
    },
    viewMode: 'grid',
    isLoading: false
};

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    initBrowsePage();
});

async function initBrowsePage() {
    parseUrlParams();
    initFilters();
    initViewToggle();
    initSorting();
    initMobileFilters();
    await loadAuctions();
    initCountdowns();

    // Connect WebSocket if logged in
    if (typeof auctionSocket !== 'undefined' && TokenManager?.isLoggedIn()) {
        auctionSocket.connect();
    }
}

// Parse URL parameters
function parseUrlParams() {
    const params = new URLSearchParams(window.location.search);

    if (params.has('category')) BrowseState.filters.category = params.get('category');
    if (params.has('search')) BrowseState.filters.search = params.get('search');
    if (params.has('q')) BrowseState.filters.search = params.get('q');
    if (params.has('min_price')) BrowseState.filters.min_price = params.get('min_price');
    if (params.has('max_price')) BrowseState.filters.max_price = params.get('max_price');
    if (params.has('condition')) BrowseState.filters.condition = params.get('condition');
    if (params.has('sort')) BrowseState.filters.sort = params.get('sort');

    // Update search input
    const searchInput = document.getElementById('browseSearch');
    if (searchInput && BrowseState.filters.search) {
        searchInput.value = BrowseState.filters.search;
    }
}

// Load auctions from API
async function loadAuctions() {
    const container = document.getElementById('auctionResults');
    if (!container) return;

    BrowseState.isLoading = true;
    container.innerHTML = '<div class="loading-spinner">Loading auctions...</div>';

    // Build API params
    const params = {
        status: 'active',
        page: BrowseState.pagination.page,
        limit: BrowseState.pagination.limit,
        sort: BrowseState.filters.sort
    };

    if (BrowseState.filters.category) params.category = BrowseState.filters.category;
    if (BrowseState.filters.search) params.search = BrowseState.filters.search;
    if (BrowseState.filters.min_price) params.min_price = BrowseState.filters.min_price;
    if (BrowseState.filters.max_price) params.max_price = BrowseState.filters.max_price;
    if (BrowseState.filters.condition) params.condition = BrowseState.filters.condition;

    try {
        const result = await API.Auctions.list(params);

        if (result.success) {
            BrowseState.auctions = result.data.auctions;
            BrowseState.pagination = { ...BrowseState.pagination, ...result.data.pagination };
            renderAuctions();
            renderPagination();
            updateResultsCount();
        } else {
            container.innerHTML = '<div class="no-results">Unable to load auctions. Please try again.</div>';
        }
    } catch (error) {
        console.error('Load auctions error:', error);
        container.innerHTML = '<div class="no-results">Error loading auctions.</div>';
    }

    BrowseState.isLoading = false;
}

// Render auctions
function renderAuctions() {
    const container = document.getElementById('auctionResults');
    if (!container) return;

    if (BrowseState.auctions.length === 0) {
        container.innerHTML = `
      <div class="no-results">
        <h3>No auctions found</h3>
        <p>Try adjusting your filters or search terms.</p>
        <button class="btn btn-primary" onclick="clearFilters()">Clear Filters</button>
      </div>
    `;
        return;
    }

    container.className = `auction-${BrowseState.viewMode}`;
    container.innerHTML = BrowseState.auctions.map(auction => renderAuctionCard(auction)).join('');
    attachCardListeners(container);
}

// Render auction card
function renderAuctionCard(auction) {
    const id = auction.auction_id || auction.id;
    const price = auction.current_bid || auction.starting_price;
    const bids = auction.bid_count || 0;
    const image = auction.thumbnail || 'https://via.placeholder.com/400x300';
    const endTime = auction.end_time;

    const timeRemaining = getTimeRemaining(endTime);
    const isEndingSoon = timeRemaining.total < 3600000 && timeRemaining.total > 0;

    const badges = [];
    if (isEndingSoon) badges.push('ending');
    if (bids > 20) badges.push('hot');
    if (auction.free_shipping) badges.push('free-shipping');

    if (BrowseState.viewMode === 'list') {
        return `
      <div class="auction-list-item" data-id="${id}">
        <img src="${image}" alt="${auction.title}" class="auction-list-image" loading="lazy">
        <div class="auction-list-content">
          <h3 class="auction-list-title">${auction.title}</h3>
          <div class="auction-list-meta">
            <span>🔨 ${bids} bids</span>
            ${auction.seller_username ? `<span>👤 ${auction.seller_username}</span>` : ''}
            ${auction.condition_type ? `<span>📦 ${formatCondition(auction.condition_type)}</span>` : ''}
          </div>
          <div class="auction-list-timer ${isEndingSoon ? 'ending-soon' : ''}" data-end="${endTime}">
            ⏰ <span class="timer-text">${formatTimeRemaining(timeRemaining)}</span>
          </div>
        </div>
        <div class="auction-list-actions">
          <div class="auction-list-price">$${parseFloat(price).toLocaleString()}</div>
          <a href="auction.html?id=${id}" class="btn btn-orange btn-sm">Bid Now</a>
        </div>
      </div>
    `;
    }

    return `
    <div class="auction-card" data-id="${id}">
      <div class="auction-card-image">
        <img src="${image}" alt="${auction.title}" loading="lazy">
        <div class="auction-card-badges">
          ${badges.map(b => `<span class="badge badge-${b}">${getBadgeLabel(b)}</span>`).join('')}
        </div>
        <button class="auction-card-watch" data-id="${id}" aria-label="Watch">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>
      <div class="auction-card-content">
        <h3 class="auction-card-title">${auction.title}</h3>
        <div class="auction-card-price">$${parseFloat(price).toLocaleString()}</div>
        <div class="auction-card-timer ${isEndingSoon ? 'ending-soon' : ''}" data-end="${endTime}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <span class="timer-text">${formatTimeRemaining(timeRemaining)}</span>
        </div>
        <div class="auction-card-meta">
          <span>🔨 ${bids} bids</span>
        </div>
      </div>
    </div>
  `;
}

// Attach card click listeners
function attachCardListeners(container) {
    container.querySelectorAll('.auction-card, .auction-list-item').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.auction-card-watch')) return;
            window.location.href = `auction.html?id=${card.dataset.id}`;
        });
    });

    container.querySelectorAll('.auction-card-watch').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            await toggleWatchlist(id, btn);
        });
    });
}

// Toggle watchlist
async function toggleWatchlist(id, btn) {
    if (typeof TokenManager === 'undefined' || !TokenManager.isLoggedIn()) {
        showToast('Please login to use watchlist', 'warning');
        return;
    }

    const isActive = btn.classList.contains('active');

    if (isActive) {
        const result = await API.Users.removeFromWatchlist(id);
        if (result.success) {
            btn.classList.remove('active');
            btn.querySelector('svg').setAttribute('fill', 'none');
            showToast('Removed from watchlist', 'info');
        }
    } else {
        const result = await API.Users.addToWatchlist(id);
        if (result.success) {
            btn.classList.add('active');
            btn.querySelector('svg').setAttribute('fill', 'currentColor');
            showToast('Added to watchlist', 'success');
        }
    }
}

// Filters
function initFilters() {
    // Category checkboxes
    document.querySelectorAll('.filter-category input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', () => {
            if (cb.checked) {
                BrowseState.filters.category = cb.value;
                document.querySelectorAll('.filter-category input[type="checkbox"]').forEach(other => {
                    if (other !== cb) other.checked = false;
                });
            } else {
                BrowseState.filters.category = null;
            }
            BrowseState.pagination.page = 1;
            loadAuctions();
        });
    });

    // Condition
    document.querySelectorAll('.filter-condition input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', () => {
            if (cb.checked) {
                BrowseState.filters.condition = cb.value;
            } else {
                BrowseState.filters.condition = null;
            }
            BrowseState.pagination.page = 1;
            loadAuctions();
        });
    });

    // Price range
    const minPrice = document.getElementById('minPrice');
    const maxPrice = document.getElementById('maxPrice');
    const applyPrice = document.getElementById('applyPriceFilter');

    if (applyPrice) {
        applyPrice.addEventListener('click', () => {
            BrowseState.filters.min_price = minPrice?.value || null;
            BrowseState.filters.max_price = maxPrice?.value || null;
            BrowseState.pagination.page = 1;
            loadAuctions();
        });
    }

    // Search
    const searchInput = document.getElementById('browseSearch');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                BrowseState.filters.search = searchInput.value.trim();
                BrowseState.pagination.page = 1;
                loadAuctions();
            }
        });
    }
}

// View toggle
function initViewToggle() {
    document.querySelectorAll('.view-toggle button').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.view-toggle button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            BrowseState.viewMode = btn.dataset.view;
            renderAuctions();
        });
    });
}

// Sorting
function initSorting() {
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            BrowseState.filters.sort = sortSelect.value;
            BrowseState.pagination.page = 1;
            loadAuctions();
        });
    }
}

// Mobile filters
function initMobileFilters() {
    const filterBtn = document.getElementById('mobileFilterBtn');
    const filterOverlay = document.getElementById('filterOverlay');
    const closeBtn = filterOverlay?.querySelector('.filter-close');

    if (filterBtn && filterOverlay) {
        filterBtn.addEventListener('click', () => filterOverlay.classList.add('active'));
        closeBtn?.addEventListener('click', () => filterOverlay.classList.remove('active'));
        filterOverlay.addEventListener('click', (e) => {
            if (e.target === filterOverlay) filterOverlay.classList.remove('active');
        });
    }
}

// Pagination
function renderPagination() {
    const container = document.getElementById('pagination');
    if (!container) return;

    const { page, pages } = BrowseState.pagination;

    if (pages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '';

    // Previous
    html += `<button class="btn btn-outline btn-sm" ${page === 1 ? 'disabled' : ''} onclick="goToPage(${page - 1})">← Prev</button>`;

    // Page numbers
    const start = Math.max(1, page - 2);
    const end = Math.min(pages, page + 2);

    if (start > 1) html += `<button class="btn btn-outline btn-sm" onclick="goToPage(1)">1</button>`;
    if (start > 2) html += `<span class="pagination-ellipsis">...</span>`;

    for (let i = start; i <= end; i++) {
        html += `<button class="btn ${i === page ? 'btn-primary' : 'btn-outline'} btn-sm" onclick="goToPage(${i})">${i}</button>`;
    }

    if (end < pages - 1) html += `<span class="pagination-ellipsis">...</span>`;
    if (end < pages) html += `<button class="btn btn-outline btn-sm" onclick="goToPage(${pages})">${pages}</button>`;

    // Next
    html += `<button class="btn btn-outline btn-sm" ${page === pages ? 'disabled' : ''} onclick="goToPage(${page + 1})">Next →</button>`;

    container.innerHTML = html;
}

function goToPage(page) {
    BrowseState.pagination.page = page;
    loadAuctions();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Results count
function updateResultsCount() {
    const countEl = document.getElementById('resultsCount');
    if (countEl) {
        countEl.textContent = `${BrowseState.pagination.total} results`;
    }
}

// Clear filters
function clearFilters() {
    BrowseState.filters = { category: null, search: '', min_price: null, max_price: null, condition: null, sort: 'end_time_asc' };
    BrowseState.pagination.page = 1;
    document.querySelectorAll('.filter-section input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.querySelectorAll('.filter-section input[type="text"], .filter-section input[type="number"]').forEach(i => i.value = '');
    loadAuctions();
}

// Countdowns
function initCountdowns() {
    setInterval(() => {
        document.querySelectorAll('[data-end]').forEach(timer => {
            const remaining = getTimeRemaining(timer.dataset.end);
            const text = timer.querySelector('.timer-text') || timer;
            text.textContent = formatTimeRemaining(remaining);
            if (remaining.total < 3600000 && remaining.total > 0) timer.classList.add('ending-soon');
        });
    }, 1000);
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
    if (time.days > 0) return `${time.days}d ${time.hours}h left`;
    if (time.hours > 0) return `${time.hours}h ${time.minutes}m left`;
    return `${time.minutes}m ${time.seconds}s left`;
}

function getBadgeLabel(badge) {
    const labels = { hot: '🔥 HOT', new: '✨ NEW', ending: '⏰ ENDING', 'free-shipping': '🚚 FREE' };
    return labels[badge] || badge.toUpperCase();
}

function formatCondition(condition) {
    const map = { new: 'New', like_new: 'Like New', used_excellent: 'Excellent', used_good: 'Good', used_fair: 'Fair', for_parts: 'Parts' };
    return map[condition] || condition;
}

function showToast(message, type = 'info') {
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
    } else {
        alert(message);
    }
}
