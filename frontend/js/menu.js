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
        await this.loadInitialData();

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
                    <img src="${item.image}"
                         alt="${item.name}"
                         class="w-full h-full object-cover hover-scale"
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
                    <p class="text-gray-600 mb-4 leading-relaxed description">${item.description || 'Món ăn ngon đặc trưng miền Nam'}</p>
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

        if (isLowStock) {
            return `
                <div class="relative">
                    <button class="add-to-cart add-to-cart-btn bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-3 px-6 rounded-lg transition-all duration-300 w-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-orange-300"
                            data-id="${item.id}">
                        <div class="flex items-center justify-center">
                            <i class="fas fa-cart-plus mr-2"></i>
                            <span>⚠️ Thêm vào giỏ (Còn ${stock})</span>
                        </div>
                    </button>
                </div>
            `;
        }

        return `
            <button class="add-to-cart add-to-cart-btn bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-6 rounded-lg transition-all duration-300 w-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-green-300"
                    data-id="${item.id}">
                <div class="flex items-center justify-center">
                    <i class="fas fa-cart-plus mr-2"></i>
                    <span>✅ Thêm vào giỏ hàng</span>
                </div>
            </button>
        `;
    }

    setupAddToCartButtons() {
        const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
        addToCartButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = parseInt(btn.dataset.id);
                this.addToCart(itemId, btn);
            });
        });
    }

    addToCart(itemId, buttonElement) {
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

            window.cartManager.addToCart(cartItem, buttonElement);
        } else {
            // Legacy cart handling
            const existingItem = this.cart.find(cartItem => cartItem.id === itemId);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                this.cart.push({ ...item, quantity: 1 });
            }

            localStorage.setItem('cart', JSON.stringify(this.cart));
            this.updateCartCounter();
            this.showButtonFeedback(buttonElement);
            this.showNotification(`Đã thêm ${item.name} vào giỏ hàng!`, 'success');
        }
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
        notification.className = `fixed top-20 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 ${
            type === 'success' ? 'bg-green-500 text-white' : 
            type === 'error' ? 'bg-red-500 text-white' : 
            'bg-blue-500 text-white'
        }`;
        notification.innerHTML = `<i class="fas fa-check-circle mr-2"></i>${message}`;
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
}

// Export for global use
window.MenuManager = MenuManager;
window.menuData = menuData;
