// Components JavaScript - Chức năng cho các component

// Component Loader
class ComponentLoader {
    static async loadComponent(componentName, targetElement) {
        try {
            const response = await fetch(`components/${componentName}.html`);
            const html = await response.text();
            
            if (typeof targetElement === 'string') {
                const element = document.querySelector(targetElement);
                if (element) {
                    element.innerHTML = html;
                }
            } else if (targetElement instanceof HTMLElement) {
                targetElement.innerHTML = html;
            }
            
            return html;
        } catch (error) {
            console.error(`Error loading component ${componentName}:`, error);
            return null;
        }
    }

    static async loadAllComponents() {
        const components = [
            { name: 'header', target: '#header-placeholder' },
            { name: 'header-menu', target: '#header-menu-placeholder' },
            { name: 'footer', target: '#footer-placeholder' },
            { name: 'ad-banner', target: '#ad-banner-placeholder' },
            { name: 'chatbot', target: '#chatbot-placeholder' },
            { name: 'login-modal', target: '#login-modal-placeholder' },
            { name: 'cart-modal', target: '#cart-modal-placeholder' }
        ];

        for (const component of components) {
            await this.loadComponent(component.name, component.target);
        }
    }
}

// Menu Filter Functionality
class MenuFilter {
    constructor() {
        this.init();
    }

    init() {
        const filterButtons = document.querySelectorAll('.menu-category-btn');
        const menuItems = document.querySelectorAll('.menu-item');

        if (filterButtons.length === 0 || menuItems.length === 0) return;

        // Set initial active state
        const allButton = document.querySelector('[data-category="all"]');
        if (allButton) {
            this.setActiveButton(allButton);
        }

        // Add event listeners
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.filterItems(button, menuItems, filterButtons);
            });
        });
    }

    filterItems(activeButton, menuItems, allButtons) {
        const category = activeButton.getAttribute('data-category');
        
        // Update button styles
        allButtons.forEach(btn => {
            this.setInactiveButton(btn);
        });
        this.setActiveButton(activeButton);

        // Filter menu items
        menuItems.forEach(item => {
            const itemCategory = item.getAttribute('data-category');
            if (category === 'all' || itemCategory === category) {
                this.showItem(item);
            } else {
                this.hideItem(item);
            }
        });
    }

    setActiveButton(button) {
        button.classList.add('bg-yellow-600', 'text-white');
        button.classList.remove('bg-gray-200', 'text-gray-800');
    }

    setInactiveButton(button) {
        button.classList.remove('bg-yellow-600', 'text-white');
        button.classList.add('bg-gray-200', 'text-gray-800');
    }

    showItem(item) {
        item.style.display = 'block';
        item.classList.remove('hidden');
    }

    hideItem(item) {
        item.style.display = 'none';
        item.classList.add('hidden');
    }
}

// Search Functionality
class SearchFunction {
    constructor() {
        this.init();
    }

    init() {
        const searchInput = document.getElementById('searchInput');
        const searchButton = document.getElementById('searchButton');
        
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            this.performSearch(e.target.value);
        });

        if (searchButton) {
            searchButton.addEventListener('click', () => {
                this.performSearch(searchInput.value);
            });
        }

        // Enter key search
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch(searchInput.value);
            }
        });
    }

    performSearch(query) {
        const menuItems = document.querySelectorAll('.menu-item');
        const searchResults = document.getElementById('searchResults');
        
        if (!query.trim()) {
            // Show all items if search is empty
            menuItems.forEach(item => {
                item.style.display = 'block';
            });
            if (searchResults) {
                searchResults.innerHTML = '';
            }
            return;
        }

        const results = [];
        menuItems.forEach(item => {
            const title = item.querySelector('h3')?.textContent.toLowerCase() || '';
            const description = item.querySelector('p')?.textContent.toLowerCase() || '';
            
            if (title.includes(query.toLowerCase()) || description.includes(query.toLowerCase())) {
                results.push(item.cloneNode(true));
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });

        // Display search results
        if (searchResults && results.length > 0) {
            searchResults.innerHTML = '';
            results.forEach(result => {
                searchResults.appendChild(result);
            });
        }
    }
}

// Auto-resize Textarea
function autoResizeTextarea() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
}

// Initialize textarea auto-resize
function initTextareaResize() {
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
        textarea.addEventListener('input', autoResizeTextarea);
        // Initial resize
        autoResizeTextarea.call(textarea);
    });
}

// Smooth Scroll
function smoothScrollTo(target) {
    const element = document.querySelector(target);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Image Lazy Loading
class LazyImageLoader {
    constructor() {
        this.init();
    }

    init() {
        const images = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for older browsers
            images.forEach(img => {
                img.src = img.dataset.src;
            });
        }
    }
}

// Form Validation
class FormValidator {
    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    static validatePhone(phone) {
        const re = /^[0-9]{10,11}$/;
        return re.test(phone.replace(/\s/g, ''));
    }

    static validatePassword(password) {
        return password.length >= 6;
    }

    static showFieldError(field, message) {
        const errorElement = field.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = message;
        } else {
            const error = document.createElement('div');
            error.className = 'error-message text-red-500 text-sm mt-1';
            error.textContent = message;
            field.parentNode.appendChild(error);
        }
        field.classList.add('border-red-500');
    }

    static clearFieldError(field) {
        const errorElement = field.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
        field.classList.remove('border-red-500');
    }
}

// Show cart button only on menu page
function showCartOnMenuPage() {
    const currentPage = window.location.pathname;
    const isMenuPage = currentPage.includes('Menu') || currentPage.includes('menu');

    const cartBtn = document.getElementById('cartBtn');
    const mobileCartContainer = document.getElementById('mobileCartContainer');

    if (isMenuPage) {
        if (cartBtn) cartBtn.classList.remove('hidden');
        if (mobileCartContainer) mobileCartContainer.classList.remove('hidden');
    } else {
        if (cartBtn) cartBtn.classList.add('hidden');
        if (mobileCartContainer) mobileCartContainer.classList.add('hidden');
    }
}

// Initialize all components when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load components first
    ComponentLoader.loadAllComponents().then(() => {
        // Initialize component functionality after loading
        setTimeout(() => {
            new MenuFilter();
            new SearchFunction();
            new LazyImageLoader();
            initTextareaResize();

            // Setup login modal after components are loaded
            setupLoginModalEvents();

            // Show/hide cart button based on current page
            showCartOnMenuPage();

            // Setup cart manager only for Menu page
            if (window.location.pathname.includes('Menu') || document.getElementById('cartBtn')) {
                setupCartManager();
            }

            // Re-initialize main app functionality
            if (window.initializeApp) {
                initializeApp();
            }
        }, 100);
    });
});

// Setup login modal events after components are loaded
function setupLoginModalEvents() {
    const loginBtn = document.getElementById('loginBtn');
    const mobileLoginBtn = document.getElementById('mobileLoginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginModal = document.getElementById('loginModal');
    const closeLoginModal = document.getElementById('closeLoginModal');
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // Check login status on page load
    checkLoginStatus();

    // Open modal events
    if (loginBtn && loginModal) {
        loginBtn.addEventListener('click', () => {
            loginModal.classList.add('active');
        });
    }

    if (mobileLoginBtn && loginModal) {
        mobileLoginBtn.addEventListener('click', () => {
            loginModal.classList.add('active');
        });
    }

    // Logout event
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Close modal event
    if (closeLoginModal && loginModal) {
        closeLoginModal.addEventListener('click', () => {
            loginModal.classList.remove('active');
        });
    }

    // Close modal when clicking outside
    if (loginModal) {
        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                loginModal.classList.remove('active');
            }
        });
    }

    // Tab switching events
    if (loginTab && registerTab) {
        loginTab.addEventListener('click', () => {
            switchLoginTab('login');
        });

        registerTab.addEventListener('click', () => {
            switchLoginTab('register');
        });
    }

    // Form submission events
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegisterSubmit);
    }
}

// Switch between login and register tabs
function switchLoginTab(tab) {
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (tab === 'login') {
        if (loginTab) {
            loginTab.classList.add('text-primary', 'border-primary');
            loginTab.classList.remove('text-gray-500');
        }
        if (registerTab) {
            registerTab.classList.add('text-gray-500');
            registerTab.classList.remove('text-primary', 'border-primary');
        }
        if (loginForm) loginForm.classList.remove('hidden');
        if (registerForm) registerForm.classList.add('hidden');
    } else {
        if (registerTab) {
            registerTab.classList.add('text-primary', 'border-primary');
            registerTab.classList.remove('text-gray-500');
        }
        if (loginTab) {
            loginTab.classList.add('text-gray-500');
            loginTab.classList.remove('text-primary', 'border-primary');
        }
        if (registerForm) registerForm.classList.remove('hidden');
        if (loginForm) loginForm.classList.add('hidden');
    }
}

// Handle login form submission
async function handleLoginSubmit(e) {
    e.preventDefault();
    const submitBtn = document.querySelector('#loginForm button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
        const email = document.getElementById('loginEmail')?.value.trim();
        const password = document.getElementById('loginPassword')?.value;

        if (!email || !password) {
            throw new Error('Vui lòng nhập đầy đủ email và mật khẩu');
        }

        const data = await auth.login(email, password);

        // Update UI
        updateUIAfterLogin(data.khach_hang);
        const loginModal = document.getElementById('loginModal');
        if (loginModal) loginModal.classList.remove('active');

        showLoginNotification('Đăng nhập thành công!', 'success');

    } catch (error) {
        showLoginNotification(error.message, 'error');
    } finally {
        if (submitBtn) submitBtn.disabled = false;
    }
}

// Handle register form submission
async function handleRegisterSubmit(e) {
    e.preventDefault();
    const submitBtn = document.querySelector('#registerForm button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
        const password = document.getElementById('registerPassword')?.value;
        const confirmPassword = document.getElementById('confirmPassword')?.value;

        if (password !== confirmPassword) {
            throw new Error('Mật khẩu xác nhận không khớp');
        }

        const userData = {
            full_name: document.getElementById('registerName')?.value.trim(),
            email: document.getElementById('registerEmail')?.value.trim(),
            phone: document.getElementById('registerPhone')?.value.trim(),
            password: password
        };

        // Validate required fields
        if (!userData.full_name || !userData.email || !userData.phone || !userData.password) {
            throw new Error('Vui lòng điền đầy đủ thông tin');
        }

        await auth.register(userData);
        showLoginNotification('Đăng ký thành công! Vui lòng đăng nhập.', 'success');
        switchLoginTab('login');

    } catch (error) {
        showLoginNotification(error.message, 'error');
    } finally {
        if (submitBtn) submitBtn.disabled = false;
    }
}

// Check login status and update UI accordingly
function checkLoginStatus() {
    const user = JSON.parse(localStorage.getItem('user'));

    if (user) {
        updateUIAfterLogin(user);
    } else {
        updateUIAfterLogout();
    }
}

// Handle logout
function handleLogout() {
    auth.logout();
    updateUIAfterLogout();
    showLoginNotification('Đã đăng xuất thành công!', 'success');
}

// Update UI after successful login
function updateUIAfterLogin(user) {
    const loginBtn = document.getElementById('loginBtn');
    const mobileLoginBtn = document.getElementById('mobileLoginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userDisplay = document.getElementById('userDisplay');
    const userName = document.getElementById('userName');

    if (loginBtn) loginBtn.style.display = 'none';
    if (mobileLoginBtn) mobileLoginBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'block';
    if (userDisplay) userDisplay.classList.remove('hidden');
    if (userName) userName.textContent = user.full_name;
}

// Update UI after logout
function updateUIAfterLogout() {
    const loginBtn = document.getElementById('loginBtn');
    const mobileLoginBtn = document.getElementById('mobileLoginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userDisplay = document.getElementById('userDisplay');

    if (loginBtn) loginBtn.style.display = 'block';
    if (mobileLoginBtn) mobileLoginBtn.style.display = 'block';
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (userDisplay) userDisplay.classList.add('hidden');
}

// Show notification for login/register
function showLoginNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-20 right-4 px-4 py-2 rounded shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
        'bg-blue-500 text-white'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Setup cart manager after components are loaded
function setupCartManager() {
    // Initialize cart manager if CartManager class is available
    if (window.CartManager) {
        window.cartManager = new CartManager();
        console.log('🛒 CartManager initialized');
    } else {
        console.warn('⚠️ CartManager class not found');
    }

    // Update cart counter styling
    updateCartCounterStyling();
}

// Update cart counter styling for better visibility
function updateCartCounterStyling() {
    const cartCounters = document.querySelectorAll('.cart-counter');
    cartCounters.forEach(counter => {
        const count = parseInt(counter.textContent) || 0;
        if (count > 0) {
            counter.style.transform = 'scale(1)';
            counter.style.display = 'flex';
        } else {
            counter.style.transform = 'scale(0)';
            counter.style.display = 'none';
        }
    });
}

// Export classes for global use
window.ComponentLoader = ComponentLoader;
window.MenuFilter = MenuFilter;
window.SearchFunction = SearchFunction;
window.FormValidator = FormValidator;
