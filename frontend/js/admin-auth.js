// Admin Authentication and Authorization System
class AdminAuth {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.loadCurrentUser();
        this.setupEventListeners();
    }

    // Load current logged in admin/staff
    loadCurrentUser() {
        try {
            const adminUser = localStorage.getItem('adminUser');
            if (adminUser) {
                this.currentUser = JSON.parse(adminUser);
                console.log('👤 Admin user loaded:', this.currentUser.username, '- Role:', this.currentUser.role);
            }
        } catch (error) {
            console.error('Error loading admin user:', error);
            this.currentUser = null;
        }
    }

    // Check if user is logged in
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // Check if user is admin
    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    }

    // Check if user is staff
    isStaff() {
        return this.currentUser && this.currentUser.role === 'staff';
    }

    // Check if user has permission for specific action
    hasPermission(action) {
        if (!this.currentUser) return false;

        const permissions = {
            'admin': [
                'view_invoices', 'edit_invoices', 'delete_invoices',
                'approve_invoices', 'reject_invoices', 'create_staff',
                'manage_staff', 'view_reports', 'system_settings'
            ],
            'staff': [
                'view_invoices'
            ]
        };

        const userPermissions = permissions[this.currentUser.role] || [];
        return userPermissions.includes(action);
    }

    // Login function
    login(username, password) {
        try {
            // Get stored admin accounts
            const adminAccounts = this.getAdminAccounts();
            
            // Find matching account
            const account = adminAccounts.find(acc => 
                acc.username === username && acc.password === password
            );

            if (account) {
                // Create session
                this.currentUser = {
                    id: account.id,
                    username: account.username,
                    fullName: account.fullName,
                    role: account.role,
                    loginTime: new Date().toISOString()
                };

                // Save to localStorage
                localStorage.setItem('adminUser', JSON.stringify(this.currentUser));
                
                console.log('✅ Admin login successful:', this.currentUser);
                return { success: true, user: this.currentUser };
            } else {
                console.log('❌ Invalid credentials');
                return { success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Có lỗi xảy ra khi đăng nhập' };
        }
    }

    // Logout function
    logout() {
        this.currentUser = null;
        localStorage.removeItem('adminUser');
        console.log('✅ Admin logout successful');
        
        // Redirect to login page
        window.location.href = 'admin-login.html';
    }

    // Get all admin accounts
    getAdminAccounts() {
        try {
            const accounts = localStorage.getItem('adminAccounts');
            if (accounts) {
                return JSON.parse(accounts);
            } else {
                // Create default accounts if none exist
                return this.createDefaultAccounts();
            }
        } catch (error) {
            console.error('Error loading admin accounts:', error);
            return this.createDefaultAccounts();
        }
    }

    // Create default admin accounts
    createDefaultAccounts() {
        const defaultAccounts = [
            {
                id: 'admin_001',
                username: 'admin',
                password: 'admin123',
                fullName: 'Quản trị viên',
                role: 'admin',
                createdAt: new Date().toISOString(),
                isActive: true
            },
            {
                id: 'staff_001',
                username: 'staff001',
                password: 'staff123',
                fullName: 'Nhân viên 001',
                role: 'staff',
                createdAt: new Date().toISOString(),
                isActive: true
            }
        ];

        localStorage.setItem('adminAccounts', JSON.stringify(defaultAccounts));
        console.log('✅ Default admin accounts created');
        return defaultAccounts;
    }

    // Create new staff account (admin only)
    createStaffAccount(staffData) {
        if (!this.isAdmin()) {
            return { success: false, message: 'Chỉ admin mới có thể tạo tài khoản nhân viên' };
        }

        try {
            const accounts = this.getAdminAccounts();
            
            // Check if username already exists
            if (accounts.find(acc => acc.username === staffData.username)) {
                return { success: false, message: 'Tên đăng nhập đã tồn tại' };
            }

            // Create new staff account
            const newStaff = {
                id: 'staff_' + Date.now(),
                username: staffData.username,
                password: staffData.password,
                fullName: staffData.fullName,
                role: 'staff',
                createdAt: new Date().toISOString(),
                createdBy: this.currentUser.id,
                isActive: true
            };

            accounts.push(newStaff);
            localStorage.setItem('adminAccounts', JSON.stringify(accounts));

            console.log('✅ Staff account created:', newStaff.username);
            return { success: true, staff: newStaff };
        } catch (error) {
            console.error('Error creating staff account:', error);
            return { success: false, message: 'Có lỗi xảy ra khi tạo tài khoản' };
        }
    }

    // Get all staff accounts (admin only)
    getStaffAccounts() {
        if (!this.isAdmin()) {
            return [];
        }

        const accounts = this.getAdminAccounts();
        return accounts.filter(acc => acc.role === 'staff');
    }

    // Update staff account (admin only)
    updateStaffAccount(staffId, updateData) {
        if (!this.isAdmin()) {
            return { success: false, message: 'Không có quyền thực hiện thao tác này' };
        }

        try {
            const accounts = this.getAdminAccounts();
            const staffIndex = accounts.findIndex(acc => acc.id === staffId && acc.role === 'staff');

            if (staffIndex === -1) {
                return { success: false, message: 'Không tìm thấy tài khoản nhân viên' };
            }

            // Update staff data
            accounts[staffIndex] = { ...accounts[staffIndex], ...updateData };
            localStorage.setItem('adminAccounts', JSON.stringify(accounts));

            console.log('✅ Staff account updated:', staffId);
            return { success: true };
        } catch (error) {
            console.error('Error updating staff account:', error);
            return { success: false, message: 'Có lỗi xảy ra khi cập nhật tài khoản' };
        }
    }

    // Delete staff account (admin only)
    deleteStaffAccount(staffId) {
        if (!this.isAdmin()) {
            return { success: false, message: 'Không có quyền thực hiện thao tác này' };
        }

        try {
            const accounts = this.getAdminAccounts();
            const filteredAccounts = accounts.filter(acc => acc.id !== staffId);

            localStorage.setItem('adminAccounts', JSON.stringify(filteredAccounts));

            console.log('✅ Staff account deleted:', staffId);
            return { success: true };
        } catch (error) {
            console.error('Error deleting staff account:', error);
            return { success: false, message: 'Có lỗi xảy ra khi xóa tài khoản' };
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Auto logout after inactivity (optional)
        let inactivityTimer;
        const resetTimer = () => {
            clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(() => {
                if (this.isLoggedIn()) {
                    alert('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
                    this.logout();
                }
            }, 30 * 60 * 1000); // 30 minutes
        };

        // Reset timer on user activity
        document.addEventListener('click', resetTimer);
        document.addEventListener('keypress', resetTimer);
        document.addEventListener('scroll', resetTimer);
    }

    // Get current user info
    getCurrentUser() {
        return this.currentUser;
    }

    // Check page access permission
    checkPageAccess(requiredPermission) {
        if (!this.isLoggedIn()) {
            window.location.href = 'admin-login.html';
            return false;
        }

        if (requiredPermission && !this.hasPermission(requiredPermission)) {
            alert('Bạn không có quyền truy cập trang này!');
            window.location.href = 'admin-dashboard.html';
            return false;
        }

        return true;
    }
}

// Export for global use
window.AdminAuth = AdminAuth;
