// Menu API Service - Tích hợp với Backend API
class MenuAPIService {
    constructor() {
        this.baseURL = 'http://localhost:3000/api';
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Lấy tất cả món ăn với search và filter
     */
    async searchFoods(params = {}) {
        try {
            // First test connection
            const isConnected = await this.testConnection();
            if (!isConnected) {
                console.warn('⚠️ API not available, using fallback data');
                return this.getFallbackData(params);
            }

            const queryParams = new URLSearchParams();

            // Add search parameter
            if (params.search && params.search.trim()) {
                queryParams.append('search', params.search.trim());
            }

            // Add category filter
            if (params.category && params.category !== 'all') {
                const categoryMap = {
                    'appetizers': 1,
                    'main-dishes': 2,
                    'soups': 3,
                    'desserts': 4,
                    'drinks': 5
                };

                if (categoryMap[params.category]) {
                    queryParams.append('category', categoryMap[params.category]);
                }
            }

            // Add pagination
            queryParams.append('limit', params.limit || 50);
            queryParams.append('offset', params.offset || 0);

            // Add availability filter
            if (params.available !== undefined) {
                queryParams.append('available', params.available);
            }

            // Add price range
            if (params.minPrice) queryParams.append('minPrice', params.minPrice);
            if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice);

            const url = `${this.baseURL}/foods?${queryParams.toString()}`;

            // Check cache first
            const cacheKey = url;
            if (this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTimeout) {
                    console.log('📦 Using cached data');
                    return cached.data;
                }
            }

            console.log('🔍 Searching foods:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                mode: 'cors'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();

            // Validate response format
            if (!data || typeof data !== 'object') {
                throw new Error('Invalid response format');
            }

            // Cache the result
            this.cache.set(cacheKey, {
                data: data,
                timestamp: Date.now()
            });

            console.log('✅ API response received:', data);
            return data;

        } catch (error) {
            console.error('❌ Error searching foods:', error);

            // Try fallback data
            console.warn('🔄 Trying fallback data...');
            return this.getFallbackData(params);
        }
    }

    /**
     * Lấy món ăn theo ID
     */
    async getFoodById(id) {
        try {
            const url = `${this.baseURL}/foods/${id}`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Món ăn không tồn tại');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            console.error('❌ Error getting food by ID:', error);
            throw error;
        }
    }

    /**
     * Lấy danh sách categories
     */
    async getCategories() {
        try {
            const cacheKey = 'categories';
            if (this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTimeout) {
                    return cached.data;
                }
            }

            const url = `${this.baseURL}/categories`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Cache the result
            this.cache.set(cacheKey, {
                data: data,
                timestamp: Date.now()
            });
            
            return data;
            
        } catch (error) {
            console.error('❌ Error getting categories:', error);
            throw error;
        }
    }

    /**
     * Lấy món ăn theo category
     */
    async getFoodsByCategory(categoryId, params = {}) {
        try {
            const queryParams = new URLSearchParams();
            queryParams.append('limit', params.limit || 20);
            queryParams.append('offset', params.offset || 0);

            const url = `${this.baseURL}/categories/${categoryId}/foods?${queryParams.toString()}`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            console.error('❌ Error getting foods by category:', error);
            throw error;
        }
    }

    /**
     * Lấy món ăn phổ biến
     */
    async getPopularFoods(limit = 10) {
        try {
            const url = `${this.baseURL}/foods/popular?limit=${limit}`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            console.error('❌ Error getting popular foods:', error);
            throw error;
        }
    }

    /**
     * Lấy thống kê món ăn
     */
    async getFoodStats() {
        try {
            const url = `${this.baseURL}/foods/stats`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            console.error('❌ Error getting food stats:', error);
            throw error;
        }
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
        console.log('🗑️ Cache cleared');
    }

    /**
     * Format food item for display
     */
    formatFoodItem(item) {
        // Đảm bảo so_luong là số hợp lệ
        const stock = typeof item.so_luong === 'number' ? item.so_luong :
                     (item.so_luong ? parseInt(item.so_luong) : 0);

        // Debug log để kiểm tra dữ liệu từ API
        console.log(`🔍 formatFoodItem for "${item.ten_mon}":`, {
            original_so_luong: item.so_luong,
            calculated_stock: stock,
            type_of_so_luong: typeof item.so_luong,
            isAvailable: stock > 0
        });

        return {
            id: item.id_mon,
            name: item.ten_mon,
            price: item.gia,
            priceFormatted: item.gia_formatted || this.formatPrice(item.gia),
            image: this.getValidImageUrl(item.hinh_anh),
            description: item.mo_ta,
            category: this.mapCategoryIdToName(item.id_loai),
            categoryId: item.id_loai,
            categoryName: item.ten_loai,
            stock: stock,
            stockDisplay: item.so_luong_display || (stock > 0 ? `Còn ${stock} phần` : 'Hết hàng'),
            status: item.tinh_trang || (stock > 0 ? 'Còn hàng' : 'Hết hàng'),
            isAvailable: stock > 0
        };
    }

    /**
     * Get valid image URL with fallback
     */
    getValidImageUrl(imageUrl) {
        if (!imageUrl) {
            return this.getPlaceholderImage();
        }

        // If already a full URL, return as is
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
        }

        // If relative path, convert to full URL
        if (imageUrl.startsWith('images/') || imageUrl.startsWith('/images/')) {
            return `${this.baseURL.replace('/api', '')}/${imageUrl}`;
        }

        // If just filename, add full path
        return `${this.baseURL.replace('/api', '')}/images/${imageUrl}`;
    }

    /**
     * Get placeholder image for missing images
     */
    getPlaceholderImage() {
        // Create a simple placeholder image data URL
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y3ZjdmNyIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Iw6xuaCDhuqNuaDwvdGV4dD4KICA8L3N2Zz4K';
    }

    /**
     * Create image error handler
     */
    createImageErrorHandler() {
        return `onerror="this.src='${this.getPlaceholderImage()}'; this.onerror=null;"`;
    }

    /**
     * Map category ID to internal category name
     */
    mapCategoryIdToName(categoryId) {
        const categoryMap = {
            1: 'appetizers',
            2: 'main-dishes', 
            3: 'soups',
            4: 'desserts',
            5: 'drinks'
        };
        
        return categoryMap[categoryId] || 'other';
    }

    /**
     * Map internal category name to ID
     */
    mapCategoryNameToId(categoryName) {
        const categoryMap = {
            'appetizers': 1,
            'main-dishes': 2,
            'soups': 3,
            'desserts': 4,
            'drinks': 5
        };
        
        return categoryMap[categoryName] || null;
    }

    /**
     * Format price to Vietnamese currency
     */
    formatPrice(price) {
        if (typeof price !== 'number' || isNaN(price)) {
            return '0 ₫';
        }

        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    }

    /**
     * Test API connection
     */
    async testConnection() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

            const response = await fetch(`${this.baseURL}/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                mode: 'cors',
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.success) {
                console.log('✅ API connection successful');
                return true;
            } else {
                console.warn('⚠️ API responded but not healthy:', data);
                return false;
            }

        } catch (error) {
            if (error.name === 'AbortError') {
                console.error('❌ API connection timeout');
            } else {
                console.error('❌ API connection failed:', error.message);
            }
            return false;
        }
    }

    /**
     * Get fallback data when API is not available
     */
    getFallbackData(params = {}) {
        console.log('📦 Using fallback data');

        // Static fallback data với đường dẫn hình ảnh đúng
        const fallbackItems = [
            {
                id_mon: 1,
                ten_mon: "Cá Lóc Nướng Trui",
                gia: 185000,
                gia_formatted: "185.000đ",
                hinh_anh: "http://localhost:3000/images/calocnuongtrui.jpg",
                mo_ta: "Cá lóc tươi nướng trui trên than hoa, phết mỡ hành và ăn kèm với các loại rau thơm đặc trưng miền Nam.",
                so_luong: 10,
                so_luong_display: "Còn 10 phần",
                tinh_trang: "Còn hàng",
                id_loai: 2,
                ten_loai: "Món Nướng"
            },
            {
                id_mon: 2,
                ten_mon: "Lẩu Mắm",
                gia: 250000,
                gia_formatted: "250.000đ",
                hinh_anh: "http://localhost:3000/images/laumam.webp",
                mo_ta: "Nước lẩu được nấu từ mắm cá linh, thêm các loại rau đồng và hải sản tươi ngon, tạo nên hương vị đậm đà khó quên.",
                so_luong: 8,
                so_luong_display: "Còn 8 phần",
                tinh_trang: "Còn hàng",
                id_loai: 3,
                ten_loai: "Lẩu"
            },
            {
                id_mon: 3,
                ten_mon: "Bánh Xèo Miền Tây",
                gia: 95000,
                gia_formatted: "95.000đ",
                hinh_anh: "http://localhost:3000/images/banhxeo.jpg",
                mo_ta: "Bánh xèo giòn tan với nhân tôm, thịt, giá và đậu xanh, ăn kèm với rau sống và nước mắm chua ngọt.",
                so_luong: 15,
                so_luong_display: "Còn 15 phần",
                tinh_trang: "Còn hàng",
                id_loai: 1,
                ten_loai: "Món Chính"
            },
            {
                id_mon: 4,
                ten_mon: "Gỏi Cuốn Tôm Thịt",
                gia: 75000,
                gia_formatted: "75.000đ",
                hinh_anh: "http://localhost:3000/images/goicuon.jpg",
                mo_ta: "Gỏi cuốn tươi mát với tôm, thịt heo, bún và rau thơm, chấm với nước mắm chua ngọt đậm đà.",
                so_luong: 20,
                so_luong_display: "Còn 20 phần",
                tinh_trang: "Còn hàng",
                id_loai: 1,
                ten_loai: "Khai Vị"
            },
            {
                id_mon: 5,
                ten_mon: "Canh Chua Cá Lóc",
                gia: 120000,
                gia_formatted: "120.000đ",
                hinh_anh: "http://localhost:3000/images/canhchuacaloc.jpg",
                mo_ta: "Canh chua truyền thống với cá lóc tươi, dứa, cà chua, đậu bắp và rau thơm miền Nam.",
                so_luong: 12,
                so_luong_display: "Còn 12 phần",
                tinh_trang: "Còn hàng",
                id_loai: 3,
                ten_loai: "Canh"
            },
            {
                id_mon: 6,
                ten_mon: "Bún Riêu Cua",
                gia: 85000,
                gia_formatted: "85.000đ",
                hinh_anh: "http://localhost:3000/images/bunrieucua.jpg",
                mo_ta: "Bún riêu cua đồng với nước dùng trong vắt, cua đồng tươi ngon và rau thơm.",
                so_luong: 18,
                so_luong_display: "Còn 18 phần",
                tinh_trang: "Còn hàng",
                id_loai: 2,
                ten_loai: "Bún"
            },
            {
                id_mon: 7,
                ten_mon: "Bánh Khọt",
                gia: 65000,
                gia_formatted: "65.000đ",
                hinh_anh: "http://localhost:3000/images/banhkhot.jpg",
                mo_ta: "Bánh khọt giòn rụm với tôm tươi, ăn kèm rau sống và nước mắm chua ngọt.",
                so_luong: 25,
                so_luong_display: "Còn 25 phần",
                tinh_trang: "Còn hàng",
                id_loai: 1,
                ten_loai: "Bánh"
            },
            {
                id_mon: 8,
                ten_mon: "Cơm Tấm",
                gia: 75000,
                gia_formatted: "75.000đ",
                hinh_anh: "http://localhost:3000/images/comtam.webp",
                mo_ta: "Cơm tấm sườn nướng với chả trứng, bì và nước mắm chua ngọt đặc trưng.",
                so_luong: 20,
                so_luong_display: "Còn 20 phần",
                tinh_trang: "Còn hàng",
                id_loai: 2,
                ten_loai: "Cơm"
            }
        ];

        // Apply search filter if provided
        let filteredItems = fallbackItems;

        if (params.search && params.search.trim()) {
            const searchTerm = params.search.toLowerCase();
            filteredItems = fallbackItems.filter(item =>
                item.ten_mon.toLowerCase().includes(searchTerm) ||
                item.mo_ta.toLowerCase().includes(searchTerm) ||
                item.ten_loai.toLowerCase().includes(searchTerm)
            );
        }

        return {
            success: true,
            data: filteredItems,
            pagination: {
                total: filteredItems.length,
                limit: params.limit || 50,
                offset: params.offset || 0,
                hasMore: false
            },
            message: "Dữ liệu offline - Vui lòng kiểm tra kết nối mạng"
        };
    }
}

// Export for global use
window.MenuAPIService = MenuAPIService;
