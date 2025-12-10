/* MESSAGES PAGE - API INTEGRATED */

const MessagesState = {
    conversations: [],
    activeConversation: null,
    messages: []
};

document.addEventListener('DOMContentLoaded', () => {
    initMessagesPage();
});

async function initMessagesPage() {
    // Check auth
    if (!TokenManager?.isLoggedIn()) {
        window.location.href = '../index.html';
        return;
    }

    // Connect WebSocket
    if (typeof auctionSocket !== 'undefined') {
        auctionSocket.connect();
        auctionSocket.on('message', handleNewMessage);
    }

    await loadConversations();
    initComposeModal();
}

// Load conversations
async function loadConversations() {
    const container = document.getElementById('conversationsList');
    if (!container) return;

    container.innerHTML = '<div class="loading">Loading conversations...</div>';

    try {
        const result = await API.Messages.getConversations();

        if (result.success && result.data.length > 0) {
            MessagesState.conversations = result.data;
            container.innerHTML = result.data.map(conv => renderConversation(conv)).join('');

            // Click handlers
            container.querySelectorAll('.conversation-item').forEach(item => {
                item.addEventListener('click', () => {
                    const convId = item.dataset.id;
                    selectConversation(convId);
                });
            });
        } else {
            container.innerHTML = '<div class="empty-state">No messages yet</div>';
        }
    } catch (error) {
        container.innerHTML = '<div class="empty-state">Error loading messages</div>';
    }
}

function renderConversation(conv) {
    return `
    <div class="conversation-item ${conv.unread_count > 0 ? 'unread' : ''}" data-id="${conv.conversation_id}">
      <img src="${conv.other_user_image || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + conv.other_username}" 
           alt="${conv.other_username}" class="conversation-avatar">
      <div class="conversation-info">
        <div class="conversation-header">
          <span class="conversation-name">${conv.other_username}</span>
          <span class="conversation-time">${formatTimeAgo(conv.last_message_time)}</span>
        </div>
        <p class="conversation-preview">${conv.last_message || 'No messages'}</p>
        ${conv.auction_title ? `<span class="conversation-auction">Re: ${conv.auction_title}</span>` : ''}
      </div>
      ${conv.unread_count > 0 ? `<span class="unread-badge">${conv.unread_count}</span>` : ''}
    </div>
  `;
}

// Select conversation
async function selectConversation(conversationId) {
    MessagesState.activeConversation = conversationId;

    // Update UI
    document.querySelectorAll('.conversation-item').forEach(item => {
        item.classList.toggle('active', item.dataset.id === conversationId);
    });

    // Load messages
    await loadMessages(conversationId);

    // Show message thread panel on mobile
    document.querySelector('.messages-thread')?.classList.add('active');
}

// Load messages
async function loadMessages(conversationId) {
    const container = document.getElementById('messagesList');
    if (!container) return;

    container.innerHTML = '<div class="loading">Loading...</div>';

    try {
        const result = await API.Messages.getMessages(conversationId);

        if (result.success && result.data.length > 0) {
            MessagesState.messages = result.data;
            const currentUser = TokenManager.getUser();

            container.innerHTML = result.data.map(msg => `
        <div class="message-bubble ${msg.sender_id === currentUser?.user_id ? 'sent' : 'received'}">
          <p class="message-text">${msg.message_text}</p>
          <span class="message-time">${formatTime(msg.created_at)}</span>
        </div>
      `).join('');

            // Scroll to bottom
            container.scrollTop = container.scrollHeight;
        } else {
            container.innerHTML = '<div class="empty-state">No messages in this conversation</div>';
        }
    } catch (error) {
        container.innerHTML = '<div class="empty-state">Error loading messages</div>';
    }
}

// Send message
async function sendMessage() {
    const input = document.getElementById('messageInput');
    const text = input?.value.trim();

    if (!text || !MessagesState.activeConversation) return;

    // Find receiver from conversation
    const conv = MessagesState.conversations.find(c => String(c.conversation_id) === String(MessagesState.activeConversation));
    if (!conv) return;

    try {
        const result = await API.Messages.send(conv.other_user_id, text, conv.auction_id);

        if (result.success) {
            input.value = '';

            // Add message to UI immediately
            const container = document.getElementById('messagesList');
            const msgHtml = `
        <div class="message-bubble sent">
          <p class="message-text">${text}</p>
          <span class="message-time">Just now</span>
        </div>
      `;
            container.insertAdjacentHTML('beforeend', msgHtml);
            container.scrollTop = container.scrollHeight;
        } else {
            showToast(result.message || 'Failed to send message', 'error');
        }
    } catch (error) {
        showToast('Error sending message', 'error');
    }
}

// Handle incoming WebSocket message
function handleNewMessage(data) {
    if (String(data.conversation_id) === String(MessagesState.activeConversation)) {
        // Add to current thread
        const container = document.getElementById('messagesList');
        if (container) {
            const msgHtml = `
        <div class="message-bubble received">
          <p class="message-text">${data.message_text}</p>
          <span class="message-time">Just now</span>
        </div>
      `;
            container.insertAdjacentHTML('beforeend', msgHtml);
            container.scrollTop = container.scrollHeight;
        }
    } else {
        // Reload conversations to update unread count
        loadConversations();
    }
}

// Compose modal
function initComposeModal() {
    const composeBtn = document.getElementById('composeBtn');
    const composeModal = document.getElementById('composeModal');
    const closeBtn = composeModal?.querySelector('.modal-close');
    const sendBtn = document.getElementById('sendComposeBtn');

    if (composeBtn && composeModal) {
        composeBtn.addEventListener('click', () => composeModal.classList.add('active'));
        closeBtn?.addEventListener('click', () => composeModal.classList.remove('active'));

        sendBtn?.addEventListener('click', async () => {
            const receiverInput = document.getElementById('composeReceiver');
            const messageInput = document.getElementById('composeMessage');

            // Would need user search endpoint to get receiver_id
            showToast('Please select a conversation or reply from an auction page', 'info');
            composeModal.classList.remove('active');
        });
    }

    // Reply form in thread
    const replyForm = document.getElementById('replyForm');
    if (replyForm) {
        replyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            sendMessage();
        });
    }
}

// Back button for mobile
function goBackToList() {
    document.querySelector('.messages-thread')?.classList.remove('active');
    MessagesState.activeConversation = null;
}

// Helpers
function formatTimeAgo(timestamp) {
    if (!timestamp) return '';
    const diff = Date.now() - new Date(timestamp);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return new Date(timestamp).toLocaleDateString();
}

function formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function showToast(message, type = 'info') {
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
    }
}

// Export
window.sendMessage = sendMessage;
window.goBackToList = goBackToList;
