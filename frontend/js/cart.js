// Cart JavaScript - Quản lý giỏ hàng đồng nhất

class CartManager {
    constructor() {
        this.currentUserId = this.getCurrentUserId();
        this.cart = this.loadUserCart();
        this.customerInfo = this.loadCustomerInfo();
        this.isInitialized = false;
        this.init();
    }

    init() {
        if (this.isInitialized) return;

        // Clear any existing notifications from previous sessions
        this.clearAllNotifications();

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

        // Customer info modal events
        document.addEventListener('click', (e) => {
            if (e.target.id === 'closeCustomerInfoModal' || e.target.id === 'cancelCustomerInfo') {
                this.closeCustomerInfoModal();
            }
            if (e.target.id === 'editCustomerInfo') {
                this.showCustomerInfoModal();
            }
        });

        // Customer info form submit
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'customerInfoForm') {
                e.preventDefault();
                this.saveCustomerInfoFromForm();
            }
        });

        // Listen for auth changes (login/logout)
        window.addEventListener('storage', (e) => {
            if (e.key === 'user' || e.key === 'userData' || e.key === 'token') {
                console.log('🔄 Auth state changed, switching cart');
                this.handleUserChange();
            }
        });

        // Listen for custom auth events
        document.addEventListener('authStateChanged', (e) => {
            console.log('🔄 Auth state changed via event:', e.detail);
            this.handleUserChange();
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

    // Get current user ID for cart separation
    getCurrentUserId() {
        try {
            const user = localStorage.getItem('user') || localStorage.getItem('userData');
            if (user) {
                const userData = JSON.parse(user);
                return userData.id || userData.email || 'guest';
            }
            return 'guest';
        } catch (error) {
            console.error('Error getting current user ID:', error);
            return 'guest';
        }
    }

    // Load cart specific to current user
    loadUserCart() {
        try {
            const cartKey = `cart_${this.currentUserId}`;
            const userCart = localStorage.getItem(cartKey);

            if (userCart) {
                console.log(`🛒 Loaded cart for user: ${this.currentUserId}`);
                return JSON.parse(userCart);
            }

            // If no user-specific cart exists, check for legacy cart
            if (this.currentUserId !== 'guest') {
                const legacyCart = localStorage.getItem('cart');
                if (legacyCart) {
                    const cart = JSON.parse(legacyCart);
                    console.log(`🔄 Migrating legacy cart to user: ${this.currentUserId}`);
                    this.saveUserCart(cart);
                    // Don't remove legacy cart yet, in case other users need it
                    return cart;
                }
            }

            console.log(`🛒 No cart found for user: ${this.currentUserId}, starting with empty cart`);
            return [];
        } catch (error) {
            console.error('Error loading user cart:', error);
            return [];
        }
    }

    // Save cart specific to current user
    saveUserCart(cart = null) {
        try {
            const cartToSave = cart || this.cart;
            const cartKey = `cart_${this.currentUserId}`;

            localStorage.setItem(cartKey, JSON.stringify(cartToSave));

            // Also save to legacy 'cart' key for backward compatibility
            localStorage.setItem('cart', JSON.stringify(cartToSave));

            console.log(`💾 Saved cart for user: ${this.currentUserId} (${cartToSave.length} items)`);

            // Dispatch cart updated event
            document.dispatchEvent(new CustomEvent('cartUpdated', {
                detail: { cart: cartToSave, userId: this.currentUserId }
            }));
        } catch (error) {
            console.error('Error saving user cart:', error);
        }
    }

    // Handle user change (login/logout)
    handleUserChange() {
        const newUserId = this.getCurrentUserId();

        if (newUserId !== this.currentUserId) {
            console.log(`👤 User changed from ${this.currentUserId} to ${newUserId}`);

            // Save current cart before switching
            this.saveUserCart();

            // Switch to new user
            this.currentUserId = newUserId;
            this.cart = this.loadUserCart();
            this.customerInfo = this.loadCustomerInfo();

            // Update UI
            this.updateCartUI();
            this.updateCustomerInfoDisplay();

            // If cart modal is open, refresh it
            const cartModal = document.getElementById('cartModal');
            if (cartModal && cartModal.classList.contains('active')) {
                this.renderCartItems();
            }

            console.log(`✅ Switched to cart for user: ${this.currentUserId} (${this.cart.length} items)`);
        }
    }

    extractItemData(button) {
        if (!button) {
            console.warn('❌ No button provided to extractItemData');
            return null;
        }

        const itemElement = button.closest('.menu-item') ||
                           button.closest('[data-item]') ||
                           button.closest('.food-item') ||
                           button.closest('.item-card');

        if (!itemElement) {
            console.warn('❌ Could not find item element for button:', button);
            return null;
        }

        // Try to get data from data attributes first (for API-generated content)
        if (itemElement.dataset.itemId) {
            const stockInfo = this.extractStockInfo(itemElement);

            // Validate required data
            const itemId = parseInt(itemElement.dataset.itemId);
            const itemName = itemElement.dataset.itemName;
            const itemPrice = parseInt(itemElement.dataset.itemPrice);

            if (!itemId || !itemName || (!itemPrice && itemPrice !== 0)) {
                console.warn('❌ Invalid data attributes:', {
                    itemId, itemName, itemPrice
                });
                return null;
            }

            return {
                id_mon: itemId,
                ten_mon: itemName,
                gia: itemPrice,
                hinh_anh: itemElement.dataset.itemImage || 'http://localhost:3000/images/placeholder.png',
                mo_ta: itemElement.dataset.itemDescription || 'Món ăn ngon đặc trưng miền Nam',
                so_luong: stockInfo.stock,
                category: itemElement.dataset.category || 'other',
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

        let hinh_anh = 'http://localhost:3000/images/placeholder.png';
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

    // Lấy thông tin tồn kho từ button element
    extractStockFromButton(buttonElement) {
        if (!buttonElement) {
            return { stock: 999, isAvailable: true };
        }

        // Kiểm tra button có bị disabled không
        if (buttonElement.disabled || buttonElement.classList.contains('disabled')) {
            return { stock: 0, isAvailable: false };
        }

        // Tìm container của item
        const itemContainer = buttonElement.closest('.menu-item, .food-item, .item-card, .product-card');
        if (!itemContainer) {
            return { stock: 999, isAvailable: true };
        }

        // Tìm thông tin tồn kho trong container
        const stockElement = itemContainer.querySelector('.stock-info, .stock-status, [class*="stock"]');
        if (stockElement) {
            const stockText = stockElement.textContent.toLowerCase();

            // Kiểm tra các pattern khác nhau
            if (stockText.includes('hết hàng') || stockText.includes('out of stock')) {
                return { stock: 0, isAvailable: false };
            }

            // Tìm số lượng cụ thể
            const stockMatch = stockText.match(/còn\s*(\d+)|(\d+)\s*phần|(\d+)\s*left/i);
            if (stockMatch) {
                const stock = parseInt(stockMatch[1] || stockMatch[2] || stockMatch[3]);
                return { stock, isAvailable: stock > 0 };
            }

            if (stockText.includes('còn hàng') || stockText.includes('available')) {
                return { stock: 999, isAvailable: true };
            }
        }

        // Kiểm tra badge hoặc indicator khác
        const badge = itemContainer.querySelector('.badge, .tag, .status');
        if (badge) {
            const badgeText = badge.textContent.toLowerCase();
            if (badgeText.includes('hết') || badgeText.includes('sold')) {
                return { stock: 0, isAvailable: false };
            }
        }

        // Mặc định
        return { stock: 999, isAvailable: true };
    }

    addToCart(item, buttonElement = null, quantity = 1) {
        // Kiểm tra đăng nhập trước khi thêm vào giỏ hàng
        if (!this.checkAuthBeforeAddToCart()) {
            return false;
        }

        // Yêu cầu thông tin khách hàng trước khi thêm vào giỏ hàng
        this.requireCustomerInfo(() => {
            this.performAddToCart(item, buttonElement, quantity);
        });
    }

    performAddToCart(item, buttonElement = null, quantity = 1) {


        // Kiểm tra dữ liệu đầu vào
        if (!item || typeof item !== 'object') {
            console.error('❌ Invalid item data:', item);
            this.showNotification('Lỗi: Dữ liệu món ăn không hợp lệ', 'error');
            return false;
        }

        // Handle both API format (id_mon, ten_mon) and legacy format (id, name)
        const itemId = item.id_mon || item.id;
        const itemName = item.ten_mon || item.name;
        const itemPrice = item.gia || item.price;

        // Kiểm tra các trường bắt buộc
        if (!itemId || !itemName || (!itemPrice && itemPrice !== 0)) {
            console.error('❌ Missing required fields:', {
                itemId, itemName, itemPrice, originalItem: item
            });
            this.showNotification('Lỗi: Thông tin món ăn không đầy đủ', 'error');
            return false;
        }

        // Cải thiện logic kiểm tra tồn kho
        let maxStock, isAvailable;

        // Kiểm tra tồn kho từ nhiều nguồn với logic cải thiện
        // Ưu tiên stock (từ formatFoodItem) trước so_luong (từ API gốc)
        if (typeof item.stock === 'number' && item.stock >= 0) {
            // Có dữ liệu tồn kho từ formatted data (ưu tiên)
            maxStock = item.stock;
            isAvailable = maxStock > 0;
        } else if (typeof item.so_luong === 'number' && item.so_luong >= 0) {
            // Có dữ liệu tồn kho từ API gốc (fallback)
            maxStock = item.so_luong;
            isAvailable = maxStock > 0;
        } else if (item.isAvailable === false) {
            // Được đánh dấu rõ ràng là hết hàng
            maxStock = 0;
            isAvailable = false;
        } else if (item.isAvailable === true) {
            // Được đánh dấu rõ ràng là có hàng
            maxStock = 999;
            isAvailable = true;
        } else {
            // Không có thông tin tồn kho rõ ràng
            // Kiểm tra từ UI elements nếu có buttonElement
            if (buttonElement) {
                const stockInfo = this.extractStockFromButton(buttonElement);
                maxStock = stockInfo.stock;
                isAvailable = stockInfo.isAvailable;
            } else {
                // Mặc định là có hàng với số lượng hạn chế
                maxStock = 999;
                isAvailable = true;
            }
        }



        // Kiểm tra tồn kho - bỏ qua thông báo lỗi, chỉ return false
        if (!isAvailable || maxStock <= 0) {
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
                    hinh_anh: item.hinh_anh || item.image || 'http://localhost:3000/images/placeholder.png',
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
        this.saveUserCart();
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
            return false;
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

    // Kiểm tra đăng nhập trước khi thêm món ăn vào giỏ hàng
    checkAuthBeforeAddToCart() {
        console.log('🔍 Checking auth before adding to cart...');

        // Kiểm tra xem auth object có tồn tại không
        if (typeof window.auth === 'undefined') {
            console.log('⚠️ Auth system not loaded, checking localStorage...');

            // Fallback: kiểm tra localStorage trực tiếp
            const userData = localStorage.getItem('userData') || localStorage.getItem('user');

            if (userData) {
                try {
                    const user = JSON.parse(userData);
                    if (user && user.id) {
                        console.log('✅ Found auth data in localStorage, allowing add to cart');
                        return true;
                    }
                } catch (error) {
                    console.error('❌ Error parsing user data:', error);
                }
            }

            console.log('❌ No auth data found, showing login required for add to cart');
            this.showLoginRequiredForAddToCart();
            return false;
        }

        console.log('🔍 Auth system found:', {
            isAuthenticated: window.auth.isAuthenticated,
            hasUser: !!window.auth.user
        });

        // Kiểm tra trạng thái đăng nhập
        if (!window.auth.isAuthenticated || !window.auth.user) {
            console.log('❌ Not authenticated, showing login required for add to cart');
            this.showLoginRequiredForAddToCart();
            return false;
        }

        console.log('✅ User authenticated, allowing add to cart');
        return true;
    }

    // Kiểm tra đăng nhập trước khi truy cập giỏ hàng
    checkAuthBeforeCart() {
        console.log('🔍 Checking auth before cart...');

        // Kiểm tra xem auth object có tồn tại không
        if (typeof window.auth === 'undefined') {
            console.log('⚠️ Auth system not loaded, checking localStorage...');

            // Fallback: kiểm tra localStorage trực tiếp
            const userData = localStorage.getItem('userData') || localStorage.getItem('user');

            if (userData) {
                try {
                    const user = JSON.parse(userData);
                    if (user && user.id) {
                        console.log('✅ Found auth data in localStorage, allowing cart access');
                        return true;
                    }
                } catch (error) {
                    console.error('❌ Error parsing user data:', error);
                }
            }

            console.log('❌ No auth data found, showing login required');
            this.showLoginRequiredNotification();
            return false;
        }

        console.log('🔍 Auth system found:', {
            isAuthenticated: window.auth.isAuthenticated,
            hasUser: !!window.auth.user
        });

        // Kiểm tra trạng thái đăng nhập
        if (!window.auth.isAuthenticated || !window.auth.user) {
            console.log('❌ Not authenticated, showing login modal');
            this.showLoginRequiredModal();
            return false;
        }

        console.log('✅ User authenticated, allowing cart access');
        return true;
    }

    // Hiển thị thông báo yêu cầu đăng nhập khi thêm món ăn
    showLoginRequiredForAddToCart() {
        // Hiển thị thông báo yêu cầu đăng nhập
        this.showNotification('Vui lòng đăng nhập để thêm món ăn vào giỏ hàng!', 'warning', 4000);

        // Tìm modal đăng nhập có sẵn
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            // Lưu trạng thái để redirect về menu sau khi đăng nhập
            localStorage.setItem('redirectAfterLogin', 'menu');

            // Hiển thị modal đăng nhập
            setTimeout(() => {
                loginModal.classList.add('active');
            }, 500);
        } else {
            // Nếu không có modal đăng nhập, redirect đến trang đăng nhập
            setTimeout(() => {
                if (confirm('Bạn cần đăng nhập để thêm món ăn vào giỏ hàng. Chuyển đến trang đăng nhập?')) {
                    window.location.href = 'Index-new.html';
                }
            }, 1000);
        }
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
        // Không cần kiểm tra đăng nhập nữa

        // Update customer info display
        this.updateCustomerInfoDisplay();

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
        const itemImage = item.hinh_anh || item.image || 'http://localhost:3000/images/placeholder.png';
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

    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        const iconClass = type === 'success' ? 'fa-check-circle' :
                         type === 'error' ? 'fa-exclamation-triangle' :
                         type === 'warning' ? 'fa-exclamation-circle' :
                         'fa-info-circle';

        const bgClass = type === 'success' ? 'bg-green-500 text-white' :
                       type === 'error' ? 'bg-red-500 text-white' :
                       type === 'warning' ? 'bg-yellow-500 text-white' :
                       'bg-blue-500 text-white';

        notification.className = `fixed top-20 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-full ${bgClass}`;
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${iconClass} mr-2"></i>
                <span>${message}</span>
                <button class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        // Auto remove
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, duration);
    }

    // Clear tất cả notifications hiện tại
    clearAllNotifications() {
        // Tìm tất cả các loại notification có thể có
        const selectors = [
            '.notification',
            '.fixed.top-4.right-4',
            '.fixed.top-4.right-4.z-50',
            '[class*="notification"]',
            '[class*="toast"]',
            '.bg-red-500.text-white',
            '.bg-green-500.text-white'
        ];

        selectors.forEach(selector => {
            const notifications = document.querySelectorAll(selector);
            notifications.forEach(notification => {
                if (notification.parentNode) {
                    notification.remove();
                }
            });
        });

        console.log('🧹 Cleared all notifications');
    }



    checkout() {
        // Không cần kiểm tra đăng nhập nữa

        if (this.cart.length === 0) {
            this.showNotification('Vui lòng thêm món ăn vào giỏ hàng trước khi thanh toán!', 'warning');
            return;
        }

        // Hiển thị loading state
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            const originalText = checkoutBtn.innerHTML;
            checkoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Đang chuyển...';
            checkoutBtn.disabled = true;

            // Restore button after a short delay
            setTimeout(() => {
                checkoutBtn.innerHTML = originalText;
                checkoutBtn.disabled = false;
            }, 3000);
        }

        // Redirect đến trang thanh toán
        this.redirectToCheckout();
    }

    // Redirect đến trang thanh toán với đầy đủ dữ liệu
    redirectToCheckout() {
        console.log('🛒 Preparing checkout with cart data:', this.cart);
        console.log('👤 Customer info:', this.customerInfo);

        // Đảm bảo giỏ hàng được lưu với đầy đủ thông tin
        this.saveCart();

        // Lưu thông tin khách hàng để sử dụng trong trang thanh toán
        if (this.customerInfo) {
            localStorage.setItem('checkoutCustomerInfo', JSON.stringify(this.customerInfo));
        }

        // Lưu timestamp để tracking
        localStorage.setItem('checkoutTimestamp', new Date().toISOString());

        // Hiển thị thông báo
        this.showNotification('Đang chuyển đến trang thanh toán...', 'info', 2000);

        // Đóng cart modal trước khi chuyển trang
        this.closeCartModal();

        // Chuyển đến trang thanh toán sau một delay ngắn
        setTimeout(() => {
            window.location.href = 'ThanhToan.html';
        }, 500);
    }

    // Xóa toàn bộ giỏ hàng của user hiện tại
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

    // Clear cart for specific user (admin function)
    clearUserCart(userId) {
        try {
            const cartKey = `cart_${userId}`;
            localStorage.removeItem(cartKey);

            if (userId === this.currentUserId) {
                this.cart = [];
                this.updateCartUI();
                this.renderCartItems();
            }

            console.log(`🗑️ Cleared cart for user: ${userId}`);
        } catch (error) {
            console.error('Error clearing user cart:', error);
        }
    }

    // Get all user carts (admin function)
    getAllUserCarts() {
        const userCarts = {};

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('cart_')) {
                const userId = key.replace('cart_', '');
                try {
                    const cart = JSON.parse(localStorage.getItem(key));
                    userCarts[userId] = cart;
                } catch (error) {
                    console.error(`Error parsing cart for user ${userId}:`, error);
                }
            }
        }

        return userCarts;
    }

    // Debug method to show cart info
    debugCartInfo() {
        console.log('🔍 Cart Debug Info:');
        console.log('Current User ID:', this.currentUserId);
        console.log('Current Cart Items:', this.cart.length);
        console.log('Customer Info:', this.customerInfo);

        const allCarts = this.getAllUserCarts();
        console.log('All User Carts:', allCarts);

        return {
            currentUserId: this.currentUserId,
            currentCartItems: this.cart.length,
            customerInfo: this.customerInfo,
            allUserCarts: allCarts
        };
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

    // Customer Info Management Methods
    loadCustomerInfo() {
        try {
            // Kiểm tra xem user đã đăng nhập chưa
            const loggedInUser = this.getLoggedInUser();
            if (loggedInUser) {
                console.log('✅ User đã đăng nhập, sử dụng thông tin từ account:', loggedInUser.email);
                return {
                    id: loggedInUser.id,
                    full_name: loggedInUser.full_name,
                    email: loggedInUser.email,
                    phone: loggedInUser.phone || '',
                    address: loggedInUser.address || '',
                    isLoggedInUser: true // Đánh dấu là user đã đăng nhập
                };
            }

            // Nếu chưa đăng nhập, lấy thông tin đã lưu từ form (theo user)
            const customerInfoKey = `customerInfo_${this.currentUserId}`;
            const saved = localStorage.getItem(customerInfoKey);
            const customerInfo = saved ? JSON.parse(saved) : null;

            if (customerInfo) {
                customerInfo.isLoggedInUser = false; // Đánh dấu là guest user
            }

            return customerInfo;
        } catch (error) {
            console.error('Error loading customer info:', error);
            return null;
        }
    }

    getLoggedInUser() {
        try {
            // Kiểm tra cả 2 format để tương thích (không cần token)
            const user = localStorage.getItem('user') || localStorage.getItem('userData');

            if (user) {
                const userData = JSON.parse(user);
                console.log('👤 Found logged in user:', userData.email || userData.full_name);
                return userData;
            }

            return null;
        } catch (error) {
            console.error('Error getting logged in user:', error);
            return null;
        }
    }

    saveCustomerInfo(customerInfo) {
        try {
            // Save customer info specific to current user
            const customerInfoKey = `customerInfo_${this.currentUserId}`;
            localStorage.setItem(customerInfoKey, JSON.stringify(customerInfo));

            // Also save to legacy key for backward compatibility
            localStorage.setItem('customerInfo', JSON.stringify(customerInfo));

            this.customerInfo = customerInfo;
            console.log(`✅ Customer info saved for user ${this.currentUserId}:`, customerInfo);
            this.updateCustomerInfoDisplay();
        } catch (error) {
            console.error('Error saving customer info:', error);
        }
    }

    showCustomerInfoModal() {
        // Kiểm tra xem user đã đăng nhập chưa
        const loggedInUser = this.getLoggedInUser();
        if (loggedInUser) {
            console.log('✅ User đã đăng nhập, không cần hiển thị modal');
            // Tự động lưu thông tin từ user đã đăng nhập
            this.customerInfo = this.loadCustomerInfo();
            this.updateCustomerInfoDisplay();

            // Thực hiện action đang chờ
            if (this.pendingCartAction) {
                this.pendingCartAction();
                this.pendingCartAction = null;
            }
            return;
        }

        const modal = document.getElementById('customerInfoModal');
        if (modal) {
            modal.classList.add('active');

            // Pre-fill form if customer info exists (chỉ cho guest user)
            if (this.customerInfo && !this.customerInfo.isLoggedInUser) {
                this.fillCustomerInfoForm(this.customerInfo);
            }
        }
    }

    closeCustomerInfoModal() {
        const modal = document.getElementById('customerInfoModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    fillCustomerInfoForm(customerInfo) {
        const form = document.getElementById('customerInfoForm');
        if (form && customerInfo) {
            const fullNameInput = form.querySelector('#customerFullName');
            const phoneInput = form.querySelector('#customerPhone');
            const emailInput = form.querySelector('#customerEmail');
            const addressInput = form.querySelector('#customerAddress');

            if (fullNameInput) fullNameInput.value = customerInfo.full_name || '';
            if (phoneInput) phoneInput.value = customerInfo.phone || '';
            if (emailInput) emailInput.value = customerInfo.email || '';
            if (addressInput) addressInput.value = customerInfo.address || '';
        }
    }

    saveCustomerInfoFromForm() {
        const form = document.getElementById('customerInfoForm');
        if (!form) return;

        const formData = new FormData(form);
        const customerInfo = {
            full_name: formData.get('full_name')?.trim(),
            phone: formData.get('phone')?.trim(),
            email: formData.get('email')?.trim(),
            address: formData.get('address')?.trim(),
            save_info: formData.get('save_info') === 'on'
        };

        // Validate required fields
        if (!customerInfo.full_name || !customerInfo.phone) {
            this.showNotification('Vui lòng nhập đầy đủ họ tên và số điện thoại', 'error');
            return;
        }

        // Validate phone number
        const phoneRegex = /^[0-9]{10,11}$/;
        if (!phoneRegex.test(customerInfo.phone)) {
            this.showNotification('Số điện thoại không hợp lệ (10-11 số)', 'error');
            return;
        }

        // Đánh dấu là guest user (không phải user đã đăng nhập)
        customerInfo.isLoggedInUser = false;

        // Save customer info
        this.saveCustomerInfo(customerInfo);
        this.closeCustomerInfoModal();
        this.showNotification('Đã lưu thông tin khách hàng', 'success');

        // Continue with the pending action (add to cart)
        if (this.pendingCartAction) {
            this.pendingCartAction();
            this.pendingCartAction = null;
        }
    }

    updateCustomerInfoDisplay() {
        // Update in cart modal
        const placeholder = document.getElementById('customer-info-placeholder');
        if (placeholder && this.customerInfo) {
            const isLoggedIn = this.customerInfo.isLoggedInUser;
            const bgColor = isLoggedIn ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200';
            const textColor = isLoggedIn ? 'text-green-800' : 'text-blue-800';
            const iconColor = isLoggedIn ? 'text-green-600' : 'text-blue-600';
            const statusIcon = isLoggedIn ? 'fas fa-user-check' : 'fas fa-user';
            const statusText = isLoggedIn ? 'Thành viên đã đăng nhập' : 'Thông tin khách hàng';

            placeholder.innerHTML = `
                <div id="customerInfoDisplay" class="${bgColor} border rounded-lg p-4 mb-4">
                    <div class="flex justify-between items-start">
                        <div>
                            <h4 class="font-semibold ${textColor} mb-2">
                                <i class="${statusIcon} mr-2"></i>${statusText}
                            </h4>
                            <div class="text-sm ${textColor.replace('800', '700')} space-y-1">
                                <div id="displayFullName" class="flex items-center">
                                    <i class="fas fa-user w-4 mr-2"></i>
                                    <span>${this.customerInfo.full_name}</span>
                                </div>
                                <div id="displayPhone" class="flex items-center">
                                    <i class="fas fa-phone w-4 mr-2"></i>
                                    <span>${this.customerInfo.phone}</span>
                                </div>
                                ${this.customerInfo.email ? `
                                <div id="displayEmail" class="flex items-center">
                                    <i class="fas fa-envelope w-4 mr-2"></i>
                                    <span>${this.customerInfo.email}</span>
                                </div>
                                ` : ''}
                                ${this.customerInfo.address ? `
                                <div id="displayAddress" class="flex items-start">
                                    <i class="fas fa-map-marker-alt w-4 mr-2 mt-0.5"></i>
                                    <span>${this.customerInfo.address}</span>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                        ${!isLoggedIn ? `
                        <button
                            id="editCustomerInfo"
                            class="${iconColor} hover:${iconColor.replace('600', '800')} text-sm"
                            title="Chỉnh sửa thông tin"
                        >
                            <i class="fas fa-edit"></i>
                        </button>
                        ` : `
                        <div class="text-xs ${textColor} opacity-75">
                            <i class="fas fa-lock mr-1"></i>Tự động từ tài khoản
                        </div>
                        `}
                    </div>
                </div>
            `;
        } else if (placeholder) {
            placeholder.innerHTML = '';
        }

        // Also update standalone display if exists
        const display = document.getElementById('customerInfoDisplay');
        if (!display) return;

        if (this.customerInfo) {
            display.classList.remove('hidden');

            const fullNameSpan = display.querySelector('#displayFullName span');
            const phoneSpan = display.querySelector('#displayPhone span');
            const emailDiv = display.querySelector('#displayEmail');
            const emailSpan = emailDiv?.querySelector('span');
            const addressDiv = display.querySelector('#displayAddress');
            const addressSpan = addressDiv?.querySelector('span');

            if (fullNameSpan) fullNameSpan.textContent = this.customerInfo.full_name;
            if (phoneSpan) phoneSpan.textContent = this.customerInfo.phone;

            if (this.customerInfo.email && emailDiv) {
                emailDiv.classList.remove('hidden');
                if (emailSpan) emailSpan.textContent = this.customerInfo.email;
            } else if (emailDiv) {
                emailDiv.classList.add('hidden');
            }

            if (this.customerInfo.address && addressDiv) {
                addressDiv.classList.remove('hidden');
                if (addressSpan) addressSpan.textContent = this.customerInfo.address;
            } else if (addressDiv) {
                addressDiv.classList.add('hidden');
            }
        } else {
            display.classList.add('hidden');
        }
    }

    requireCustomerInfo(callback) {
        // Refresh customer info để kiểm tra trạng thái đăng nhập mới nhất
        this.customerInfo = this.loadCustomerInfo();

        if (this.customerInfo && this.customerInfo.isLoggedInUser) {
            console.log('✅ Sử dụng thông tin từ user đã đăng nhập');
            // Customer info already exists and user is logged in, execute callback
            callback();
        } else {
            console.log('❌ Không có thông tin user đã đăng nhập, yêu cầu đăng nhập');

            // Hiển thị thông báo yêu cầu đăng nhập
            this.showLoginRequiredForAddToCart();

            // Không thực hiện callback vì user chưa đăng nhập
            return false;
        }
    }

    getCustomerInfo() {
        return this.customerInfo;
    }
}

// Export for global use
window.CartManager = CartManager;
