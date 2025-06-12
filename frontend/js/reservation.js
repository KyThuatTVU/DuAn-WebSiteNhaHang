// Reservation JavaScript - Chức năng đặt bàn

class ReservationManager {
    constructor() {
        this.form = document.getElementById('reservationForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.submitText = document.getElementById('submitText');
        this.submitLoading = document.getElementById('submitLoading');
        this.messagesContainer = document.getElementById('formMessages');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupValidation();
        this.setupAnimations();
    }

    setupEventListeners() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });
        }

        // Real-time validation
        const inputs = this.form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            input.addEventListener('input', () => {
                this.clearFieldError(input);
            });
        });

        // Phone number formatting
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                this.formatPhoneNumber(e.target);
            });
        }

        // Date validation
        const dateInput = document.getElementById('date');
        if (dateInput) {
            dateInput.addEventListener('change', () => {
                this.validateDate(dateInput);
            });
        }

        // Time validation
        const timeInput = document.getElementById('time');
        if (timeInput) {
            timeInput.addEventListener('change', () => {
                this.validateTime(timeInput);
            });
        }
    }

    setupValidation() {
        // Set minimum date to today
        const dateInput = document.getElementById('date');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.min = today;
        }
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        switch (field.id) {
            case 'name':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Vui lòng nhập họ và tên';
                } else if (value.length < 2) {
                    isValid = false;
                    errorMessage = 'Họ và tên phải có ít nhất 2 ký tự';
                }
                break;

            case 'phone':
                const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
                if (!value) {
                    isValid = false;
                    errorMessage = 'Vui lòng nhập số điện thoại';
                } else if (!phoneRegex.test(value.replace(/\s/g, ''))) {
                    isValid = false;
                    errorMessage = 'Số điện thoại không hợp lệ';
                }
                break;

            case 'email':
                if (value) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) {
                        isValid = false;
                        errorMessage = 'Email không hợp lệ';
                    }
                }
                break;

            case 'date':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Vui lòng chọn ngày';
                } else {
                    const selectedDate = new Date(value);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    if (selectedDate < today) {
                        isValid = false;
                        errorMessage = 'Không thể đặt bàn cho ngày trong quá khứ';
                    }
                }
                break;

            case 'time':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Vui lòng chọn giờ';
                } else {
                    const [hours, minutes] = value.split(':').map(Number);
                    if (hours < 10 || hours > 22) {
                        isValid = false;
                        errorMessage = 'Nhà hàng mở cửa từ 10:00 - 22:00';
                    }
                }
                break;

            case 'guests':
                const guests = parseInt(value);
                if (!value) {
                    isValid = false;
                    errorMessage = 'Vui lòng nhập số lượng khách';
                } else if (guests < 1) {
                    isValid = false;
                    errorMessage = 'Số lượng khách phải ít nhất 1 người';
                } else if (guests > 20) {
                    isValid = false;
                    errorMessage = 'Số lượng khách tối đa 20 người. Vui lòng liên hệ trực tiếp cho nhóm lớn hơn';
                }
                break;
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        } else {
            this.clearFieldError(field);
        }

        return isValid;
    }

    validateDate(dateInput) {
        const selectedDate = new Date(dateInput.value);
        const today = new Date();
        const dayOfWeek = selectedDate.getDay();
        
        // Check if it's a valid business day (optional)
        if (dayOfWeek === 1) { // Monday
            this.showInfo('Lưu ý: Thứ 2 là ngày nghỉ của một số bếp trưởng. Vui lòng gọi trước để xác nhận.');
        }
    }

    validateTime(timeInput) {
        const [hours, minutes] = timeInput.value.split(':').map(Number);
        
        if (hours >= 11 && hours <= 13) {
            this.showInfo('Giờ cao điểm trưa (11:30-13:30). Bàn có thể được ưu tiên cho khách đặt trước.');
        } else if (hours >= 18 && hours <= 20) {
            this.showInfo('Giờ cao điểm tối (18:00-20:00). Bàn có thể được ưu tiên cho khách đặt trước.');
        }
    }

    formatPhoneNumber(input) {
        let value = input.value.replace(/\D/g, '');
        
        if (value.length > 0) {
            if (value.length <= 4) {
                value = value;
            } else if (value.length <= 7) {
                value = value.slice(0, 4) + ' ' + value.slice(4);
            } else {
                value = value.slice(0, 4) + ' ' + value.slice(4, 7) + ' ' + value.slice(7, 10);
            }
        }
        
        input.value = value;
    }

    showFieldError(field, message) {
        this.clearFieldError(field);
        
        field.classList.add('border-red-500');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'text-red-500 text-sm mt-1 field-error';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle mr-1"></i>${message}`;
        
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.classList.remove('border-red-500');
        
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    async handleSubmit() {
        // Validate all fields
        const inputs = this.form.querySelectorAll('input[required], textarea[required]');
        let isFormValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isFormValid = false;
            }
        });

        if (!isFormValid) {
            this.showError('Vui lòng kiểm tra lại thông tin đã nhập');
            return;
        }

        // Show loading state
        this.setLoadingState(true);

        try {
            // Collect form data
            const formData = {
                name: document.getElementById('name').value.trim(),
                phone: document.getElementById('phone').value.replace(/\s/g, ''),
                email: document.getElementById('email').value.trim(),
                date: document.getElementById('date').value,
                time: document.getElementById('time').value,
                guests: parseInt(document.getElementById('guests').value),
                notes: document.getElementById('notes').value.trim(),
                timestamp: new Date().toISOString()
            };

            // Simulate API call (replace with actual API endpoint)
            const response = await this.submitReservation(formData);
            
            if (response.success) {
                this.showSuccess('Đặt bàn thành công! Chúng tôi sẽ liên hệ xác nhận trong vòng 15 phút.');
                this.resetForm();
                
                // Track successful reservation
                this.trackReservation(formData);
            } else {
                throw new Error(response.message || 'Có lỗi xảy ra khi đặt bàn');
            }
        } catch (error) {
            console.error('Reservation error:', error);
            this.showError('Có lỗi xảy ra khi đặt bàn. Vui lòng thử lại hoặc gọi trực tiếp đến nhà hàng.');
        } finally {
            this.setLoadingState(false);
        }
    }

    async submitReservation(formData) {
        // Simulate API call - replace with actual endpoint
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate success/failure
                const success = Math.random() > 0.1; // 90% success rate
                
                if (success) {
                    // Save to localStorage as backup
                    const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
                    reservations.push({
                        ...formData,
                        id: Date.now(),
                        status: 'pending'
                    });
                    localStorage.setItem('reservations', JSON.stringify(reservations));
                    
                    resolve({ success: true, id: Date.now() });
                } else {
                    resolve({ success: false, message: 'Hệ thống đang bận, vui lòng thử lại' });
                }
            }, 2000);
        });
    }

    setLoadingState(isLoading) {
        if (isLoading) {
            this.submitBtn.disabled = true;
            this.submitText.classList.add('hidden');
            this.submitLoading.classList.remove('hidden');
        } else {
            this.submitBtn.disabled = false;
            this.submitText.classList.remove('hidden');
            this.submitLoading.classList.add('hidden');
        }
    }

    showSuccess(message) {
        this.messagesContainer.innerHTML = `
            <div class="form-success">
                <i class="fas fa-check-circle mr-2"></i>${message}
            </div>
        `;
        this.scrollToMessages();
    }

    showError(message) {
        this.messagesContainer.innerHTML = `
            <div class="form-error">
                <i class="fas fa-exclamation-triangle mr-2"></i>${message}
            </div>
        `;
        this.scrollToMessages();
    }

    showInfo(message) {
        // Remove existing info messages
        const existingInfo = document.querySelector('.form-info');
        if (existingInfo) {
            existingInfo.remove();
        }

        const infoDiv = document.createElement('div');
        infoDiv.className = 'form-info bg-blue-100 text-blue-800 p-3 rounded-lg mb-4 text-sm';
        infoDiv.innerHTML = `<i class="fas fa-info-circle mr-2"></i>${message}`;
        
        this.messagesContainer.appendChild(infoDiv);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (infoDiv.parentNode) {
                infoDiv.remove();
            }
        }, 5000);
    }

    scrollToMessages() {
        this.messagesContainer.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest' 
        });
    }

    resetForm() {
        this.form.reset();
        
        // Reset to default values
        const dateInput = document.getElementById('date');
        const timeInput = document.getElementById('time');
        
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.value = today;
        }
        
        if (timeInput) {
            timeInput.value = '19:00';
        }
        
        // Clear all error states
        const inputs = this.form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            this.clearFieldError(input);
        });
    }

    trackReservation(formData) {
        // Analytics tracking (replace with actual analytics)
        console.log('Reservation tracked:', {
            date: formData.date,
            time: formData.time,
            guests: formData.guests,
            timestamp: formData.timestamp
        });
    }

    setupAnimations() {
        if (window.gsap && window.ScrollTrigger) {
            // Form animation
            gsap.from('.reservation-form', {
                opacity: 0,
                x: -50,
                duration: 1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: '.reservation-form',
                    start: "top 80%",
                    toggleActions: "play none none reset"
                }
            });

            // Contact info animation
            gsap.from('.contact-info-card', {
                opacity: 0,
                x: 50,
                duration: 1,
                delay: 0.2,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: '.contact-info-card',
                    start: "top 80%",
                    toggleActions: "play none none reset"
                }
            });

            // Contact items stagger
            gsap.from('.contact-item', {
                opacity: 0,
                y: 30,
                duration: 0.6,
                stagger: 0.1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: '.contact-info-card',
                    start: "top 70%",
                    toggleActions: "play none none reset"
                }
            });
        }
    }
}

// Export for global use
window.ReservationManager = ReservationManager;
