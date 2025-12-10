/* LIVE AUCTION SYSTEM - AUCTION DETAIL PAGE JS */

document.addEventListener('DOMContentLoaded', () => {
    initAuctionPage();
});

function initAuctionPage() {
    initGallery();
    initTabs();
    initBidding();
    initCountdown();
    renderSimilarItems();
}

// Gallery
function initGallery() {
    const mainImage = document.getElementById('mainImage');
    const thumbs = document.querySelectorAll('.thumb');

    thumbs.forEach((thumb, index) => {
        thumb.addEventListener('click', () => {
            thumbs.forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
            const newSrc = thumb.querySelector('img').src.replace('120', '800').replace('90', '600');
            mainImage.src = newSrc;
            document.querySelector('.gallery-counter').textContent = `${index + 1} / ${thumbs.length}`;
        });
    });

    // Zoom button
    document.getElementById('zoomBtn')?.addEventListener('click', () => {
        window.open(mainImage.src, '_blank');
    });
}

// Tabs
function initTabs() {
    const tabs = document.querySelectorAll('#auctionTabs .tab');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tab.dataset.tab)?.classList.add('active');
        });
    });
}

// Bidding
function initBidding() {
    const bidModal = document.getElementById('bidModal');
    const placeBidBtn = document.getElementById('placeBidBtn');
    const mobileBidBtn = document.getElementById('mobileBidBtn');
    const closeBidModal = document.getElementById('closeBidModal');
    const cancelBid = document.getElementById('cancelBid');
    const confirmBid = document.getElementById('confirmBid');
    const bidInput = document.getElementById('bidAmount');
    const modalBidInput = document.getElementById('modalBidAmount');
    const maxBidCheck = document.getElementById('maxBidCheck');
    const maxBidGroup = document.getElementById('maxBidGroup');

    // Open modal
    [placeBidBtn, mobileBidBtn].forEach(btn => {
        btn?.addEventListener('click', () => {
            const amount = bidInput?.value || 1275;
            if (modalBidInput) modalBidInput.value = amount;
            bidModal?.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    // Close modal
    [closeBidModal, cancelBid].forEach(btn => {
        btn?.addEventListener('click', () => {
            bidModal?.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    bidModal?.addEventListener('click', (e) => {
        if (e.target === bidModal) {
            bidModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Max bid toggle
    maxBidCheck?.addEventListener('change', () => {
        maxBidGroup?.classList.toggle('d-none', !maxBidCheck.checked);
    });

    // Quick bid buttons
    document.querySelectorAll('.quick-bid-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const amount = btn.dataset.amount;
            if (bidInput) bidInput.value = amount;
            document.querySelectorAll('.quick-bid-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Confirm bid
    confirmBid?.addEventListener('click', () => {
        const amount = modalBidInput?.value || 1275;
        simulateBid(parseFloat(amount));
        bidModal?.classList.remove('active');
        document.body.style.overflow = '';
    });

    // Watch button
    const watchBtn = document.getElementById('watchBtn');
    watchBtn?.addEventListener('click', () => {
        watchBtn.classList.toggle('active');
        const isWatched = watchBtn.classList.contains('active');
        watchBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="${isWatched ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> ${isWatched ? 'Watching' : 'Watch'}`;
        showToast(isWatched ? 'Added to watchlist' : 'Removed from watchlist', isWatched ? 'success' : 'info');
    });
}

function simulateBid(amount) {
    // Simulate bid success
    const currentBidEl = document.getElementById('currentBid');
    if (currentBidEl) {
        currentBidEl.textContent = `$${amount.toLocaleString()}.00`;
    }

    // Update bid status
    const bidStatus = document.querySelector('.bid-status');
    if (bidStatus) {
        bidStatus.className = 'bid-status winning';
        bidStatus.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> You're currently winning!`;
    }

    // Update minimum bid
    const minBid = amount + 25;
    const bidNote = document.querySelector('.bid-note');
    if (bidNote) {
        bidNote.innerHTML = `Minimum bid: <strong>$${minBid.toLocaleString()}.00</strong> (Increment: $25)`;
    }

    // Update quick bid buttons
    document.querySelectorAll('.quick-bid-btn').forEach((btn, i) => {
        const newAmount = minBid + (i * 25);
        btn.dataset.amount = newAmount;
        btn.textContent = `$${newAmount.toLocaleString()}`;
    });

    // Show success toast
    showToast(`Bid of $${amount.toLocaleString()} placed successfully!`, 'success');
}

// Countdown
function initCountdown() {
    const countdown = document.getElementById('auctionCountdown');
    if (!countdown) return;

    const endDate = new Date('2025-12-12T18:00:00');

    function update() {
        const now = new Date();
        const diff = endDate - now;

        if (diff <= 0) {
            countdown.innerHTML = '<span style="color: var(--error); font-weight: 600;">Auction Ended</span>';
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        countdown.querySelector('[data-days]').textContent = String(days).padStart(2, '0');
        countdown.querySelector('[data-hours]').textContent = String(hours).padStart(2, '0');
        countdown.querySelector('[data-minutes]').textContent = String(minutes).padStart(2, '0');
        countdown.querySelector('[data-seconds]').textContent = String(seconds).padStart(2, '0');

        // Update mobile bar
        const mobileTime = document.querySelector('.mobile-bid-time');
        if (mobileTime) {
            mobileTime.textContent = days > 0 ? `${days}d ${hours}h left` : `${hours}h ${minutes}m left`;
        }
    }

    update();
    setInterval(update, 1000);
}

// Similar Items
function renderSimilarItems() {
    const container = document.getElementById('similarItems');
    if (!container || !window.SAMPLE_AUCTIONS) return;

    const items = window.SAMPLE_AUCTIONS.slice(0, 4);
    container.innerHTML = items.map(auction => `
    <div class="auction-card" onclick="location.href='auction.html?id=${auction.id}'">
      <div class="auction-card-image">
        <img src="${auction.image}" alt="${auction.title}" loading="lazy">
      </div>
      <div class="auction-card-content">
        <h3 class="auction-card-title">${auction.title}</h3>
        <div class="auction-card-price">$${auction.price.toLocaleString()}</div>
        <div class="auction-card-meta">
          <span>🔨 ${auction.bids} bids</span>
        </div>
      </div>
    </div>
  `).join('');
}

// Toast helper
function showToast(message, type = 'info') {
    if (window.showToast) {
        window.showToast(message, type);
        return;
    }

    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${message}</span><button class="toast-close">✕</button>`;
    container.appendChild(toast);

    toast.querySelector('.toast-close').addEventListener('click', () => toast.remove());
    setTimeout(() => toast.remove(), 4000);
}
