// Social Authentication - Google & Facebook Login
class SocialAuth {
    constructor() {
        this.googleClientId = ''; // Sẽ được cấu hình
        this.facebookAppId = ''; // Sẽ được cấu hình
        this.isGoogleLoaded = false;
        this.isFacebookLoaded = false;
        this.init();
    }

    async init() {
        await this.loadGoogleAPI();
        await this.loadFacebookAPI();
        this.setupEventListeners();
        console.log('🔐 Social Auth initialized');
    }

    // Load Google API
    async loadGoogleAPI() {
        return new Promise((resolve) => {
            if (window.google) {
                this.isGoogleLoaded = true;
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = () => {
                this.isGoogleLoaded = true;
                this.initializeGoogle();
                resolve();
            };
            document.head.appendChild(script);
        });
    }

    // Load Facebook API
    async loadFacebookAPI() {
        return new Promise((resolve) => {
            if (window.FB) {
                this.isFacebookLoaded = true;
                resolve();
                return;
            }

            window.fbAsyncInit = () => {
                FB.init({
                    appId: this.facebookAppId || '1234567890', // Demo App ID
                    cookie: true,
                    xfbml: true,
                    version: 'v18.0'
                });
                this.isFacebookLoaded = true;
                resolve();
            };

            const script = document.createElement('script');
            script.src = 'https://connect.facebook.net/vi_VN/sdk.js';
            script.async = true;
            script.defer = true;
            script.crossOrigin = 'anonymous';
            document.head.appendChild(script);
        });
    }

    // Initialize Google Sign-In
    initializeGoogle() {
        if (!window.google) return;

        try {
            google.accounts.id.initialize({
                client_id: this.googleClientId || '1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com', // Demo Client ID
                callback: this.handleGoogleResponse.bind(this),
                auto_select: false,
                cancel_on_tap_outside: true
            });
        } catch (error) {
            console.warn('Google Sign-In initialization failed:', error);
        }
    }

    // Setup event listeners
    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.id === 'googleLoginBtn' || e.target.closest('#googleLoginBtn')) {
                this.loginWithGoogle();
            }
            if (e.target.id === 'facebookLoginBtn' || e.target.closest('#facebookLoginBtn')) {
                this.loginWithFacebook();
            }
        });
    }

    // Google Login
    async loginWithGoogle() {
        if (!this.isGoogleLoaded || !window.google) {
            this.showNotification('Google Sign-In chưa sẵn sàng. Vui lòng thử lại.', 'warning');
            return;
        }

        try {
            // Hiển thị popup đăng nhập Google
            google.accounts.id.prompt((notification) => {
                if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                    // Fallback: sử dụng popup
                    this.showGooglePopup();
                }
            });
        } catch (error) {
            console.error('Google login error:', error);
            this.showNotification('Lỗi đăng nhập Google. Vui lòng thử lại.', 'error');
        }
    }

    // Show Google popup as fallback
    showGooglePopup() {
        const popup = document.createElement('div');
        popup.className = 'modal active';
        popup.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md mx-4">
                <h3 class="text-lg font-bold mb-4">Đăng nhập Google</h3>
                <p class="text-gray-600 mb-4">Tính năng đăng nhập Google đang được phát triển.</p>
                <div class="text-center">
                    <button onclick="this.closest('.modal').remove()" class="bg-primary text-white px-4 py-2 rounded">Đóng</button>
                </div>
            </div>
        `;
        document.body.appendChild(popup);
    }

    // Handle Google response
    async handleGoogleResponse(response) {
        try {
            const credential = response.credential;
            const payload = this.parseJWT(credential);
            
            const userData = {
                provider: 'google',
                providerId: payload.sub,
                email: payload.email,
                full_name: payload.name,
                avatar: payload.picture,
                phone: '', // Google không cung cấp số điện thoại
                verified: payload.email_verified
            };

            await this.processSocialLogin(userData);
        } catch (error) {
            console.error('Google response error:', error);
            this.showNotification('Lỗi xử lý đăng nhập Google', 'error');
        }
    }

    // Facebook Login
    async loginWithFacebook() {
        if (!this.isFacebookLoaded || !window.FB) {
            this.showNotification('Facebook Login chưa sẵn sàng. Vui lòng thử lại.', 'warning');
            return;
        }

        try {
            FB.login((response) => {
                if (response.authResponse) {
                    this.getFacebookUserInfo(response.authResponse);
                } else {
                    this.showNotification('Đăng nhập Facebook bị hủy', 'info');
                }
            }, {
                scope: 'email,public_profile',
                return_scopes: true
            });
        } catch (error) {
            console.error('Facebook login error:', error);
            this.showNotification('Lỗi đăng nhập Facebook. Vui lòng thử lại.', 'error');
        }
    }

    // Get Facebook user info
    getFacebookUserInfo(authResponse) {
        FB.api('/me', {
            fields: 'id,name,email,picture.type(large)'
        }, (response) => {
            if (response && !response.error) {
                const userData = {
                    provider: 'facebook',
                    providerId: response.id,
                    email: response.email,
                    full_name: response.name,
                    avatar: response.picture?.data?.url,
                    phone: '', // Facebook không cung cấp số điện thoại
                    verified: true
                };

                this.processSocialLogin(userData);
            } else {
                console.error('Facebook API error:', response.error);
                this.showNotification('Lỗi lấy thông tin Facebook', 'error');
            }
        });
    }

    // Process social login
    async processSocialLogin(userData) {
        try {
            this.showNotification('Đang xử lý đăng nhập...', 'info');

            // Gửi thông tin đến backend
            const response = await fetch(`${API_BASE_URL}/khach_hang/social-login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (response.ok) {
                // Lưu thông tin user và token
                localStorage.setItem('user', JSON.stringify(data.khach_hang));
                localStorage.setItem('token', data.token);

                // Cập nhật auth state
                if (window.auth) {
                    window.auth.isAuthenticated = true;
                    window.auth.user = data.khach_hang;
                    window.auth.startTokenCheck();
                    window.auth.startInactivityTimer();
                    window.auth.updateUI();
                }

                // Đóng modal đăng nhập
                const loginModal = document.getElementById('loginModal');
                if (loginModal) {
                    loginModal.classList.remove('active');
                }

                // Dispatch event
                document.dispatchEvent(new CustomEvent('userLoggedIn'));

                this.showNotification(`Chào mừng ${data.khach_hang.full_name}!`, 'success');
            } else {
                throw new Error(data.error || 'Đăng nhập thất bại');
            }
        } catch (error) {
            console.error('Social login processing error:', error);
            this.showNotification(error.message, 'error');
        }
    }

    // Parse JWT token
    parseJWT(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('JWT parsing error:', error);
            return {};
        }
    }

    // Show notification
    showNotification(message, type = 'info') {
        if (window.auth && window.auth.showNotification) {
            window.auth.showNotification(message, type);
        } else {
            alert(message);
        }
    }
}

// Initialize social auth
const socialAuth = new SocialAuth();
window.socialAuth = socialAuth;
