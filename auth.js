/* =========================================================
   QMA — Shared Utilities (auth.js)
   Handles: toast, spinner, theme, API helper, Google OAuth
   ========================================================= */

const BASE_URL = 'http://localhost:8765';

// ─── Toast ───────────────────────────────────────────────
function toast(msg, type = 'info', ms = 3500) {
    const c = document.getElementById('toastContainer');
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    const icon = { error:'ph-warning-circle', success:'ph-check-circle', info:'ph-info', warn:'ph-warning' }[type] || 'ph-info';
    t.innerHTML = `<i class="ph-fill ${icon}"></i><span>${msg}</span>`;
    c.appendChild(t);
    setTimeout(() => {
        t.style.cssText = 'opacity:0;transform:translateY(-10px);transition:all .3s';
        setTimeout(() => t.remove(), 300);
    }, ms);
}

// ─── Button loading state ────────────────────────────────
function setBtn(id, loading, html) {
    const b = document.getElementById(id);
    if (!b) return;
    b.disabled = loading;
    b.innerHTML = loading ? '<span class="spinner"></span> Loading…' : html;
}

// ─── Theme ───────────────────────────────────────────────
let isDarkMode = localStorage.getItem('qma-theme') === 'dark';

function applyTheme() {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    document.querySelectorAll('.theme-icon').forEach(el => {
        el.classList.toggle('ph-sun',  isDarkMode);
        el.classList.toggle('ph-moon', !isDarkMode);
    });
    localStorage.setItem('qma-theme', isDarkMode ? 'dark' : 'light');
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    applyTheme();
}

// ─── API Helper ──────────────────────────────────────────
async function api(path, method = 'GET', body = null, auth = true) {
    const headers = { 'Content-Type': 'application/json' };
    const token = sessionStorage.getItem('qma-token');
    if (auth && token) headers['Authorization'] = `Bearer ${token}`;
    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);
    const res  = await fetch(`${BASE_URL}${path}`, opts);
    const ct   = res.headers.get('content-type') || '';
    const data = ct.includes('application/json') ? await res.json() : await res.text();
    if (!res.ok) {
        const msg = typeof data === 'string' ? data : (data.message || data.error || `HTTP ${res.status}`);
        throw new Error(msg);
    }
    return data;
}

// ─── Session helpers ─────────────────────────────────────
function saveSession(token, name, email) {
    sessionStorage.setItem('qma-token', token);
    sessionStorage.setItem('qma-name',  name);
    sessionStorage.setItem('qma-email', email);
}

function clearSession() {
    sessionStorage.removeItem('qma-token');
    sessionStorage.removeItem('qma-name');
    sessionStorage.removeItem('qma-email');
}

function getSession() {
    return {
        token: sessionStorage.getItem('qma-token'),
        name:  sessionStorage.getItem('qma-name')  || 'User',
        email: sessionStorage.getItem('qma-email') || ''
    };
}

// ─── Google OAuth redirect ───────────────────────────────
function triggerGoogleLogin() {
    toast('Redirecting to Google…', 'info', 1500);
    setTimeout(() => { window.location.href = `${BASE_URL}/auth-service/oauth2/authorization/google`; }, 400);
}

// ─── Check OAuth2 callback (call on every page load) ─────
async function checkOAuthCallback() {
    const p = new URLSearchParams(window.location.search);
    const token = p.get('token') || p.get('access_token');

    if (token) {
        const name  = p.get('name')  || '';
        const email = p.get('email') || '';
        window.history.replaceState({}, '', window.location.pathname);

        if (name) {
            saveSession(token, name, email);
            window.location.href = 'dashboard.html';
        } else {
            try {
                const data = await api('/auth-service/auth/oauth-success', 'GET', null, false);
                saveSession(data.token, data.name || 'User', data.email || '');
                window.location.href = 'dashboard.html';
            } catch (e) { toast('Google sign-in failed: ' + e.message, 'error'); }
        }
        return true;
    }

    if (document.referrer.includes(BASE_URL) || p.has('code')) {
        try {
            const data = await api('/auth-service/auth/oauth-success', 'GET', null, false);
            if (data.token) {
                saveSession(data.token, data.name || 'User', data.email || '');
                window.history.replaceState({}, '', window.location.pathname);
                window.location.href = 'dashboard.html';
                return true;
            }
        } catch (_) { /* not an OAuth redirect */ }
    }
    return false;
}

// Apply theme immediately on load (before DOMContentLoaded to avoid flash)
applyTheme();
