// Payment JavaScript - Kết nối với database hóa đơn

class PaymentManager {
    constructor() {
        this.form = document.getElementById('paymentForm');
        this.submitBtn = document.getElementById('submitPayment');
        this.cartData = this.getCartData();
        this.customerData = this.getCustomerData();
        
        this.init();
    }

    init() {
        console.log('🔧 PaymentManager initializing...');
        console.log('📦 Cart data:', this.cartData);
        console.log('👤 Customer data:', this.customerData);

        this.displayCartSummary();
        this.setupEventListeners();
        this.populateCustomerInfo();
        this.calculateTotal();

        console.log('✅ PaymentManager initialized successfully');
    }

    getCartData() {
        // Try multiple keys to get cart data
        const keys = ['cartData', 'cart'];

        for (const key of keys) {
            const data = localStorage.getItem(key);
            if (data) {
                try {
                    const cartData = JSON.parse(data);
                    if (Array.isArray(cartData) && cartData.length > 0) {
                        console.log(`✅ Found cart data in localStorage key: ${key}`);
                        console.log('🛒 Cart items:', cartData.length);
                        return cartData;
                    }
                } catch (error) {
                    console.warn(`⚠️ Error parsing cart data from ${key}:`, error);
                }
            }
        }

        // Fallback: get from URL params
        const urlParams = new URLSearchParams(window.location.search);
        const cartParam = urlParams.get('cart');
        if (cartParam) {
            try {
                return JSON.parse(decodeURIComponent(cartParam));
            } catch (error) {
                console.warn('⚠️ Error parsing cart from URL:', error);
            }
        }

        console.log('❌ No cart data found');
        return [];
    }

    getCustomerData() {
        // Try multiple keys to get customer data
        const keys = ['loggedInUser', 'customerData', 'userData', 'user'];

        for (const key of keys) {
            const data = localStorage.getItem(key);
            if (data) {
                try {
                    const userData = JSON.parse(data);
                    if (userData && (userData.id || userData.email)) {
                        console.log(`✅ Found customer data in localStorage key: ${key}`);
                        console.log('👤 Customer info:', {
                            id: userData.id,
                            name: userData.full_name || userData.name,
                            email: userData.email,
                            phone: userData.phone || userData.sdt
                        });
                        return userData;
                    }
                } catch (error) {
                    console.warn(`⚠️ Error parsing ${key}:`, error);
                }
            }
        }

        console.log('❌ No customer data found in localStorage');
        return null;
    }

    displayCartSummary() {
        const cartContainer = document.getElementById('cartSummary');
        if (!cartContainer || !this.cartData || this.cartData.length === 0) {
            if (cartContainer) {
                cartContainer.innerHTML = '<p class="text-center text-gray-500">Giỏ hàng trống</p>';
            }
            return;
        }

        let html = '<div class="space-y-4">';
        
        this.cartData.forEach(item => {
            const itemTotal = item.price * item.quantity;
            html += `
                <div class="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div class="flex items-center space-x-4">
                        <img src="${item.image || 'images/default-food.jpg'}" 
                             alt="${item.name}" 
                             class="w-16 h-16 object-cover rounded-lg">
                        <div>
                            <h4 class="font-semibold text-gray-800">${item.name}</h4>
                            <p class="text-sm text-gray-600">Số lượng: ${item.quantity}</p>
                            <p class="text-sm text-gray-600">Đơn giá: ${this.formatCurrency(item.price)}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="font-semibold text-lg text-red-600">${this.formatCurrency(itemTotal)}</p>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        cartContainer.innerHTML = html;
    }

    populateCustomerInfo() {
        if (!this.customerData) {
            // Redirect back to menu if no user data
            this.showLoginRequired();
            return;
        }

        // Auto-display customer info - no form needed
        this.displayCustomerInfo();
    }

    showLoginRequired() {
        const customerSection = document.querySelector('.customer-info-section');
        if (customerSection) {
            customerSection.innerHTML = `
                <div class="border-b pb-4">
                    <h2 class="text-xl font-semibold mb-4 text-gray-700">Yêu Cầu Đăng Nhập</h2>
                    <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <div class="mb-4">
                            <i class="fas fa-exclamation-triangle text-red-500 text-4xl mb-3"></i>
                            <h3 class="text-lg font-semibold text-red-800 mb-2">Vui lòng đăng nhập trước khi thanh toán</h3>
                            <p class="text-red-700">Bạn cần đăng nhập từ trang Menu để sử dụng chức năng thanh toán.</p>
                        </div>
                        <div class="space-y-3">
                            <button onclick="window.location.href='Menu-new.html'"
                                    class="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium">
                                <i class="fas fa-arrow-left mr-2"></i>Quay lại Menu và Đăng nhập
                            </button>
                            <button onclick="window.location.href='Index-new.html'"
                                    class="w-full bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium">
                                <i class="fas fa-home mr-2"></i>Về Trang Chủ
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        // Disable payment button
        const submitBtn = document.getElementById('submitPayment');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-lock mr-2"></i>Cần Đăng Nhập';
            submitBtn.classList.add('bg-gray-400', 'cursor-not-allowed');
            submitBtn.classList.remove('bg-primary', 'hover:bg-red-700');
        }
    }

    displayCustomerInfo() {
        const customerSection = document.querySelector('.customer-info-section');
        if (customerSection && this.customerData) {
            customerSection.innerHTML = `
                <div class="border-b pb-4">
                    <h2 class="text-xl font-semibold mb-4 text-gray-700">Thông Tin Khách Hàng</h2>
                    <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center">
                                <i class="fas fa-user-check text-green-600 mr-3 text-xl"></i>
                                <div>
                                    <p class="text-green-800 font-medium">Đã đăng nhập từ Menu</p>
                                    <p class="text-green-700 text-sm">Thông tin tự động sử dụng cho thanh toán</p>
                                </div>
                            </div>
                            <div class="text-green-600">
                                <i class="fas fa-check-circle text-xl"></i>
                            </div>
                        </div>
                        <div class="mt-4 bg-white rounded-lg p-4 border border-green-100">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="flex items-center">
                                    <i class="fas fa-user text-gray-500 mr-3 w-4"></i>
                                    <div>
                                        <span class="text-gray-600 text-sm">Họ tên</span>
                                        <p class="font-medium text-gray-800">${this.customerData.full_name || this.customerData.name}</p>
                                    </div>
                                </div>
                                <div class="flex items-center">
                                    <i class="fas fa-phone text-gray-500 mr-3 w-4"></i>
                                    <div>
                                        <span class="text-gray-600 text-sm">Điện thoại</span>
                                        <p class="font-medium text-gray-800">${this.customerData.phone || this.customerData.sdt}</p>
                                    </div>
                                </div>
                                <div class="flex items-center">
                                    <i class="fas fa-envelope text-gray-500 mr-3 w-4"></i>
                                    <div>
                                        <span class="text-gray-600 text-sm">Email</span>
                                        <p class="font-medium text-gray-800">${this.customerData.email || 'Chưa có'}</p>
                                    </div>
                                </div>
                                <div class="flex items-center">
                                    <i class="fas fa-id-card text-gray-500 mr-3 w-4"></i>
                                    <div>
                                        <span class="text-gray-600 text-sm">ID Khách hàng</span>
                                        <p class="font-medium text-gray-800">#${this.customerData.id}</p>
                                    </div>
                                </div>
                                ${this.customerData.address ? `
                                <div class="md:col-span-2 flex items-start">
                                    <i class="fas fa-map-marker-alt text-gray-500 mr-3 w-4 mt-1"></i>
                                    <div>
                                        <span class="text-gray-600 text-sm">Địa chỉ</span>
                                        <p class="font-medium text-gray-800">${this.customerData.address}</p>
                                    </div>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                        <div class="mt-3 text-center">
                            <p class="text-green-700 text-sm">
                                <i class="fas fa-info-circle mr-1"></i>
                                Thông tin này sẽ được sử dụng tự động cho hóa đơn
                            </p>
                        </div>
                    </div>
                </div>
            `;
        }
    }



    calculateTotal() {
        if (!this.cartData || this.cartData.length === 0) return 0;

        const subtotal = this.cartData.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);

        const deliveryFee = this.getDeliveryFee();
        const total = subtotal + deliveryFee;

        // Update UI
        this.updateTotalDisplay(subtotal, deliveryFee, total);
        
        return total;
    }

    getDeliveryFee() {
        const orderType = document.querySelector('input[name="orderType"]:checked');
        if (orderType && orderType.value === 'delivery') {
            return 20000; // 20k delivery fee
        }
        return 0;
    }

    updateTotalDisplay(subtotal, deliveryFee, total) {
        const subtotalElement = document.getElementById('subtotal');
        const deliveryElement = document.getElementById('deliveryFee');
        const totalElement = document.getElementById('totalAmount');

        if (subtotalElement) subtotalElement.textContent = this.formatCurrency(subtotal);
        if (deliveryElement) deliveryElement.textContent = this.formatCurrency(deliveryFee);
        if (totalElement) totalElement.textContent = this.formatCurrency(total);
    }

    setupEventListeners() {
        // Order type change
        const orderTypeRadios = document.querySelectorAll('input[name="orderType"]');
        orderTypeRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                this.handleOrderTypeChange();
                this.calculateTotal();
            });
        });

        // Form submission
        if (this.form) {
            this.form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handlePayment();
            });
        }

        // Payment method change
        const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
        paymentMethods.forEach(radio => {
            radio.addEventListener('change', () => {
                this.handlePaymentMethodChange();
            });
        });
    }

    handleOrderTypeChange() {
        const orderType = document.querySelector('input[name="orderType"]:checked');
        const addressSection = document.getElementById('deliveryAddressSection');
        
        if (orderType && orderType.value === 'delivery') {
            if (addressSection) addressSection.classList.remove('hidden');
        } else {
            if (addressSection) addressSection.classList.add('hidden');
        }
    }

    handlePaymentMethodChange() {
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
        // Handle different payment methods if needed
        console.log('Payment method changed:', paymentMethod?.value);
    }

    async handlePayment() {
        try {
            // Show loading state
            this.setLoadingState(true);

            // Validate form
            if (!this.validateForm()) {
                this.setLoadingState(false);
                return;
            }

            // Prepare payment data
            const paymentData = this.preparePaymentData();
            
            // Submit to backend
            const response = await this.submitPayment(paymentData);
            
            if (response.success) {
                // Clear cart
                localStorage.removeItem('cartData');
                
                // Redirect to invoice page
                window.location.href = `HoaDon.html?id=${response.data.id}`;
            } else {
                this.showMessage(response.message || 'Có lỗi xảy ra khi thanh toán', 'error');
            }

        } catch (error) {
            console.error('Payment error:', error);
            this.showMessage('Có lỗi xảy ra, vui lòng thử lại sau', 'error');
        } finally {
            this.setLoadingState(false);
        }
    }

    validateForm() {
        let isValid = true;

        // Clear previous errors
        document.querySelectorAll('.error-message').forEach(error => error.remove());
        document.querySelectorAll('.border-red-500').forEach(field => field.classList.remove('border-red-500'));

        // Must be logged in to proceed
        if (!this.customerData) {
            this.showMessage('Vui lòng đăng nhập từ trang Menu trước khi thanh toán', 'error');
            return false;
        }

        // Validate cart
        if (!this.cartData || this.cartData.length === 0) {
            this.showMessage('Giỏ hàng trống! Vui lòng thêm món ăn trước khi thanh toán.', 'error');
            return false;
        }

        // Validate customer data completeness
        if (!this.customerData.full_name && !this.customerData.name) {
            this.showMessage('Thông tin tên khách hàng không đầy đủ. Vui lòng đăng nhập lại.', 'error');
            return false;
        }

        if (!this.customerData.phone && !this.customerData.sdt) {
            this.showMessage('Thông tin số điện thoại không đầy đủ. Vui lòng đăng nhập lại.', 'error');
            return false;
        }

        // Validate delivery address if delivery order
        const orderType = document.querySelector('input[name="orderType"]:checked');
        if (orderType && orderType.value === 'delivery') {
            const addressField = document.getElementById('deliveryAddress');
            if (!addressField || !addressField.value || !addressField.value.trim()) {
                this.showFieldError(addressField, 'Địa chỉ giao hàng là bắt buộc cho đơn giao hàng');
                isValid = false;
            }
        }

        return isValid;
    }

    preparePaymentData() {
        const orderType = document.querySelector('input[name="orderType"]:checked');
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
        const deliveryAddress = document.getElementById('deliveryAddress')?.value || '';
        const notes = document.getElementById('notes')?.value || '';

        // Use logged-in customer data directly
        const customerId = this.customerData.id;
        const customerInfo = {
            name: this.customerData.full_name || this.customerData.name,
            phone: this.customerData.phone || this.customerData.sdt,
            email: this.customerData.email || '',
            address: orderType?.value === 'delivery' ? deliveryAddress : (this.customerData.address || ''),
            is_logged_in: true,
            customer_id: customerId
        };

        return {
            id_khach: customerId,
            loai_don: orderType?.value === 'delivery' ? 'giao_hang' : 'tai_cho',
            tong_tien: this.calculateTotal(),
            dia_chi_giao_hang: orderType?.value === 'delivery' ? deliveryAddress : null,
            ghi_chu: notes || null,
            cart_items: this.cartData.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image
            })),
            customer_info: customerInfo,
            payment_method: paymentMethod?.value || 'cash'
        };
    }

    async submitPayment(data) {
        try {
            console.log('🚀 Submitting payment data:', data);
            console.log('📡 Sending to API: http://localhost:3000/api/hoadon');

            const response = await fetch('http://localhost:3000/api/hoadon', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });

            console.log('📨 Response status:', response.status);
            console.log('📨 Response ok:', response.ok);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Response error text:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            console.log('✅ Response data:', result);
            
            if (response.ok && result.success) {
                return {
                    success: true,
                    message: result.message,
                    data: result.data
                };
            } else {
                return {
                    success: false,
                    message: result.message || 'Có lỗi xảy ra khi thanh toán',
                    errors: result.errors || []
                };
            }
        } catch (error) {
            console.error('❌ Payment submission error:', error);
            console.error('❌ Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
            return {
                success: false,
                message: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.',
                error: error.message
            };
        }
    }

    setLoadingState(loading) {
        if (this.submitBtn) {
            this.submitBtn.disabled = loading;
            if (loading) {
                this.submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Đang xử lý...';
            } else {
                this.submitBtn.innerHTML = '<i class="fas fa-credit-card mr-2"></i>Thanh Toán';
            }
        }
    }

    showFieldError(field, message) {
        // Remove existing error
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Add new error
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message text-red-500 text-sm mt-1';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
        field.classList.add('border-red-500');
    }

    showMessage(message, type = 'info') {
        // Create or update message container
        let messageContainer = document.getElementById('messageContainer');
        if (!messageContainer) {
            messageContainer = document.createElement('div');
            messageContainer.id = 'messageContainer';
            messageContainer.className = 'fixed top-4 right-4 z-50';
            document.body.appendChild(messageContainer);
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `p-4 rounded-lg shadow-lg mb-4 ${
            type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
            type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
            'bg-blue-100 text-blue-800 border border-blue-200'
        }`;
        
        messageDiv.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} mr-2"></i>
                <span>${message}</span>
            </div>
        `;
        
        messageContainer.appendChild(messageDiv);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Payment page loaded successfully!');
    
    // Initialize payment manager
    window.paymentManager = new PaymentManager();
    console.log('✅ PaymentManager initialized successfully');
});

// Export for global access
window.PaymentManager = PaymentManager;
