// Reservation JavaScript - Chức năng đặt bàn theo DB dat_ban

class ReservationManager {
    constructor() {
        this.form = document.getElementById('reservationForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.submitText = document.getElementById('submitText');
        this.submitLoading = document.getElementById('submitLoading');
        this.messagesContainer = document.getElementById('formMessages');
        
        // Database field mapping
        this.fields = {
            ten_khach: document.getElementById('ten_khach'),
            sdt: document.getElementById('sdt'),
            email: document.getElementById('email'),
            ngay: document.getElementById('ngay'),
            gio: document.getElementById('gio'),
            so_luong_khach: document.getElementById('so_luong_khach'),
            ghi_chu: document.getElementById('ghi_chu'),
            trang_thai: document.getElementById('trang_thai')
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupValidation();
        this.setupAnimations();
        this.setupDateTimeDefaults();
        this.setupCharacterCounter();
    }

    setupEventListeners() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });
        }

        // Real-time validation
        const inputs = this.form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            input.addEventListener('input', () => {
                this.clearFieldError(input);
            });
        });

        // Phone number formatting
        if (this.fields.sdt) {
            this.fields.sdt.addEventListener('input', (e) => {
                this.formatPhoneNumber(e.target);
            });
        }

        // Date validation
        if (this.fields.ngay) {
            this.fields.ngay.addEventListener('change', () => {
                this.validateDate();
            });
        }
    }

    setupDateTimeDefaults() {
        // Set minimum date to today
        if (this.fields.ngay) {
            const today = new Date().toISOString().split('T')[0];
            this.fields.ngay.min = today;
            this.fields.ngay.value = today;
        }

        // Set default time if not selected
        if (this.fields.gio && !this.fields.gio.value) {
            this.fields.gio.value = '19:00';
        }

        // Set default guest count
        if (this.fields.so_luong_khach && !this.fields.so_luong_khach.value) {
            this.fields.so_luong_khach.value = '2';
        }
    }

    setupCharacterCounter() {
        if (this.fields.ghi_chu) {
            const counter = document.getElementById('ghi_chu_count');
            if (counter) {
                this.fields.ghi_chu.addEventListener('input', () => {
                    const length = this.fields.ghi_chu.value.length;
                    counter.textContent = length;
                    
                    // Change color based on length
                    if (length > 450) {
                        counter.className = 'text-red-500 font-semibold';
                    } else if (length > 400) {
                        counter.className = 'text-yellow-500 font-semibold';
                    } else {
                        counter.className = 'text-gray-500';
                    }
                });
            }
        }
    }

    validateField(field) {
        const fieldName = field.name || field.id;
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        switch (fieldName) {
            case 'ten_khach':
                if (!value) {
                    errorMessage = 'Vui lòng nhập họ và tên';
                    isValid = false;
                } else if (value.length < 2) {
                    errorMessage = 'Họ tên phải có ít nhất 2 ký tự';
                    isValid = false;
                } else if (value.length > 100) {
                    errorMessage = 'Họ tên không được quá 100 ký tự';
                    isValid = false;
                } else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(value)) {
                    errorMessage = 'Họ tên chỉ được chứa chữ cái và khoảng trắng';
                    isValid = false;
                }
                break;

            case 'sdt':
                if (!value) {
                    errorMessage = 'Vui lòng nhập số điện thoại';
                    isValid = false;
                } else if (!/^[0-9]{10,11}$/.test(value)) {
                    errorMessage = 'Số điện thoại phải có 10-11 chữ số';
                    isValid = false;
                } else if (!this.isValidPhoneNumber(value)) {
                    errorMessage = 'Số điện thoại không đúng định dạng Việt Nam';
                    isValid = false;
                }
                break;

            case 'email':
                if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    errorMessage = 'Email không đúng định dạng';
                    isValid = false;
                } else if (value.length > 100) {
                    errorMessage = 'Email không được quá 100 ký tự';
                    isValid = false;
                }
                break;

            case 'ngay':
                if (!value) {
                    errorMessage = 'Vui lòng chọn ngày đặt bàn';
                    isValid = false;
                } else {
                    const selectedDate = new Date(value);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    if (selectedDate < today) {
                        errorMessage = 'Không thể đặt bàn cho ngày trong quá khứ';
                        isValid = false;
                    } else if (selectedDate > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) {
                        errorMessage = 'Chỉ có thể đặt bàn trong vòng 30 ngày tới';
                        isValid = false;
                    }
                }
                break;

            case 'gio':
                if (!value) {
                    errorMessage = 'Vui lòng chọn giờ đặt bàn';
                    isValid = false;
                } else if (!this.isValidTime(value)) {
                    errorMessage = 'Giờ đặt bàn không hợp lệ';
                    isValid = false;
                }
                break;

            case 'so_luong_khach':
                if (!value) {
                    errorMessage = 'Vui lòng chọn số lượng khách';
                    isValid = false;
                } else {
                    const guests = parseInt(value);
                    if (guests < 1 || guests > 20) {
                        errorMessage = 'Số lượng khách phải từ 1 đến 20 người';
                        isValid = false;
                    }
                }
                break;

            case 'ghi_chu':
                if (value.length > 500) {
                    errorMessage = 'Ghi chú không được quá 500 ký tự';
                    isValid = false;
                }
                break;
        }

        this.showFieldError(field, errorMessage);
        return isValid;
    }

    isValidPhoneNumber(phone) {
        // Vietnamese phone number patterns - simplified
        // Check for 10-digit format: 0xxxxxxxxx
        if (phone.length === 10) {
            return /^0[3-9][0-9]{8}$/.test(phone);
        }

        // Check for 11-digit format: 0xxxxxxxxxx (some old formats)
        if (phone.length === 11) {
            return /^0[3-9][0-9]{9}$/.test(phone);
        }

        return false;
    }

    isValidTime(time) {
        const [hours, minutes] = time.split(':').map(Number);
        
        // Restaurant operating hours: 10:00 - 21:30
        if (hours < 10 || hours > 21) return false;
        if (hours === 21 && minutes > 30) return false;
        
        return true;
    }

    validateDate() {
        const dateField = this.fields.ngay;
        if (!dateField) return true;

        const selectedDate = new Date(dateField.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if selected date is today and time has passed
        if (selectedDate.toDateString() === today.toDateString()) {
            const timeField = this.fields.gio;
            if (timeField && timeField.value) {
                const [hours, minutes] = timeField.value.split(':').map(Number);
                const selectedTime = new Date();
                selectedTime.setHours(hours, minutes, 0, 0);
                
                const now = new Date();
                if (selectedTime <= now) {
                    this.showFieldError(timeField, 'Không thể đặt bàn cho giờ đã qua');
                    return false;
                }
            }
        }

        return true;
    }

    showFieldError(field, message) {
        const errorElement = document.getElementById(field.id + '_error');
        if (errorElement) {
            if (message) {
                errorElement.textContent = message;
                errorElement.classList.remove('hidden');
                field.classList.add('border-red-500');
            } else {
                errorElement.classList.add('hidden');
                field.classList.remove('border-red-500');
            }
        }
    }

    clearFieldError(field) {
        const errorElement = document.getElementById(field.id + '_error');
        if (errorElement) {
            errorElement.classList.add('hidden');
            field.classList.remove('border-red-500');
        }
    }

    formatPhoneNumber(input) {
        let value = input.value.replace(/\D/g, '');

        // Limit to 11 digits
        if (value.length > 11) {
            value = value.substring(0, 11);
        }

        // No formatting - just keep numbers only
        input.value = value;
    }

    async handleSubmit() {
        // Clear previous messages
        this.clearMessages();
        
        // Validate all fields
        let isValid = true;
        Object.values(this.fields).forEach(field => {
            if (field && !this.validateField(field)) {
                isValid = false;
            }
        });

        // Additional date/time validation
        if (!this.validateDate()) {
            isValid = false;
        }

        if (!isValid) {
            this.showMessage('Vui lòng kiểm tra lại thông tin đã nhập', 'error');
            return;
        }

        // Show loading state
        this.setLoadingState(true);

        try {
            // Collect form data
            const formData = this.collectFormData();
            
            // Submit to backend
            const response = await this.submitReservation(formData);
            
            if (response.success) {
                this.showMessage(
                    response.message || 'Đặt bàn thành công! Chúng tôi sẽ liên hệ xác nhận trong vòng 15 phút.', 
                    'success'
                );
                this.resetForm();
            } else {
                this.showMessage(response.message || 'Có lỗi xảy ra, vui lòng thử lại', 'error');
                
                // Show specific field errors if available
                if (response.errors && response.errors.length > 0) {
                    response.errors.forEach(error => {
                        console.error('Validation error:', error);
                    });
                }
            }
        } catch (error) {
            console.error('Reservation error:', error);
            this.showMessage('Có lỗi xảy ra, vui lòng thử lại sau', 'error');
        } finally {
            this.setLoadingState(false);
        }
    }

    collectFormData() {
        const data = {};
        Object.keys(this.fields).forEach(key => {
            const field = this.fields[key];
            if (field) {
                data[key] = field.value.trim();
            }
        });

        return data;
    }

    async submitReservation(data) {
        try {
            // Call backend API
            const response = await fetch('http://localhost:3000/api/datban', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            
            if (response.ok && result.success) {
                return {
                    success: true,
                    message: result.message,
                    data: result.data,
                    id: result.id
                };
            } else {
                return {
                    success: false,
                    message: result.message || 'Có lỗi xảy ra khi đặt bàn',
                    errors: result.errors || []
                };
            }
        } catch (error) {
            console.error('Network error:', error);
            return {
                success: false,
                message: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.'
            };
        }
    }

    setLoadingState(loading) {
        if (loading) {
            this.submitBtn.disabled = true;
            this.submitText.classList.add('hidden');
            this.submitLoading.classList.remove('hidden');
        } else {
            this.submitBtn.disabled = false;
            this.submitText.classList.remove('hidden');
            this.submitLoading.classList.add('hidden');
        }
    }

    showMessage(message, type = 'info') {
        if (!this.messagesContainer) {
            // Create messages container if it doesn't exist
            this.messagesContainer = document.createElement('div');
            this.messagesContainer.id = 'formMessages';
            this.form.insertBefore(this.messagesContainer, this.form.firstChild);
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `p-4 rounded-lg mb-4 ${
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
        
        this.messagesContainer.innerHTML = '';
        this.messagesContainer.appendChild(messageDiv);
        
        // Scroll to message
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Auto hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.remove();
                }
            }, 5000);
        }
    }

    clearMessages() {
        if (this.messagesContainer) {
            this.messagesContainer.innerHTML = '';
        }
    }

    resetForm() {
        if (this.form) {
            this.form.reset();
            
            // Reset to default values
            this.setupDateTimeDefaults();
            
            // Clear all error states
            Object.values(this.fields).forEach(field => {
                if (field) {
                    this.clearFieldError(field);
                }
            });
            
            // Reset character counter
            const counter = document.getElementById('ghi_chu_count');
            if (counter) {
                counter.textContent = '0';
                counter.className = 'text-gray-500';
            }
        }
    }

    setupValidation() {
        // Real-time validation setup is already in setupEventListeners
        console.log('Validation setup completed');
    }

    setupAnimations() {
        // Add smooth animations for form interactions
        const formSections = this.form.querySelectorAll('.bg-gray-50, .bg-blue-50, .bg-yellow-50');
        formSections.forEach((section, index) => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                section.style.transition = 'all 0.5s ease';
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
            }, index * 200);
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait for components to load
    setTimeout(() => {
        if (document.getElementById('reservationForm')) {
            window.ReservationManager = new ReservationManager();
            console.log('✅ ReservationManager initialized successfully');
        }
    }, 500);
});

// Export for global access
window.ReservationManager = ReservationManager;
