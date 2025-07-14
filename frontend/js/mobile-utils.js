// Mobile Utilities JavaScript - Enhanced Mobile Experience

class MobileUtils {
    constructor() {
        this.init();
    }

    init() {
        this.setupTouchEvents();
        this.setupScrollEffects();
        this.setupNavigationHighlight();
        this.setupToastSystem();
        this.setupModalSystem();
        this.setupPullToRefresh();
    }

    // Touch Events and Gestures
    setupTouchEvents() {
        let startY = 0;
        let startX = 0;

        document.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            startX = e.touches[0].clientX;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            const endY = e.changedTouches[0].clientY;
            const endX = e.changedTouches[0].clientX;
            const diffY = startY - endY;
            const diffX = startX - endX;

            // Swipe detection
            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (Math.abs(diffX) > 50) {
                    if (diffX > 0) {
                        this.onSwipeLeft();
                    } else {
                        this.onSwipeRight();
                    }
                }
            }
        }, { passive: true });
    }

    onSwipeLeft() {
        // Handle swipe left (next page, etc.)
        console.log('Swipe left detected');
    }

    onSwipeRight() {
        // Handle swipe right (previous page, back, etc.)
        console.log('Swipe right detected');
        if (window.history.length > 1) {
            window.history.back();
        }
    }

    // Scroll Effects
    setupScrollEffects() {
        let lastScrollTop = 0;
        const header = document.querySelector('.mobile-header');
        
        if (!header) return;

        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                // Scrolling down - hide header
                header.style.transform = 'translateY(-100%)';
            } else {
                // Scrolling up - show header
                header.style.transform = 'translateY(0)';
            }
            
            lastScrollTop = scrollTop;
        }, { passive: true });
    }

    // Navigation Highlight
    setupNavigationHighlight() {
        const navItems = document.querySelectorAll('.mobile-nav-item');
        const currentPage = window.location.pathname.split('/').pop();

        navItems.forEach(item => {
            const href = item.getAttribute('href');
            if (href && href.includes(currentPage)) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    // Toast Notification System
    setupToastSystem() {
        this.toastContainer = document.createElement('div');
        this.toastContainer.className = 'mobile-toast-container';
        this.toastContainer.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 2000;
            pointer-events: none;
        `;
        document.body.appendChild(this.toastContainer);
    }

    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `mobile-toast ${type}`;
        toast.textContent = message;
        toast.style.pointerEvents = 'auto';

        this.toastContainer.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            toast.style.animation = 'mobile-slideInUp 0.3s ease-out reverse';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);

        return toast;
    }

    // Modal System
    setupModalSystem() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('mobile-modal')) {
                this.closeModal(e.target);
            }
        });

        // Close modal on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const activeModal = document.querySelector('.mobile-modal.active');
                if (activeModal) {
                    this.closeModal(activeModal);
                }
            }
        });
    }

    showModal(content, options = {}) {
        const modal = document.createElement('div');
        modal.className = 'mobile-modal';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'mobile-modal-content';
        
        if (typeof content === 'string') {
            modalContent.innerHTML = content;
        } else {
            modalContent.appendChild(content);
        }

        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // Show modal
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);

        return modal;
    }

    closeModal(modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }

    // Pull to Refresh
    setupPullToRefresh() {
        let startY = 0;
        let currentY = 0;
        let isPulling = false;
        const threshold = 100;

        const pullIndicator = document.createElement('div');
        pullIndicator.className = 'mobile-pull-indicator';
        pullIndicator.style.cssText = `
            position: fixed;
            top: -50px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--mobile-primary);
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            font-size: 14px;
            z-index: 1001;
            transition: top 0.3s ease;
        `;
        pullIndicator.textContent = 'Kéo để làm mới';
        document.body.appendChild(pullIndicator);

        document.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) {
                startY = e.touches[0].clientY;
                isPulling = true;
            }
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (!isPulling) return;

            currentY = e.touches[0].clientY;
            const pullDistance = currentY - startY;

            if (pullDistance > 0 && pullDistance < threshold * 2) {
                e.preventDefault();
                const progress = Math.min(pullDistance / threshold, 1);
                pullIndicator.style.top = `${-50 + (progress * 70)}px`;
                
                if (pullDistance > threshold) {
                    pullIndicator.textContent = 'Thả để làm mới';
                    pullIndicator.style.background = 'var(--mobile-success)';
                } else {
                    pullIndicator.textContent = 'Kéo để làm mới';
                    pullIndicator.style.background = 'var(--mobile-primary)';
                }
            }
        }, { passive: false });

        document.addEventListener('touchend', () => {
            if (!isPulling) return;

            const pullDistance = currentY - startY;
            
            if (pullDistance > threshold) {
                pullIndicator.textContent = 'Đang làm mới...';
                pullIndicator.style.background = 'var(--mobile-info)';
                
                // Trigger refresh
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                pullIndicator.style.top = '-50px';
            }

            isPulling = false;
        }, { passive: true });
    }

    // Utility Functions
    vibrate(pattern = [100]) {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    }

    isOnline() {
        return navigator.onLine;
    }

    getDeviceInfo() {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            screenWidth: screen.width,
            screenHeight: screen.height,
            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight
        };
    }

    // Animation helpers
    animateElement(element, animationClass, duration = 500) {
        element.classList.add(animationClass);
        setTimeout(() => {
            element.classList.remove(animationClass);
        }, duration);
    }

    // Storage helpers
    setStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Storage error:', e);
            return false;
        }
    }

    getStorage(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error('Storage error:', e);
            return null;
        }
    }

    removeStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Storage error:', e);
            return false;
        }
    }
}

// Initialize Mobile Utils
const mobileUtils = new MobileUtils();

// Global functions for easy access
window.showToast = (message, type, duration) => mobileUtils.showToast(message, type, duration);
window.showModal = (content, options) => mobileUtils.showModal(content, options);
window.closeModal = (modal) => mobileUtils.closeModal(modal);
window.vibrate = (pattern) => mobileUtils.vibrate(pattern);

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileUtils;
}
