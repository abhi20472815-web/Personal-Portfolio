document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    const currentTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', currentTheme);

    themeToggle.addEventListener('click', () => {
        const theme = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        html.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    });

    // Elements
    const loginModal = document.getElementById('loginModal');
    const dashboardContent = document.getElementById('dashboardContent');
    const loginForm = document.getElementById('loginForm');
    const adminPasswordInput = document.getElementById('adminPassword');
    const loginError = document.getElementById('loginError');
    const logoutBtn = document.getElementById('logoutBtn');
    
    const statTotal = document.getElementById('statTotal');
    const statUnread = document.getElementById('statUnread');
    const statRead = document.getElementById('statRead');
    
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const refreshBtn = document.getElementById('refreshBtn');
    
    const messagesTable = document.getElementById('messagesTable');
    const messagesTableBody = document.getElementById('messagesTableBody');
    const noMessages = document.getElementById('noMessages');

    let allMessages = []; // Cache all messages locally for search & filter

    // Dynamic Toast System
    function showToast(title, message, type = 'success') {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            info: 'ℹ️'
        };

        toast.innerHTML = `
            <div class="toast-icon">${icons[type]}</div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">&times;</button>
        `;

        container.appendChild(toast);

        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.classList.add('hide');
            setTimeout(() => toast.remove(), 300);
        });

        setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.add('hide');
                setTimeout(() => toast.remove(), 300);
            }
        }, 4000);
    }

    // Auth Helper
    function getPassword() {
        return localStorage.getItem('adminPassword') || '';
    }

    // API Headers Helper
    function getAuthHeaders() {
        return {
            'Content-Type': 'application/json',
            'X-Admin-Password': getPassword()
        };
    }

    // Verify Password and Unlock Dashboard
    async function checkAuth(password) {
        try {
            const response = await fetch('/api/admin/stats', {
                method: 'GET',
                headers: {
                    'X-Admin-Password': password
                }
            });

            if (response.ok) {
                localStorage.setItem('adminPassword', password);
                loginModal.style.display = 'none';
                dashboardContent.style.display = 'flex';
                loadDashboardData();
                showToast('Welcome Back', 'Dashboard unlocked successfully.', 'success');
            } else {
                throw new Error('Invalid Password');
            }
        } catch (error) {
            localStorage.removeItem('adminPassword');
            loginModal.style.display = 'flex';
            dashboardContent.style.display = 'none';
            loginError.textContent = 'Incorrect password. Please try again.';
            adminPasswordInput.focus();
        }
    }

    // Login Form Submit
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const enteredPassword = adminPasswordInput.value;
        loginError.textContent = '';
        checkAuth(enteredPassword);
    });

    // Logout
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('adminPassword');
        window.location.reload();
    });

    // Check auth on load
    const savedPassword = getPassword();
    if (savedPassword) {
        checkAuth(savedPassword);
    } else {
        loginModal.style.display = 'flex';
        adminPasswordInput.focus();
    }

    // Load Data
    async function loadDashboardData() {
        await Promise.all([fetchStats(), fetchMessages()]);
    }

    // Fetch Stats
    async function fetchStats() {
        try {
            const response = await fetch('/api/admin/stats', {
                headers: getAuthHeaders()
            });
            const data = await response.json();
            if (response.ok && data.success) {
                // Animate stats numbers
                animateNumber(statTotal, data.stats.total);
                animateNumber(statUnread, data.stats.unread);
                animateNumber(statRead, data.stats.read);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
            showToast('Fetch Failed', 'Could not load statistics.', 'error');
        }
    }

    // Fetch Messages
    async function fetchMessages() {
        try {
            const response = await fetch('/api/admin/messages', {
                headers: getAuthHeaders()
            });
            const data = await response.json();
            if (response.ok && data.success) {
                allMessages = data.messages;
                renderMessages();
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            showToast('Fetch Failed', 'Could not load messages.', 'error');
        }
    }

    // Number Counter Animation
    function animateNumber(element, target) {
        const start = parseInt(element.textContent) || 0;
        const duration = 500; // ms
        let startTime = null;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            element.textContent = Math.floor(progress * (target - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                element.textContent = target;
            }
        }
        window.requestAnimationFrame(step);
    }

    // Format Date helper
    function formatDate(dateStr) {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        
        return date.toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    }

    // Render Messages to Table
    function renderMessages() {
        const query = searchInput.value.toLowerCase().trim();
        const filter = statusFilter.value;

        // Apply filters
        const filtered = allMessages.filter(msg => {
            // Filter by Read Status
            if (filter === 'unread' && msg.is_read !== 0) return false;
            if (filter === 'read' && msg.is_read !== 1) return false;

            // Search Filter
            if (query !== '') {
                const nameMatch = msg.name.toLowerCase().includes(query);
                const emailMatch = msg.email.toLowerCase().includes(query);
                const messageMatch = msg.message.toLowerCase().includes(query);
                return nameMatch || emailMatch || messageMatch;
            }

            return true;
        });

        // Toggle table / empty state
        if (filtered.length === 0) {
            messagesTable.style.display = 'none';
            noMessages.style.display = 'block';
        } else {
            messagesTable.style.display = 'table';
            noMessages.style.display = 'none';
            
            messagesTableBody.innerHTML = '';
            filtered.forEach(msg => {
                const tr = document.createElement('tr');
                tr.className = msg.is_read === 1 ? 'read-row' : 'unread-row';
                
                tr.innerHTML = `
                    <td data-label="Date & Time" class="message-date">${formatDate(msg.timestamp)}</td>
                    <td data-label="Sender">
                        <div class="sender-info">
                            <span class="sender-name">${escapeHtml(msg.name)}</span>
                            <a href="mailto:${escapeHtml(msg.email)}" class="sender-email">${escapeHtml(msg.email)}</a>
                        </div>
                    </td>
                    <td data-label="Message" class="message-text-cell">
                        <div class="message-snippet">${escapeHtml(msg.message)}</div>
                    </td>
                    <td data-label="Actions" style="text-align: center;">
                        <div class="action-buttons">
                            <button class="action-btn read-toggle-btn" data-id="${msg.id}" data-status="${msg.is_read}" title="${msg.is_read === 1 ? 'Mark as Unread' : 'Mark as Read'}">
                                ${msg.is_read === 1 ? '📭' : '📩'}
                            </button>
                            <button class="action-btn delete-btn" data-id="${msg.id}" title="Delete Message">
                                🗑️
                            </button>
                        </div>
                    </td>
                `;

                messagesTableBody.appendChild(tr);
            });

            // Attach Action Listeners
            attachActionListeners();
        }
    }

    // Attach click listeners to action buttons
    function attachActionListeners() {
        // Read status toggle
        document.querySelectorAll('.read-toggle-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = btn.getAttribute('data-id');
                const currentStatus = parseInt(btn.getAttribute('data-status'));
                const newStatus = currentStatus === 1 ? 0 : 1;

                try {
                    const response = await fetch(`/api/admin/messages/${id}/read`, {
                        method: 'PUT',
                        headers: getAuthHeaders(),
                        body: JSON.stringify({ is_read: newStatus })
                    });

                    const data = await response.json();
                    if (response.ok && data.success) {
                        showToast(
                            newStatus === 1 ? 'Marked Read' : 'Marked Unread', 
                            'Message status updated.', 
                            'info'
                        );
                        loadDashboardData();
                    } else {
                        throw new Error(data.message);
                    }
                } catch (error) {
                    console.error('Update read status failed:', error);
                    showToast('Update Failed', 'Failed to update message status.', 'error');
                }
            });
        });

        // Delete message
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = btn.getAttribute('data-id');
                if (confirm('Are you sure you want to permanently delete this message?')) {
                    try {
                        const response = await fetch(`/api/admin/messages/${id}`, {
                            method: 'DELETE',
                            headers: getAuthHeaders()
                        });

                        const data = await response.json();
                        if (response.ok && data.success) {
                            showToast('Message Deleted', 'Message deleted from database.', 'success');
                            loadDashboardData();
                        } else {
                            throw new Error(data.message);
                        }
                    } catch (error) {
                        console.error('Delete message failed:', error);
                        showToast('Delete Failed', 'Failed to delete message.', 'error');
                    }
                }
            });
        });
    }

    // Search and Filter Listeners
    searchInput.addEventListener('input', renderMessages);
    statusFilter.addEventListener('change', renderMessages);
    
    // Refresh listener
    refreshBtn.addEventListener('click', async () => {
        const originalText = refreshBtn.innerHTML;
        refreshBtn.innerHTML = '<span>⏳ Loading...</span>';
        refreshBtn.disabled = true;
        await loadDashboardData();
        refreshBtn.innerHTML = originalText;
        refreshBtn.disabled = false;
        showToast('Refreshed', 'Dashboard data has been updated.', 'info');
    });

    // Escape HTML helper to prevent XSS
    function escapeHtml(text) {
        if (!text) return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
});
