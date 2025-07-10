// Menu JavaScript - Chức năng cho trang thực đơn

// Menu data
const menuData = [
    // Khai Vị
    {
        id: 1,
        name: "Gỏi Ngó Sen Tôm Thịt",
        category: "appetizers",
        price: 85000,
        image: "img/goingosen.jpg",
        description: "Ngó sen giòn ngọt hòa quyện cùng tôm tươi, thịt ba chỉ thái mỏng và nước sốt đặc biệt.",
        tags: ["gỏi", "ngó sen", "tôm", "thịt", "khai vị"]
    },
    {
        id: 2,
        name: "Chả Giò Phương Nam",
        category: "appetizers", 
        price: 75000,
        image: "img/chagioPN.jpg",
        description: "Chả giò giòn rụm với nhân tôm thịt, miến và nấm, ăn kèm với rau sống và nước mắm chua ngọt.",
        tags: ["chả giò", "tôm", "thịt", "miến", "nấm", "khai vị"]
    },
    // Món Chính
    {
        id: 3,
        name: "Cá Lóc Nướng Trui",
        category: "maindishes",
        price: 185000,
        image: "img/calocnuongtrui.jpg",
        description: "Cá lóc tươi nướng trui trên than hoa, phết mỡ hành và ăn kèm với các loại rau thơm đặc trưng miền Nam.",
        tags: ["cá lóc", "nướng", "trui", "than hoa", "rau thơm", "món chính"]
    },
    {
        id: 4,
        name: "Sườn Nướng Chao",
        category: "maindishes",
        price: 165000,
        image: "img/suonnuongchao.webp",
        description: "Sườn heo ướp chao đỏ, nướng than hoa thơm lừng, ăn kèm với kim chi cải chua và đồ chua.",
        tags: ["sườn", "nướng", "chao", "heo", "kim chi", "món chính"]
    },
    // Canh & Lẩu
    {
        id: 5,
        name: "Lẩu Mắm",
        category: "hotpot",
        price: 250000,
        image: "img/laumam.webp",
        description: "Nước lẩu được nấu từ mắm cá linh, thêm các loại rau đồng và hải sản tươi ngon, tạo nên hương vị đậm đà khó quên.",
        tags: ["lẩu", "mắm", "cá linh", "rau đồng", "hải sản", "canh lẩu"]
    },
    {
        id: 6,
        name: "Lẩu Cá Kèo",
        category: "hotpot",
        price: 225000,
        image: "img/laucakeo.jpg",
        description: "Lẩu cá kèo chua cay với nước dùng đặc biệt nấu từ xương heo và me chua, ăn kèm với rau muống, bông điên điển.",
        tags: ["lẩu", "cá kèo", "chua cay", "me chua", "rau muống", "canh lẩu"]
    },
    // Cơm & Bún
    {
        id: 7,
        name: "Bánh Xèo Miền Tây",
        category: "rice",
        price: 95000,
        image: "img/banhxeo.jpg",
        description: "Bánh xèo giòn tan với nhân tôm, thịt, giá và đậu xanh, ăn kèm với rau sống và nước mắm chua ngọt.",
        tags: ["bánh xèo", "miền tây", "tôm", "thịt", "giá", "đậu xanh", "cơm bún"]
    },
    {
        id: 8,
        name: "Cơm Cháy Sườn Rim",
        category: "rice",
        price: 125000,
        image: "img/comchaysuonrim.webp",
        description: "Cơm được chiên giòn, ăn kèm với sườn rim mặn ngọt đậm đà, rưới thêm mỡ hành thơm phức.",
        tags: ["cơm cháy", "sườn rim", "mặn ngọt", "mỡ hành", "cơm bún"]
    },
    // Tráng Miệng
    {
        id: 9,
        name: "Chè Bắp",
        category: "desserts",
        price: 45000,
        image: "img/chebap.webp",
        description: "Chè bắp béo ngậy với vị ngọt tự nhiên từ bắp, nước cốt dừa và đậu xanh.",
        tags: ["chè", "bắp", "béo ngậy", "nước cốt dừa", "đậu xanh", "tráng miệng"]
    },
    // Đồ Uống
    {
        id: 10,
        name: "Nước Sâm Lạnh",
        category: "drinks",
        price: 35000,
        image: "img/nuocsamlanh.jpg",
        description: "Nước sâm mát lạnh giải nhiệt, nấu từ các loại thảo mộc tự nhiên tốt cho sức khỏe.",
        tags: ["nước sâm", "mát lạnh", "giải nhiệt", "thảo mộc", "đồ uống"]
    },
    {
        id: 11,
        name: "Trà Tắc",
        category: "drinks",
        price: 30000,
        image: "img/tratac.jpg",
        description: "Trà tắc chua ngọt thanh mát, giải khát hiệu quả.",
        tags: ["trà tắc", "chua ngọt", "thanh mát", "giải khát", "đồ uống"]
    }
];

// Menu Manager Class
class MenuManager {
    constructor() {
        this.apiService = new MenuAPIService();
        this.menuData = [];
        this.filteredData = [];
        this.currentCategory = 'all';
        this.currentSearchTerm = '';
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.isLoading = false;
        this.searchTimeout = null;
        this.menuDescriptions = {};

        // Lightbox properties
        this.currentLightboxItem = null;
        this.currentImageIndex = -1;

        // Image quality settings
        this.imageQualities = {
            thumbnail: { suffix: '_thumb', width: 300, height: 200 },
            medium: { suffix: '_med', width: 800, height: 600 },
            high: { suffix: '_high', width: 1920, height: 1440 },
            ultra: { suffix: '_4k', width: 3840, height: 2880 }
        };
        this.currentImageQuality = 'medium';
        this.preloadedImages = new Map();

        // Zoom properties
        this.isZoomed = false;
        this.zoomLevel = 1;
        this.maxZoom = 3;

        this.init();
    }

    async init() {
        console.log('🚀 Initializing MenuManager...');

        // Initialize CartManager if not already initialized
        if (!window.cartManager) {
            window.cartManager = new CartManager();
            console.log('🛒 CartManager initialized from MenuManager');
        }

        // Always setup event listeners first
        this.setupEventListeners();

        // Try to load data (with fallback)
        await Promise.all([
            this.loadInitialData(),
            this.loadMenuDescriptions()
        ]);

        // Update cart UI
        this.updateCartCounter();

        console.log('✅ MenuManager initialized');
    }

    async testAPIConnection() {
        console.log('🔗 Testing API connection...');
        const isConnected = await this.apiService.testConnection();
        if (!isConnected) {
            console.warn('⚠️ API not available, will use fallback data');
            this.showWarning('Đang sử dụng dữ liệu offline. Một số tính năng có thể bị hạn chế.');
            return false;
        }
        console.log('✅ API connection successful');
        return true;
    }

    async loadInitialData() {
        try {
            this.showLoading();
            console.log('📊 Loading initial menu data...');

            const response = await this.apiService.searchFoods({ limit: 50 });

            if (response && response.success && response.data) {
                this.menuData = response.data.map(item => this.apiService.formatFoodItem(item));
                this.filteredData = [...this.menuData];
                this.renderMenuItems();

                console.log(`✅ Loaded ${this.menuData.length} menu items`);

                // Show offline message if using fallback data
                if (response.message && response.message.includes('offline')) {
                    this.showWarning(response.message);
                }
            } else {
                throw new Error('Invalid response format or no data received');
            }
        } catch (error) {
            console.error('❌ Error loading menu data:', error);
            this.showError(`Không thể tải dữ liệu menu: ${error.message}`);
        } finally {
            this.hideLoading();
        }
    }

    setupEventListeners() {
        // Category filter buttons
        const filterButtons = document.querySelectorAll('.menu-category-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.filterByCategory(btn.dataset.category);
                this.updateActiveButton(btn);
            });
        });

        // Search functionality with API integration
        const searchInput = document.getElementById('searchInput');
        const searchButton = document.getElementById('searchButton');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearchInput(e.target.value);
            });

            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(e.target.value);
                }
            });
        }

        if (searchButton) {
            searchButton.addEventListener('click', () => {
                this.performSearch(searchInput.value);
            });
        }

        // Set initial active button
        const allButton = document.querySelector('[data-category="all"]');
        if (allButton) {
            this.updateActiveButton(allButton);
        }
    }

    filterByCategory(category) {
        this.currentCategory = category;
        this.applyFilters();
    }

    // Handle search input with debouncing
    handleSearchInput(searchTerm) {
        // Clear previous timeout
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        // Set new timeout for debounced search
        this.searchTimeout = setTimeout(() => {
            this.performSearch(searchTerm);
        }, 300); // 300ms delay
    }

    // Perform actual search
    async performSearch(searchTerm) {
        try {
            this.currentSearchTerm = searchTerm.trim();

            if (this.currentSearchTerm.length === 0) {
                // If empty search, load all items
                await this.loadInitialData();
                return;
            }

            if (this.currentSearchTerm.length < 2) {
                // Don't search for terms less than 2 characters
                return;
            }

            this.showLoading();

            const searchParams = {
                search: this.currentSearchTerm,
                category: this.currentCategory !== 'all' ? this.currentCategory : undefined,
                limit: 50
            };

            const response = await this.apiService.searchFoods(searchParams);

            if (response.success && response.data) {
                this.filteredData = response.data.map(item => this.apiService.formatFoodItem(item));
                this.renderMenuItems();

                // Update search results info
                this.updateSearchResultsInfo(this.filteredData.length, this.currentSearchTerm);

                console.log(`🔍 Search "${this.currentSearchTerm}" found ${this.filteredData.length} results`);
            } else {
                throw new Error('Invalid search response');
            }

        } catch (error) {
            console.error('❌ Search error:', error);
            this.showError(`Lỗi tìm kiếm: ${error.message}`);
        } finally {
            this.hideLoading();
        }
    }

    // Legacy search method for backward compatibility
    searchItems(searchTerm) {
        this.performSearch(searchTerm);
    }

    applyFilters() {
        this.showLoading();
        
        setTimeout(() => {
            let filtered = [...this.menuData];

            // Apply category filter
            if (this.currentCategory !== 'all') {
                filtered = filtered.filter(item => item.category === this.currentCategory);
            }

            // Apply search filter
            if (this.currentSearchTerm) {
                filtered = filtered.filter(item => 
                    item.name.toLowerCase().includes(this.currentSearchTerm) ||
                    item.description.toLowerCase().includes(this.currentSearchTerm) ||
                    item.tags.some(tag => tag.toLowerCase().includes(this.currentSearchTerm))
                );
            }

            this.filteredData = filtered;
            this.renderMenuItems();
            this.updateSearchInfo();
            this.hideLoading();
        }, 300);
    }

    renderMenuItems() {
        const container = document.getElementById('menuItemsContainer');
        const emptyState = document.getElementById('emptyState');

        if (!container) return;

        if (this.filteredData.length === 0) {
            container.innerHTML = '';
            if (emptyState) emptyState.classList.remove('hidden');
            return;
        }

        if (emptyState) emptyState.classList.add('hidden');

        // Debug log để kiểm tra dữ liệu
        console.log('🔍 Rendering menu items:', this.filteredData.slice(0, 3).map(item => {
            const actualStock = typeof item.stock === 'number' ? item.stock : 999;
            const actualIsAvailable = item.isAvailable !== false && actualStock > 0;
            return {
                name: item.name,
                original_stock: item.stock,
                original_isAvailable: item.isAvailable,
                calculated_stock: actualStock,
                calculated_isAvailable: actualIsAvailable,
                price: item.price
            };
        }));
        
        container.innerHTML = this.filteredData.map(item => {
            // Sử dụng function chung để tính toán trạng thái
            const { stock, isAvailable, isLowStock } = this.calculateStockStatus(item);

            return `
            <div class="menu-item bg-white rounded-lg overflow-hidden shadow-md stagger-item hover-lift"
                 data-category="${item.category}"
                 data-item-id="${item.id}"
                 data-item-name="${item.name}"
                 data-item-price="${item.price}"
                 data-item-image="${item.image}"
                 data-item-description="${item.description || 'Món ăn ngon đặc trưng miền Nam'}">
                <div class="h-64 overflow-hidden relative">
                    <img src="${this.getImageUrl(item.image, 'thumbnail')}"
                         alt="${item.name}"
                         class="w-full h-full object-cover hover-scale progressive-image"
                         data-original="${item.image}"
                         data-item-id="${item.id}"
                         onerror="this.src='${this.apiService.getPlaceholderImage()}'; this.onerror=null;"
                         loading="lazy">
                    <div class="absolute top-2 right-2">
                        <span class="px-3 py-1 text-xs font-semibold rounded-full ${isAvailable ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}">
                            ${isAvailable ? '✅ Còn hàng' : '❌ Hết hàng'}
                        </span>
                    </div>
                    ${stock > 0 && stock < 10 ? `
                        <div class="absolute top-2 left-2">
                            <span class="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                                ⚠️ Còn ${stock} phần
                            </span>
                        </div>
                    ` : ''}
                    ${stock >= 10 ? `
                        <div class="absolute top-2 left-2">
                            <span class="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                                📦 Còn ${stock} phần
                            </span>
                        </div>
                    ` : ''}
                </div>
                <div class="p-6">
                    <div class="flex justify-between items-start mb-3">
                        <h3 class="item-name font-bold text-xl">${item.name}</h3>
                        <span class="price-tag" data-price="${item.price}">${item.priceFormatted || this.formatPrice(item.price)}</span>
                    </div>
                    <p class="text-gray-600 mb-3 leading-relaxed description">${this.getItemDescription(item.id).description || item.description || 'Món ăn ngon đặc trưng miền Nam'}</p>

                    <!-- View Details Link -->
                    <div class="mb-3">
                        <button class="view-details-btn text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center transition-colors"
                                data-item-id="${item.id}">
                            <i class="fas fa-info-circle mr-1"></i>
                            Xem chi tiết món ăn
                            <i class="fas fa-chevron-right ml-1 text-xs"></i>
                        </button>
                    </div>

                    <div class="flex items-center justify-between mb-4">
                        <span class="text-sm text-gray-500">
                            <i class="fas fa-tag mr-1"></i>${item.categoryName || 'Món ăn'}
                        </span>
                        ${item.stockDisplay ? `<span class="text-sm text-blue-600">${item.stockDisplay}</span>` : ''}
                    </div>
                    ${this.createAddToCartButton(item)}
                </div>
            </div>
            `;
        }).join('');

        // Setup add to cart buttons
        this.setupAddToCartButtons();

        // Setup view details buttons
        this.setupViewDetailsButtons();

        // Setup image lightbox
        this.setupImageLightbox();

        // Trigger animations
        this.triggerAnimations();
    }

    // Function chung để tính toán trạng thái stock
    calculateStockStatus(item) {
        // Ưu tiên sử dụng stock từ API, fallback về 999 nếu không có
        const stock = typeof item.stock === 'number' ? item.stock : 999;

        // Kiểm tra available dựa trên stock thực tế
        const isAvailable = stock > 0;

        const isLowStock = stock > 0 && stock <= 5;
        const isOutOfStock = stock <= 0;

        console.log(`🔍 Stock status for "${item.name}":`, {
            original_stock: item.stock,
            original_isAvailable: item.isAvailable,
            calculated_stock: stock,
            calculated_isAvailable: isAvailable,
            isLowStock,
            isOutOfStock
        });

        return {
            stock,
            isAvailable,
            isLowStock,
            isOutOfStock
        };
    }

    createAddToCartButton(item) {
        const { stock, isAvailable, isLowStock, isOutOfStock } = this.calculateStockStatus(item);

        if (isOutOfStock) {
            return `
                <div class="relative">
                    <button class="add-to-cart-btn bg-red-400 text-white py-3 px-6 rounded-lg w-full font-semibold cursor-not-allowed opacity-75 relative overflow-hidden border-2 border-red-300"
                            data-id="${item.id}" disabled>
                        <div class="flex items-center justify-center">
                            <i class="fas fa-times-circle mr-2"></i>
                            <span>❌ Hết hàng</span>
                        </div>
                    </button>
                </div>
            `;
        }

        // Improved UI with quantity controls - Enhanced clarity and contrast
        return `
            <div class="quantity-cart-container" data-item-id="${item.id}">
                <!-- Quantity Controls -->
                <div class="flex items-center justify-between mb-4 bg-white rounded-xl p-4 border-2 border-gray-300 shadow-sm">
                    <span class="text-base font-bold text-gray-800">Số lượng:</span>
                    <div class="flex items-center space-x-4">
                        <button class="quantity-btn minus-btn bg-red-600 hover:bg-red-700 active:bg-red-800 text-white w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-150 transform hover:scale-105 active:scale-95 shadow-lg border-2 border-red-700"
                                data-id="${item.id}" data-action="minus">
                            <i class="fas fa-minus text-sm font-bold"></i>
                        </button>
                        <span class="quantity-display bg-gray-100 px-4 py-2 rounded-lg border-3 border-gray-400 font-black text-xl min-w-[4rem] text-center text-gray-900 shadow-inner"
                              data-id="${item.id}">1</span>
                        <button class="quantity-btn plus-btn bg-green-600 hover:bg-green-700 active:bg-green-800 text-white w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-150 transform hover:scale-105 active:scale-95 shadow-lg border-2 border-green-700"
                                data-id="${item.id}" data-action="plus" data-max-stock="${stock}">
                            <i class="fas fa-plus text-sm font-bold"></i>
                        </button>
                    </div>
                </div>

                <!-- Add to Cart Button -->
                <button class="add-to-cart add-to-cart-btn bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 active:from-orange-700 active:to-red-800 text-white py-4 px-6 rounded-xl transition-all duration-200 w-full font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-102 active:scale-98 border-2 border-red-700"
                        data-id="${item.id}">
                    <div class="flex items-center justify-center">
                        <i class="fas fa-cart-plus mr-3 text-lg"></i>
                        <span class="add-to-cart-text">
                            ${isLowStock ? `⚠️ THÊM VÀO GIỎ (Còn ${stock})` : '🛒 THÊM VÀO GIỎ HÀNG'}
                        </span>
                    </div>
                </button>

                <!-- Stock Info -->
                ${stock < 999 ? `
                    <div class="text-center mt-3">
                        <span class="text-sm ${isLowStock ? 'text-orange-700 bg-orange-100' : 'text-green-700 bg-green-100'} font-bold px-3 py-1 rounded-full border-2 ${isLowStock ? 'border-orange-300' : 'border-green-300'}">
                            ${isLowStock ? `⚠️ CHỈ CÒN ${stock} PHẦN` : `📦 CÒN ${stock} PHẦN`}
                        </span>
                    </div>
                ` : ''}
            </div>
        `;
    }

    setupAddToCartButtons() {
        // Setup quantity control buttons
        const quantityButtons = document.querySelectorAll('.quantity-btn');
        quantityButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const itemId = parseInt(btn.dataset.id);
                const action = btn.dataset.action;
                const maxStock = parseInt(btn.dataset.maxStock) || 999;
                this.handleQuantityChange(itemId, action, maxStock);
            });
        });

        // Setup add to cart buttons
        const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
        addToCartButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const itemId = parseInt(btn.dataset.id);
                const quantity = this.getSelectedQuantity(itemId);
                this.addToCart(itemId, btn, quantity);
            });
        });
    }

    handleQuantityChange(itemId, action, maxStock) {
        const quantityDisplay = document.querySelector(`[data-id="${itemId}"].quantity-display`);
        if (!quantityDisplay) return;

        let currentQuantity = parseInt(quantityDisplay.textContent) || 1;

        if (action === 'plus') {
            if (currentQuantity < maxStock) {
                currentQuantity++;
                this.animateQuantityChange(quantityDisplay, 'increase');
            } else {
                this.showNotification(`Chỉ còn ${maxStock} phần trong kho!`, 'warning');
                this.shakeElement(quantityDisplay);
            }
        } else if (action === 'minus') {
            if (currentQuantity > 1) {
                currentQuantity--;
                this.animateQuantityChange(quantityDisplay, 'decrease');
            } else {
                this.shakeElement(quantityDisplay);
            }
        }

        quantityDisplay.textContent = currentQuantity;
        this.updateAddToCartButtonText(itemId, currentQuantity);
    }

    getSelectedQuantity(itemId) {
        const quantityDisplay = document.querySelector(`[data-id="${itemId}"].quantity-display`);
        return quantityDisplay ? parseInt(quantityDisplay.textContent) || 1 : 1;
    }

    updateAddToCartButtonText(itemId, quantity) {
        const addToCartBtn = document.querySelector(`[data-id="${itemId}"].add-to-cart-btn .add-to-cart-text`);
        if (addToCartBtn) {
            const item = this.menuData.find(item => item.id === itemId);
            if (item) {
                const { isLowStock, stock } = this.calculateStockStatus(item);
                const baseText = isLowStock ? `⚠️ Thêm vào giỏ (Còn ${stock})` : '✅ Thêm vào giỏ hàng';
                addToCartBtn.textContent = quantity > 1 ? `${baseText} (${quantity})` : baseText;
            }
        }
    }

    animateQuantityChange(element, type) {
        // Enhanced animation with better visibility
        element.style.transition = 'all 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        element.style.transform = type === 'increase' ? 'scale(1.3)' : 'scale(0.7)';
        element.style.color = type === 'increase' ? '#059669' : '#dc2626';
        element.style.fontWeight = '900';
        element.style.textShadow = '0 2px 4px rgba(0,0,0,0.3)';
        element.style.background = type === 'increase' ? 'linear-gradient(145deg, #d1fae5, #a7f3d0)' : 'linear-gradient(145deg, #fee2e2, #fecaca)';
        element.style.borderColor = type === 'increase' ? '#059669' : '#dc2626';
        element.style.borderWidth = '3px';

        setTimeout(() => {
            element.style.transform = 'scale(1)';
            element.style.color = '#111827';
            element.style.fontWeight = '800';
            element.style.textShadow = '0 1px 2px rgba(0,0,0,0.1)';
            element.style.background = 'linear-gradient(145deg, #f3f4f6, #e5e7eb)';
            element.style.borderColor = '#9ca3af';
            element.style.borderWidth = '3px';
        }, 250);
    }

    shakeElement(element) {
        element.style.animation = 'shake 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97)';
        element.style.filter = 'brightness(1.2) saturate(1.3)';
        setTimeout(() => {
            element.style.animation = '';
            element.style.filter = '';
        }, 600);
    }

    addToCart(itemId, buttonElement, quantity = 1) {
        const item = this.menuData.find(item => item.id === itemId);
        if (!item) {
            console.error('Item not found:', itemId);
            return;
        }

        // Use CartManager if available, otherwise fallback to legacy method
        if (window.cartManager) {
            // Convert menu item to cart format với logic đồng bộ với createAddToCartButton
            const stockValue = typeof item.stock === 'number' ? item.stock : 999;
            const isAvailable = item.isAvailable !== false && stockValue > 0;

            const cartItem = {
                id_mon: item.id,
                ten_mon: item.name,
                gia: item.price,
                hinh_anh: item.image,
                mo_ta: item.description || 'Món ăn ngon đặc trưng miền Nam',
                so_luong: stockValue,
                isAvailable: isAvailable,
                category: item.category,
                categoryName: item.categoryName
            };

            console.log(`🔄 Converting menu item to cart format:`, {
                original: { stock: item.stock, isAvailable: item.isAvailable },
                converted: { so_luong: cartItem.so_luong, isAvailable: cartItem.isAvailable }
            });

            // Add multiple quantities if specified
            for (let i = 0; i < quantity; i++) {
                window.cartManager.addToCart(cartItem, buttonElement);
            }

            // Reset quantity display to 1 after adding to cart
            this.resetQuantityDisplay(itemId);
        } else {
            // Legacy cart handling
            const existingItem = this.cart.find(cartItem => cartItem.id === itemId);
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                this.cart.push({ ...item, quantity: quantity });
            }

            localStorage.setItem('cart', JSON.stringify(this.cart));
            this.updateCartCounter();
            this.showButtonFeedback(buttonElement);
            this.showNotification(`Đã thêm ${quantity} ${item.name} vào giỏ hàng!`, 'success');
            this.resetQuantityDisplay(itemId);
        }
    }

    resetQuantityDisplay(itemId) {
        const quantityDisplay = document.querySelector(`[data-id="${itemId}"].quantity-display`);
        if (quantityDisplay) {
            quantityDisplay.textContent = '1';
            this.updateAddToCartButtonText(itemId, 1);
        }
    }

    setupImageLightbox() {
        // Setup progressive loading for menu images
        this.setupProgressiveLoading();

        // Setup click handlers for menu item images
        const menuImages = document.querySelectorAll('.menu-item img');
        menuImages.forEach((img, index) => {
            img.addEventListener('click', (e) => {
                e.preventDefault();
                this.openLightbox(index);
            });
        });

        // Setup lightbox controls
        const lightbox = document.getElementById('imageLightbox');
        const closeLightbox = document.getElementById('closeLightbox');
        const prevImage = document.getElementById('prevImage');
        const nextImage = document.getElementById('nextImage');
        const lightboxAddToCart = document.getElementById('lightboxAddToCart');

        if (closeLightbox) {
            closeLightbox.addEventListener('click', () => this.closeLightbox());
        }

        if (prevImage) {
            prevImage.addEventListener('click', () => this.showPreviousImage());
        }

        if (nextImage) {
            nextImage.addEventListener('click', () => this.showNextImage());
        }

        if (lightbox) {
            // Close on background click
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) {
                    this.closeLightbox();
                }
            });

            // Keyboard navigation
            document.addEventListener('keydown', (e) => {
                if (lightbox.classList.contains('hidden')) return;

                switch(e.key) {
                    case 'Escape':
                        this.closeLightbox();
                        break;
                    case 'ArrowLeft':
                        e.preventDefault();
                        this.showPreviousImage();
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        this.showNextImage();
                        break;
                    case ' ':
                    case 'Enter':
                        e.preventDefault();
                        if (this.currentLightboxItem) {
                            this.addToCart(this.currentLightboxItem.id, lightboxAddToCart);
                            this.closeLightbox();
                        }
                        break;
                }
            });
        }

        if (lightboxAddToCart) {
            lightboxAddToCart.addEventListener('click', () => {
                if (this.currentLightboxItem) {
                    this.addToCart(this.currentLightboxItem.id, lightboxAddToCart);
                    this.closeLightbox();
                }
            });
        }

        // Setup zoom functionality
        this.setupImageZoom();

        // Setup detailed info modal
        this.setupDetailedInfoModal();

        console.log('✅ Image lightbox setup completed');
    }

    setupImageZoom() {
        const lightboxImage = document.getElementById('lightboxImage');
        const zoomContainer = document.getElementById('imageZoomContainer');

        if (!lightboxImage || !zoomContainer) return;

        // Click to zoom
        lightboxImage.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleZoom(e);
        });

        // Mouse wheel zoom
        zoomContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.2 : 0.2;
            this.adjustZoom(delta, e);
        });

        // Touch gestures for mobile
        let initialDistance = 0;
        let initialZoom = 1;

        zoomContainer.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                initialDistance = this.getTouchDistance(e.touches);
                initialZoom = this.zoomLevel;
            }
        });

        zoomContainer.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                const currentDistance = this.getTouchDistance(e.touches);
                const scale = currentDistance / initialDistance;
                const newZoom = Math.max(1, Math.min(this.maxZoom, initialZoom * scale));
                this.setZoom(newZoom);
            }
        });

        console.log('✅ Image zoom functionality setup completed');
    }

    toggleZoom(event) {
        if (this.isZoomed) {
            this.resetZoom();
        } else {
            this.zoomToPoint(event, 2);
        }
    }

    zoomToPoint(event, zoomLevel) {
        const lightboxImage = document.getElementById('lightboxImage');
        const rect = lightboxImage.getBoundingClientRect();

        // Calculate zoom center point
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;

        this.setZoom(zoomLevel, x, y);
    }

    adjustZoom(delta, event) {
        const newZoom = Math.max(1, Math.min(this.maxZoom, this.zoomLevel + delta));

        if (newZoom !== this.zoomLevel) {
            this.zoomToPoint(event, newZoom);
        }
    }

    setZoom(level, centerX = 0.5, centerY = 0.5) {
        const lightboxImage = document.getElementById('lightboxImage');
        const zoomContainer = document.getElementById('imageZoomContainer');

        if (!lightboxImage || !zoomContainer) return;

        this.zoomLevel = level;
        this.isZoomed = level > 1;

        // Apply zoom transform
        const translateX = (0.5 - centerX) * (level - 1) * 100;
        const translateY = (0.5 - centerY) * (level - 1) * 100;

        lightboxImage.style.transform = `scale(${level}) translate(${translateX}%, ${translateY}%)`;

        // Update cursor
        zoomContainer.style.cursor = this.isZoomed ? 'zoom-out' : 'zoom-in';

        // Update zoom indicator
        this.updateZoomIndicator(level);
    }

    resetZoom() {
        this.setZoom(1);
    }

    getTouchDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    updateZoomIndicator(level) {
        const zoomContainer = document.getElementById('imageZoomContainer');
        if (!zoomContainer) return;

        // Remove existing zoom indicator
        const existingIndicator = zoomContainer.querySelector('.zoom-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }

        if (level > 1) {
            const indicator = document.createElement('div');
            indicator.className = 'zoom-indicator absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm font-bold';
            indicator.textContent = `${Math.round(level * 100)}%`;
            zoomContainer.appendChild(indicator);
        }
    }

    setupProgressiveLoading() {
        // Use Intersection Observer for lazy loading high quality images
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const originalUrl = img.dataset.original;

                    if (originalUrl && !img.dataset.loaded) {
                        img.dataset.loaded = 'true';
                        this.loadProgressiveImage(img, originalUrl, 'high');
                        observer.unobserve(img);
                    }
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.1
        });

        // Observe all progressive images
        const progressiveImages = document.querySelectorAll('.progressive-image');
        progressiveImages.forEach(img => {
            imageObserver.observe(img);
        });

        console.log(`🖼️ Progressive loading setup for ${progressiveImages.length} images`);
    }

    openLightbox(imageIndex) {
        const lightbox = document.getElementById('imageLightbox');
        const lightboxImage = document.getElementById('lightboxImage');
        const lightboxTitle = document.getElementById('lightboxTitle');
        const lightboxDescription = document.getElementById('lightboxDescription');
        const lightboxPrice = document.getElementById('lightboxPrice');

        if (!lightbox || !lightboxImage) return;

        // Get current item data
        const item = this.filteredData[imageIndex];
        if (!item) return;

        this.currentLightboxItem = item;
        this.currentImageIndex = imageIndex;

        // Load 4K quality image in lightbox with progressive enhancement
        this.loadLightboxImage(lightboxImage, item.image, item.name);

        if (lightboxTitle) lightboxTitle.textContent = item.name;
        if (lightboxDescription) {
            const description = this.getItemDescription(item.id);
            lightboxDescription.textContent = description.description || item.description || 'Món ăn ngon đặc trưng miền Nam';
        }
        if (lightboxPrice) lightboxPrice.textContent = item.priceFormatted || this.formatPrice(item.price);

        // Show lightbox
        lightbox.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling

        // Add fade in animation
        setTimeout(() => {
            lightbox.style.opacity = '1';
        }, 10);

        console.log('🖼️ Lightbox opened for:', item.name);
    }

    closeLightbox() {
        const lightbox = document.getElementById('imageLightbox');
        if (!lightbox) return;

        // Reset zoom before closing
        this.resetZoom();

        // Add fade out animation
        lightbox.style.opacity = '0';

        setTimeout(() => {
            lightbox.classList.add('hidden');
            document.body.style.overflow = ''; // Restore scrolling
            this.currentLightboxItem = null;
            this.currentImageIndex = -1;
        }, 300);

        console.log('✅ Lightbox closed');
    }

    showPreviousImage() {
        if (this.currentImageIndex > 0) {
            this.openLightbox(this.currentImageIndex - 1);
        } else {
            // Loop to last image
            this.openLightbox(this.filteredData.length - 1);
        }
    }

    showNextImage() {
        if (this.currentImageIndex < this.filteredData.length - 1) {
            this.openLightbox(this.currentImageIndex + 1);
        } else {
            // Loop to first image
            this.openLightbox(0);
        }
    }

    /**
     * Generate image URL with specified quality
     */
    getImageUrl(originalUrl, quality = 'medium') {
        if (!originalUrl) return this.apiService.getPlaceholderImage();

        const qualityConfig = this.imageQualities[quality];
        if (!qualityConfig) return originalUrl;

        // Extract file extension and name
        const lastDotIndex = originalUrl.lastIndexOf('.');
        const extension = lastDotIndex > -1 ? originalUrl.substring(lastDotIndex) : '.jpg';
        const baseName = lastDotIndex > -1 ? originalUrl.substring(0, lastDotIndex) : originalUrl;

        // Generate quality-specific URL
        return `${baseName}${qualityConfig.suffix}${extension}`;
    }

    /**
     * Preload high quality image
     */
    preloadHighQualityImage(originalUrl, quality = 'high') {
        const highQualityUrl = this.getImageUrl(originalUrl, quality);

        if (this.preloadedImages.has(highQualityUrl)) {
            return Promise.resolve(highQualityUrl);
        }

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.preloadedImages.set(highQualityUrl, img);
                resolve(highQualityUrl);
            };
            img.onerror = () => {
                // Fallback to original image if high quality fails
                resolve(originalUrl);
            };
            img.src = highQualityUrl;
        });
    }

    /**
     * Progressive image loading with quality upgrade
     */
    async loadProgressiveImage(imgElement, originalUrl, targetQuality = 'ultra') {
        // Start with medium quality for fast loading
        const mediumUrl = this.getImageUrl(originalUrl, 'medium');
        imgElement.src = mediumUrl;
        imgElement.style.filter = 'blur(1px)';

        try {
            // Preload high quality image
            const highQualityUrl = await this.preloadHighQualityImage(originalUrl, targetQuality);

            // Smooth transition to high quality
            const tempImg = new Image();
            tempImg.onload = () => {
                imgElement.style.transition = 'filter 0.5s ease';
                imgElement.src = highQualityUrl;
                imgElement.style.filter = 'none';

                // Add 4K quality indicator
                this.addQualityIndicator(imgElement, targetQuality);
            };
            tempImg.src = highQualityUrl;

        } catch (error) {
            console.warn('Failed to load high quality image:', error);
            imgElement.style.filter = 'none';
        }
    }

    /**
     * Add quality indicator badge
     */
    addQualityIndicator(imgElement, quality) {
        const container = imgElement.closest('.h-64');
        if (!container) return;

        // Remove existing quality indicator
        const existingIndicator = container.querySelector('.quality-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }

        const qualityLabels = {
            medium: 'HD',
            high: 'FHD',
            ultra: '4K'
        };

        const indicator = document.createElement('div');
        indicator.className = 'quality-indicator absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-bold';
        indicator.textContent = qualityLabels[quality] || 'HD';

        container.appendChild(indicator);
    }

    /**
     * Load high quality image in lightbox with progressive enhancement
     */
    async loadLightboxImage(imgElement, originalUrl, altText) {
        imgElement.alt = altText;

        // Start with medium quality for immediate display
        const mediumUrl = this.getImageUrl(originalUrl, 'medium');
        imgElement.style.opacity = '0.7';
        imgElement.style.filter = 'blur(2px)';
        imgElement.src = mediumUrl;

        // Add loading indicator
        this.showImageLoadingIndicator(imgElement, true);

        try {
            // Load 4K quality image
            const ultraUrl = this.getImageUrl(originalUrl, 'ultra');

            const highQualityImg = new Image();
            highQualityImg.onload = () => {
                // Smooth transition to 4K
                imgElement.style.transition = 'all 0.8s ease';
                imgElement.src = ultraUrl;
                imgElement.style.opacity = '1';
                imgElement.style.filter = 'none';

                // Add 4K quality badge
                this.showImageQualityBadge(imgElement, '4K ULTRA');
                this.showImageLoadingIndicator(imgElement, false);

                console.log('✅ 4K image loaded successfully');
            };

            highQualityImg.onerror = () => {
                // Fallback to high quality if 4K fails
                this.loadFallbackQuality(imgElement, originalUrl);
            };

            highQualityImg.src = ultraUrl;

        } catch (error) {
            console.warn('Failed to load 4K image:', error);
            this.loadFallbackQuality(imgElement, originalUrl);
        }
    }

    /**
     * Load fallback quality when 4K fails
     */
    async loadFallbackQuality(imgElement, originalUrl) {
        try {
            const highUrl = this.getImageUrl(originalUrl, 'high');
            const fallbackImg = new Image();

            fallbackImg.onload = () => {
                imgElement.style.transition = 'all 0.5s ease';
                imgElement.src = highUrl;
                imgElement.style.opacity = '1';
                imgElement.style.filter = 'none';

                this.showImageQualityBadge(imgElement, 'FULL HD');
                this.showImageLoadingIndicator(imgElement, false);
            };

            fallbackImg.onerror = () => {
                // Final fallback to original
                imgElement.src = originalUrl;
                imgElement.style.opacity = '1';
                imgElement.style.filter = 'none';
                this.showImageLoadingIndicator(imgElement, false);
            };

            fallbackImg.src = highUrl;

        } catch (error) {
            imgElement.src = originalUrl;
            imgElement.style.opacity = '1';
            imgElement.style.filter = 'none';
            this.showImageLoadingIndicator(imgElement, false);
        }
    }

    /**
     * Show/hide image loading indicator
     */
    showImageLoadingIndicator(imgElement, show) {
        const container = imgElement.parentElement;
        if (!container) return;

        let indicator = container.querySelector('.image-loading-indicator');

        if (show && !indicator) {
            indicator = document.createElement('div');
            indicator.className = 'image-loading-indicator absolute inset-0 flex items-center justify-center bg-black bg-opacity-50';
            indicator.innerHTML = `
                <div class="text-white text-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <div class="text-sm">Loading 4K...</div>
                </div>
            `;
            container.appendChild(indicator);
        } else if (!show && indicator) {
            indicator.remove();
        }
    }

    /**
     * Show image quality badge
     */
    showImageQualityBadge(imgElement, qualityText) {
        const container = imgElement.parentElement;
        if (!container) return;

        // Remove existing badge
        const existingBadge = container.querySelector('.lightbox-quality-badge');
        if (existingBadge) {
            existingBadge.remove();
        }

        const badge = document.createElement('div');
        badge.className = 'lightbox-quality-badge absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg';
        badge.textContent = qualityText;

        container.appendChild(badge);

        // Auto-hide after 3 seconds
        setTimeout(() => {
            if (badge.parentElement) {
                badge.style.transition = 'opacity 0.5s ease';
                badge.style.opacity = '0';
                setTimeout(() => badge.remove(), 500);
            }
        }, 3000);
    }

    showButtonFeedback(buttonElement) {
        const originalHTML = buttonElement.innerHTML;
        buttonElement.innerHTML = '<i class="fas fa-check mr-2"></i>Đã thêm!';
        buttonElement.classList.remove('bg-primary', 'hover:bg-red-700');
        buttonElement.classList.add('bg-green-500');
        buttonElement.disabled = true;

        setTimeout(() => {
            buttonElement.innerHTML = originalHTML;
            buttonElement.classList.remove('bg-green-500');
            buttonElement.classList.add('bg-primary', 'hover:bg-red-700');
            buttonElement.disabled = false;
        }, 2000);
    }

    updateCartCounter() {
        // Use CartManager if available
        if (window.cartManager) {
            window.cartManager.updateCartUI();
        } else {
            // Legacy cart counter update
            const cartCounter = document.querySelector('#cartBtn span');
            if (cartCounter) {
                const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
                cartCounter.textContent = totalItems;
            }
        }
    }

    updateActiveButton(activeBtn) {
        const buttons = document.querySelectorAll('.menu-category-btn');
        buttons.forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    }

    updateSearchInfo() {
        const searchInfo = document.getElementById('searchResultsInfo');
        const searchText = document.getElementById('searchResultsText');
        
        if (!searchInfo || !searchText) return;
        
        if (this.currentSearchTerm || this.currentCategory !== 'all') {
            let text = `Tìm thấy ${this.filteredData.length} món ăn`;
            
            if (this.currentSearchTerm) {
                text += ` cho "${this.currentSearchTerm}"`;
            }
            
            if (this.currentCategory !== 'all') {
                const categoryNames = {
                    'appetizers': 'Khai Vị',
                    'maindishes': 'Món Chính', 
                    'rice': 'Cơm & Bún',
                    'hotpot': 'Canh & Lẩu',
                    'desserts': 'Tráng Miệng',
                    'drinks': 'Đồ Uống'
                };
                text += ` trong danh mục "${categoryNames[this.currentCategory]}"`;
            }
            
            searchText.textContent = text;
            searchInfo.classList.remove('hidden');
        } else {
            searchInfo.classList.add('hidden');
        }
    }

    showLoading() {
        const loadingState = document.getElementById('loadingState');
        const container = document.getElementById('menuItemsContainer');
        
        if (loadingState) loadingState.classList.remove('hidden');
        if (container) container.style.opacity = '0.5';
    }

    hideLoading() {
        const loadingState = document.getElementById('loadingState');
        const container = document.getElementById('menuItemsContainer');

        if (loadingState) loadingState.classList.add('hidden');
        if (container) container.style.opacity = '1';
    }

    showError(message) {
        const container = document.getElementById('menuItemsContainer');
        if (container) {
            container.innerHTML = `
                <div class="col-span-full flex justify-center items-center py-12">
                    <div class="text-center">
                        <div class="text-red-500 text-6xl mb-4">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-800 mb-2">Có lỗi xảy ra</h3>
                        <p class="text-gray-600 mb-4">${message}</p>
                        <div class="space-x-4">
                            <button onclick="menuManager.loadInitialData()" class="bg-primary hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-300">
                                <i class="fas fa-redo mr-2"></i>Thử lại
                            </button>
                            <button onclick="menuManager.useOfflineMode()" class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition duration-300">
                                <i class="fas fa-wifi-slash mr-2"></i>Chế độ offline
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    showWarning(message) {
        // Show warning banner at top
        const warningBanner = document.createElement('div');
        warningBanner.id = 'warningBanner';
        warningBanner.className = 'bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4';
        warningBanner.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <i class="fas fa-exclamation-triangle text-yellow-600 mr-2"></i>
                    <span class="text-yellow-800">${message}</span>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="text-yellow-600 hover:text-yellow-800">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Insert before menu container
        const menuContainer = document.getElementById('menuItemsContainer');
        if (menuContainer && menuContainer.parentNode) {
            // Remove existing warning if any
            const existingWarning = document.getElementById('warningBanner');
            if (existingWarning) {
                existingWarning.remove();
            }

            menuContainer.parentNode.insertBefore(warningBanner, menuContainer);
        }
    }

    async useOfflineMode() {
        try {
            this.showLoading();
            const response = await this.apiService.getFallbackData({ limit: 50 });

            if (response && response.data) {
                this.menuData = response.data.map(item => this.apiService.formatFoodItem(item));
                this.filteredData = [...this.menuData];
                this.renderMenuItems();
                this.showWarning('Đang sử dụng chế độ offline với dữ liệu mẫu');
                console.log(`📦 Loaded ${this.menuData.length} offline menu items`);
            }
        } catch (error) {
            console.error('❌ Error loading offline data:', error);
            this.showError('Không thể tải dữ liệu offline');
        } finally {
            this.hideLoading();
        }
    }

    updateSearchResultsInfo(count, searchTerm) {
        const searchInfo = document.getElementById('searchResultsInfo');
        const searchText = document.getElementById('searchResultsText');

        if (!searchInfo || !searchText) return;

        if (searchTerm && searchTerm.trim()) {
            searchText.innerHTML = `
                <span class="text-blue-800">
                    <i class="fas fa-search mr-2"></i>
                    Tìm thấy <strong>${count}</strong> kết quả cho "<strong>${searchTerm}</strong>"
                </span>
                <button onclick="menuManager.clearSearch()" class="text-blue-600 hover:text-blue-800 text-sm ml-4">
                    <i class="fas fa-times mr-1"></i>Xóa tìm kiếm
                </button>
            `;
            searchInfo.classList.remove('hidden');
        } else {
            searchInfo.classList.add('hidden');
        }
    }

    async clearSearch() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = '';
        }

        this.currentSearchTerm = '';
        this.currentCategory = 'all';
        await this.loadInitialData();
        this.updateSearchResultsInfo(0, '');

        // Reset category buttons
        const categoryButtons = document.querySelectorAll('.category-btn');
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        const allBtn = document.querySelector('.category-btn[data-category="all"]');
        if (allBtn) allBtn.classList.add('active');
    }

    formatPrice(price) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        const iconClass = type === 'success' ? 'fa-check-circle' :
                         type === 'error' ? 'fa-times-circle' :
                         type === 'warning' ? 'fa-exclamation-triangle' :
                         'fa-info-circle';

        notification.className = `fixed top-20 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-full ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            type === 'warning' ? 'notification-warning text-white' :
            'bg-blue-500 text-white'
        }`;
        notification.innerHTML = `<i class="fas ${iconClass} mr-2"></i>${message}`;
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Animate out and remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    triggerAnimations() {
        if (window.gsap && window.ScrollTrigger) {
            // Menu items animation
            gsap.utils.toArray(".menu-item").forEach((item, i) => {
                gsap.from(item, {
                    opacity: 0,
                    y: 60,
                    duration: 0.8,
                    delay: i * 0.1,
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

    // Public methods for external access
    getCart() {
        return this.cart;
    }

    clearCart() {
        this.cart = [];
        localStorage.removeItem('cart');
        this.updateCartCounter();
    }

    removeFromCart(itemId) {
        this.cart = this.cart.filter(item => item.id !== itemId);
        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.updateCartCounter();
    }

    async loadMenuDescriptions() {
        try {
            const response = await fetch('./data/menu-descriptions.json');
            if (!response.ok) {
                throw new Error('Failed to load menu descriptions');
            }
            const data = await response.json();
            this.menuDescriptions = data.menu_descriptions;
            console.log('✅ Menu descriptions loaded successfully');
        } catch (error) {
            console.warn('Failed to load menu descriptions:', error);
            this.menuDescriptions = {};
        }
    }

    getItemDescription(itemId) {
        const description = this.menuDescriptions[itemId.toString()];

        if (!description) {
            return {
                description: 'Món ăn ngon đặc trưng miền Nam với hương vị truyền thống.',
                detailed_description: 'Món ăn ngon đặc trưng miền Nam với hương vị truyền thống.',
                ingredients: [],
                cooking_method: 'Đang cập nhật thông tin...',
                taste_profile: 'Đang cập nhật thông tin...',
                serving_suggestion: 'Đang cập nhật thông tin...',
                nutritional_info: 'Đang cập nhật thông tin...',
                origin: 'Đang cập nhật thông tin...'
            };
        }

        return description;
    }

    setupDetailedInfoModal() {
        const showDetailBtn = document.getElementById('showDetailedInfo');
        const detailModal = document.getElementById('detailedInfoModal');
        const closeDetailModal = document.getElementById('closeDetailModal');
        const closeDetailModalBtn = document.getElementById('closeDetailModalBtn');
        const detailAddToCart = document.getElementById('detailAddToCart');

        if (showDetailBtn) {
            showDetailBtn.addEventListener('click', () => {
                if (this.currentLightboxItem) {
                    this.showDetailedInfo(this.currentLightboxItem);
                }
            });
        }

        if (closeDetailModal) {
            closeDetailModal.addEventListener('click', () => this.hideDetailedInfo());
        }

        if (closeDetailModalBtn) {
            closeDetailModalBtn.addEventListener('click', () => this.hideDetailedInfo());
        }

        if (detailModal) {
            detailModal.addEventListener('click', (e) => {
                if (e.target === detailModal) {
                    this.hideDetailedInfo();
                }
            });
        }

        if (detailAddToCart) {
            detailAddToCart.addEventListener('click', () => {
                if (this.currentLightboxItem) {
                    this.addToCart(this.currentLightboxItem.id, detailAddToCart);
                    this.hideDetailedInfo();
                    this.closeLightbox();
                }
            });
        }
    }

    showDetailedInfo(item) {
        const modal = document.getElementById('detailedInfoModal');
        const description = this.getItemDescription(item.id);

        // Update modal content
        document.getElementById('detailModalTitle').textContent = item.name;
        document.getElementById('detailDescription').textContent = description.detailed_description;
        document.getElementById('detailCookingMethod').textContent = description.cooking_method;
        document.getElementById('detailTasteProfile').textContent = description.taste_profile;
        document.getElementById('detailServingSuggestion').textContent = description.serving_suggestion;
        document.getElementById('detailNutritionalInfo').textContent = description.nutritional_info;
        document.getElementById('detailOrigin').textContent = description.origin;
        document.getElementById('detailPrice').textContent = item.priceFormatted || this.formatPrice(item.price);

        // Update ingredients list
        const ingredientsList = document.getElementById('detailIngredients');
        ingredientsList.innerHTML = '';
        if (description.ingredients && description.ingredients.length > 0) {
            description.ingredients.forEach(ingredient => {
                const li = document.createElement('li');
                li.className = 'flex items-center text-gray-600 text-sm';
                li.innerHTML = `<i class="fas fa-check text-green-500 mr-2"></i>${ingredient}`;
                ingredientsList.appendChild(li);
            });
        } else {
            ingredientsList.innerHTML = '<li class="text-gray-500 text-sm">Thông tin nguyên liệu đang được cập nhật</li>';
        }

        // Show modal
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    hideDetailedInfo() {
        const modal = document.getElementById('detailedInfoModal');
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    setupViewDetailsButtons() {
        const viewDetailsButtons = document.querySelectorAll('.view-details-btn');
        viewDetailsButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const itemId = parseInt(button.getAttribute('data-item-id'));
                const item = this.filteredData.find(item => item.id === itemId);

                if (item) {
                    this.showDetailedInfo(item);
                }
            });
        });
    }
}

// Export for global use
window.MenuManager = MenuManager;
window.menuData = menuData;
