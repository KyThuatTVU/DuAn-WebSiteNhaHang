// Loading Manager - Quản lý trạng thái loading
class LoadingManager {
    constructor() {
        this.isLoading = false;
        this.currentStep = 0;
        this.totalSteps = 3;
        this.progress = 0;
        this.loadingMessages = {
            connecting: '🌐 Đang kết nối server...',
            loading: '📊 Đang tải dữ liệu...',
            rendering: '🎨 Đang hiển thị giao diện...',
            complete: '✅ Hoàn thành!',
            error: '❌ Có lỗi xảy ra',
            offline: '📱 Đang sử dụng dữ liệu offline',
            menu: '🍽️ Đang tải thực đơn...',
            reservation: '📅 Đang xử lý đặt bàn...',
            payment: '💳 Đang xử lý thanh toán...',
            upload: '📤 Đang tải lên...',
            download: '📥 Đang tải xuống...',
            processing: '⚙️ Đang xử lý...',
            saving: '💾 Đang lưu dữ liệu...',
            deleting: '🗑️ Đang xóa...',
            updating: '🔄 Đang cập nhật...'
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
                <!-- Decorative particles -->
                <div class="loading-particles">
                    <div class="particle"></div>
                    <div class="particle"></div>
                    <div class="particle"></div>
                    <div class="particle"></div>
                    <div class="particle"></div>
                </div>

                <div class="loading-spinner">
                    <div class="spinner-ring"></div>
                    <div class="spinner-ring"></div>
                    <div class="spinner-ring"></div>
                    <div class="spinner-ring"></div>
                </div>

                <div class="loading-text">
                    <h3 id="loading-title">✨ Đang tải dữ liệu...</h3>
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
                        <div class="step-icon">🌐</div>
                        <span>Kết nối Server</span>
                    </div>
                    <div class="step" id="step-2">
                        <div class="step-icon">📊</div>
                        <span>Tải Dữ Liệu</span>
                    </div>
                    <div class="step" id="step-3">
                        <div class="step-icon">🎨</div>
                        <span>Hiển Thị</span>
                    </div>
                </div>

                <div class="loading-error hidden" id="loading-error">
                    <div class="error-icon">🚫</div>
                    <h4>Không thể kết nối</h4>
                    <p>Đang sử dụng dữ liệu offline</p>
                    <button class="retry-btn" onclick="window.loadingManager.retry()">
                        <i class="fas fa-redo"></i> Thử Lại
                    </button>
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
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.9), rgba(118, 75, 162, 0.9));
            backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
            display: flex; justify-content: center; align-items: center;
            z-index: 9999; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .loading-overlay.hidden {
            opacity: 0; pointer-events: none;
            transform: scale(0.95); filter: blur(10px);
        }
        .loading-container {
            background: linear-gradient(145deg, #ffffff, #f8fafc);
            border-radius: 30px; padding: 50px 40px; text-align: center;
            box-shadow:
                0 25px 80px rgba(0, 0, 0, 0.15),
                0 0 0 1px rgba(255, 255, 255, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.8);
            max-width: 450px; width: 90%;
            animation: slideUpBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
            position: relative; overflow: hidden;
        }
        .loading-container::before {
            content: ''; position: absolute; top: 0; left: -100%;
            width: 100%; height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
            animation: shimmerEffect 2s infinite;
        }
        .loading-particles {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            pointer-events: none; overflow: hidden; border-radius: 30px;
        }
        .particle {
            position: absolute; width: 4px; height: 4px;
            background: linear-gradient(45deg, #667eea, #764ba2);
            border-radius: 50%; opacity: 0.6;
            animation: floatParticle 4s ease-in-out infinite;
        }
        .particle:nth-child(1) {
            top: 20%; left: 10%; animation-delay: 0s;
            background: linear-gradient(45deg, #ff6b35, #f7931e);
        }
        .particle:nth-child(2) {
            top: 60%; left: 80%; animation-delay: 1s;
            background: linear-gradient(45deg, #ffd700, #32cd32);
        }
        .particle:nth-child(3) {
            top: 80%; left: 20%; animation-delay: 2s;
            background: linear-gradient(45deg, #667eea, #764ba2);
        }
        .particle:nth-child(4) {
            top: 30%; left: 70%; animation-delay: 3s;
            background: linear-gradient(45deg, #f7931e, #ffd700);
        }
        .particle:nth-child(5) {
            top: 70%; left: 50%; animation-delay: 0.5s;
            background: linear-gradient(45deg, #32cd32, #38a169);
        }
        @keyframes floatParticle {
            0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.6; }
            25% { transform: translateY(-20px) rotate(90deg); opacity: 1; }
            50% { transform: translateY(-10px) rotate(180deg); opacity: 0.8; }
            75% { transform: translateY(-30px) rotate(270deg); opacity: 1; }
        }
        @keyframes slideUpBounce {
            0% { transform: translateY(100px) scale(0.8); opacity: 0; }
            60% { transform: translateY(-10px) scale(1.05); opacity: 0.8; }
            100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes shimmerEffect {
            0% { left: -100%; }
            100% { left: 100%; }
        }
        .loading-spinner {
            position: relative; width: 100px; height: 100px; margin: 0 auto 40px;
            filter: drop-shadow(0 10px 20px rgba(255, 107, 53, 0.3));
        }
        .spinner-ring {
            position: absolute; border-radius: 50%;
            animation: spinGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .spinner-ring:nth-child(1) {
            width: 100%; height: 100%;
            border: 4px solid transparent;
            border-top: 4px solid #ff6b35;
            box-shadow: 0 0 20px rgba(255, 107, 53, 0.5);
        }
        .spinner-ring:nth-child(2) {
            width: 85%; height: 85%; top: 7.5%; left: 7.5%;
            border: 3px solid transparent;
            border-top: 3px solid #f7931e;
            animation-delay: -0.4s; animation-duration: 1.8s;
            box-shadow: 0 0 15px rgba(247, 147, 30, 0.4);
        }
        .spinner-ring:nth-child(3) {
            width: 70%; height: 70%; top: 15%; left: 15%;
            border: 3px solid transparent;
            border-top: 3px solid #ffd700;
            animation-delay: -0.8s; animation-duration: 1.6s;
            box-shadow: 0 0 10px rgba(255, 215, 0, 0.4);
        }
        .spinner-ring:nth-child(4) {
            width: 55%; height: 55%; top: 22.5%; left: 22.5%;
            border: 2px solid transparent;
            border-top: 2px solid #32cd32;
            animation-delay: -1.2s; animation-duration: 1.4s;
            box-shadow: 0 0 8px rgba(50, 205, 50, 0.4);
        }
        @keyframes spinGlow {
            0% { transform: rotate(0deg); filter: brightness(1); }
            50% { filter: brightness(1.2); }
            100% { transform: rotate(360deg); filter: brightness(1); }
        }
        .loading-text h3 {
            color: #2d3748; margin: 0 0 15px; font-size: 1.8em; font-weight: 700;
            background: linear-gradient(135deg, #667eea, #764ba2);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            background-clip: text; text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .loading-text p {
            color: #718096; margin: 0 0 35px; font-size: 1.1em; font-weight: 400;
            line-height: 1.6;
        }
        .loading-progress { margin-bottom: 35px; }
        .progress-bar {
            width: 100%; height: 12px;
            background: linear-gradient(90deg, #e2e8f0, #cbd5e0);
            border-radius: 20px; overflow: hidden; margin-bottom: 15px;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
        }
        .progress-fill {
            height: 100%; border-radius: 20px; width: 0%;
            background: linear-gradient(90deg, #ff6b35, #f7931e, #ffd700, #32cd32);
            background-size: 200% 100%;
            animation: progressGlow 2s ease-in-out infinite;
            transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 0 20px rgba(255, 107, 53, 0.4);
        }
        @keyframes progressGlow {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
        }
        .progress-text {
            font-size: 1em; color: #4a5568; font-weight: 600;
            text-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        .loading-steps {
            display: flex; justify-content: space-between; margin-bottom: 25px;
            padding: 20px; background: rgba(247, 250, 252, 0.8);
            border-radius: 20px; backdrop-filter: blur(10px);
        }
        .step {
            display: flex; flex-direction: column; align-items: center;
            flex: 1; padding: 0 15px; opacity: 0.4;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            transform: scale(0.9);
        }
        .step.active {
            opacity: 1; transform: scale(1.1);
            filter: drop-shadow(0 5px 15px rgba(102, 126, 234, 0.3));
        }
        .step.completed {
            opacity: 1; color: #38a169; transform: scale(1);
            filter: drop-shadow(0 3px 10px rgba(56, 161, 105, 0.3));
        }
        .step-icon {
            font-size: 2em; margin-bottom: 12px;
            padding: 15px; border-radius: 50%;
            background: linear-gradient(135deg, #f7fafc, #edf2f7);
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
        }
        .step.active .step-icon {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white; transform: rotateY(360deg);
        }
        .step.completed .step-icon {
            background: linear-gradient(135deg, #38a169, #48bb78);
            color: white;
        }
        .step span {
            font-size: 0.9em; text-align: center; font-weight: 600;
            text-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        .loading-error {
            text-align: center; padding: 30px;
            background: linear-gradient(135deg, #fed7d7, #feb2b2);
            border-radius: 20px; margin-top: 20px;
        }
        .loading-error.hidden { display: none; }
        .error-icon {
            font-size: 4em; margin-bottom: 20px;
            filter: drop-shadow(0 5px 15px rgba(229, 62, 62, 0.3));
            animation: errorPulse 2s ease-in-out infinite;
        }
        @keyframes errorPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
        .loading-error h4 {
            color: #c53030; margin: 0 0 15px; font-size: 1.4em; font-weight: 700;
        }
        .loading-error p {
            color: #744210; margin: 0 0 25px; font-size: 1.1em;
        }
        .retry-btn {
            background: linear-gradient(135deg, #ff6b35, #e53e3e);
            color: white; border: none; padding: 15px 30px;
            border-radius: 30px; cursor: pointer; font-size: 1.1em;
            font-weight: 600; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 8px 25px rgba(255, 107, 53, 0.3);
            text-transform: uppercase; letter-spacing: 1px;
        }
        .retry-btn:hover {
            transform: translateY(-3px) scale(1.05);
            box-shadow: 0 15px 35px rgba(255, 107, 53, 0.4);
            background: linear-gradient(135deg, #e55a2b, #c53030);
        }
        .retry-btn:active {
            transform: translateY(-1px) scale(1.02);
        }
        @media (max-width: 768px) {
            .loading-container {
                padding: 40px 25px; margin: 15px; border-radius: 25px;
            }
            .loading-spinner { width: 80px; height: 80px; }
            .loading-text h3 { font-size: 1.5em; }
            .loading-text p { font-size: 1em; }
            .step { padding: 0 8px; }
            .step span { font-size: 0.8em; }
            .step-icon { font-size: 1.5em; padding: 12px; }
            .retry-btn { padding: 12px 24px; font-size: 1em; }
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
        this.show('🍽️ Đang tải thực đơn...', 'Kết nối đến server nhà hàng');
        this.updateStep(0); // Connecting
        this.updateProgress(10);

        await this.delay(800);
        this.updateMessage('📊 Đang tải dữ liệu món ăn...', 'Lấy thông tin từ database');
        this.updateStep(1); // Loading data
        this.updateProgress(60);

        await this.delay(1200);
        this.updateMessage('🎨 Đang hiển thị menu...', 'Chuẩn bị giao diện đẹp mắt');
        this.updateStep(2); // Rendering
        this.updateProgress(90);

        await this.delay(400);
        this.updateProgress(100);
        this.updateMessage('✨ Thực đơn đã sẵn sàng!', 'Chúc bạn ngon miệng');

        await this.delay(800);
        this.hide();
    }

    async loadReservation() {
        this.show('📅 Đang xử lý đặt bàn...', 'Kiểm tra thông tin khách hàng');
        this.updateStep(0);
        this.updateProgress(15);

        await this.delay(1000);
        this.updateMessage('💾 Đang lưu thông tin...', 'Gửi yêu cầu đến server');
        this.updateStep(1);
        this.updateProgress(70);

        await this.delay(800);
        this.updateMessage('🎉 Hoàn thành đặt bàn!', 'Chuẩn bị xác nhận...');
        this.updateStep(2);
        this.updateProgress(95);

        await this.delay(400);
        this.updateProgress(100);
        this.updateMessage('✅ Đặt bàn thành công!', 'Chúng tôi sẽ liên hệ sớm');

        await this.delay(1000);
        this.hide();
    }

    async loadPayment() {
        this.show('💳 Đang xử lý thanh toán...', 'Kết nối với ngân hàng');
        this.updateStep(0);
        this.updateProgress(20);

        await this.delay(1500);
        this.updateMessage('🔐 Đang xác thực...', 'Kiểm tra thông tin thanh toán');
        this.updateStep(1);
        this.updateProgress(75);

        await this.delay(1200);
        this.updateMessage('✅ Thanh toán thành công!', 'Hoàn tất giao dịch');
        this.updateStep(2);
        this.updateProgress(100);

        await this.delay(1000);
        this.hide();
    }

    async loadUpload() {
        this.show('📤 Đang tải lên...', 'Chuẩn bị tệp tin');
        this.updateStep(0);

        // Simulate upload progress
        for (let i = 0; i <= 100; i += 5) {
            this.updateProgress(i);
            if (i === 30) {
                this.updateMessage('📤 Đang tải lên...', 'Đang gửi dữ liệu');
                this.updateStep(1);
            }
            if (i === 80) {
                this.updateMessage('✅ Hoàn thành tải lên!', 'Xử lý tệp tin');
                this.updateStep(2);
            }
            await this.delay(100);
        }

        await this.delay(500);
        this.hide();
    }

    async loadData(dataType = 'dữ liệu') {
        this.show(`📊 Đang tải ${dataType}...`, 'Kết nối đến server');
        this.updateStep(0);
        this.updateProgress(10);

        await this.delay(800);
        this.updateMessage(`📥 Đang tải ${dataType}...`, 'Nhận dữ liệu từ server');
        this.updateStep(1);
        this.updateProgress(60);

        await this.delay(1000);
        this.updateMessage(`🎨 Đang hiển thị ${dataType}...`, 'Chuẩn bị giao diện');
        this.updateStep(2);
        this.updateProgress(90);

        await this.delay(400);
        this.updateProgress(100);
        this.updateMessage(`✨ ${dataType} đã sẵn sàng!`, 'Hoàn thành');

        await this.delay(600);
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
