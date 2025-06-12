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
                    window.location.href = 'Menu.html';
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

        // Try to get data from data attributes first (for static pages)
        if (itemElement.dataset.itemId) {
            return {
                id_mon: parseInt(itemElement.dataset.itemId),
                ten_mon: itemElement.dataset.itemName,
                gia: parseInt(itemElement.dataset.itemPrice),
                hinh_anh: itemElement.dataset.itemImage,
                mo_ta: itemElement.dataset.itemDescription,
                so_luong: 999 // Default stock for static items
            };
        }

        // Extract from DOM (for API-generated content)
        const nameElement = itemElement.querySelector('h3, .item-name, [data-name]');
        const priceElement = itemElement.querySelector('.text-primary, .price, [data-price]');
        const imageElement = itemElement.querySelector('img');
        const descriptionElement = itemElement.querySelector('p, .description, [data-description]');

        if (!nameElement || !priceElement) {
            console.warn('Could not extract item data');
            return null;
        }

        const ten_mon = nameElement.textContent.trim();
        const priceText = priceElement.textContent.replace(/[^\d]/g, '');
        const gia = parseInt(priceText) || 0;

        let hinh_anh = 'http://localhost:3000/images/placeholder.png';
        if (imageElement && imageElement.src) {
            hinh_anh = imageElement.src;
        }

        const mo_ta = descriptionElement ? descriptionElement.textContent.trim() : '';

        // Try to get stock info from stock indicator
        const stockElement = itemElement.querySelector('.bg-green-500, .bg-red-500, .bg-gray-500');
        let so_luong = 999; // Default
        if (stockElement) {
            const stockText = stockElement.textContent;
            const stockMatch = stockText.match(/Còn (\d+) phần/);
            if (stockMatch) {
                so_luong = parseInt(stockMatch[1]);
            } else if (stockText.includes('Hết hàng')) {
                so_luong = 0;
            }
        }

        return {
            id_mon: Date.now() + Math.random(), // Generate unique ID
            ten_mon,
            gia,
            hinh_anh,
            mo_ta,
            so_luong
        };
    }

    addToCart(item, buttonElement = null, quantity = 1) {
        // Handle both API format (id_mon, ten_mon) and legacy format (id, name)
        const itemId = item.id_mon || item.id;
        const itemName = item.ten_mon || item.name;
        const itemPrice = item.gia || item.price;
        const maxStock = item.so_luong || 999;

        if (!itemId || !itemName || !itemPrice) {
            console.error('Invalid item data:', item);
            this.showNotification('Lỗi: Dữ liệu món ăn không hợp lệ', 'error');
            return;
        }

        const existingItem = this.cart.find(cartItem =>
            (cartItem.id_mon || cartItem.id) === itemId
        );

        if (existingItem) {
            const newQuantity = existingItem.qty + quantity;
            if (newQuantity <= maxStock) {
                existingItem.qty = newQuantity;
                this.showAddToCartNotification(`Đã cập nhật số lượng "${itemName}"`);
            } else {
                this.showNotification(`Chỉ còn ${maxStock} phần "${itemName}"`, 'error');
                return;
            }
        } else {
            if (quantity <= maxStock) {
                this.cart.push({
                    id_mon: itemId,
                    ten_mon: itemName,
                    gia: itemPrice,
                    hinh_anh: item.hinh_anh || item.image || 'http://localhost:3000/images/placeholder.png',
                    mo_ta: item.mo_ta || item.description || '',
                    so_luong: maxStock,
                    qty: quantity,
                    addedAt: new Date().toISOString()
                });
                this.showAddToCartNotification(`Đã thêm "${itemName}" vào giỏ hàng`);
            } else {
                this.showNotification(`Chỉ còn ${maxStock} phần "${itemName}"`, 'error');
                return;
            }
        }

        this.saveCart();
        this.updateCartUI();

        // Visual feedback on button
        if (buttonElement) {
            this.showButtonFeedback(buttonElement);
        }
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
        const cartModal = document.getElementById('cartModal');
        if (cartModal) {
            cartModal.classList.add('active');
            this.renderCartItems();
        }
    }

    closeCartModal() {
        const cartModal = document.getElementById('cartModal');
        if (cartModal) {
            cartModal.classList.remove('active');
        }
    }

    renderCartItems() {
        const cartItemsList = document.getElementById('cartItemsList');
        const emptyCartState = document.getElementById('emptyCartState');
        const cartSummary = document.getElementById('cartSummary');

        if (!cartItemsList) return;

        if (this.cart.length === 0) {
            cartItemsList.classList.add('hidden');
            cartSummary.classList.add('hidden');
            emptyCartState.classList.remove('hidden');
            return;
        }

        emptyCartState.classList.add('hidden');
        cartItemsList.classList.remove('hidden');
        cartSummary.classList.remove('hidden');

        cartItemsList.innerHTML = this.cart.map(item => this.createCartItemHTML(item)).join('');
        this.updateCartSummary();
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

        clone.querySelector('.item-image').src = itemImage;
        clone.querySelector('.item-image').alt = itemName;
        clone.querySelector('.item-name').textContent = itemName;
        clone.querySelector('.item-price').textContent = this.formatPrice(itemPrice);
        clone.querySelector('.item-description').textContent = itemDescription;
        clone.querySelector('.item-quantity').textContent = itemQuantity;
        clone.querySelector('.item-total').textContent = this.formatPrice(itemPrice * itemQuantity);

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

    showAddToCartNotification(itemName) {
        const template = document.getElementById('cartNotificationTemplate');
        if (!template) return;

        const clone = template.content.cloneNode(true);
        const notification = clone.querySelector('.cart-notification');
        notification.querySelector('.notification-text').textContent = `Đã thêm "${itemName}" vào giỏ hàng!`;
        
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
        button.innerHTML = '<i class="fas fa-check mr-2"></i>Đã thêm!';
        button.classList.add('bg-green-500');
        button.disabled = true;

        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.classList.remove('bg-green-500');
            button.disabled = false;
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
        if (this.cart.length === 0) {
            this.showNotification('Giỏ hàng trống!', 'error');
            return;
        }

        // Simulate checkout process
        const checkoutModal = document.getElementById('checkoutModal');
        if (checkoutModal) {
            this.closeCartModal();
            checkoutModal.classList.add('active');
            
            // Clear cart after successful checkout
            setTimeout(() => {
                this.cart = [];
                this.saveCart();
                this.updateCartUI();
            }, 1000);
        }
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
}

// Export for global use
window.CartManager = CartManager;
