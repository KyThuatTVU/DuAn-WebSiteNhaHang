// User Cart Integration - Kết hợp user đăng nhập với giỏ hàng và thanh toán

class UserCartIntegration {
    constructor() {
        this.userData = null;
        this.cartData = [];
        this.init();
    }

    init() {
        this.loadUserData();
        this.loadCartData();
        this.setupEventListeners();
        this.updateUI();
        console.log('✅ UserCartIntegration initialized');
    }

    loadUserData() {
        // Try multiple keys to find user data
        const keys = ['loggedInUser', 'customerData', 'userData', 'user'];

        for (const key of keys) {
            const data = localStorage.getItem(key);
            if (data) {
                try {
                    const userData = JSON.parse(data);
                    if (userData && (userData.id || userData.email)) {
                        this.userData = userData;
                        console.log(`✅ User logged in from ${key}:`, this.userData.full_name || this.userData.name);
                        this.showUserElements();
                        return;
                    }
                } catch (error) {
                    console.error(`❌ Error parsing ${key}:`, error);
                    localStorage.removeItem(key);
                }
            }
        }

        console.log('ℹ️ No user logged in - Guest mode');
        this.showGuestElements();
    }

    loadCartData() {
        // Try multiple cart storage keys for compatibility
        const cartKeys = ['cartData', 'cart'];
        let cartData = null;

        for (const key of cartKeys) {
            const data = localStorage.getItem(key);
            if (data) {
                try {
                    cartData = JSON.parse(data);
                    if (Array.isArray(cartData) && cartData.length > 0) {
                        break;
                    }
                } catch (error) {
                    console.warn(`Error parsing ${key}:`, error);
                }
            }
        }

        if (cartData) {
            this.cartData = this.normalizeCartData(cartData);
            console.log(`📦 Loaded ${this.cartData.length} items from cart`);
        }
    }

    normalizeCartData(cartData) {
        // Normalize cart data to consistent format
        return cartData.map(item => ({
            id: item.id || item.id_mon,
            name: item.name || item.ten_mon,
            price: parseFloat(item.price || item.gia),
            image: item.image || item.hinh_anh || 'img/default-food.jpg',
            quantity: parseInt(item.quantity || item.qty || item.so_luong || 1),
            added_by: this.userData?.id || 'guest',
            added_at: item.added_at || new Date().toISOString()
        }));
    }

    setupEventListeners() {
        // Listen for login/logout events
        document.addEventListener('userLoggedIn', (event) => {
            this.handleUserLogin(event.detail);
        });

        document.addEventListener('userLoggedOut', () => {
            this.handleUserLogout();
        });

        // Listen for cart updates
        document.addEventListener('cartUpdated', (event) => {
            this.handleCartUpdate(event.detail);
        });

        // Setup add to cart buttons
        this.setupAddToCartButtons();

        // Setup cart modal
        this.setupCartModal();
    }

    setupAddToCartButtons() {
        // Handle add to cart buttons with data attributes
        document.addEventListener('click', (e) => {
            const addButton = e.target.closest('[data-add-to-cart]');
            if (addButton) {
                e.preventDefault();
                this.handleAddToCart(addButton);
            }
        });

        // Handle quantity buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.qty-btn-minus')) {
                e.preventDefault();
                const input = e.target.closest('.qty-controls').querySelector('.qty-input');
                this.changeQuantity(input, -1);
            }
            
            if (e.target.closest('.qty-btn-plus')) {
                e.preventDefault();
                const input = e.target.closest('.qty-controls').querySelector('.qty-input');
                this.changeQuantity(input, 1);
            }
        });
    }

    setupCartModal() {
        // Cart toggle button
        const cartToggle = document.getElementById('cartToggle');
        const cartModal = document.getElementById('cartModal');
        const closeCart = document.getElementById('closeCart');

        if (cartToggle && cartModal) {
            cartToggle.addEventListener('click', () => {
                cartModal.classList.remove('hidden');
                this.updateCartModal();
            });
        }

        if (closeCart && cartModal) {
            closeCart.addEventListener('click', () => {
                cartModal.classList.add('hidden');
            });
        }

        // Checkout button
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                this.proceedToPayment();
            });
        }
    }

    handleAddToCart(button) {
        const itemData = {
            id: button.dataset.id,
            name: button.dataset.name,
            price: parseFloat(button.dataset.price),
            image: button.dataset.image
        };

        // Get quantity from nearby input or default to 1
        const qtyInput = button.closest('.menu-item')?.querySelector('.qty-input') || 
                        document.getElementById(`qty-${itemData.id}`);
        const quantity = qtyInput ? parseInt(qtyInput.value) || 1 : 1;

        this.addToCart(itemData, quantity);
    }

    addToCart(item, quantity = 1) {
        if (!item || !item.id || !item.name || !item.price) {
            console.error('❌ Invalid item data:', item);
            return false;
        }

        // Check if user is logged in
        if (this.userData) {
            console.log(`✅ Adding ${item.name} to cart for user: ${this.userData.full_name || this.userData.name}`);
        } else {
            console.log(`ℹ️ Adding ${item.name} to guest cart`);
        }

        // Find existing item
        const existingItem = this.cartData.find(cartItem => cartItem.id == item.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
            console.log(`📦 Updated quantity for ${item.name}: ${existingItem.quantity}`);
        } else {
            const newItem = {
                id: item.id,
                name: item.name,
                price: parseFloat(item.price),
                image: item.image || 'img/default-food.jpg',
                quantity: quantity,
                added_by: this.userData?.id || 'guest',
                added_at: new Date().toISOString()
            };
            
            this.cartData.push(newItem);
            console.log(`📦 Added new item to cart: ${item.name}`);
        }

        this.saveCartData();
        this.updateUI();
        this.showAddToCartMessage(item.name);
        
        // Dispatch event
        document.dispatchEvent(new CustomEvent('cartUpdated', {
            detail: this.cartData
        }));

        return true;
    }

    removeFromCart(itemId) {
        const item = this.cartData.find(cartItem => cartItem.id == itemId);
        if (item) {
            console.log(`🗑️ Removing ${item.name} from cart`);
        }

        this.cartData = this.cartData.filter(item => item.id != itemId);
        this.saveCartData();
        this.updateUI();
        
        document.dispatchEvent(new CustomEvent('cartUpdated', {
            detail: this.cartData
        }));
    }

    updateQuantity(itemId, quantity) {
        const item = this.cartData.find(cartItem => cartItem.id == itemId);
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(itemId);
            } else {
                item.quantity = quantity;
                console.log(`📦 Updated ${item.name} quantity: ${quantity}`);
                this.saveCartData();
                this.updateUI();
                
                document.dispatchEvent(new CustomEvent('cartUpdated', {
                    detail: this.cartData
                }));
            }
        }
    }

    changeQuantity(input, delta) {
        if (!input) return;
        
        const currentVal = parseInt(input.value) || 1;
        const maxVal = parseInt(input.max) || 999;
        const minVal = parseInt(input.min) || 1;
        
        let newVal = currentVal + delta;
        newVal = Math.max(minVal, Math.min(newVal, maxVal));
        
        input.value = newVal;
    }

    clearCart() {
        console.log('🗑️ Clearing cart');
        this.cartData = [];
        this.saveCartData();
        this.updateUI();
        
        document.dispatchEvent(new CustomEvent('cartUpdated', {
            detail: this.cartData
        }));
    }

    saveCartData() {
        // Save to multiple keys for compatibility
        localStorage.setItem('cartData', JSON.stringify(this.cartData));
        localStorage.setItem('cart', JSON.stringify(this.cartData));
    }

    handleUserLogin(userData) {
        this.userData = userData;
        console.log('✅ User logged in, updating UI...');
        this.showUserElements();
        this.updateUI();
    }

    handleUserLogout() {
        this.userData = null;
        console.log('ℹ️ User logged out');
        this.showGuestElements();
        this.updateUI();
    }

    handleCartUpdate(cartData) {
        if (Array.isArray(cartData)) {
            this.cartData = this.normalizeCartData(cartData);
            this.saveCartData();
            this.updateUI();
        }
    }

    showUserElements() {
        const userElements = document.querySelectorAll('.user-only');
        userElements.forEach(element => {
            element.style.display = 'block';
        });

        const guestElements = document.querySelectorAll('.guest-only');
        guestElements.forEach(element => {
            element.style.display = 'none';
        });

        // Update user name displays
        const userNameElements = document.querySelectorAll('.user-name');
        userNameElements.forEach(element => {
            element.textContent = this.userData?.full_name || this.userData?.name || 'User';
        });
    }

    showGuestElements() {
        const userElements = document.querySelectorAll('.user-only');
        userElements.forEach(element => {
            element.style.display = 'none';
        });

        const guestElements = document.querySelectorAll('.guest-only');
        guestElements.forEach(element => {
            element.style.display = 'block';
        });
    }

    updateUI() {
        this.updateCartCount();
        this.updateCartTotal();
        this.updateCartButtons();
    }

    updateCartCount() {
        const cartCount = this.getCartCount();
        const cartCountElements = document.querySelectorAll('.cart-count');
        cartCountElements.forEach(element => {
            element.textContent = cartCount;
            element.style.display = cartCount > 0 ? 'inline-block' : 'none';
        });
    }

    updateCartTotal() {
        const cartTotal = this.getCartTotal();
        const cartTotalElements = document.querySelectorAll('.cart-total');
        cartTotalElements.forEach(element => {
            element.textContent = this.formatCurrency(cartTotal);
        });
    }

    updateCartButtons() {
        const cartButtons = document.querySelectorAll('.cart-button');
        const cartCount = this.getCartCount();
        
        cartButtons.forEach(button => {
            if (cartCount > 0) {
                button.classList.add('has-items');
                button.classList.remove('empty');
            } else {
                button.classList.remove('has-items');
                button.classList.add('empty');
            }
        });
    }

    updateCartModal() {
        const cartModal = document.getElementById('cartModal');
        if (!cartModal) return;

        const cartItemsContainer = cartModal.querySelector('.cart-items');
        const cartTotalElement = cartModal.querySelector('.cart-modal-total');
        const checkoutBtn = cartModal.querySelector('#checkoutBtn');

        if (!cartItemsContainer) return;

        if (this.cartData.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-shopping-cart text-4xl text-gray-300 mb-4"></i>
                    <p class="text-gray-500">Chưa có món ăn nào</p>
                    <p class="text-sm text-gray-400">Hãy chọn món ăn yêu thích từ thực đơn</p>
                </div>
            `;
            
            if (checkoutBtn) checkoutBtn.disabled = true;
            if (cartTotalElement) cartTotalElement.textContent = this.formatCurrency(0);
            return;
        }

        let html = '';
        this.cartData.forEach(item => {
            const itemTotal = item.price * item.quantity;
            html += `
                <div class="cart-item flex items-center justify-between p-4 border-b hover:bg-gray-50">
                    <div class="flex items-center space-x-3">
                        <img src="${item.image}" alt="${item.name}" 
                             class="w-16 h-16 object-cover rounded-lg border">
                        <div>
                            <h4 class="font-medium text-gray-800">${item.name}</h4>
                            <p class="text-sm text-gray-600">${this.formatCurrency(item.price)} x ${item.quantity}</p>
                            <p class="text-sm font-semibold text-red-600">${this.formatCurrency(itemTotal)}</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-2">
                        <button onclick="userCartIntegration.updateQuantity(${item.id}, ${item.quantity - 1})" 
                                class="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors">
                            <i class="fas fa-minus text-xs"></i>
                        </button>
                        <span class="w-8 text-center font-medium">${item.quantity}</span>
                        <button onclick="userCartIntegration.updateQuantity(${item.id}, ${item.quantity + 1})" 
                                class="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors">
                            <i class="fas fa-plus text-xs"></i>
                        </button>
                        <button onclick="userCartIntegration.removeFromCart(${item.id})" 
                                class="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors ml-2">
                            <i class="fas fa-trash text-xs"></i>
                        </button>
                    </div>
                </div>
            `;
        });

        cartItemsContainer.innerHTML = html;

        // Update total
        const total = this.getCartTotal();
        if (cartTotalElement) {
            cartTotalElement.textContent = this.formatCurrency(total);
        }

        // Enable checkout button
        if (checkoutBtn) {
            checkoutBtn.disabled = false;
        }
    }

    showAddToCartMessage(itemName) {
        let messageDiv = document.getElementById('addToCartMessage');
        if (!messageDiv) {
            messageDiv = document.createElement('div');
            messageDiv.id = 'addToCartMessage';
            messageDiv.className = 'fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg transform transition-all duration-300';
            document.body.appendChild(messageDiv);
        }

        messageDiv.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-check-circle mr-2"></i>
                <span>Đã thêm "${itemName}" vào giỏ hàng</span>
            </div>
        `;

        messageDiv.style.display = 'block';
        messageDiv.style.transform = 'translateX(0)';

        setTimeout(() => {
            messageDiv.style.transform = 'translateX(100%)';
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 300);
        }, 3000);
    }

    proceedToPayment() {
        if (this.cartData.length === 0) {
            alert('Vui lòng chọn món ăn từ thực đơn trước khi thanh toán!');
            return;
        }

        console.log('🛒 Proceeding to payment with cart:', this.cartData);
        console.log('📦 Cart data details:', JSON.stringify(this.cartData, null, 2));

        // Save cart data for payment page (multiple keys for compatibility)
        localStorage.setItem('cartData', JSON.stringify(this.cartData));
        localStorage.setItem('cart', JSON.stringify(this.cartData));
        localStorage.setItem('userCart', JSON.stringify(this.cartData));

        console.log('💾 Cart data saved to localStorage with keys: cartData, cart, userCart');
        console.log('🔍 Verification - cartData:', localStorage.getItem('cartData'));
        console.log('🔍 Verification - cart:', localStorage.getItem('cart'));
        console.log('🔍 Verification - userCart:', localStorage.getItem('userCart'));

        // Save customer data if logged in (multiple keys for compatibility)
        if (this.userData) {
            localStorage.setItem('customerData', JSON.stringify(this.userData));
            localStorage.setItem('loggedInUser', JSON.stringify(this.userData));
            console.log('✅ Customer data saved for payment with multiple keys');
            console.log('👤 Saved customer:', {
                id: this.userData.id,
                name: this.userData.full_name || this.userData.name,
                email: this.userData.email,
                phone: this.userData.phone || this.userData.sdt
            });
        } else {
            console.log('⚠️ No user data to save - proceeding as guest');
        }

        // Close cart modal
        const cartModal = document.getElementById('cartModal');
        if (cartModal) {
            cartModal.classList.add('hidden');
        }

        // Redirect to payment page
        window.location.href = 'ThanhToan.html';
    }

    // Utility methods
    formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    }

    getCartData() {
        return this.cartData;
    }

    getUserData() {
        return this.userData;
    }

    getCartCount() {
        return this.cartData.reduce((total, item) => total + item.quantity, 0);
    }

    getCartTotal() {
        return this.cartData.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    isUserLoggedIn() {
        return !!this.userData;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (!window.userCartIntegration) {
            window.userCartIntegration = new UserCartIntegration();
        }
    }, 200);
});

// Export for global access
window.UserCartIntegration = UserCartIntegration;
