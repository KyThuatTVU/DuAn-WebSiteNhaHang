// Main JavaScript - Chức năng chính của website

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize Application
function initializeApp() {
    setupNavigation();
    setupMobileMenu();
    setupCartFunctionality();
    // Không cần kiểm tra login status nữa
    setupScrollAnimations();
    // Không cần logout handler nữa
}

// Navigation Setup
function setupNavigation() {
    const currentPage = window.location.pathname.split('/').pop() || 'Index.html';
    const pageName = currentPage.replace('.html', '').toLowerCase();
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
    
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        const linkPage = linkHref ? linkHref.split('/').pop().replace('.html', '').toLowerCase() : '';
        const isIndex = (pageName === 'index' || pageName === '');
        const linkIsIndex = (linkPage === 'index' || linkPage === '');

        if ((isIndex && linkIsIndex) || (pageName !== '' && pageName !== 'index' && pageName === linkPage)) {
            link.classList.add('active');
            // Remove old mobile styling and apply new active styling
            if(link.classList.contains('mobile-nav-link')) {
                link.classList.remove('bg-gray-200', 'font-semibold');
                // Active styling is now handled by CSS
            }
        } else {
            link.classList.remove('active');
            if(link.classList.contains('mobile-nav-link')) {
                link.classList.remove('bg-gray-200', 'font-semibold');
            }
        }
    });
}

// Mobile Menu Setup with Enhanced Animation
function setupMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const mobileNav = document.getElementById('mobileNav');

    if (menuToggle && mobileNav) {
        // Add mobile-menu-btn class for styling
        menuToggle.classList.add('mobile-menu-btn');

        menuToggle.addEventListener('click', function() {
            if (mobileNav.classList.contains('hidden')) {
                // Show menu with animation
                mobileNav.classList.remove('hidden');
                mobileNav.classList.add('show');
                mobileNav.classList.remove('hide');

                // Update hamburger icon
                const icon = menuToggle.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                }
            } else {
                // Hide menu with animation
                mobileNav.classList.add('hide');
                mobileNav.classList.remove('show');

                // Update hamburger icon
                const icon = menuToggle.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }

                // Hide after animation completes
                setTimeout(() => {
                    mobileNav.classList.add('hidden');
                    mobileNav.classList.remove('hide');
                }, 300);
            }
        });

        // Close mobile nav when clicking outside
        document.addEventListener('click', function(event) {
            if (!menuToggle.contains(event.target) && !mobileNav.contains(event.target)) {
                if (!mobileNav.classList.contains('hidden')) {
                    mobileNav.classList.add('hide');
                    mobileNav.classList.remove('show');

                    const icon = menuToggle.querySelector('i');
                    if (icon) {
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                    }

                    setTimeout(() => {
                        mobileNav.classList.add('hidden');
                        mobileNav.classList.remove('hide');
                    }, 300);
                }
            }
        });
    }
}

// Setup logout handler
function setupLogoutHandler() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            auth.logout();
            location.reload();
        });
    }
}



// Check login status
function checkLoginStatus() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        updateUIAfterLogin(user);
    }
}

// Update UI after login (moved from components.js to avoid duplication)
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

// Cart Functionality
function setupCartFunctionality() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    const cartCounter = document.querySelector('#cartBtn span');
    let cartCount = parseInt(localStorage.getItem('cartCount')) || 0;
    
    if (cartCounter) {
        cartCounter.textContent = cartCount;
    }
    
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            cartCount++;
            localStorage.setItem('cartCount', cartCount);
            if (cartCounter) {
                cartCounter.textContent = cartCount;
            }
            
            const menuItem = this.closest('.menu-item');
            const itemName = menuItem?.querySelector('h3')?.textContent || 'Sản phẩm';
            showNotification(`Đã thêm ${itemName} vào giỏ hàng!`, 'success');
        });
    });
}

// Show notification
function showNotification(message, type = 'info') {
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

// Setup scroll animations
function setupScrollAnimations() {
    if (window.gsap && window.ScrollTrigger) {
        // Hero Banner
        gsap.from("#heroBanner .max-w-2xl", {
            opacity: 0,
            y: 60,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
                trigger: "#heroBanner",
                start: "top 80%",
                toggleActions: "play none none reset"
            }
        });

        // Menu Items
        gsap.utils.toArray(".menu-item").forEach((item, i) => {
            gsap.from(item, {
                opacity: 0,
                y: 60,
                duration: 1,
                delay: i * 0.15,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: item,
                    start: "top 85%",
                    toggleActions: "play none none reset"
                }
            });
        });
    }
}

// Gọi lại initLanguageSwitcher sau khi header đã được tải xong
document.addEventListener('DOMContentLoaded', () => {
    // Kiểm tra header đã load xong
    const headerInterval = setInterval(() => {
        const langBtn = document.getElementById('language-toggle');
        if (langBtn) {
            clearInterval(headerInterval);
            if (typeof initLanguageSwitcher === 'function') {
                initLanguageSwitcher(); // ✅ Gọi hàm chuyển ngôn ngữ
            } else {
                console.warn('⚠️ initLanguageSwitcher chưa được định nghĩa!');
            }
        }
    }, 100); // kiểm tra mỗi 100ms
});

