const API_BASE_URL = 'http://localhost:3000/api';

// Auth state management
const auth = {
    isAuthenticated: false,
    user: null,

    // Initialize auth state from localStorage
    init() {
        const user = localStorage.getItem('user');
        if (user) {
            this.isAuthenticated = true;
            this.user = JSON.parse(user);
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
            if (data.token) { // Lưu token nếu có
                localStorage.setItem('token', data.token);
            }
            this.isAuthenticated = true;
            this.user = data.khach_hang;

            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw new Error(error.message || 'Lỗi kết nối máy chủ');
        }
    },

    // Logout
    logout() {
        localStorage.removeItem('user');
        localStorage.removeItem('token'); // Xóa cả token khi logout
        this.isAuthenticated = false;
        this.user = null;
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
