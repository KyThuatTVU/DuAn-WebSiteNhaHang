// Cart Integration - Kết nối với menu-db.html và API data

// Enhanced cart integration for API data
class CartIntegration {
    constructor() {
        this.API_BASE = 'http://localhost:3000';
        this.PLACEHOLDER = `${this.API_BASE}/images/placeholder.png`;
        this.init();
    }

    init() {
        // Initialize cart manager if not already done
        if (!window.cartManager && window.CartManager) {
            window.cartManager = new CartManager();
        }

        // Sync with existing cart data
        this.syncExistingCart();
        
        // Override add to cart functions for API integration
        this.setupAPIIntegration();
        
        console.log('🔗 Cart Integration initialized');
    }

    syncExistingCart() {
        // Sync with localStorage cart from menu-db.html
        const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        if (existingCart.length > 0 && window.cartManager) {
            // Convert existing cart items to new format if needed
            existingCart.forEach(item => {
                if (!window.cartManager.cart.find(cartItem => 
                    (cartItem.id_mon || cartItem.id) === (item.id_mon || item.id)
                )) {
                    window.cartManager.cart.push(item);
                }
            });
            
            window.cartManager.saveCart();
            window.cartManager.updateCartUI();
        }
    }

    setupAPIIntegration() {
        // Override global cart object if it exists (from menu-db.html)
        if (window.cart) {
            const originalAdd = window.cart.add.bind(window.cart);
            
            window.cart.add = (item, qty = 1) => {
                // Use new cart manager if available
                if (window.cartManager) {
                    window.cartManager.addAPIItem(item, qty);
                } else {
                    // Fallback to original method
                    originalAdd(item, qty);
                }
            };

            // Override updateUI to sync with new cart manager
            const originalUpdateUI = window.cart.updateUI.bind(window.cart);
            
            window.cart.updateUI = () => {
                if (window.cartManager) {
                    window.cartManager.updateCartUI();
                } else {
                    originalUpdateUI();
                }
            };
        }

        // Setup event listeners for API-generated content
        this.setupDynamicEventListeners();
    }

    setupDynamicEventListeners() {
        // Handle add to cart for dynamically generated content
        document.addEventListener('click', (e) => {
            // Handle onclick cart.add calls from API-generated buttons
            if (e.target.closest('button[onclick*="cart.add"]')) {
                e.preventDefault();
                e.stopPropagation();
                
                const button = e.target.closest('button');
                const onclickAttr = button.getAttribute('onclick');
                
                // Extract item data from onclick attribute
                try {
                    const match = onclickAttr.match(/cart\.add\((.+?),\s*parseInt\(document\.getElementById\("qty-(\d+)"\)\.value\)\)/);
                    if (match) {
                        const itemJson = match[1];
                        const itemId = match[2];
                        const qtyInput = document.getElementById(`qty-${itemId}`);
                        
                        if (qtyInput) {
                            const quantity = parseInt(qtyInput.value) || 1;
                            const item = JSON.parse(itemJson.replace(/&quot;/g, '"'));
                            
                            if (window.cartManager) {
                                window.cartManager.addAPIItem(item, quantity);
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error parsing cart.add onclick:', error);
                }
            }
        });

        // Handle quantity change buttons for API content
        document.addEventListener('click', (e) => {
            if (e.target.closest('button[onclick*="changeQty"]')) {
                e.preventDefault();
                e.stopPropagation();
                
                const button = e.target.closest('button');
                const onclickAttr = button.getAttribute('onclick');
                
                try {
                    const match = onclickAttr.match(/changeQty\((\d+),\s*(-?\d+)\)/);
                    if (match) {
                        const itemId = match[1];
                        const delta = parseInt(match[2]);
                        this.changeQuantity(itemId, delta);
                    }
                } catch (error) {
                    console.error('Error parsing changeQty onclick:', error);
                }
            }
        });
    }

    changeQuantity(id, delta) {
        const input = document.getElementById(`qty-${id}`);
        if (!input) return;
        
        const currentVal = parseInt(input.value, 10) || 1;
        const maxVal = parseInt(input.max, 10) || 999;
        const minVal = parseInt(input.min, 10) || 1;
        
        let newVal = currentVal + delta;
        newVal = Math.max(minVal, Math.min(newVal, maxVal));
        
        input.value = newVal;
    }

    // Method to manually add API item
    addAPIItem(apiItem, quantity = 1) {
        if (window.cartManager) {
            window.cartManager.addAPIItem(apiItem, quantity);
        } else {
            console.warn('CartManager not available');
        }
    }

    // Method to get formatted cart data for API
    getCartForAPI() {
        if (window.cartManager) {
            return window.cartManager.cart.map(item => ({
                id_mon: item.id_mon || item.id,
                ten_mon: item.ten_mon || item.name,
                gia: item.gia || item.price,
                so_luong: item.qty || item.quantity,
                hinh_anh: item.hinh_anh || item.image
            }));
        }
        return [];
    }

    // Method to clear cart
    clearCart() {
        if (window.cartManager) {
            window.cartManager.clearCart();
        }
        
        // Also clear legacy cart
        if (window.cart) {
            window.cart.items = [];
            window.cart.save();
            window.cart.updateUI();
        }
    }

    // Method to get cart total
    getTotal() {
        if (window.cartManager) {
            return window.cartManager.getCartTotal();
        }
        return 0;
    }

    // Method to get cart item count
    getItemCount() {
        if (window.cartManager) {
            return window.cartManager.getCartItemCount();
        }
        return 0;
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for other scripts to load
    setTimeout(() => {
        window.cartIntegration = new CartIntegration();
    }, 500);
});

// Export for global use
window.CartIntegration = CartIntegration;
