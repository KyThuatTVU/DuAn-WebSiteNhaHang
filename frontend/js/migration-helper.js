// Migration Helper - Hỗ trợ chuyển đổi sang hệ thống component

class MigrationHelper {
    constructor() {
        this.componentsToMigrate = [
            'header',
            'footer', 
            'ad-banner',
            'chatbot',
            'login-modal'
        ];
        this.init();
    }

    init() {
        console.log('🔄 Migration Helper initialized');
        this.checkCurrentPage();
        this.addMigrationControls();
    }

    checkCurrentPage() {
        const hasComponents = this.componentsToMigrate.some(component => 
            document.getElementById(`${component}-placeholder`)
        );

        if (hasComponents) {
            console.log('✅ Trang này đã sử dụng hệ thống component mới');
            this.showSuccessMessage();
        } else {
            console.log('⚠️ Trang này chưa được migrate');
            this.showMigrationSuggestion();
        }
    }

    showSuccessMessage() {
        const message = document.createElement('div');
        message.className = 'fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50';
        message.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-check-circle mr-2"></i>
                <span>Trang đã sử dụng components mới!</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        document.body.appendChild(message);

        setTimeout(() => {
            if (message.parentNode) {
                message.remove();
            }
        }, 5000);
    }

    showMigrationSuggestion() {
        const suggestion = document.createElement('div');
        suggestion.className = 'fixed bottom-4 left-4 bg-yellow-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-md';
        suggestion.innerHTML = `
            <div>
                <h4 class="font-bold mb-2">🔄 Migration Available</h4>
                <p class="text-sm mb-3">Trang này có thể được cải thiện bằng hệ thống component mới.</p>
                <div class="flex space-x-2">
                    <button onclick="migrationHelper.showMigrationGuide()" class="bg-white text-yellow-600 px-3 py-1 rounded text-sm hover:bg-gray-100">
                        Xem Hướng Dẫn
                    </button>
                    <button onclick="this.parentElement.parentElement.remove()" class="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700">
                        Đóng
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(suggestion);
    }

    showMigrationGuide() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <div class="p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-2xl font-bold">🔄 Hướng Dẫn Migration</h2>
                        <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    
                    <div class="space-y-4">
                        <div class="bg-blue-50 p-4 rounded-lg">
                            <h3 class="font-bold text-blue-800 mb-2">📋 Checklist Migration</h3>
                            <ul class="space-y-2 text-sm">
                                <li class="flex items-center">
                                    <input type="checkbox" class="mr-2"> Thêm CSS files mới
                                </li>
                                <li class="flex items-center">
                                    <input type="checkbox" class="mr-2"> Thêm JS files mới
                                </li>
                                <li class="flex items-center">
                                    <input type="checkbox" class="mr-2"> Thêm placeholder divs
                                </li>
                                <li class="flex items-center">
                                    <input type="checkbox" class="mr-2"> Xóa code cũ
                                </li>
                                <li class="flex items-center">
                                    <input type="checkbox" class="mr-2"> Test functionality
                                </li>
                            </ul>
                        </div>

                        <div class="bg-green-50 p-4 rounded-lg">
                            <h3 class="font-bold text-green-800 mb-2">✅ Lợi Ích</h3>
                            <ul class="text-sm space-y-1">
                                <li>• Giảm 70% duplicate code</li>
                                <li>• Tăng tốc độ development</li>
                                <li>• Dễ dàng maintain</li>
                                <li>• UI/UX consistent</li>
                                <li>• Performance tốt hơn</li>
                            </ul>
                        </div>

                        <div class="bg-yellow-50 p-4 rounded-lg">
                            <h3 class="font-bold text-yellow-800 mb-2">🔧 Code Mẫu</h3>
                            <pre class="text-xs bg-gray-100 p-2 rounded overflow-x-auto"><code>&lt;!-- Thêm vào &lt;head&gt; --&gt;
&lt;link href="css/main.css" rel="stylesheet"&gt;
&lt;link href="css/components.css" rel="stylesheet"&gt;
&lt;link href="css/animations.css" rel="stylesheet"&gt;

&lt;!-- Thêm vào &lt;body&gt; --&gt;
&lt;div id="header-placeholder"&gt;&lt;/div&gt;
&lt;div id="ad-banner-placeholder"&gt;&lt;/div&gt;
&lt;main&gt;...&lt;/main&gt;
&lt;div id="footer-placeholder"&gt;&lt;/div&gt;
&lt;div id="chatbot-placeholder"&gt;&lt;/div&gt;
&lt;div id="login-modal-placeholder"&gt;&lt;/div&gt;

&lt;!-- Thêm trước &lt;/body&gt; --&gt;
&lt;script src="js/components.js"&gt;&lt;/script&gt;
&lt;script src="js/main.js"&gt;&lt;/script&gt;
&lt;script src="js/chatbot.js"&gt;&lt;/script&gt;</code></pre>
                        </div>

                        <div class="flex space-x-3">
                            <a href="demo-components.html" target="_blank" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm">
                                🧪 Xem Demo
                            </a>
                            <a href="template.html" target="_blank" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm">
                                📄 Template Mẫu
                            </a>
                            <a href="Index-new.html" target="_blank" class="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 text-sm">
                                🆕 Index Mới
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    addMigrationControls() {
        // Add floating action button for migration tools
        const fab = document.createElement('div');
        fab.className = 'fixed bottom-20 left-4 z-40';
        fab.innerHTML = `
            <button onclick="migrationHelper.toggleMigrationPanel()" 
                    class="bg-indigo-500 text-white w-12 h-12 rounded-full shadow-lg hover:bg-indigo-600 transition-all duration-300 flex items-center justify-center">
                <i class="fas fa-tools"></i>
            </button>
        `;
        document.body.appendChild(fab);
    }

    toggleMigrationPanel() {
        const existingPanel = document.getElementById('migration-panel');
        if (existingPanel) {
            existingPanel.remove();
            return;
        }

        const panel = document.createElement('div');
        panel.id = 'migration-panel';
        panel.className = 'fixed bottom-36 left-4 bg-white rounded-lg shadow-xl p-4 z-40 w-64 border';
        panel.innerHTML = `
            <div class="mb-3">
                <h3 class="font-bold text-gray-800">🔧 Migration Tools</h3>
            </div>
            <div class="space-y-2">
                <button onclick="migrationHelper.analyzeCurrentPage()" 
                        class="w-full bg-blue-500 text-white py-2 px-3 rounded text-sm hover:bg-blue-600">
                    📊 Phân Tích Trang
                </button>
                <button onclick="migrationHelper.showMigrationGuide()" 
                        class="w-full bg-green-500 text-white py-2 px-3 rounded text-sm hover:bg-green-600">
                    📖 Hướng Dẫn
                </button>
                <button onclick="migrationHelper.generateMigrationCode()" 
                        class="w-full bg-purple-500 text-white py-2 px-3 rounded text-sm hover:bg-purple-600">
                    🔄 Tạo Code
                </button>
                <button onclick="document.getElementById('migration-panel').remove()" 
                        class="w-full bg-gray-500 text-white py-2 px-3 rounded text-sm hover:bg-gray-600">
                    ✕ Đóng
                </button>
            </div>
        `;
        document.body.appendChild(panel);
    }

    analyzeCurrentPage() {
        const analysis = {
            hasOldHeader: !!document.querySelector('header'),
            hasOldFooter: !!document.querySelector('footer'),
            hasInlineCSS: !!document.querySelector('style'),
            hasInlineJS: !!document.querySelector('script:not([src])'),
            hasComponents: this.componentsToMigrate.some(c => 
                document.getElementById(`${c}-placeholder`)
            )
        };

        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-lg max-w-md w-full p-6">
                <h3 class="text-xl font-bold mb-4">📊 Phân Tích Trang</h3>
                <div class="space-y-3">
                    <div class="flex justify-between">
                        <span>Header cũ:</span>
                        <span class="${analysis.hasOldHeader ? 'text-red-500' : 'text-green-500'}">
                            ${analysis.hasOldHeader ? '❌ Có' : '✅ Không'}
                        </span>
                    </div>
                    <div class="flex justify-between">
                        <span>Footer cũ:</span>
                        <span class="${analysis.hasOldFooter ? 'text-red-500' : 'text-green-500'}">
                            ${analysis.hasOldFooter ? '❌ Có' : '✅ Không'}
                        </span>
                    </div>
                    <div class="flex justify-between">
                        <span>CSS inline:</span>
                        <span class="${analysis.hasInlineCSS ? 'text-red-500' : 'text-green-500'}">
                            ${analysis.hasInlineCSS ? '❌ Có' : '✅ Không'}
                        </span>
                    </div>
                    <div class="flex justify-between">
                        <span>JS inline:</span>
                        <span class="${analysis.hasInlineJS ? 'text-red-500' : 'text-green-500'}">
                            ${analysis.hasInlineJS ? '❌ Có' : '✅ Không'}
                        </span>
                    </div>
                    <div class="flex justify-between">
                        <span>Components mới:</span>
                        <span class="${analysis.hasComponents ? 'text-green-500' : 'text-red-500'}">
                            ${analysis.hasComponents ? '✅ Có' : '❌ Không'}
                        </span>
                    </div>
                </div>
                <div class="mt-6 text-center">
                    <button onclick="this.closest('.fixed').remove()" 
                            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        Đóng
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    generateMigrationCode() {
        const code = `
<!-- Thêm vào <head> -->
<link href="css/main.css" rel="stylesheet">
<link href="css/components.css" rel="stylesheet">
<link href="css/animations.css" rel="stylesheet">

<!-- Thay thế header cũ -->
<div id="header-placeholder"></div>

<!-- Thay thế ad banner cũ -->
<div id="ad-banner-placeholder"></div>

<!-- Giữ nguyên main content -->
<main>
    <!-- Nội dung trang của bạn -->
</main>

<!-- Thay thế footer cũ -->
<div id="footer-placeholder"></div>

<!-- Thêm chatbot -->
<div id="chatbot-placeholder"></div>

<!-- Thêm login modal -->
<div id="login-modal-placeholder"></div>

<!-- Thêm trước </body> -->
<script src="js/auth.js"></script>
<script src="js/components.js"></script>
<script src="js/main.js"></script>
<script src="js/chatbot.js"></script>
        `;

        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold">🔄 Migration Code</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <pre class="bg-gray-100 p-4 rounded overflow-x-auto text-sm"><code>${code.trim()}</code></pre>
                <div class="mt-4 text-center">
                    <button onclick="navigator.clipboard.writeText(\`${code.trim()}\`); alert('Đã copy code!')" 
                            class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                        📋 Copy Code
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
}

// Initialize migration helper
document.addEventListener('DOMContentLoaded', function() {
    window.migrationHelper = new MigrationHelper();
});

// Export for global use
window.MigrationHelper = MigrationHelper;
