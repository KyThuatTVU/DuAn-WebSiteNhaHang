const API_BASE_URL = 'http://localhost:3000/api';

// Unified Auth System - Hệ thống xác thực đồng nhất
const auth = {
    isAuthenticated: false,
    user: null,
    token: null,
    refreshToken: null,
    tokenExpiry: null,
    activityTimer: null,
    warningTimer: null,
    refreshTimer: null,
    sessionCheckTimer: null,
    INACTIVITY_TIMEOUT: 2 * 60 * 1000, // 2 phút không hoạt động
    WARNING_TIME: 30 * 1000, // 30 giây trước khi đăng xuất
    TOKEN_REFRESH_INTERVAL: 90 * 1000, // 90 giây (refresh trước khi token hết hạn)
    TOKEN_EXPIRY: 2 * 60 * 1000, // 2 phút
    SESSION_CHECK_INTERVAL: 10 * 1000, // Kiểm tra session mỗi 10 giây

    // Initialize auth state from localStorage
    init() {
        console.log('🔧 Initializing unified auth system...');
        const user = localStorage.getItem('user') || localStorage.getItem('userData');
        const token = localStorage.getItem('token');
        const refreshToken = localStorage.getItem('refreshToken');
        const tokenExpiry = localStorage.getItem('tokenExpiry');
        const tokenTimestamp = localStorage.getItem('tokenTimestamp');

        if (user && token) {
            // Kiểm tra token có hết hạn không
            if (tokenExpiry && Date.now() > parseInt(tokenExpiry)) {
                console.log('⚠️ Token expired, clearing auth data');
                this.clearAuthData();
                return;
            }

            this.isAuthenticated = true;
            this.user = JSON.parse(user);
            this.token = token;
            this.refreshToken = refreshToken;
            this.tokenExpiry = tokenExpiry ? parseInt(tokenExpiry) : null;

            console.log('✅ User authenticated:', this.user.email);
            console.log('🔑 Token expires at:', this.tokenExpiry ? new Date(this.tokenExpiry) : 'Unknown');

            this.startActivityTracking();
            this.startTokenRefresh();
            this.startSessionCheck();
        } else {
            console.log('❌ No valid auth data found');
        }
    },

    // Kiểm tra token có hết hạn không
    isTokenExpired(tokenTimestamp) {
        if (!tokenTimestamp) return true;
        const now = Date.now();
        const tokenAge = now - parseInt(tokenTimestamp);
        return tokenAge > this.TOKEN_EXPIRY;
    },

    // Xóa tất cả dữ liệu auth
    clearAuthData() {
        // Xóa tất cả keys liên quan đến auth
        localStorage.removeItem('user');
        localStorage.removeItem('userData');
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('customerData');
        localStorage.removeItem('authTimestamp');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('tokenTimestamp');
        localStorage.removeItem('tokenExpiry');
        localStorage.removeItem('redirectAfterLogin');

        // Clear cart data khi logout
        localStorage.removeItem('cartData');
        localStorage.removeItem('cart');

        // Reset object properties
        this.isAuthenticated = false;
        this.user = null;
        this.token = null;
        this.refreshToken = null;
        this.tokenExpiry = null;

        // Stop all timers
        this.stopActivityTracking();
        this.stopTokenRefresh();

        console.log('🗑️ All auth data cleared including payment compatibility keys');
    },

    // Lưu user data và token
    saveUserData(userData, token = null, refreshToken = null, tokenExpiry = null) {
        const timestamp = Date.now().toString();
        // Lưu cả nhiều format để tương thích với tất cả components
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('loggedInUser', JSON.stringify(userData)); // Cho payment.js
        localStorage.setItem('customerData', JSON.stringify(userData)); // Cho payment.js
        localStorage.setItem('authTimestamp', timestamp);

        // Lưu token và thông tin hết hạn
        if (token) {
            localStorage.setItem('token', token);
            localStorage.setItem('tokenTimestamp', timestamp);
        }
        if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
        }
        if (tokenExpiry) {
            localStorage.setItem('tokenExpiry', tokenExpiry.toString());
        }

        console.log('💾 User data saved with timestamp:', timestamp);
        console.log('💾 User data saved for ThanhToan.html compatibility');
        console.log('💾 Saved keys: user, userData, loggedInUser, customerData');
        console.log('💾 User info:', {
            id: userData.id,
            name: userData.full_name || userData.name,
            email: userData.email,
            phone: userData.phone
        });
    },

    // Lưu auth data với timestamp (unified format) - DEPRECATED
    saveAuthData(userData, token, refreshToken = null) {
        // Chỉ lưu user data, bỏ qua token
        this.saveUserData(userData);
    },

    // Unified Login - Đăng nhập đồng nhất
    async login(email, password) {
        try {
            console.log('🔐 Attempting unified login for:', email);
            console.log('🌐 API URL:', `${API_BASE_URL}/khach_hang/login`);

            const response = await fetch(`${API_BASE_URL}/khach_hang/login?t=${Date.now()}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                },
                body: JSON.stringify({ email, password })
            });

            console.log('📡 Response status:', response.status, 'OK:', response.ok);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ HTTP Error:', response.status, errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log('📥 Response data:', data);

            if (!data.success) {
                console.error('❌ Login failed:', data);
                throw new Error(data.error || 'Đăng nhập thất bại');
            }

            // Lưu user data và token
            this.saveUserData(data.khach_hang, data.token, data.refreshToken, data.tokenExpiry);
            this.isAuthenticated = true;
            this.user = data.khach_hang;
            this.token = data.token;
            this.refreshToken = data.refreshToken;
            this.tokenExpiry = data.tokenExpiry;

            // Bắt đầu theo dõi hoạt động và session
            this.startActivityTracking();
            this.startTokenRefresh();
            this.startSessionCheck();

            // Broadcast login event cho tất cả components
            this.broadcastAuthChange('login', this.user);

            // Xử lý redirect sau khi đăng nhập
            this.handlePostLoginRedirect();

            console.log('✅ Unified login successful for:', this.user.email);
            console.log('🔑 Token expires at:', new Date(data.tokenExpiry));
            return data;
        } catch (error) {
            console.error('❌ Login error:', error);
            throw new Error(error.message || 'Lỗi kết nối máy chủ');
        }
    },

    // Unified Logout - Đăng xuất đồng nhất
    logout() {
        console.log('🚪 Unified logout initiated');

        // Dừng tất cả timers và tracking
        this.stopActivityTracking();
        this.stopTokenRefresh();

        // Broadcast logout event trước khi clear data
        this.broadcastAuthChange('logout', null);

        // Clear tất cả auth data
        this.clearAuthData();

        // Ẩn các warning/modal nếu có
        this.hideSessionWarning();
        const sessionModal = document.getElementById('sessionExpiredModal');
        if (sessionModal) {
            sessionModal.remove();
        }



        console.log('✅ Unified logout completed');

        // Redirect về trang chủ nếu cần
        if (window.location.pathname.includes('ThanhToan') ||
            window.location.pathname.includes('HoaDon') ||
            window.location.pathname.includes('DanhSach')) {
            window.location.href = 'Index-new.html';
        }
    },

    // Broadcast auth changes to all components
    broadcastAuthChange(type, userData) {
        const event = new CustomEvent('authStateChanged', {
            detail: { type, user: userData }
        });
        window.dispatchEvent(event);
        console.log('📢 Auth state broadcasted:', type, userData?.email || 'none');
    },

    // Unified Register - Đăng ký đồng nhất
    async register(userData) {
        try {
            console.log('📝 Attempting unified registration for:', userData.email);

            // Map old field names to new structure
            const registerData = {
                full_name: userData.ho_ten || userData.full_name,
                email: userData.email,
                password: userData.mat_khau || userData.password,
                phone: userData.so_dien_thoai || userData.phone
            };

            const registerUrl = `${API_BASE_URL}/khach_hang/register`;
            const response = await fetch(registerUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(registerData)
            });

            const data = await response.json();
            console.log('📥 Registration response:', data);

            if (!response.ok) {
                console.error('❌ Registration failed:', data);
                throw new Error(data.error || 'Đăng ký thất bại. Vui lòng thử lại.');
            }

            // Tự động đăng nhập sau khi đăng ký thành công
            if (data.khach_hang) {
                this.saveUserData(data.khach_hang);
                this.isAuthenticated = true;
                this.user = data.khach_hang;

                // Bắt đầu theo dõi hoạt động (không cần token)
                this.startActivityTracking();

                // Broadcast register event
                this.broadcastAuthChange('register', this.user);

                // Xử lý redirect sau khi đăng ký
                this.handlePostLoginRedirect();

                console.log('✅ Unified registration successful for:', this.user.email);
            }

            return data;
        } catch (error) {
            console.error('❌ Registration error:', error.message);
            throw error;
        }
    },

    // Bắt đầu theo dõi hoạt động người dùng (chỉ tương tác thực sự)
    startActivityTracking() {
        this.resetActivityTimer();

        // Chỉ lắng nghe các sự kiện tương tác thực sự của người dùng
        // Loại bỏ scroll và mousemove để tránh false positive
        const realInteractionEvents = ['mousedown', 'keydown', 'keypress', 'touchstart', 'click'];

        realInteractionEvents.forEach(event => {
            document.addEventListener(event, this.resetActivityTimer.bind(this), true);
        });

        console.log('🔄 Activity tracking started - monitoring real user interactions only');
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
        if (this.sessionCheckTimer) {
            clearInterval(this.sessionCheckTimer);
            this.sessionCheckTimer = null;
        }

        // Xóa event listeners cho tương tác thực sự
        const realInteractionEvents = ['mousedown', 'keydown', 'keypress', 'touchstart', 'click'];
        realInteractionEvents.forEach(event => {
            document.removeEventListener(event, this.resetActivityTimer.bind(this), true);
        });
    },

    // Bắt đầu kiểm tra session định kỳ
    startSessionCheck() {
        console.log('🔍 Starting session check...');

        if (this.sessionCheckTimer) {
            clearInterval(this.sessionCheckTimer);
        }

        this.sessionCheckTimer = setInterval(() => {
            this.checkTokenExpiry();
        }, this.SESSION_CHECK_INTERVAL);
    },

    // Kiểm tra token có hết hạn không
    checkTokenExpiry() {
        if (!this.isAuthenticated || !this.tokenExpiry) {
            return;
        }

        const now = Date.now();
        const timeUntilExpiry = this.tokenExpiry - now;

        // Nếu token đã hết hạn
        if (timeUntilExpiry <= 0) {
            console.log('⏰ Token expired, auto logout');
            this.handleSessionExpired();
            return;
        }

        // Nếu token sắp hết hạn (còn 30 giây) và chưa hiển thị warning
        if (timeUntilExpiry <= this.WARNING_TIME && !this.warningTimer) {
            console.log('⚠️ Token expiring soon, showing warning');
            this.showSessionWarning();
        }
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

        // Đặt timer cảnh báo (1.5 phút)
        this.warningTimer = setTimeout(() => {
            this.showSessionWarning();
        }, this.INACTIVITY_TIMEOUT - this.WARNING_TIME);

        // Đặt timer đăng xuất (2 phút)
        this.activityTimer = setTimeout(() => {
            this.autoLogout();
        }, this.INACTIVITY_TIMEOUT);
    },

    // Xử lý khi session hết hạn
    handleSessionExpired() {
        console.log('🚪 Session expired, logging out...');
        this.showSessionExpiredDialog();
        this.logout();
    },

    // Hiển thị dialog thông báo session hết hạn (giống như ảnh)
    showSessionExpiredDialog() {
        // Xóa modal cũ nếu có
        const existingModal = document.getElementById('sessionExpiredModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Tạo modal đơn giản giống như ảnh
        const modal = document.createElement('div');
        modal.id = 'sessionExpiredModal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.style.fontFamily = 'Arial, sans-serif';
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-lg" style="width: 400px; max-width: 90vw;">
                <!-- Header với icon cảnh báo -->
                <div class="flex items-center p-4 bg-blue-50 rounded-t-lg border-b">
                    <div class="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                        <span class="text-white font-bold text-lg">!</span>
                    </div>
                    <span class="text-gray-800 font-medium">Phiên làm việc đã hết hạn, vui lòng đăng nhập lại</span>
                </div>

                <!-- Nút đóng -->
                <div class="p-4 text-right">
                    <button id="closeSessionModal" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-medium">
                        Đóng
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Xử lý click nút đóng
        document.getElementById('closeSessionModal').addEventListener('click', () => {
            modal.remove();
            this.redirectToLogin();
        });

        // Cho phép đóng bằng click outside (giống như ảnh)
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                this.redirectToLogin();
            }
        });

        // Cho phép đóng bằng ESC
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                this.redirectToLogin();
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);

        console.log('🚨 Session expired dialog shown');
    },



    // Redirect đến trang đăng nhập
    redirectToLogin() {
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.classList.add('active');
        } else {
            window.location.href = 'Index-new.html';
        }
    },

    // Hiển thị cảnh báo session sắp hết hạn (đơn giản)
    showSessionWarning() {
        const existingWarning = document.getElementById('sessionWarning');
        if (existingWarning) return;

        // Tạo modal cảnh báo đơn giản
        const warning = document.createElement('div');
        warning.id = 'sessionWarning';
        warning.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40';
        warning.style.fontFamily = 'Arial, sans-serif';
        warning.innerHTML = `
            <div class="bg-white rounded-lg shadow-lg" style="width: 400px; max-width: 90vw;">
                <!-- Header với icon cảnh báo -->
                <div class="flex items-center p-4 bg-blue-50 rounded-t-lg border-b">
                    <div class="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                        <span class="text-white font-bold text-lg">!</span>
                    </div>
                    <span class="text-gray-800 font-medium">Phiên của bạn sẽ hết hạn trong <span id="countdown" class="font-bold text-red-600">30</span> giây</span>
                </div>

                <!-- Nút hành động -->
                <div class="p-4 flex space-x-2">
                    <button id="extendSession" class="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-medium">
                        Gia hạn
                    </button>
                    <button id="logoutNow" class="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-medium">
                        Đăng xuất
                    </button>
                </div>
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
                // Tự động đăng xuất khi hết thời gian
                this.hideSessionWarning();
                this.handleSessionExpired();
            }
        }, 1000);

        // Extend session button
        document.getElementById('extendSession')?.addEventListener('click', () => {
            clearInterval(countdownInterval);
            this.extendSession();
        });

        // Logout now button
        document.getElementById('logoutNow')?.addEventListener('click', () => {
            clearInterval(countdownInterval);
            this.hideSessionWarning();
            this.handleSessionExpired();
        });

        // Cho phép đóng bằng click outside
        warning.addEventListener('click', (e) => {
            if (e.target === warning) {
                clearInterval(countdownInterval);
                this.hideSessionWarning();
                this.handleSessionExpired();
            }
        });

        console.log('⚠️ Session warning shown');
    },

    // Ẩn cảnh báo session
    hideSessionWarning() {
        const warning = document.getElementById('sessionWarning');
        if (warning) {
            warning.remove();
        }

    },

    // Gia hạn session
    async extendSession() {
        try {
            console.log('🔄 Extending session...');

            // Refresh token để gia hạn session
            await this.refreshAccessToken();

            // Reset activity timer
            this.resetActivityTimer();

            // Ẩn warning
            this.hideSessionWarning();

            console.log('✅ Session extended successfully');
        } catch (error) {
            console.error('❌ Failed to extend session:', error);
            this.handleSessionExpired();
        }
    },

    // Tự động đăng xuất
    autoLogout() {
        console.log('🚪 Auto logout due to inactivity');
        this.handleSessionExpired();
    },

    // Refresh access token
    async refreshAccessToken() {
        try {
            if (!this.refreshToken) {
                throw new Error('No refresh token available');
            }

            console.log('🔄 Refreshing access token...');

            const response = await fetch(`${API_BASE_URL}/khach_hang/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    refreshToken: this.refreshToken
                })
            });

            if (!response.ok) {
                throw new Error('Failed to refresh token');
            }

            const data = await response.json();

            // Cập nhật token mới
            this.token = data.token;
            this.tokenExpiry = data.tokenExpiry;

            // Lưu token mới
            localStorage.setItem('token', data.token);
            localStorage.setItem('tokenExpiry', data.tokenExpiry.toString());
            localStorage.setItem('tokenTimestamp', Date.now().toString());

            console.log('✅ Token refreshed successfully');
            return data;
        } catch (error) {
            console.error('❌ Token refresh failed:', error);
            throw error;
        }
    },

    // Ẩn cảnh báo session
    hideSessionWarning() {
        const warning = document.getElementById('sessionWarning');
        if (warning) {
            warning.remove();
        }
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
                return true;
            } else {
                console.error('Token refresh failed:', data.error);
                this.autoLogout();
                return false;
            }
        } catch (error) {
            console.error('Token refresh error:', error);
            this.autoLogout();
            return false;
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

        console.log('🔒 Login required, redirecting...');

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
    },

    // Unified API Call với auto token refresh
    async apiCall(url, options = {}) {
        const token = localStorage.getItem('token');

        if (!token) {
            throw new Error('No authentication token available');
        }

        // Thêm Authorization header
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        };

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            // Nếu 401, thử refresh token
            if (response.status === 401) {
                console.log('🔄 Token expired, attempting refresh...');
                const refreshed = await this.refreshToken();

                if (refreshed) {
                    // Retry với token mới
                    const newToken = localStorage.getItem('token');
                    headers.Authorization = `Bearer ${newToken}`;

                    return await fetch(url, {
                        ...options,
                        headers
                    });
                } else {
                    // Refresh thất bại, logout
                    this.logout();
                    throw new Error('Session expired. Please login again.');
                }
            }

            return response;
        } catch (error) {
            console.error('❌ API call failed:', error);
            throw error;
        }
    },

    // Get current user info
    getCurrentUser() {
        return this.user;
    },

    // Check if user is authenticated
    isLoggedIn() {
        return this.isAuthenticated && this.user;
    },

    // Get auth headers for manual API calls
    getAuthHeaders() {
        const token = localStorage.getItem('token');
        return token ? {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        } : {
            'Content-Type': 'application/json'
        };
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
    console.log('🔍 Testing backend connection...');
    console.log('🌐 API URL:', `${API_BASE_URL}/test`);
    const response = await fetch(`${API_BASE_URL}/test`);
    console.log('📡 Test response status:', response.status, 'OK:', response.ok);
    const data = await response.json();
    console.log('✅ Backend connection test successful:', data);
  } catch (error) {
    console.error('❌ Backend connection failed:', error);
    console.error('❌ Error details:', error.message);
  }
}

// Expose auth object to global scope
window.auth = auth;

// Initialize auth system when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔧 Initializing auth system...');
    auth.init();
});

// Also initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
    // DOM is still loading, wait for DOMContentLoaded
} else {
    // DOM is already loaded
    console.log('🔧 DOM already loaded, initializing auth system...');
    auth.init();
}

// Gọi hàm test khi auth.js được tải
testBackendConnection();
