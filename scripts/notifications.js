/* NOTIFICATIONS PAGE - API INTEGRATED */

document.addEventListener('DOMContentLoaded', () => {
    initNotificationsPage();
});

async function initNotificationsPage() {
    // Check auth
    if (!TokenManager?.isLoggedIn()) {
        window.location.href = '../index.html';
        return;
    }

    // Connect WebSocket
    if (typeof auctionSocket !== 'undefined') {
        auctionSocket.connect();
        auctionSocket.on('notification', handleNewNotification);
    }

    await loadNotifications();
    initActions();
}

// Load notifications
async function loadNotifications() {
    const container = document.getElementById('notificationsList');
    if (!container) return;

    container.innerHTML = '<div class="loading">Loading notifications...</div>';

    try {
        const result = await API.Users.getNotifications();

        if (result.success) {
            const notifications = result.data.notifications;

            // Update unread count
            const countEl = document.getElementById('unreadCount');
            if (countEl) countEl.textContent = result.data.unread_count;

            if (notifications.length > 0) {
                const grouped = groupNotifications(notifications);
                container.innerHTML = Object.entries(grouped).map(([date, items]) => `
          <div class="notification-group">
            <h3 class="notification-date">${date}</h3>
            ${items.map(n => renderNotification(n)).join('')}
          </div>
        `).join('');
            } else {
                container.innerHTML = '<div class="empty-state">No notifications yet</div>';
            }
        }
    } catch (error) {
        container.innerHTML = '<div class="empty-state">Error loading notifications</div>';
    }
}

function renderNotification(notification) {
    const icon = getNotificationIcon(notification.notification_type);

    return `
    <div class="notification-item ${notification.is_read ? '' : 'unread'}" data-id="${notification.notification_id}">
      <div class="notification-icon ${notification.notification_type}">${icon}</div>
      <div class="notification-content">
        <h4 class="notification-title">${notification.title}</h4>
        <p class="notification-message">${notification.message}</p>
        <span class="notification-time">${formatTimeAgo(notification.created_at)}</span>
      </div>
      ${notification.link ? `<a href="${notification.link}" class="btn btn-sm btn-ghost">View</a>` : ''}
    </div>
  `;
}

function getNotificationIcon(type) {
    const icons = {
        bid_placed: '🔨',
        outbid: '⚠️',
        auction_won: '🏆',
        auction_lost: '😢',
        auction_ending: '⏰',
        payment_received: '💰',
        item_shipped: '📦',
        message_received: '💬',
        review_received: '⭐'
    };
    return icons[type] || '🔔';
}

function groupNotifications(notifications) {
    const groups = {};
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    notifications.forEach(n => {
        const date = new Date(n.created_at).toDateString();
        let label = date;

        if (date === today) label = 'Today';
        else if (date === yesterday) label = 'Yesterday';
        else label = new Date(n.created_at).toLocaleDateString();

        if (!groups[label]) groups[label] = [];
        groups[label].push(n);
    });

    return groups;
}

// Actions
function initActions() {
    // Mark all as read
    const markAllBtn = document.getElementById('markAllReadBtn');
    if (markAllBtn) {
        markAllBtn.addEventListener('click', async () => {
            const result = await API.Users.markNotificationsRead();
            if (result.success) {
                document.querySelectorAll('.notification-item.unread').forEach(el => {
                    el.classList.remove('unread');
                });
                const countEl = document.getElementById('unreadCount');
                if (countEl) countEl.textContent = '0';
                showToast('All notifications marked as read', 'success');
            }
        });
    }

    // Individual notification click
    document.addEventListener('click', async (e) => {
        const item = e.target.closest('.notification-item');
        if (item && item.classList.contains('unread')) {
            const id = item.dataset.id;
            await API.Users.markNotificationsRead([parseInt(id)]);
            item.classList.remove('unread');
        }
    });

    // Tab filtering
    document.querySelectorAll('.notification-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.notification-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const filter = tab.dataset.filter;
            filterNotifications(filter);
        });
    });
}

function filterNotifications(type) {
    document.querySelectorAll('.notification-item').forEach(item => {
        if (type === 'all') {
            item.style.display = '';
        } else {
            const itemType = item.querySelector('.notification-icon')?.className.split(' ')[1];
            item.style.display = matchesFilter(itemType, type) ? '' : 'none';
        }
    });
}

function matchesFilter(itemType, filter) {
    const filters = {
        bids: ['bid_placed', 'outbid', 'auction_won', 'auction_lost'],
        messages: ['message_received'],
        activity: ['auction_ending', 'payment_received', 'item_shipped', 'review_received']
    };
    return filters[filter]?.includes(itemType) || false;
}

// Handle new notification via WebSocket
function handleNewNotification(notification) {
    const container = document.getElementById('notificationsList');
    if (!container) return;

    const html = renderNotification(notification);

    // Find or create Today group
    let todayGroup = container.querySelector('.notification-group:first-child');
    if (todayGroup?.querySelector('.notification-date')?.textContent === 'Today') {
        todayGroup.querySelector('.notification-date').insertAdjacentHTML('afterend', html);
    } else {
        container.insertAdjacentHTML('afterbegin', `
      <div class="notification-group">
        <h3 class="notification-date">Today</h3>
        ${html}
      </div>
    `);
    }

    // Update count
    const countEl = document.getElementById('unreadCount');
    if (countEl) countEl.textContent = parseInt(countEl.textContent) + 1;
}

// Helpers
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
    }
}
