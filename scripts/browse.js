/* LIVE AUCTION SYSTEM - BROWSE PAGE JS */

// Extended sample data
const ALL_AUCTIONS = [
    ...window.SAMPLE_AUCTIONS || [],
    { id: 13, title: 'Apple Watch Ultra 2', price: 650, bids: 19, watchers: 87, endTime: '2025-12-14T10:00:00', image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&h=300&fit=crop', badges: ['new'], seller: 'gadget_world', rating: 4.8, category: 'electronics' },
    { id: 14, title: 'Vintage Leica M6 Camera', price: 2200, bids: 31, watchers: 145, endTime: '2025-12-13T16:00:00', image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop', badges: ['hot'], seller: 'camera_pro', rating: 5.0, category: 'electronics' },
    { id: 15, title: 'Gucci Leather Handbag', price: 890, bids: 25, watchers: 198, endTime: '2025-12-12T20:00:00', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=300&fit=crop', badges: [], seller: 'luxe_fashion', rating: 4.9, category: 'fashion' },
    { id: 16, title: 'Pokemon Charizard 1st Edition', price: 4500, bids: 67, watchers: 456, endTime: '2025-12-15T12:00:00', image: 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=400&h=300&fit=crop', badges: ['hot'], seller: 'card_collector', rating: 4.7, category: 'collectibles' },
    { id: 17, title: 'Original Oil Painting Abstract', price: 1200, bids: 12, watchers: 56, endTime: '2025-12-16T18:00:00', image: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=400&h=300&fit=crop', badges: ['new'], seller: 'art_gallery', rating: 4.8, category: 'art' },
    { id: 18, title: 'Diamond Engagement Ring 1ct', price: 3800, bids: 28, watchers: 89, endTime: '2025-12-14T14:00:00', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=300&fit=crop', badges: ['reserve'], seller: 'jewel_box', rating: 5.0, category: 'jewelry' },
    { id: 19, title: 'Harley Davidson Sportster 2019', price: 8900, bids: 15, watchers: 234, endTime: '2025-12-18T10:00:00', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop', badges: [], seller: 'moto_deals', rating: 4.6, category: 'vehicles' },
    { id: 20, title: 'Vintage Omega Seamaster', price: 2100, bids: 34, watchers: 178, endTime: '2025-12-13T22:00:00', image: 'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=400&h=300&fit=crop', badges: ['hot'], seller: 'time_keeper', rating: 4.9, category: 'jewelry' }
];

let currentView = 'grid';
let currentSort = 'ending';
let currentFilters = { categories: [], priceMin: null, priceMax: null, status: [], condition: [], rating: null, shipping: [] };

document.addEventListener('DOMContentLoaded', () => {
    initBrowsePage();
});

function initBrowsePage() {
    renderAuctions();
    initFilterToggles();
    initViewToggle();
    initSortSelect();
    initMobileFilters();
    initFilterInputs();
}

function renderAuctions() {
    const grid = document.getElementById('auctionGrid');
    if (!grid) return;

    let auctions = filterAuctions(ALL_AUCTIONS);
    auctions = sortAuctions(auctions, currentSort);

    grid.className = `auction-grid ${currentView === 'list' ? 'list-view' : ''}`;
    grid.innerHTML = auctions.map(renderAuctionCard).join('');
    attachCardListeners(grid);
    updateResultsCount(auctions.length);
}

function renderAuctionCard(auction) {
    const isWatched = window.AppState?.watchlist?.includes(auction.id);
    const timeRemaining = getTimeRemaining(auction.endTime);
    const isEndingSoon = timeRemaining.total < 3600000;

    return `
    <div class="auction-card" data-id="${auction.id}">
      <div class="auction-card-image">
        <img src="${auction.image}" alt="${auction.title}" loading="lazy">
        <div class="auction-card-badges">
          ${(auction.badges || []).map(b => `<span class="badge badge-${b}">${getBadgeLabel(b)}</span>`).join('')}
        </div>
        <button class="auction-card-watch ${isWatched ? 'active' : ''}" data-id="${auction.id}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="${isWatched ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>
      <div class="auction-card-content">
        <h3 class="auction-card-title">${auction.title}</h3>
        <div class="auction-card-price">$${auction.price.toLocaleString()}</div>
        <div class="auction-card-timer ${isEndingSoon ? 'ending-soon' : ''}" data-end="${auction.endTime}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <span class="timer-text">${formatTimeRemaining(timeRemaining)}</span>
        </div>
        <div class="auction-card-meta">
          <span>🔨 ${auction.bids} bids</span>
          <span>👁️ ${auction.watchers}</span>
          <span>⭐ ${auction.rating}</span>
        </div>
      </div>
    </div>
  `;
}

function attachCardListeners(grid) {
    grid.querySelectorAll('.auction-card-watch').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            toggleWatchlist(id, btn);
        });
    });

    grid.querySelectorAll('.auction-card').forEach(card => {
        card.addEventListener('click', () => {
            window.location.href = `auction.html?id=${card.dataset.id}`;
        });
    });
}

function toggleWatchlist(id, btn) {
    if (!window.AppState) return;
    const idx = window.AppState.watchlist.indexOf(id);
    if (idx > -1) {
        window.AppState.watchlist.splice(idx, 1);
        btn.classList.remove('active');
        btn.querySelector('svg').setAttribute('fill', 'none');
        if (window.showToast) showToast('Removed from watchlist', 'info');
    } else {
        window.AppState.watchlist.push(id);
        btn.classList.add('active');
        btn.querySelector('svg').setAttribute('fill', 'currentColor');
        if (window.showToast) showToast('Added to watchlist', 'success');
    }
}

function filterAuctions(auctions) {
    return auctions.filter(a => {
        if (currentFilters.priceMin && a.price < currentFilters.priceMin) return false;
        if (currentFilters.priceMax && a.price > currentFilters.priceMax) return false;
        if (currentFilters.categories.length && !currentFilters.categories.includes(a.category)) return false;
        return true;
    });
}

function sortAuctions(auctions, sortBy) {
    const sorted = [...auctions];
    switch (sortBy) {
        case 'ending': return sorted.sort((a, b) => new Date(a.endTime) - new Date(b.endTime));
        case 'newest': return sorted.sort((a, b) => new Date(b.endTime) - new Date(a.endTime));
        case 'price-asc': return sorted.sort((a, b) => a.price - b.price);
        case 'price-desc': return sorted.sort((a, b) => b.price - a.price);
        case 'bids': return sorted.sort((a, b) => b.bids - a.bids);
        default: return sorted;
    }
}

function updateResultsCount(count) {
    const el = document.querySelector('.results-count');
    if (el) el.innerHTML = `Showing <strong>1-${Math.min(20, count)}</strong> of <strong>${count}</strong> auctions`;
}

// Filter Toggles
function initFilterToggles() {
    document.querySelectorAll('.filter-toggle').forEach(toggle => {
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('active');
            const content = toggle.nextElementSibling;
            if (content) content.classList.toggle('active');
        });
    });
}

// View Toggle
function initViewToggle() {
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentView = btn.dataset.view;
            renderAuctions();
        });
    });
}

// Sort Select
function initSortSelect() {
    const select = document.getElementById('sortSelect');
    if (select) {
        select.addEventListener('change', () => {
            currentSort = select.value;
            renderAuctions();
        });
    }
}

// Mobile Filters
function initMobileFilters() {
    const btn = document.getElementById('mobileFilterBtn');
    const overlay = document.getElementById('filterOverlay');
    const closeBtn = document.getElementById('closeFilterOverlay');
    const applyBtn = document.getElementById('applyMobileFilters');

    if (btn && overlay) {
        btn.addEventListener('click', () => overlay.classList.add('active'));
        closeBtn?.addEventListener('click', () => overlay.classList.remove('active'));
        applyBtn?.addEventListener('click', () => { overlay.classList.remove('active'); renderAuctions(); });
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('active'); });
    }
}

// Filter Inputs
function initFilterInputs() {
    // Category checkboxes
    document.querySelectorAll('.filter-checkbox input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', () => {
            currentFilters.categories = Array.from(document.querySelectorAll('.filter-checkbox input[value]:checked'))
                .map(c => c.value);
            renderAuctions();
            updateActiveFilters();
        });
    });

    // Price presets
    document.querySelectorAll('.price-preset').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.price-preset').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilters.priceMin = btn.dataset.min ? parseInt(btn.dataset.min) : null;
            currentFilters.priceMax = btn.dataset.max ? parseInt(btn.dataset.max) : null;
            document.getElementById('priceMin').value = currentFilters.priceMin || '';
            document.getElementById('priceMax').value = currentFilters.priceMax || '';
            renderAuctions();
            updateActiveFilters();
        });
    });

    // Price inputs
    ['priceMin', 'priceMax'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('change', () => {
                currentFilters[id] = input.value ? parseInt(input.value) : null;
                renderAuctions();
                updateActiveFilters();
            });
        }
    });

    // Clear all
    document.getElementById('clearFilters')?.addEventListener('click', clearAllFilters);
    document.getElementById('clearMobileFilters')?.addEventListener('click', clearAllFilters);
}

function clearAllFilters() {
    currentFilters = { categories: [], priceMin: null, priceMax: null, status: [], condition: [], rating: null, shipping: [] };
    document.querySelectorAll('.filter-checkbox input, .filter-radio input').forEach(i => i.checked = false);
    document.querySelectorAll('.price-preset').forEach(b => b.classList.remove('active'));
    document.getElementById('priceMin').value = '';
    document.getElementById('priceMax').value = '';
    renderAuctions();
    updateActiveFilters();
}

function updateActiveFilters() {
    const container = document.getElementById('activeFilters');
    if (!container) return;

    const tags = [];
    currentFilters.categories.forEach(c => tags.push({ label: c, type: 'category', value: c }));
    if (currentFilters.priceMin || currentFilters.priceMax) {
        const label = currentFilters.priceMax ? `$${currentFilters.priceMin || 0} - $${currentFilters.priceMax}` : `$${currentFilters.priceMin}+`;
        tags.push({ label, type: 'price' });
    }

    container.innerHTML = tags.map(t => `
    <span class="filter-tag">${t.label}<button data-type="${t.type}" data-value="${t.value || ''}">✕</button></span>
  `).join('');

    container.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.dataset.type === 'category') {
                const cb = document.querySelector(`.filter-checkbox input[value="${btn.dataset.value}"]`);
                if (cb) { cb.checked = false; cb.dispatchEvent(new Event('change')); }
            } else if (btn.dataset.type === 'price') {
                currentFilters.priceMin = null;
                currentFilters.priceMax = null;
                document.getElementById('priceMin').value = '';
                document.getElementById('priceMax').value = '';
                document.querySelectorAll('.price-preset').forEach(b => b.classList.remove('active'));
                renderAuctions();
                updateActiveFilters();
            }
        });
    });
}

// Time helpers
function getTimeRemaining(endTime) {
    const total = new Date(endTime) - new Date();
    return {
        total,
        days: Math.floor(total / (1000 * 60 * 60 * 24)),
        hours: Math.floor((total / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((total / (1000 * 60)) % 60),
        seconds: Math.floor((total / 1000) % 60)
    };
}

function formatTimeRemaining(time) {
    if (time.total <= 0) return 'Ended';
    if (time.days > 0) return `${time.days}d ${time.hours}h left`;
    if (time.hours > 0) return `${time.hours}h ${time.minutes}m left`;
    return `${time.minutes}m ${time.seconds}s left`;
}

function getBadgeLabel(badge) {
    const labels = { hot: '🔥 HOT', new: '✨ NEW', ending: '⏰ ENDING', reserve: '📌 RESERVE' };
    return labels[badge] || badge.toUpperCase();
}

// Update timers
setInterval(() => {
    document.querySelectorAll('.auction-card-timer[data-end]').forEach(timer => {
        const remaining = getTimeRemaining(timer.dataset.end);
        const text = timer.querySelector('.timer-text');
        if (text) text.textContent = formatTimeRemaining(remaining);
        if (remaining.total < 3600000) timer.classList.add('ending-soon');
    });
}, 1000);
