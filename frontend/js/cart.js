// Cart JavaScript - Quản lý giỏ hàng đồng nhất

class CartManager {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.isInitialized = false;
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        this.setupEventListeners();
        this.updateCartUI();
        this.isInitialized = true;
        console.log('🛒 CartManager initialized');
    }

    setupEventListeners() {
        // Cart button click (desktop and mobile)
        document.addEventListener('click', (e) => {
            if (e.target.closest('#cartBtn') || e.target.closest('#mobileCartBtn')) {
                this.openCartModal();
            }
        });

        // Close cart modal
        document.addEventListener('click', (e) => {
            if (e.target.id === 'closeCartModal' || e.target.id === 'cartModal') {
                this.closeCartModal();
            }
        });

        // Continue shopping buttons
        document.addEventListener('click', (e) => {
            if (e.target.id === 'continueShoppingBtn' || e.target.id === 'continueShoppingBtn2') {
                this.closeCartModal();
                // Navigate to menu page if not already there
                if (!window.location.pathname.includes('Menu')) {
                    window.location.href = 'Menu-new.html';
                }
            }
        });

        // Clear cart
        document.addEventListener('click', (e) => {
            if (e.target.id === 'clearCartBtn') {
                this.clearCart();
            }
        });

        // Checkout
        document.addEventListener('click', (e) => {
            if (e.target.id === 'checkoutBtn') {
                this.checkout();
            }
        });

        // Close checkout modal
        document.addEventListener('click', (e) => {
            if (e.target.id === 'closeCheckoutModal' || e.target.id === 'checkoutModal') {
                this.closeCheckoutModal();
            }
        });

        // Track order
        document.addEventListener('click', (e) => {
            if (e.target.id === 'trackOrderBtn') {
                this.trackOrder();
            }
        });

        // Toggle cart details
        document.addEventListener('click', (e) => {
            if (e.target.id === 'toggleCartDetails') {
                this.toggleCartDetails();
            }
        });

        // Add to cart buttons (for all pages)
        document.addEventListener('click', (e) => {
            if (e.target.closest('.add-to-cart')) {
                const button = e.target.closest('.add-to-cart');
                const itemData = this.extractItemData(button);
                if (itemData) {
                    this.addToCart(itemData, button);
                }
            }
        });

        // Quantity controls and remove buttons (delegated events)
        document.addEventListener('click', (e) => {
            if (e.target.closest('.quantity-increase')) {
                const itemId = this.getItemIdFromElement(e.target);
                this.updateQuantity(itemId, 1);
            } else if (e.target.closest('.quantity-decrease')) {
                const itemId = this.getItemIdFromElement(e.target);
                this.updateQuantity(itemId, -1);
            } else if (e.target.closest('.remove-item')) {
                const itemId = this.getItemIdFromElement(e.target);
                this.removeFromCart(itemId);
            }
        });
    }

    extractItemData(button) {
        const itemElement = button.closest('.menu-item') || button.closest('[data-item]');

        if (!itemElement) {
            console.warn('Could not find item element');
            return null;
        }

        // Try to get data from data attributes first (for API-generated content)
        if (itemElement.dataset.itemId) {
            const stockInfo = this.extractStockInfo(itemElement);
            return {
                id_mon: parseInt(itemElement.dataset.itemId),
                ten_mon: itemElement.dataset.itemName,
                gia: parseInt(itemElement.dataset.itemPrice),
                hinh_anh: itemElement.dataset.itemImage,
                mo_ta: itemElement.dataset.itemDescription,
                so_luong: stockInfo.stock,
                category: itemElement.dataset.category,
                isAvailable: stockInfo.isAvailable
            };
        }

        // Extract from DOM (for legacy content)
        const nameElement = itemElement.querySelector('h3, .item-name, [data-name]');
        const priceElement = itemElement.querySelector('.price-tag, .text-primary, .price, [data-price]');
        const imageElement = itemElement.querySelector('img');
        const descriptionElement = itemElement.querySelector('p.description, p, .description, [data-description]');

        if (!nameElement || !priceElement) {
            console.warn('Could not extract item data - missing name or price');
            return null;
        }

        const ten_mon = nameElement.textContent.trim();

        // Extract price more carefully
        let gia = 0;
        if (priceElement.dataset.price) {
            gia = parseInt(priceElement.dataset.price);
        } else {
            const priceText = priceElement.textContent.replace(/[^\d]/g, '');
            gia = parseInt(priceText) || 0;
        }

        let hinh_anh = 'http://localhost:3001/images/placeholder.png';
        if (imageElement && imageElement.src && !imageElement.src.includes('placeholder')) {
            hinh_anh = imageElement.src;
        }

        const mo_ta = descriptionElement ? descriptionElement.textContent.trim() : 'Món ăn ngon đặc trưng miền Nam';

        // Extract stock and availability info
        const stockInfo = this.extractStockInfo(itemElement);

        return {
            id_mon: Date.now() + Math.random(), // Generate unique ID for legacy items
            ten_mon,
            gia,
            hinh_anh,
            mo_ta,
            so_luong: stockInfo.stock,
            category: itemElement.dataset.category || 'other',
            isAvailable: stockInfo.isAvailable
        };
    }

    extractStockInfo(itemElement) {
        // Check for stock indicators
        const stockElement = itemElement.querySelector('.bg-yellow-100, .bg-green-100, .bg-red-100');
        let stock = 999; // Default high stock
        let isAvailable = true;

        if (stockElement) {
            const stockText = stockElement.textContent;

            // Check for specific stock count
            const stockMatch = stockText.match(/Còn (\d+) phần/);
            if (stockMatch) {
                stock = parseInt(stockMatch[1]);
                isAvailable = stock > 0;
            } else if (stockText.includes('Hết hàng')) {
                stock = 0;
                isAvailable = false;
            } else if (stockText.includes('Còn hàng')) {
                stock = 999;
                isAvailable = true;
            }
        }

        // Check button state
        const addButton = itemElement.querySelector('.add-to-cart, .add-to-cart-btn');
        if (addButton && addButton.disabled) {
            isAvailable = false;
            stock = 0;
        }

        return { stock, isAvailable };
    }

    addToCart(item, buttonElement = null, quantity = 1) {
        // Kiểm tra đăng nhập trước khi thêm vào giỏ hàng
        if (!this.checkAuthBeforeCart()) {
            return false;
        }

        // Handle both API format (id_mon, ten_mon) and legacy format (id, name)
        const itemId = item.id_mon || item.id;
        const itemName = item.ten_mon || item.name;
        const itemPrice = item.gia || item.price;
        const maxStock = item.so_luong || 999;
        const isAvailable = item.isAvailable !== false && maxStock > 0;

        if (!itemId || !itemName || !itemPrice) {
            console.error('Invalid item data:', item);
            this.showNotification('Lỗi: Dữ liệu món ăn không hợp lệ', 'error');
            return false;
        }

        if (!isAvailable) {
            this.showNotification(`"${itemName}" hiện đang hết hàng`, 'error');
            return false;
        }

        const existingItem = this.cart.find(cartItem =>
            (cartItem.id_mon || cartItem.id) === itemId
        );

        if (existingItem) {
            const newQuantity = existingItem.qty + quantity;
            if (newQuantity <= maxStock) {
                existingItem.qty = newQuantity;
                this.showAddToCartNotification(`Đã cập nhật "${itemName}" (${newQuantity} món)`);
            } else {
                this.showNotification(`Chỉ còn ${maxStock} phần "${itemName}"`, 'error');
                return false;
            }
        } else {
            if (quantity <= maxStock) {
                const cartItem = {
                    id_mon: itemId,
                    ten_mon: itemName,
                    gia: itemPrice,
                    hinh_anh: item.hinh_anh || item.image || 'http://localhost:3001/images/placeholder.png',
                    mo_ta: item.mo_ta || item.description || 'Món ăn ngon đặc trưng miền Nam',
                    so_luong: maxStock,
                    qty: quantity,
                    category: item.category || 'other',
                    addedAt: new Date().toISOString()
                };

                this.cart.push(cartItem);
                this.showAddToCartNotification(`Đã thêm "${itemName}" vào giỏ hàng`);
            } else {
                this.showNotification(`Chỉ còn ${maxStock} phần "${itemName}"`, 'error');
                return false;
            }
        }

        this.saveCart();
        this.updateCartUI();

        // Visual feedback on button
        if (buttonElement) {
            this.showButtonFeedback(buttonElement);
        }

        return true;
    }

    removeFromCart(itemId) {
        const itemToRemove = this.cart.find(item => (item.id_mon || item.id) == itemId);
        if (itemToRemove) {
            const itemName = itemToRemove.ten_mon || itemToRemove.name;
            this.cart = this.cart.filter(item => (item.id_mon || item.id) != itemId);
            this.saveCart();
            this.updateCartUI();
            this.renderCartItems();
            this.showNotification(`Đã xóa "${itemName}" khỏi giỏ hàng`, 'info');
        }
    }

    updateQuantity(itemId, change) {
        const item = this.cart.find(item => (item.id_mon || item.id) == itemId);
        if (item) {
            const newQuantity = item.qty + change;
            const maxStock = item.so_luong || 999;

            if (newQuantity <= 0) {
                this.removeFromCart(itemId);
            } else if (newQuantity <= maxStock) {
                item.qty = newQuantity;
                this.saveCart();
                this.updateCartUI();
                this.renderCartItems();
            } else {
                const itemName = item.ten_mon || item.name;
                this.showNotification(`Chỉ còn ${maxStock} phần "${itemName}"`, 'error');
            }
        }
    }

    clearCart() {
        if (this.cart.length === 0) return;
        
        if (confirm('Bạn có chắc chắn muốn xóa tất cả món ăn trong giỏ hàng?')) {
            this.cart = [];
            this.saveCart();
            this.updateCartUI();
            this.renderCartItems();
            this.showNotification('Đã xóa tất cả món ăn khỏi giỏ hàng', 'info');
        }
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    updateCartUI() {
        const totalItems = this.cart.reduce((sum, item) => sum + (item.qty || item.quantity || 0), 0);

        // Update desktop cart counter
        const cartCounter = document.getElementById('cartCounter');
        if (cartCounter) {
            cartCounter.textContent = totalItems;
            if (totalItems > 0) {
                cartCounter.style.transform = 'scale(1)';
                cartCounter.style.display = 'flex';
            } else {
                cartCounter.style.transform = 'scale(0)';
                cartCounter.style.display = 'none';
            }
        }

        // Update mobile cart counter
        const mobileCartCounter = document.getElementById('mobileCartCounter');
        if (mobileCartCounter) {
            mobileCartCounter.textContent = totalItems;
        }

        // Update cart item count in modal
        const cartItemCount = document.getElementById('cartItemCount');
        if (cartItemCount) {
            cartItemCount.textContent = `${totalItems} món`;
        }

        // Update cart button in menu-db.html if exists
        const legacyCartCounter = document.querySelector('#cartBtn span');
        if (legacyCartCounter) {
            legacyCartCounter.textContent = totalItems;
        }
    }

    openCartModal() {
        // Kiểm tra đăng nhập trước khi mở giỏ hàng
        if (!this.checkAuthBeforeCart()) {
            return;
        }

        const cartModal = document.getElementById('cartModal');
        if (cartModal) {
            cartModal.classList.add('active');
            this.showCartLoading();

            // Simulate loading delay for better UX
            setTimeout(() => {
                this.hideCartLoading();
                this.renderCartItems();
            }, 300);
        }
    }

    // Kiểm tra đăng nhập trước khi truy cập giỏ hàng
    checkAuthBeforeCart() {
        // Kiểm tra xem auth object có tồn tại không
        if (typeof window.auth === 'undefined') {
            console.warn('Auth system not loaded');
            this.showLoginRequiredNotification();
            return false;
        }

        // Kiểm tra trạng thái đăng nhập
        if (!window.auth.isAuthenticated || !window.auth.user) {
            this.showLoginRequiredModal();
            return false;
        }

        return true;
    }

    // Hiển thị modal yêu cầu đăng nhập
    showLoginRequiredModal() {
        // Hiển thị cart modal với trạng thái login required
        const cartModal = document.getElementById('cartModal');
        if (cartModal) {
            cartModal.classList.add('active');
            this.showLoginRequiredState();
        }

        // Tìm modal đăng nhập có sẵn
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            // Lưu trạng thái để redirect về giỏ hàng sau khi đăng nhập
            localStorage.setItem('redirectAfterLogin', 'cart');
        }

        this.showLoginRequiredNotification();
    }

    // Hiển thị trạng thái yêu cầu đăng nhập trong cart modal
    showLoginRequiredState() {
        const emptyCartState = document.getElementById('emptyCartState');
        const loginRequiredState = document.getElementById('loginRequiredState');
        const cartItemsList = document.getElementById('cartItemsList');
        const cartSummary = document.getElementById('cartSummary');
        const loadingState = document.getElementById('cartLoadingState');

        // Ẩn tất cả các state khác
        if (emptyCartState) emptyCartState.classList.add('hidden');
        if (cartItemsList) cartItemsList.classList.add('hidden');
        if (cartSummary) cartSummary.classList.add('hidden');
        if (loadingState) loadingState.classList.add('hidden');

        // Hiển thị login required state
        if (loginRequiredState) {
            loginRequiredState.classList.remove('hidden');

            // Setup event listeners cho các button
            this.setupLoginRequiredButtons();
        }
    }

    // Setup event listeners cho login required buttons
    setupLoginRequiredButtons() {
        const openLoginBtn = document.getElementById('openLoginFromCart');
        const continueShoppingBtn = document.getElementById('continueShoppingBtn3');

        if (openLoginBtn) {
            openLoginBtn.addEventListener('click', () => {
                // Lưu redirect target
                localStorage.setItem('redirectAfterLogin', 'cart');

                // Mở modal đăng nhập
                const loginModal = document.getElementById('loginModal');
                if (loginModal) {
                    this.closeCartModal();
                    loginModal.classList.add('active');
                } else {
                    // Redirect đến trang có form đăng nhập
                    window.location.href = 'Index-new.html';
                }
            });
        }

        if (continueShoppingBtn) {
            continueShoppingBtn.addEventListener('click', () => {
                this.closeCartModal();
                // Navigate to menu page if not already there
                if (!window.location.pathname.includes('Menu')) {
                    window.location.href = 'Menu-new.html';
                }
            });
        }
    }

    // Hiển thị thông báo yêu cầu đăng nhập
    showLoginRequiredNotification() {
        this.showNotification(
            'Vui lòng đăng nhập để xem giỏ hàng của bạn!',
            'warning',
            5000
        );
    }

    // Scroll đến phần đăng nhập (nếu có)
    scrollToLoginSection() {
        const loginSection = document.querySelector('.login-section') ||
                           document.querySelector('#loginForm') ||
                           document.querySelector('[data-login]');

        if (loginSection) {
            loginSection.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }

    showCartLoading() {
        const loadingState = document.getElementById('cartLoadingState');
        const cartItems = document.getElementById('cartItemsList');
        const emptyState = document.getElementById('emptyCartState');

        if (loadingState) loadingState.classList.remove('hidden');
        if (cartItems) cartItems.classList.add('hidden');
        if (emptyState) emptyState.classList.add('hidden');
    }

    hideCartLoading() {
        const loadingState = document.getElementById('cartLoadingState');
        if (loadingState) loadingState.classList.add('hidden');
    }

    closeCartModal() {
        const cartModal = document.getElementById('cartModal');
        if (cartModal) {
            cartModal.classList.remove('active');
        }
    }

    renderCartItems() {
        // Kiểm tra đăng nhập trước khi render
        if (!this.checkAuthBeforeCart()) {
            return;
        }

        const cartItemsList = document.getElementById('cartItemsList');
        const emptyCartState = document.getElementById('emptyCartState');
        const cartSummary = document.getElementById('cartSummary');
        const quickActions = document.getElementById('cartQuickActions');
        const loginRequiredState = document.getElementById('loginRequiredState');

        if (!cartItemsList) return;

        // Ẩn login required state nếu đã đăng nhập
        if (loginRequiredState) {
            loginRequiredState.classList.add('hidden');
        }

        if (this.cart.length === 0) {
            cartItemsList.classList.add('hidden');
            cartSummary.classList.add('hidden');
            if (quickActions) quickActions.classList.add('hidden');
            emptyCartState.classList.remove('hidden');
            this.removeScrollIndicators();
            return;
        }

        emptyCartState.classList.add('hidden');
        cartItemsList.classList.remove('hidden');
        cartSummary.classList.remove('hidden');
        if (quickActions) quickActions.classList.remove('hidden');

        cartItemsList.innerHTML = this.cart.map(item => this.createCartItemHTML(item)).join('');
        this.updateCartSummary();

        // Setup scroll indicators after rendering
        setTimeout(() => {
            this.setupScrollIndicators();
        }, 100);
    }

    createCartItemHTML(item) {
        const template = document.getElementById('cartItemTemplate');
        if (!template) return '';

        const clone = template.content.cloneNode(true);

        // Handle both API format and legacy format
        const itemId = item.id_mon || item.id;
        const itemName = item.ten_mon || item.name || 'Món ăn';
        const itemPrice = item.gia || item.price || 0;
        const itemImage = item.hinh_anh || item.image || 'http://localhost:3001/images/placeholder.png';
        const itemDescription = item.mo_ta || item.description || 'Chưa có mô tả';
        const itemQuantity = item.qty || item.quantity || 1;
        const itemStock = item.so_luong || 999;
        const itemCategory = item.category || 'other';

        // Set basic item info
        clone.querySelector('.item-image').src = itemImage;
        clone.querySelector('.item-image').alt = itemName;
        clone.querySelector('.item-name').textContent = itemName;
        clone.querySelector('.item-price').textContent = this.formatPrice(itemPrice);
        clone.querySelector('.item-description').textContent = itemDescription;
        clone.querySelector('.item-quantity').textContent = itemQuantity;
        clone.querySelector('.item-total').textContent = this.formatPrice(itemPrice * itemQuantity);

        // Set additional details
        const categoryElement = clone.querySelector('.item-category');
        const stockElement = clone.querySelector('.item-stock');

        if (categoryElement) {
            const categoryNames = {
                'appetizers': 'Khai Vị',
                'maindishes': 'Món Chính',
                'rice': 'Cơm & Bún',
                'hotpot': 'Canh & Lẩu',
                'desserts': 'Tráng Miệng',
                'drinks': 'Đồ Uống',
                'other': 'Món ăn'
            };
            categoryElement.textContent = categoryNames[itemCategory] || 'Món ăn';
        }

        if (stockElement) {
            if (itemStock === 0) {
                stockElement.textContent = 'Hết hàng';
                stockElement.className = 'text-red-600';
            } else if (itemStock < 10) {
                stockElement.textContent = `Còn ${itemStock} phần`;
                stockElement.className = 'text-yellow-600';
            } else {
                stockElement.textContent = 'Còn hàng';
                stockElement.className = 'text-green-600';
            }
        }

        // Add data attributes for event handling
        const cartItemDiv = clone.querySelector('.cart-item');
        cartItemDiv.dataset.itemId = itemId;

        return cartItemDiv.outerHTML;
    }

    updateCartSummary() {
        const subtotal = this.cart.reduce((sum, item) => {
            const itemPrice = item.gia || item.price || 0;
            const itemQuantity = item.qty || item.quantity || 0;
            return sum + (itemPrice * itemQuantity);
        }, 0);
        const shipping = 0; // Free shipping
        const total = subtotal + shipping;

        const cartSubtotal = document.getElementById('cartSubtotal');
        const cartTotal = document.getElementById('cartTotal');

        if (cartSubtotal) cartSubtotal.textContent = this.formatPrice(subtotal);
        if (cartTotal) cartTotal.textContent = this.formatPrice(total);
    }

    formatPrice(price) {
        if (isNaN(price) || price === null || price === undefined) {
            return '0đ';
        }
        return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
    }

    getItemIdFromElement(element) {
        const cartItem = element.closest('.cart-item');
        return cartItem ? cartItem.dataset.itemId : null;
    }

    showAddToCartNotification(message) {
        const template = document.getElementById('cartNotificationTemplate');
        if (!template) {
            // Fallback notification if template not found
            this.showNotification(message, 'success');
            return;
        }

        const clone = template.content.cloneNode(true);
        const notification = clone.querySelector('.cart-notification');
        notification.querySelector('.notification-text').textContent = message;

        document.body.appendChild(notification);

        // Trigger animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    showButtonFeedback(button) {
        const originalHTML = button.innerHTML;
        const originalClasses = button.className;

        // Add success state
        button.innerHTML = '<i class="fas fa-check mr-2"></i>Đã thêm!';
        button.className = button.className.replace(/bg-\w+-\d+/g, '').replace(/hover:bg-\w+-\d+/g, '') + ' bg-green-500 hover:bg-green-600';
        button.disabled = true;

        // Add pulse animation
        button.style.animation = 'pulse 0.5s ease-in-out';

        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.className = originalClasses;
            button.disabled = false;
            button.style.animation = '';
        }, 2000);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-20 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 ${
            type === 'success' ? 'bg-green-500 text-white' : 
            type === 'error' ? 'bg-red-500 text-white' : 
            'bg-blue-500 text-white'
        }`;
        notification.innerHTML = `<i class="fas fa-info-circle mr-2"></i>${message}`;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    checkout() {
        // Kiểm tra đăng nhập trước khi thanh toán
        if (!this.checkAuthBeforeCart()) {
            return;
        }

        if (this.cart.length === 0) {
            this.showNotification('Giỏ hàng trống!', 'error');
            return;
        }

        // Redirect đến trang thanh toán
        this.redirectToCheckout();
    }

    // Redirect đến trang thanh toán
    redirectToCheckout() {
        // Lưu giỏ hàng trước khi chuyển trang
        this.saveCart();

        // Chuyển đến trang thanh toán
        window.location.href = 'ThanhToan.html';
    }

    closeCheckoutModal() {
        const checkoutModal = document.getElementById('checkoutModal');
        if (checkoutModal) {
            checkoutModal.classList.remove('active');
        }
    }

    trackOrder() {
        this.closeCheckoutModal();
        this.showNotification('Chức năng theo dõi đơn hàng đang được phát triển', 'info');
    }

    toggleCartDetails() {
        const detailsElements = document.querySelectorAll('.item-details');
        const toggleBtn = document.getElementById('toggleCartDetails');

        if (!toggleBtn) return;

        const isHidden = detailsElements.length > 0 && detailsElements[0].classList.contains('hidden');

        detailsElements.forEach(element => {
            if (isHidden) {
                element.classList.remove('hidden');
            } else {
                element.classList.add('hidden');
            }
        });

        // Update button text
        if (isHidden) {
            toggleBtn.innerHTML = '<i class="fas fa-eye-slash mr-1"></i>Ẩn chi tiết';
        } else {
            toggleBtn.innerHTML = '<i class="fas fa-eye mr-1"></i>Xem chi tiết';
        }
    }

    // Public methods for external access
    getCart() {
        return this.cart;
    }

    getCartTotal() {
        return this.cart.reduce((sum, item) => {
            const itemPrice = item.gia || item.price || 0;
            const itemQuantity = item.qty || item.quantity || 0;
            return sum + (itemPrice * itemQuantity);
        }, 0);
    }

    getCartItemCount() {
        return this.cart.reduce((sum, item) => sum + (item.qty || item.quantity || 0), 0);
    }

    // Method to integrate with existing menu-db.html cart system
    syncWithLegacyCart() {
        // If there's a legacy cart object, sync with it
        if (window.cart && window.cart.items) {
            // Convert legacy cart items to new format
            window.cart.items.forEach(legacyItem => {
                const existingItem = this.cart.find(item =>
                    (item.id_mon || item.id) === legacyItem.id_mon
                );

                if (!existingItem) {
                    this.cart.push({
                        ...legacyItem,
                        qty: legacyItem.qty || 1
                    });
                }
            });

            this.saveCart();
            this.updateCartUI();
        }
    }

    // Method to add item with API format (for menu-db.html integration)
    addAPIItem(apiItem, quantity = 1) {
        this.addToCart(apiItem, null, quantity);
    }

    // Setup scroll indicators for cart items
    setupScrollIndicators() {
        const cartItems = document.querySelector('.cart-items');
        if (!cartItems) return;

        // Remove existing indicators
        this.removeScrollIndicators();

        // Check if scrolling is needed
        if (cartItems.scrollHeight <= cartItems.clientHeight) {
            cartItems.classList.remove('scrollable');
            return;
        }

        cartItems.classList.add('scrollable');

        // Create scroll indicators
        const topIndicator = document.createElement('div');
        topIndicator.className = 'scroll-indicator top';
        topIndicator.innerHTML = '<i class="fas fa-chevron-up"></i>Cuộn lên';

        const bottomIndicator = document.createElement('div');
        bottomIndicator.className = 'scroll-indicator bottom show';
        bottomIndicator.innerHTML = '<i class="fas fa-chevron-down"></i>Cuộn xuống';

        cartItems.appendChild(topIndicator);
        cartItems.appendChild(bottomIndicator);

        // Add scroll event listener
        cartItems.addEventListener('scroll', () => {
            this.updateScrollIndicators(cartItems, topIndicator, bottomIndicator);
        });

        // Add click handlers for indicators
        topIndicator.addEventListener('click', () => {
            cartItems.scrollTo({ top: 0, behavior: 'smooth' });
        });

        bottomIndicator.addEventListener('click', () => {
            cartItems.scrollTo({ top: cartItems.scrollHeight, behavior: 'smooth' });
        });
    }

    updateScrollIndicators(container, topIndicator, bottomIndicator) {
        const { scrollTop, scrollHeight, clientHeight } = container;

        // Show/hide top indicator
        if (scrollTop > 20) {
            topIndicator.classList.add('show');
        } else {
            topIndicator.classList.remove('show');
        }

        // Show/hide bottom indicator
        if (scrollTop < scrollHeight - clientHeight - 20) {
            bottomIndicator.classList.add('show');
        } else {
            bottomIndicator.classList.remove('show');
        }
    }

    removeScrollIndicators() {
        const indicators = document.querySelectorAll('.scroll-indicator');
        indicators.forEach(indicator => indicator.remove());

        const cartItems = document.querySelector('.cart-items');
        if (cartItems) {
            cartItems.classList.remove('scrollable');
        }
    }
}

// Export for global use
window.CartManager = CartManager;
