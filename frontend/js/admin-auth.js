// Admin Authentication and Authorization System
class AdminAuth {
    constructor() {
        this.currentUser = null;
        // In-memory staff accounts storage
        this.staffAccounts = [];
        this.init();
    }

    init() {
        this.loadCurrentUser();
        this.setupEventListeners();

        // Initialize staff accounts storage
        this.initializeStaffAccounts();
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
            console.log('🔐 Login attempt:', username, '/', password);

            // Get stored admin accounts
            const adminAccounts = this.getAdminAccounts();
            console.log('👑 Admin accounts for login:', adminAccounts);

            // Get stored staff accounts
            const staffAccounts = this.getStaffAccountsFromStorage();
            console.log('👔 Staff accounts for login:', staffAccounts);

            // Combine all accounts for login check
            const allAccounts = [...adminAccounts, ...staffAccounts];
            console.log('🔍 All accounts combined:', allAccounts);

            // Find matching account
            const account = allAccounts.find(acc => {
                const usernameMatch = acc.username === username;
                const passwordMatch = acc.password === password;
                const isActive = acc.isActive;

                console.log(`🔍 Checking account ${acc.username}:`, {
                    usernameMatch,
                    passwordMatch,
                    isActive,
                    storedPassword: acc.password,
                    inputPassword: password
                });

                return usernameMatch && passwordMatch && isActive;
            });

            console.log('🔍 Found matching account:', account);

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

                console.log('✅ Login successful:', this.currentUser);
                return { success: true, user: this.currentUser };
            } else {
                console.log('❌ Invalid credentials - no matching account found');
                return { success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng hoặc tài khoản bị khóa' };
            }
        } catch (error) {
            console.error('❌ Login error:', error);
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

    // Create default admin accounts (only admin, no default staff)
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
            }
        ];

        localStorage.setItem('adminAccounts', JSON.stringify(defaultAccounts));
        console.log('✅ Default admin account created');
        return defaultAccounts;
    }

    // Initialize staff accounts storage
    initializeStaffAccounts() {
        console.log('🔧 Initializing staff accounts storage...');

        // Create some demo staff accounts
        this.staffAccounts = [
            {
                id: 'staff_demo_001',
                username: 'nhanvien01',
                password: '123456',
                fullName: 'Nguyễn Văn A',
                role: 'staff',
                createdAt: new Date().toISOString(),
                createdBy: 'system',
                isActive: true
            },
            {
                id: 'staff_demo_002',
                username: 'nhanvien02',
                password: '123456',
                fullName: 'Trần Thị B',
                role: 'staff',
                createdAt: new Date().toISOString(),
                createdBy: 'system',
                isActive: true
            },

             {
                id: 'staff_demo_003',
                username: 'nhanvien03',
                password: '123456',
                fullName: 'Hứa Thị Thảo Vy',
                role: 'staff',
                createdAt: new Date().toISOString(),
                createdBy: 'system',
                isActive: true
            },
             {
                id: 'staff_demo_004',
                username: 'nhanvien04',
                password: '123456',
                fullName: 'Nguyễn Huỳnh Kỹ Thuật',
                role: 'staff',
                createdAt: new Date().toISOString(),
                createdBy: 'system',
                isActive: true
            }
        ];

        console.log('✅ Staff accounts initialized:', this.staffAccounts);
    }

    // Get all staff accounts from in-memory storage
    getStaffAccountsFromStorage() {
        console.log('🔍 Getting staff accounts from memory:', this.staffAccounts);
        return this.staffAccounts || [];
    }

    // Save staff accounts to in-memory storage
    saveStaffAccountsToStorage(staffAccounts) {
        console.log('💾 Saving staff accounts to memory:', staffAccounts);
        this.staffAccounts = [...staffAccounts];
        console.log('✅ Staff accounts saved to memory:', this.staffAccounts);
        return true;
    }

    // Debug function to check all accounts
    debugAllAccounts() {
        console.log('🔍 === DEBUG ALL ACCOUNTS ===');
        const adminAccounts = this.getAdminAccounts();
        const staffAccounts = this.getStaffAccountsFromStorage();
        console.log('👑 Admin accounts:', adminAccounts);
        console.log('👔 Staff accounts:', staffAccounts);
        console.log('📊 Total admin:', adminAccounts.length);
        console.log('📊 Total staff:', staffAccounts.length);
        console.log('🔍 === END DEBUG ===');
        return { adminAccounts, staffAccounts };
    }



    // Create new staff account (admin only)
    createStaffAccount(staffData) {
        if (!this.isAdmin()) {
            return { success: false, message: 'Chỉ admin mới có thể tạo tài khoản nhân viên' };
        }

        try {
            console.log('🔧 Creating staff account with data:', staffData);

            // Get existing staff accounts
            const staffAccounts = this.getStaffAccountsFromStorage();
            console.log('🔧 Current staff accounts:', staffAccounts);

            // Get admin accounts to check for username conflicts
            const adminAccounts = this.getAdminAccounts();
            const allExistingAccounts = [...adminAccounts, ...staffAccounts];

            // Check if username already exists
            if (allExistingAccounts.find(acc => acc.username === staffData.username)) {
                console.log('❌ Username already exists:', staffData.username);
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

            console.log('🔧 New staff account created:', newStaff);

            // Add to staff accounts
            staffAccounts.push(newStaff);
            console.log('🔧 Updated staff accounts list:', staffAccounts);

            // Save to staff storage
            if (this.saveStaffAccountsToStorage(staffAccounts)) {
                console.log('✅ Staff account saved successfully:', newStaff.username);
                return { success: true, staff: newStaff };
            } else {
                console.log('❌ Failed to save staff account');
                return { success: false, message: 'Không thể lưu tài khoản nhân viên' };
            }
        } catch (error) {
            console.error('❌ Error creating staff account:', error);
            return { success: false, message: 'Có lỗi xảy ra khi tạo tài khoản' };
        }
    }

    // Get all staff accounts (admin only)
    getStaffAccounts() {
        if (!this.isAdmin()) {
            return [];
        }

        return this.getStaffAccountsFromStorage();
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
            // Get staff accounts from separate storage
            const staffAccounts = this.getStaffAccountsFromStorage();
            const filteredStaffAccounts = staffAccounts.filter(acc => acc.id !== staffId);

            // Save updated staff accounts
            if (this.saveStaffAccountsToStorage(filteredStaffAccounts)) {
                console.log('✅ Staff account deleted:', staffId);
                return { success: true };
            } else {
                return { success: false, message: 'Không thể xóa tài khoản nhân viên' };
            }
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
