const API_BASE_URL = 'http://localhost:3000/api';

// Auth state management
const auth = {
    isAuthenticated: false,
    user: null,
    activityTimer: null,
    warningTimer: null,
    refreshTimer: null,
    INACTIVITY_TIMEOUT: 3 * 60 * 1000, // 3 phút
    WARNING_TIME: 30 * 1000, // 30 giây trước khi đăng xuất
    TOKEN_REFRESH_INTERVAL: 4 * 60 * 1000, // 4 phút (trước khi token hết hạn)

    // Initialize auth state from localStorage
    init() {
        const user = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (user && token) {
            this.isAuthenticated = true;
            this.user = JSON.parse(user);
            this.startActivityTracking();
            this.startTokenRefresh();
        }
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
            if (data.token) {
                localStorage.setItem('token', data.token);
            }
            if (data.refreshToken) {
                localStorage.setItem('refreshToken', data.refreshToken);
            }
            this.isAuthenticated = true;
            this.user = data.khach_hang;

            // Bắt đầu theo dõi hoạt động và refresh token
            this.startActivityTracking();
            this.startTokenRefresh();

            // Xử lý redirect sau khi đăng nhập
            this.handlePostLoginRedirect();

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
        localStorage.removeItem('refreshToken');
        this.isAuthenticated = false;
        this.user = null;

        // Dừng tất cả timers
        this.stopActivityTracking();
        this.stopTokenRefresh();
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
            // Tự động đăng nhập sau khi đăng ký thành công
            if (data.token && data.refreshToken) {
                localStorage.setItem('user', JSON.stringify(data.khach_hang));
                localStorage.setItem('token', data.token);
                localStorage.setItem('refreshToken', data.refreshToken);
                this.isAuthenticated = true;
                this.user = data.khach_hang;

                // Bắt đầu theo dõi hoạt động và refresh token
                this.startActivityTracking();
                this.startTokenRefresh();

                // Xử lý redirect sau khi đăng ký
                this.handlePostLoginRedirect();
            }

            return data;
        } catch (error) {
            console.error('Registration error:', error.message);
            throw error;
        }
    },

    // Bắt đầu theo dõi hoạt động người dùng
    startActivityTracking() {
        this.resetActivityTimer();

        // Lắng nghe các sự kiện hoạt động
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        events.forEach(event => {
            document.addEventListener(event, this.resetActivityTimer.bind(this), true);
        });
    },

    // Dừng theo dõi hoạt động
    stopActivityTracking() {
        if (this.activityTimer) {
            clearTimeout(this.activityTimer);
            this.activityTimer = null;
        }
        if (this.warningTimer) {
            clearTimeout(this.warningTimer);
            this.warningTimer = null;
        }

        // Xóa event listeners
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        events.forEach(event => {
            document.removeEventListener(event, this.resetActivityTimer.bind(this), true);
        });
    },

    // Reset timer hoạt động
    resetActivityTimer() {
        if (!this.isAuthenticated) return;

        // Xóa timer cũ
        if (this.activityTimer) {
            clearTimeout(this.activityTimer);
        }
        if (this.warningTimer) {
            clearTimeout(this.warningTimer);
        }

        // Ẩn cảnh báo nếu đang hiển thị
        this.hideSessionWarning();

        // Đặt timer cảnh báo (2.5 phút)
        this.warningTimer = setTimeout(() => {
            this.showSessionWarning();
        }, this.INACTIVITY_TIMEOUT - this.WARNING_TIME);

        // Đặt timer đăng xuất (3 phút)
        this.activityTimer = setTimeout(() => {
            this.autoLogout();
        }, this.INACTIVITY_TIMEOUT);
    },

    // Hiển thị cảnh báo session sắp hết hạn
    showSessionWarning() {
        const existingWarning = document.getElementById('sessionWarning');
        if (existingWarning) return;

        const warning = document.createElement('div');
        warning.id = 'sessionWarning';
        warning.className = 'fixed top-4 right-4 bg-yellow-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm';
        warning.innerHTML = `
            <div class="flex items-center justify-between">
                <div>
                    <h4 class="font-bold">Cảnh báo phiên làm việc</h4>
                    <p class="text-sm">Phiên của bạn sẽ hết hạn trong <span id="countdown">30</span> giây</p>
                </div>
                <button id="extendSession" class="ml-4 bg-white text-yellow-500 px-3 py-1 rounded text-sm font-bold hover:bg-gray-100">
                    Gia hạn
                </button>
            </div>
        `;

        document.body.appendChild(warning);

        // Countdown
        let countdown = 30;
        const countdownEl = document.getElementById('countdown');
        const countdownInterval = setInterval(() => {
            countdown--;
            if (countdownEl) {
                countdownEl.textContent = countdown;
            }
            if (countdown <= 0) {
                clearInterval(countdownInterval);
            }
        }, 1000);

        // Extend session button
        document.getElementById('extendSession')?.addEventListener('click', () => {
            this.resetActivityTimer();
            clearInterval(countdownInterval);
        });
    },

    // Ẩn cảnh báo session
    hideSessionWarning() {
        const warning = document.getElementById('sessionWarning');
        if (warning) {
            warning.remove();
        }
    },

    // Tự động đăng xuất
    autoLogout() {
        this.hideSessionWarning();
        this.logout();

        // Hiển thị thông báo
        this.showAutoLogoutNotification();

        // Reload trang để cập nhật UI
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    },

    // Hiển thị thông báo tự động đăng xuất
    showAutoLogoutNotification() {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm';
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-exclamation-triangle mr-2"></i>
                <div>
                    <h4 class="font-bold">Đã đăng xuất tự động</h4>
                    <p class="text-sm">Phiên làm việc đã hết hạn do không hoạt động</p>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    },

    // Bắt đầu refresh token tự động
    startTokenRefresh() {
        this.refreshTimer = setInterval(async () => {
            await this.refreshToken();
        }, this.TOKEN_REFRESH_INTERVAL);
    },

    // Dừng refresh token
    stopTokenRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    },

    // Refresh token
    async refreshToken() {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                this.autoLogout();
                return;
            }

            const response = await fetch(`${API_BASE_URL}/khach_hang/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refreshToken })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                console.log('Token refreshed successfully');
            } else {
                console.error('Token refresh failed:', data.error);
                this.autoLogout();
            }
        } catch (error) {
            console.error('Token refresh error:', error);
            this.autoLogout();
        }
    },

    // Xử lý redirect sau khi đăng nhập thành công
    handlePostLoginRedirect() {
        const redirectTarget = localStorage.getItem('redirectAfterLogin');

        if (redirectTarget) {
            // Xóa redirect flag
            localStorage.removeItem('redirectAfterLogin');

            // Xử lý các loại redirect khác nhau
            switch (redirectTarget) {
                case 'cart':
                    // Mở giỏ hàng sau khi đăng nhập
                    setTimeout(() => {
                        if (window.cartManager) {
                            window.cartManager.openCartModal();
                        }
                    }, 500);
                    break;

                case 'checkout':
                    // Redirect đến trang thanh toán
                    setTimeout(() => {
                        window.location.href = 'ThanhToan.html';
                    }, 500);
                    break;

                default:
                    // Redirect tùy chỉnh khác
                    if (redirectTarget.startsWith('http') || redirectTarget.startsWith('/')) {
                        setTimeout(() => {
                            window.location.href = redirectTarget;
                        }, 500);
                    }
                    break;
            }
        }
    },

    // Yêu cầu đăng nhập với redirect
    requireLogin(redirectTo = null) {
        if (this.isAuthenticated) {
            return true;
        }

        // Lưu redirect target
        if (redirectTo) {
            localStorage.setItem('redirectAfterLogin', redirectTo);
        }

        // Hiển thị modal đăng nhập hoặc redirect
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.classList.add('active');
        } else {
            // Redirect đến trang có form đăng nhập
            window.location.href = 'Index-new.html';
        }

        return false;
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
