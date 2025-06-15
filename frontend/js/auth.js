const API_BASE_URL = 'http://localhost:3000/api';

// Auth state management
const auth = {
    isAuthenticated: false,
    user: null,
    tokenCheckInterval: null,
    inactivityTimer: null,
    lastActivity: Date.now(),

    // Initialize auth state from localStorage
    init() {
        const user = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (user && token) {
            // Kiểm tra token còn hợp lệ không
            this.verifyToken().then(isValid => {
                if (isValid) {
                    this.isAuthenticated = true;
                    this.user = JSON.parse(user);
                    this.startTokenCheck();
                    this.startInactivityTimer();
                    this.updateUI();
                } else {
                    this.logout();
                }
            });
        }

        // Theo dõi hoạt động của user
        this.trackUserActivity();
    },

    // Login
    async login(email, password) {
        try {
            console.log('Attempting login for:', email);
            
            const response = await fetch(`${API_BASE_URL}/khach_hang/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            
            if (!response.ok) {
                console.error('Login failed:', data);
                throw new Error(data.error || 'Đăng nhập thất bại');
            }

            // Store user data
            localStorage.setItem('user', JSON.stringify(data.khach_hang));
            if (data.token) { // Lưu token nếu có
                localStorage.setItem('token', data.token);
            }
            this.isAuthenticated = true;
            this.user = data.khach_hang;

            // Bắt đầu kiểm tra token và timer
            this.startTokenCheck();
            this.startInactivityTimer();
            this.updateUI();

            // Dispatch event cho cart
            document.dispatchEvent(new CustomEvent('userLoggedIn'));

            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw new Error(error.message || 'Lỗi kết nối máy chủ');
        }
    },

    // Logout
    logout() {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        this.isAuthenticated = false;
        this.user = null;

        // Dừng các timer
        this.stopTokenCheck();
        this.stopInactivityTimer();
        this.updateUI();

        // Dispatch event cho cart
        document.dispatchEvent(new CustomEvent('userLoggedOut'));

        // Hiển thị thông báo
        this.showNotification('Đã đăng xuất thành công!', 'info');
    },

    async register(userData) {
        try {
            const registerUrl = `${API_BASE_URL}/khach_hang/register`;
            const response = await fetch(registerUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();
            if (!response.ok) {
                // Ném lỗi với thông điệp từ server nếu có, nếu không thì thông điệp mặc định
                throw new Error(data.error || 'Đăng ký thất bại. Vui lòng thử lại.');
            }
            // Có thể bạn muốn tự động đăng nhập người dùng sau khi đăng ký thành công
            // hoặc hiển thị thông báo và yêu cầu họ đăng nhập.
            // Ví dụ: return data; // Trả về dữ liệu để xử lý tiếp (vd: hiển thị thông báo)
            return data;
        } catch (error) {
            console.error('Registration error:', error.message); // Log message của error
            // Ném lại lỗi để hàm gọi có thể bắt và xử lý (ví dụ: hiển thị cho người dùng)
            throw error;
        }
    },

    // Verify token với server
    async verifyToken() {
        try {
            const token = localStorage.getItem('token');
            if (!token) return false;

            const response = await fetch(`${API_BASE_URL}/khach_hang/verify`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return response.ok;
        } catch (error) {
            console.error('Token verification failed:', error);
            return false;
        }
    },

    // Bắt đầu kiểm tra token định kỳ
    startTokenCheck() {
        this.tokenCheckInterval = setInterval(async () => {
            const isValid = await this.verifyToken();
            if (!isValid) {
                this.logout();
                this.showNotification('Phiên đăng nhập đã hết hạn!', 'warning');
            }
        }, 30000); // Kiểm tra mỗi 30 giây
    },

    // Dừng kiểm tra token
    stopTokenCheck() {
        if (this.tokenCheckInterval) {
            clearInterval(this.tokenCheckInterval);
            this.tokenCheckInterval = null;
        }
    },

    // Bắt đầu timer không hoạt động (5 phút)
    startInactivityTimer() {
        this.resetInactivityTimer();
    },

    // Reset timer không hoạt động
    resetInactivityTimer() {
        this.stopInactivityTimer();
        this.lastActivity = Date.now();

        this.inactivityTimer = setTimeout(() => {
            this.logout();
            this.showNotification('Đã tự động đăng xuất do không hoạt động!', 'warning');
        }, 5 * 60 * 1000); // 5 phút
    },

    // Dừng timer không hoạt động
    stopInactivityTimer() {
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
            this.inactivityTimer = null;
        }
    },

    // Theo dõi hoạt động của user
    trackUserActivity() {
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

        events.forEach(event => {
            document.addEventListener(event, () => {
                if (this.isAuthenticated) {
                    this.resetInactivityTimer();
                }
            }, true);
        });
    },

    // Cập nhật UI sau khi đăng nhập/đăng xuất
    updateUI() {
        // Desktop elements
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const userDisplay = document.getElementById('userDisplay');
        const userName = document.getElementById('userName');

        // Mobile elements
        const mobileLoginBtn = document.getElementById('mobileLoginBtn');
        const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
        const mobileUserDisplay = document.getElementById('mobileUserDisplay');
        const mobileUserName = document.getElementById('mobileUserName');

        if (this.isAuthenticated && this.user) {
            // Desktop: Ẩn nút đăng nhập, hiển thị user info và nút đăng xuất
            if (loginBtn) loginBtn.style.display = 'none';
            if (logoutBtn) {
                logoutBtn.style.display = 'block';
                logoutBtn.onclick = () => this.logout();
            }
            if (userDisplay) userDisplay.classList.remove('hidden');
            if (userName) userName.textContent = this.user.full_name;

            // Mobile: Ẩn nút đăng nhập, hiển thị user info và nút đăng xuất
            if (mobileLoginBtn) mobileLoginBtn.style.display = 'none';
            if (mobileLogoutBtn) {
                mobileLogoutBtn.style.display = 'block';
                mobileLogoutBtn.onclick = () => this.logout();
            }
            if (mobileUserDisplay) mobileUserDisplay.classList.remove('hidden');
            if (mobileUserName) mobileUserName.textContent = this.user.full_name;

        } else {
            // Desktop: Hiển thị nút đăng nhập, ẩn user info
            if (loginBtn) loginBtn.style.display = 'block';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (userDisplay) userDisplay.classList.add('hidden');

            // Mobile: Hiển thị nút đăng nhập, ẩn user info
            if (mobileLoginBtn) mobileLoginBtn.style.display = 'block';
            if (mobileLogoutBtn) mobileLogoutBtn.style.display = 'none';
            if (mobileUserDisplay) mobileUserDisplay.classList.add('hidden');
        }
    },

    // Hiển thị thông báo
    showNotification(message, type = 'info') {
        // Tạo element thông báo
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        // Thêm styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease-out;
        `;

        // Thêm CSS animation nếu chưa có
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); }
                    to { transform: translateX(100%); }
                }
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Trigger animation
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);

        // Tự động xóa sau 3 giây
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
};

// Initialize auth state
auth.init();

// Export auth object
window.auth = auth;

function getCurrentUser() {
    const user = JSON.parse(localStorage.getItem('user'));
    return user;
}

function checkAuth() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

function getUserId() {
    const user = JSON.parse(localStorage.getItem('user'));
    return user ? user.id : null;
}

// Hàm test kết nối backend
async function testBackendConnection() {
  try {
    console.log('Testing backend connection...');
    const response = await fetch(`${API_BASE_URL}/test`);
    const data = await response.json();
    console.log('Backend connection test:', data);
  } catch (error) {
    console.error('Backend connection failed:', error);
  }
}

// Gọi hàm test khi auth.js được tải
testBackendConnection();
