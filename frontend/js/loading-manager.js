// Loading Manager - Quản lý trạng thái loading
class LoadingManager {
    constructor() {
        this.isLoading = false;
        this.currentStep = 0;
        this.totalSteps = 3;
        this.progress = 0;
        this.loadingMessages = {
            connecting: 'Đang kết nối server...',
            loading: 'Đang tải dữ liệu...',
            rendering: 'Đang hiển thị giao diện...',
            complete: 'Hoàn thành!',
            error: 'Có lỗi xảy ra',
            offline: 'Đang sử dụng dữ liệu offline'
        };
        
        this.init();
    }

    init() {
        // Inject loading HTML if not exists
        if (!document.getElementById('loading-overlay')) {
            this.injectLoadingHTML();
        }
        
        // Bind elements
        this.overlay = document.getElementById('loading-overlay');
        this.title = document.getElementById('loading-title');
        this.subtitle = document.getElementById('loading-subtitle');
        this.progressFill = document.getElementById('progress-fill');
        this.progressPercentage = document.getElementById('progress-percentage');
        this.errorContainer = document.getElementById('loading-error');
        
        // Bind steps
        this.steps = [
            document.getElementById('step-1'),
            document.getElementById('step-2'),
            document.getElementById('step-3')
        ];
    }

    injectLoadingHTML() {
        // Create loading overlay
        const loadingHTML = `
        <div id="loading-overlay" class="loading-overlay hidden">
            <div class="loading-container">
                <div class="loading-spinner">
                    <div class="spinner-ring"></div>
                    <div class="spinner-ring"></div>
                    <div class="spinner-ring"></div>
                    <div class="spinner-ring"></div>
                </div>
                
                <div class="loading-text">
                    <h3 id="loading-title">Đang tải dữ liệu...</h3>
                    <p id="loading-subtitle">Vui lòng đợi trong giây lát</p>
                </div>
                
                <div class="loading-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" id="progress-fill"></div>
                    </div>
                    <div class="progress-text">
                        <span id="progress-percentage">0%</span>
                    </div>
                </div>
                
                <div class="loading-steps">
                    <div class="step" id="step-1">
                        <div class="step-icon">🔗</div>
                        <span>Kết nối</span>
                    </div>
                    <div class="step" id="step-2">
                        <div class="step-icon">🗄️</div>
                        <span>Tải dữ liệu</span>
                    </div>
                    <div class="step" id="step-3">
                        <div class="step-icon">🎨</div>
                        <span>Hiển thị</span>
                    </div>
                </div>
                
                <div class="loading-error hidden" id="loading-error">
                    <div class="error-icon">⚠️</div>
                    <h4>Không thể kết nối</h4>
                    <p>Đang sử dụng dữ liệu offline</p>
                    <button class="retry-btn" onclick="window.loadingManager.retry()">Thử lại</button>
                </div>
            </div>
        </div>`;
        
        document.body.insertAdjacentHTML('beforeend', loadingHTML);
        
        // Inject CSS
        this.injectLoadingCSS();
    }

    injectLoadingCSS() {
        const css = `
        .loading-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(5px);
            display: flex; justify-content: center; align-items: center;
            z-index: 9999; transition: opacity 0.3s ease;
        }
        .loading-overlay.hidden { opacity: 0; pointer-events: none; }
        .loading-container {
            background: white; border-radius: 20px; padding: 40px; text-align: center;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); max-width: 400px; width: 90%;
            animation: slideUp 0.5s ease;
        }
        @keyframes slideUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .loading-spinner { position: relative; width: 80px; height: 80px; margin: 0 auto 30px; }
        .spinner-ring {
            position: absolute; width: 100%; height: 100%; border: 4px solid transparent;
            border-top: 4px solid #ff6b35; border-radius: 50%; animation: spin 1.2s linear infinite;
        }
        .spinner-ring:nth-child(2) { border-top-color: #f7931e; width: 90%; height: 90%; top: 5%; left: 5%; }
        .spinner-ring:nth-child(3) { border-top-color: #ffd700; width: 80%; height: 80%; top: 10%; left: 10%; }
        .spinner-ring:nth-child(4) { border-top-color: #32cd32; width: 70%; height: 70%; top: 15%; left: 15%; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .loading-text h3 { color: #333; margin: 0 0 10px; font-size: 1.5em; font-weight: 600; }
        .loading-text p { color: #666; margin: 0 0 30px; font-size: 1em; }
        .progress-bar { width: 100%; height: 8px; background: #f0f0f0; border-radius: 4px; overflow: hidden; margin-bottom: 10px; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #ff6b35, #f7931e, #ffd700); border-radius: 4px; width: 0%; transition: width 0.3s ease; }
        .progress-text { font-size: 0.9em; color: #666; font-weight: 500; }
        .loading-steps { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .step { display: flex; flex-direction: column; align-items: center; flex: 1; padding: 0 10px; opacity: 0.3; transition: opacity 0.3s ease; }
        .step.active { opacity: 1; } .step.completed { opacity: 1; color: #32cd32; }
        .step-icon { font-size: 1.5em; margin-bottom: 8px; } .step span { font-size: 0.8em; text-align: center; }
        .loading-error { text-align: center; } .loading-error.hidden { display: none; }
        .error-icon { font-size: 3em; margin-bottom: 15px; }
        .loading-error h4 { color: #e74c3c; margin: 0 0 10px; } .loading-error p { color: #666; margin: 0 0 20px; }
        .retry-btn { background: #ff6b35; color: white; border: none; padding: 12px 24px; border-radius: 25px; cursor: pointer; font-size: 1em; font-weight: 500; transition: background 0.3s ease; }
        .retry-btn:hover { background: #e55a2b; }
        @media (max-width: 768px) {
            .loading-container { padding: 30px 20px; margin: 20px; }
            .loading-spinner { width: 60px; height: 60px; }
            .loading-text h3 { font-size: 1.3em; }
            .step { padding: 0 5px; } .step span { font-size: 0.7em; }
        }`;
        
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    }

    show(message = 'Đang tải dữ liệu...', subtitle = 'Vui lòng đợi trong giây lát') {
        this.isLoading = true;
        this.currentStep = 0;
        this.progress = 0;
        
        if (this.overlay) {
            this.overlay.classList.remove('hidden');
            this.title.textContent = message;
            this.subtitle.textContent = subtitle;
            this.updateProgress(0);
            this.updateStep(0);
            this.hideError();
        }
    }

    hide() {
        this.isLoading = false;
        if (this.overlay) {
            this.overlay.classList.add('hidden');
        }
    }

    updateProgress(percentage) {
        this.progress = Math.min(100, Math.max(0, percentage));
        if (this.progressFill) {
            this.progressFill.style.width = `${this.progress}%`;
        }
        if (this.progressPercentage) {
            this.progressPercentage.textContent = `${Math.round(this.progress)}%`;
        }
    }

    updateStep(stepIndex, completed = false) {
        this.currentStep = stepIndex;
        
        this.steps.forEach((step, index) => {
            if (step) {
                step.classList.remove('active', 'completed');
                if (index < stepIndex) {
                    step.classList.add('completed');
                } else if (index === stepIndex) {
                    step.classList.add('active');
                }
            }
        });
        
        // Update progress based on step
        const stepProgress = (stepIndex / this.totalSteps) * 100;
        this.updateProgress(stepProgress);
    }

    updateMessage(message, subtitle = '') {
        if (this.title) this.title.textContent = message;
        if (this.subtitle && subtitle) this.subtitle.textContent = subtitle;
    }

    showError(message = 'Không thể kết nối', subtitle = 'Đang sử dụng dữ liệu offline') {
        if (this.errorContainer) {
            this.errorContainer.classList.remove('hidden');
            this.errorContainer.querySelector('h4').textContent = message;
            this.errorContainer.querySelector('p').textContent = subtitle;
        }
    }

    hideError() {
        if (this.errorContainer) {
            this.errorContainer.classList.add('hidden');
        }
    }

    retry() {
        this.hideError();
        this.show('Đang thử kết nối lại...', 'Vui lòng đợi');
        
        // Trigger retry event
        window.dispatchEvent(new CustomEvent('loadingRetry'));
    }

    // Preset loading sequences
    async loadMenu() {
        this.show('Đang tải menu...', 'Kết nối đến server');
        this.updateStep(0); // Connecting
        
        await this.delay(800);
        this.updateMessage('Đang tải dữ liệu món ăn...', 'Lấy thông tin từ database');
        this.updateStep(1); // Loading data
        
        await this.delay(1200);
        this.updateMessage('Đang hiển thị menu...', 'Chuẩn bị giao diện');
        this.updateStep(2); // Rendering
        this.updateProgress(100);
        
        await this.delay(500);
        this.hide();
    }

    async loadReservation() {
        this.show('Đang xử lý đặt bàn...', 'Kiểm tra thông tin');
        this.updateStep(0);
        
        await this.delay(1000);
        this.updateMessage('Đang lưu thông tin...', 'Gửi đến server');
        this.updateStep(1);
        
        await this.delay(800);
        this.updateMessage('Hoàn thành đặt bàn!', 'Chuyển hướng...');
        this.updateStep(2);
        this.updateProgress(100);
        
        await this.delay(500);
        this.hide();
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize global loading manager
window.loadingManager = new LoadingManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoadingManager;
}
