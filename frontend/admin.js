const API_BASE = 'https://popgamerhost.onrender.com/api/admin';

// State
let currentTab = 'overview';

// Tab Switching
function switchTab(tabId) {
    currentTab = tabId;
    
    // Update Sidebar
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    event.currentTarget.classList.add('active');

    // Update Content
    document.querySelectorAll('.page-section').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');

    // Load Data
    if (tabId === 'overview') loadOverview();
    if (tabId === 'uploads') loadUploads();
    if (tabId === 'logs') loadLogs();
    if (tabId === 'settings') loadSettings();
}

// Data Fetching
async function loadOverview() {
    const container = document.getElementById('overview-content');
    try {
        const res = await fetch(`${API_BASE}/stats`);
        const stats = await res.json();
        
        container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-label">Total Uploads</div>
                    <div class="stat-value" style="color: #3b82f6">${stats.totalUploads}</div>
                    <div class="stat-label">${stats.deploymentsToday || 0} today</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Successful</div>
                    <div class="stat-value" style="color: #10b981">${stats.successfulDeployments}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Failed</div>
                    <div class="stat-value" style="color: #ef4444">${stats.failedDeployments}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Storage Used</div>
                    <div class="stat-value">${formatBytes(stats.totalStorageUsed)}</div>
                </div>
            </div>
        `;
    } catch (err) {
        container.innerHTML = `<div class="message error">Failed to load stats: ${err.message}</div>`;
    }
}

async function loadUploads() {
    const tbody = document.getElementById('uploads-table-body');
    tbody.innerHTML = '<tr><td colspan="4" class="loading">Loading...</td></tr>';
    
    try {
        const res = await fetch(`${API_BASE}/uploads`);
        const data = await res.json();
        
        if (data.items.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="loading">No uploads yet.</td></tr>';
            return;
        }

        tbody.innerHTML = data.items.map(u => `
            <tr>
                <td style="font-family: monospace;">${u.id}</td>
                <td><span class="status-badge ${u.status === 'success' ? 'status-success' : 'status-failed'}">${u.status}</span></td>
                <td>${new Date(u.timestamp).toLocaleString()}</td>
                <td>${u.url ? `<a href="${u.url}" target="_blank" style="color: var(--primary-color);">View Site</a>` : '-'}</td>
            </tr>
        `).join('');
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="4" class="message error">Error: ${err.message}</td></tr>`;
    }
}

async function loadLogs() {
    const container = document.getElementById('logs-content');
    try {
        const res = await fetch(`${API_BASE}/logs`);
        const logs = await res.json();
        
        if (logs.length === 0) {
            container.innerHTML = '<div style="color: #6b7280">No logs found.</div>';
            return;
        }

        container.innerHTML = logs.map(l => `
            <div style="border-bottom: 1px solid #374151; padding: 8px 0;">
                <span style="color: #9ca3af; font-size: 0.8rem;">${new Date(l.timestamp).toISOString()}</span>
                <span style="color: ${l.level === 'error' ? '#ef4444' : '#60a5fa'}; font-weight: bold; margin: 0 10px;">[${l.level.toUpperCase()}]</span>
                <span>${l.message}</span>
            </div>
        `).join('');
    } catch (err) {
        container.innerHTML = `Error loading logs: ${err.message}`;
    }
}

async function loadSettings() {
    try {
        const res = await fetch(`${API_BASE}/settings`);
        const settings = await res.json();
        document.getElementById('maintenance-toggle').checked = settings.maintenanceMode;
    } catch (err) {
        alert('Failed to load settings');
    }
}

async function saveSettings() {
    const maintenanceMode = document.getElementById('maintenance-toggle').checked;
    try {
        await fetch(`${API_BASE}/settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ maintenanceMode })
        });
        alert('Settings saved!');
    } catch (err) {
        alert('Failed to save settings');
    }
}

function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    loadOverview();
});
