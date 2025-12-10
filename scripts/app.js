/* LIVE AUCTION SYSTEM - MAIN APPLICATION */

// Sample Data
const SAMPLE_AUCTIONS = [
  { id: 1, title: 'Vintage Canon AE-1 Camera', price: 1250, bids: 23, watchers: 156, endTime: '2025-12-12T18:00:00', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop', badges: ['hot'], seller: 'camera_collector', rating: 4.9 },
  { id: 2, title: 'Rolex Submariner Watch 1985', price: 8500, bids: 45, watchers: 312, endTime: '2025-12-11T14:30:00', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop', badges: ['hot', 'ending'], seller: 'luxury_watches', rating: 5.0 },
  { id: 3, title: 'MacBook Pro M3 Max 16"', price: 2450, bids: 18, watchers: 89, endTime: '2025-12-13T20:00:00', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop', badges: ['new'], seller: 'tech_deals', rating: 4.8 },
  { id: 4, title: 'Vintage Leather Jacket 1970s', price: 340, bids: 12, watchers: 67, endTime: '2025-12-12T10:00:00', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=300&fit=crop', badges: [], seller: 'vintage_fashion', rating: 4.7 },
  { id: 5, title: 'Nike Air Jordan 1 Retro OG', price: 890, bids: 34, watchers: 234, endTime: '2025-12-11T16:45:00', image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400&h=300&fit=crop', badges: ['hot'], seller: 'sneaker_head', rating: 4.9 },
  { id: 6, title: 'Sony A7 IV Mirrorless Camera', price: 1890, bids: 15, watchers: 78, endTime: '2025-12-14T12:00:00', image: 'https://images.unsplash.com/photo-1516724562728-afc824a36e84?w=400&h=300&fit=crop', badges: ['new'], seller: 'photo_pro', rating: 4.6 },
  { id: 7, title: 'Antique Victorian Desk Lamp', price: 275, bids: 8, watchers: 45, endTime: '2025-12-11T08:30:00', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=300&fit=crop', badges: ['ending'], seller: 'antique_finds', rating: 4.8 },
  { id: 8, title: 'Gibson Les Paul Standard Guitar', price: 3200, bids: 28, watchers: 189, endTime: '2025-12-15T22:00:00', image: 'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=400&h=300&fit=crop', badges: ['reserve'], seller: 'music_vault', rating: 5.0 }
];

const ENDING_SOON_AUCTIONS = [
  { id: 9, title: 'Bose QuietComfort Headphones', price: 185, bids: 14, watchers: 56, endTime: new Date(Date.now() + 45 * 60000).toISOString(), image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop', badges: ['ending'], seller: 'audio_zone', rating: 4.7 },
  { id: 10, title: 'Vintage Polaroid Camera', price: 95, bids: 9, watchers: 34, endTime: new Date(Date.now() + 32 * 60000).toISOString(), image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=300&fit=crop', badges: ['ending'], seller: 'retro_tech', rating: 4.5 },
  { id: 11, title: 'Mechanical Keyboard Cherry MX', price: 145, bids: 11, watchers: 42, endTime: new Date(Date.now() + 58 * 60000).toISOString(), image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=400&h=300&fit=crop', badges: ['ending'], seller: 'pc_master', rating: 4.8 },
  { id: 12, title: 'Designer Sunglasses Ray-Ban', price: 120, bids: 7, watchers: 28, endTime: new Date(Date.now() + 25 * 60000).toISOString(), image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=300&fit=crop', badges: ['ending'], seller: 'style_hub', rating: 4.6 }
];

const CATEGORIES = [
  { id: 1, name: 'Electronics', icon: '💻', count: 2458 },
  { id: 2, name: 'Fashion', icon: '👗', count: 1892 },
  { id: 3, name: 'Collectibles', icon: '🏆', count: 1245 },
  { id: 4, name: 'Art', icon: '🎨', count: 867 },
  { id: 5, name: 'Vehicles', icon: '🚗', count: 534 },
  { id: 6, name: 'Jewelry', icon: '💍', count: 1123 }
];

// App State
const AppState = {
  user: { id: 1, name: 'John Doe', email: 'john@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John' },
  watchlist: [1, 3, 5],
  notifications: 5,
  cart: 2
};

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  renderFeaturedAuctions();
  renderEndingSoonAuctions();
  renderCategories();
  initDropdowns();
  initModals();
  initCountdowns();
  initSearch();
}

// Render Auction Cards
function renderAuctionCard(auction) {
  const isWatched = AppState.watchlist.includes(auction.id);
  const timeRemaining = getTimeRemaining(auction.endTime);
  const isEndingSoon = timeRemaining.total < 3600000;

  return `
    <div class="auction-card" data-id="${auction.id}">
      <div class="auction-card-image">
        <img src="${auction.image}" alt="${auction.title}" loading="lazy">
        <div class="auction-card-badges">
          ${auction.badges.map(b => `<span class="badge badge-${b}">${getBadgeLabel(b)}</span>`).join('')}
        </div>
        <button class="auction-card-watch ${isWatched ? 'active' : ''}" data-id="${auction.id}" aria-label="Watch">
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
          <span>👁️ ${auction.watchers} watching</span>
        </div>
      </div>
    </div>
  `;
}

function renderFeaturedAuctions() {
  const container = document.getElementById('featuredAuctions');
  if (container) {
    container.innerHTML = SAMPLE_AUCTIONS.slice(0, 4).map(renderAuctionCard).join('');
    attachWatchListeners(container);
  }
}

function renderEndingSoonAuctions() {
  const container = document.getElementById('endingSoonAuctions');
  if (container) {
    container.innerHTML = ENDING_SOON_AUCTIONS.map(renderAuctionCard).join('');
    attachWatchListeners(container);
  }
}

function renderCategories() {
  const container = document.getElementById('categoriesGrid');
  if (container) {
    container.innerHTML = CATEGORIES.map(cat => `
      <a href="pages/browse.html?category=${cat.id}" class="category-card">
        <div class="category-icon">${cat.icon}</div>
        <span class="category-name">${cat.name}</span>
        <span class="category-count">${cat.count.toLocaleString()} items</span>
      </a>
    `).join('');
  }
}

// Watch List
function attachWatchListeners(container) {
  container.querySelectorAll('.auction-card-watch').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      toggleWatchlist(id, btn);
    });
  });
  
  container.querySelectorAll('.auction-card').forEach(card => {
    card.addEventListener('click', () => {
      window.location.href = `pages/auction.html?id=${card.dataset.id}`;
    });
  });
}

function toggleWatchlist(id, btn) {
  const idx = AppState.watchlist.indexOf(id);
  if (idx > -1) {
    AppState.watchlist.splice(idx, 1);
    btn.classList.remove('active');
    btn.querySelector('svg').setAttribute('fill', 'none');
    showToast('Removed from watchlist', 'info');
  } else {
    AppState.watchlist.push(id);
    btn.classList.add('active');
    btn.querySelector('svg').setAttribute('fill', 'currentColor');
    showToast('Added to watchlist', 'success');
  }
}

// Time Helpers
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
  const labels = { hot: '🔥 HOT', new: '✨ NEW', ending: '⏰ ENDING', reserve: '📌 RESERVE' };
  return labels[badge] || badge.toUpperCase();
}

// Countdowns
function initCountdowns() {
  setInterval(() => {
    document.querySelectorAll('.auction-card-timer[data-end]').forEach(timer => {
      const end = timer.dataset.end;
      const remaining = getTimeRemaining(end);
      const text = timer.querySelector('.timer-text');
      if (text) text.textContent = formatTimeRemaining(remaining);
      if (remaining.total < 3600000) timer.classList.add('ending-soon');
    });
    
    // Hero countdown
    updateHeroCountdown();
  }, 1000);
}

function updateHeroCountdown() {
  const heroEnd = new Date('2025-12-12T18:00:00');
  const now = new Date();
  const diff = heroEnd - now;
  
  if (diff > 0) {
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);
    
    const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = String(val).padStart(2, '0'); };
    setEl('hero-days', days);
    setEl('hero-hours', hours);
    setEl('hero-mins', mins);
    setEl('hero-secs', secs);
  }
}

// Dropdowns
function initDropdowns() {
  document.querySelectorAll('.dropdown').forEach(dropdown => {
    const btn = dropdown.querySelector('[id$="Btn"]');
    const menu = dropdown.querySelector('.dropdown-menu');
    
    if (btn && menu) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeAllDropdowns();
        menu.classList.toggle('active');
      });
    }
  });
  
  document.addEventListener('click', closeAllDropdowns);
}

function closeAllDropdowns() {
  document.querySelectorAll('.dropdown-menu.active').forEach(m => m.classList.remove('active'));
}

// Modals
function initModals() {
  const authModal = document.getElementById('authModal');
  const closeBtn = document.getElementById('closeAuthModal');
  
  if (closeBtn && authModal) {
    closeBtn.addEventListener('click', () => authModal.classList.remove('active'));
    authModal.addEventListener('click', (e) => {
      if (e.target === authModal) authModal.classList.remove('active');
    });
  }
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop.active').forEach(m => m.classList.remove('active'));
    }
  });
}

// Search
function initSearch() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) window.location.href = `pages/browse.html?q=${encodeURIComponent(query)}`;
      }
    });
  }
}

// Toast Notifications
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button class="toast-close" aria-label="Close">✕</button>
  `;
  
  container.appendChild(toast);
  
  toast.querySelector('.toast-close').addEventListener('click', () => toast.remove());
  setTimeout(() => toast.remove(), 4000);
}

// Export for other modules
window.AppState = AppState;
window.showToast = showToast;
window.SAMPLE_AUCTIONS = SAMPLE_AUCTIONS;
