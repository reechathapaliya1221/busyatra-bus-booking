// API Service
const API = {
    baseURL: '/api',
    
    async request(endpoint, options = {}) {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                headers
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },
    
    get(endpoint) {
        return this.request(endpoint);
    },
    
    post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    },
    
    put(endpoint, body) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    },
    
    delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }
};

// Auth functions
async function login(email, password) {
    try {
        const data = await API.post('/auth/login', { email, password });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        showAlert('Login successful!', 'success');
        
        setTimeout(() => {
            window.location.href = data.role === 'admin' ? '/admin/dashboard' : '/';
        }, 1000);
        
        return { success: true };
    } catch (error) {
        showAlert(error.message, 'error');
        return { success: false, error: error.message };
    }
}

async function register(userData) {
    try {
        const data = await API.post('/auth/register', userData);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        showAlert('Registration successful!', 'success');
        
        setTimeout(() => {
            window.location.href = '/';
        }, 1000);
        
        return { success: true };
    } catch (error) {
        showAlert(error.message, 'error');
        return { success: false, error: error.message };
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showAlert('Logged out successfully', 'success');
    
    setTimeout(() => {
        window.location.href = '/';
    }, 1000);
}

// Check authentication
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    if (!token) {
        const publicPages = ['/', '/login', '/register', '/search', '/seat-selection'];
        const currentPath = window.location.pathname;
        
        if (!publicPages.includes(currentPath) && !currentPath.startsWith('/api')) {
            window.location.href = '/login';
        }
    }
    
    return user;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Format time
function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Show alert
function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '9999';
    alertDiv.style.minWidth = '300px';
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

// Load navigation
function loadNavigation() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navMenu) {
        if (user) {
            navMenu.innerHTML = `
                <li><a href="/">Home</a></li>
                <li><a href="/search">Search Buses</a></li>
                ${user.role === 'admin' ? '<li><a href="/admin/dashboard">Admin Dashboard</a></li>' : ''}
                <li><span>Welcome, ${user.name}</span></li>
                <li><a href="#" onclick="logout()">Logout</a></li>
            `;
        } else {
            navMenu.innerHTML = `
                <li><a href="/">Home</a></li>
                <li><a href="/search">Search Buses</a></li>
                <li><a href="/login">Login</a></li>
                <li><a href="/register">Register</a></li>
            `;
        }
    }
}

// Show loading spinner
function showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = '<div class="spinner"></div>';
    }
}

// Hide loading spinner
function hideLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        const spinner = container.querySelector('.spinner');
        if (spinner) {
            spinner.remove();
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadNavigation();
    
    // Login form handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            await login(email, password);
        });
    }
    
    // Register form handler
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (password !== confirmPassword) {
                showAlert('Passwords do not match', 'error');
                return;
            }
            
            const userData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                password: password,
                phone: document.getElementById('phone').value
            };
            
            await register(userData);
        });
    }
});

// Make functions globally available
window.logout = logout;
window.showAlert = showAlert;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.formatTime = formatTime;