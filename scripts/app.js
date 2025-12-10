/* LIVE AUCTION SYSTEM - MAIN APPLICATION (API INTEGRATED) */

// App State
const AppState = {
  user: null,
  watchlist: [],
  notifications: 0,
  categories: [],
  isLoading: false
};

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

async function initApp() {
  // Check for logged in user
  AppState.user = TokenManager.getUser();
  updateUIForAuth();

  // Load data
  await Promise.all([
    loadFeaturedAuctions(),
    loadCategories()
  ]);

  initDropdowns();
  initModals();
  initCountdowns();
  initSearch();
  initAuthForms();

  // Connect WebSocket if logged in
  if (TokenManager.isLoggedIn()) {
    auctionSocket.connect();
    loadNotificationCount();
  }
}

// ========== DATA LOADING ==========
async function loadFeaturedAuctions() {
  const container = document.getElementById('featuredAuctions');
  if (!container) return;

  container.innerHTML = '<div class="loading-spinner">Loading...</div>';

  const result = await API.Auctions.list({ status: 'active', limit: 4, sort: 'most_bids' });

  if (result.success && result.data.auctions.length > 0) {
    container.innerHTML = result.data.auctions.map(renderAuctionCard).join('');
    attachWatchListeners(container);
  } else {
    // Fallback to sample data if API fails
    container.innerHTML = SAMPLE_AUCTIONS.slice(0, 4).map(a => renderAuctionCard(mapSampleToApiFormat(a))).join('');
    attachWatchListeners(container);
  }
}

async function loadEndingSoonAuctions() {
  const container = document.getElementById('endingSoonAuctions');
  if (!container) return;

  const result = await API.Auctions.list({ status: 'active', limit: 4, sort: 'end_time_asc' });

  if (result.success && result.data.auctions.length > 0) {
    container.innerHTML = result.data.auctions.map(renderAuctionCard).join('');
    attachWatchListeners(container);
  }
}

async function loadCategories() {
  const container = document.getElementById('categoriesGrid');
  if (!container) return;

  const result = await API.Auctions.getCategories();

  if (result.success && result.data.length > 0) {
    AppState.categories = result.data.filter(c => !c.parent_id);
    container.innerHTML = AppState.categories.slice(0, 6).map(cat => `
      <a href="pages/browse.html?category=${cat.category_id}" class="category-card">
        <div class="category-icon">${cat.icon || '📦'}</div>
        <span class="category-name">${cat.name}</span>
      </a>
    `).join('');
  } else {
    // Fallback
    container.innerHTML = CATEGORIES.map(cat => `
      <a href="pages/browse.html?category=${cat.id}" class="category-card">
        <div class="category-icon">${cat.icon}</div>
        <span class="category-name">${cat.name}</span>
        <span class="category-count">${cat.count.toLocaleString()} items</span>
      </a>
    `).join('');
  }
}

async function loadNotificationCount() {
  if (!TokenManager.isLoggedIn()) return;

  const result = await API.Users.getNotifications(true);
  if (result.success) {
    AppState.notifications = result.data.unread_count || 0;
    updateNotificationBadge();
  }
}

// ========== FALLBACK DATA ==========
const SAMPLE_AUCTIONS = [
  { id: 1, title: 'Vintage Canon AE-1 Camera', price: 1250, bids: 23, watchers: 156, endTime: '2025-12-12T18:00:00', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop', badges: ['hot'], seller: 'camera_collector', rating: 4.9 },
  { id: 2, title: 'Rolex Submariner Watch 1985', price: 8500, bids: 45, watchers: 312, endTime: '2025-12-11T14:30:00', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop', badges: ['hot', 'ending'], seller: 'luxury_watches', rating: 5.0 },
  { id: 3, title: 'MacBook Pro M3 Max 16"', price: 2450, bids: 18, watchers: 89, endTime: '2025-12-13T20:00:00', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop', badges: ['new'], seller: 'tech_deals', rating: 4.8 },
  { id: 4, title: 'Vintage Leather Jacket 1970s', price: 340, bids: 12, watchers: 67, endTime: '2025-12-12T10:00:00', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=300&fit=crop', badges: [], seller: 'vintage_fashion', rating: 4.7 }
];

const CATEGORIES = [
  { id: 1, name: 'Electronics', icon: '💻', count: 2458 },
  { id: 2, name: 'Fashion', icon: '👗', count: 1892 },
  { id: 3, name: 'Collectibles', icon: '🏆', count: 1245 },
  { id: 4, name: 'Art', icon: '🎨', count: 867 },
  { id: 5, name: 'Vehicles', icon: '🚗', count: 534 },
  { id: 6, name: 'Jewelry', icon: '💍', count: 1123 }
];

function mapSampleToApiFormat(auction) {
  return {
    auction_id: auction.id,
    title: auction.title,
    current_bid: auction.price,
    starting_price: auction.price,
    bid_count: auction.bids,
    end_time: auction.endTime,
    thumbnail: auction.image,
    free_shipping: false,
    seller_username: auction.seller,
    seller_rating: auction.rating
  };
}

// ========== RENDER FUNCTIONS ==========
function renderAuctionCard(auction) {
  const id = auction.auction_id || auction.id;
  const price = auction.current_bid || auction.starting_price || auction.price;
  const bids = auction.bid_count || auction.bids || 0;
  const image = auction.thumbnail || auction.image;
  const endTime = auction.end_time || auction.endTime;

  const isWatched = AppState.watchlist.includes(id);
  const timeRemaining = getTimeRemaining(endTime);
  const isEndingSoon = timeRemaining.total < 3600000 && timeRemaining.total > 0;

  const badges = [];
  if (isEndingSoon) badges.push('ending');
  if (bids > 20) badges.push('hot');
  if (auction.free_shipping) badges.push('free-shipping');

  return `
    <div class="auction-card" data-id="${id}">
      <div class="auction-card-image">
        <img src="${image}" alt="${auction.title}" loading="lazy">
        <div class="auction-card-badges">
          ${badges.map(b => `<span class="badge badge-${b}">${getBadgeLabel(b)}</span>`).join('')}
        </div>
        <button class="auction-card-watch ${isWatched ? 'active' : ''}" data-id="${id}" aria-label="Watch">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="${isWatched ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
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
          ${auction.seller_username ? `<span>👤 ${auction.seller_username}</span>` : ''}
        </div>
      </div>
    </div>
  `;
}

// ========== AUTH INTEGRATION ==========
function updateUIForAuth() {
  const user = AppState.user;

  // Auth buttons (Sign In, Register links)
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');

  // Elements that require auth
  const authRequired = document.querySelectorAll('.auth-required');

  // User info elements
  const headerAvatar = document.getElementById('headerAvatar');
  const headerUsername = document.getElementById('headerUsername');

  if (user) {
    // Hide login/register buttons
    if (loginBtn) loginBtn.style.display = 'none';
    if (registerBtn) registerBtn.style.display = 'none';

    // Show auth-required elements
    authRequired.forEach(el => el.style.display = '');

    // Update user info
    if (headerAvatar) headerAvatar.src = user.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`;
    if (headerUsername) headerUsername.textContent = user.username || user.full_name || 'User';
  } else {
    // Show login/register buttons
    if (loginBtn) loginBtn.style.display = '';
    if (registerBtn) registerBtn.style.display = '';

    // Hide auth-required elements
    authRequired.forEach(el => el.style.display = 'none');
  }
}

function initAuthForms() {
  // Login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = loginForm.querySelector('[name="email"]').value;
      const password = loginForm.querySelector('[name="password"]').value;

      const btn = loginForm.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Logging in...';

      const result = await API.Auth.login(email, password);

      if (result.success) {
        AppState.user = result.data.user;
        showToast('Login successful!', 'success');
        document.getElementById('authModal')?.classList.remove('active');
        updateUIForAuth();
        auctionSocket.connect();
        loadNotificationCount();
      } else {
        showToast(result.message || 'Login failed', 'error');
      }

      btn.disabled = false;
      btn.textContent = 'Sign In';
    });
  }

  // Register form
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = registerForm.querySelector('[name="username"]').value;
      const email = registerForm.querySelector('[name="email"]').value;
      const password = registerForm.querySelector('[name="password"]').value;

      const btn = registerForm.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Creating account...';

      const result = await API.Auth.register(username, email, password);

      if (result.success) {
        TokenManager.setTokens(result.data.accessToken, result.data.refreshToken);
        TokenManager.setUser(result.data.user);
        AppState.user = result.data.user;
        showToast('Account created!', 'success');
        document.getElementById('authModal')?.classList.remove('active');
        updateUIForAuth();
        auctionSocket.connect();
      } else {
        showToast(result.message || 'Registration failed', 'error');
      }

      btn.disabled = false;
      btn.textContent = 'Create Account';
    });
  }

  // Logout button
  document.querySelectorAll('[data-action="logout"]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      await API.Auth.logout();
      AppState.user = null;
      auctionSocket.disconnect();
      showToast('Logged out', 'info');
      updateUIForAuth();
    });
  });

  // Open auth modal links
  document.querySelectorAll('[data-auth="login"], .btn-login').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('authModal')?.classList.add('active');
    });
  });
}

function updateNotificationBadge() {
  const badge = document.querySelector('.notification-badge');
  if (badge) {
    badge.textContent = AppState.notifications;
    badge.style.display = AppState.notifications > 0 ? 'flex' : 'none';
  }
}

// ========== WATCHLIST ==========
function attachWatchListeners(container) {
  container.querySelectorAll('.auction-card-watch').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      await toggleWatchlist(id, btn);
    });
  });

  container.querySelectorAll('.auction-card').forEach(card => {
    card.addEventListener('click', () => {
      window.location.href = `pages/auction.html?id=${card.dataset.id}`;
    });
  });
}

async function toggleWatchlist(id, btn) {
  if (!TokenManager.isLoggedIn()) {
    showToast('Please login to use watchlist', 'warning');
    document.getElementById('authModal')?.classList.add('active');
    return;
  }

  const idx = AppState.watchlist.indexOf(id);

  if (idx > -1) {
    const result = await API.Users.removeFromWatchlist(id);
    if (result.success) {
      AppState.watchlist.splice(idx, 1);
      btn.classList.remove('active');
      btn.querySelector('svg').setAttribute('fill', 'none');
      showToast('Removed from watchlist', 'info');
    }
  } else {
    const result = await API.Users.addToWatchlist(id);
    if (result.success) {
      AppState.watchlist.push(id);
      btn.classList.add('active');
      btn.querySelector('svg').setAttribute('fill', 'currentColor');
      showToast('Added to watchlist', 'success');
    }
  }
}

// ========== HELPERS ==========
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
  const labels = { hot: '🔥 HOT', new: '✨ NEW', ending: '⏰ ENDING', reserve: '📌 RESERVE', 'free-shipping': '🚚 FREE' };
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
      if (remaining.total < 3600000 && remaining.total > 0) timer.classList.add('ending-soon');
    });
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
    const btn = dropdown.querySelector('[id$="Btn"]') || dropdown.querySelector('button');
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
        if (query) window.location.href = `pages/browse.html?search=${encodeURIComponent(query)}`;
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

// Export
window.AppState = AppState;
window.showToast = showToast;
window.SAMPLE_AUCTIONS = SAMPLE_AUCTIONS;
