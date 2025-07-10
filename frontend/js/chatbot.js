// Chatbot JavaScript - Chức năng chatbot

class Chatbot {
    constructor() {
        this.chatHistory = [];
        this.isOpen = false;
        this.init();
    }

    init() {
        console.log('🤖 Chatbot initializing...');
        this.setupEventListeners();
        this.initializeChat();
        console.log('✅ Chatbot initialized successfully');
    }

    setupEventListeners() {
        // Wait for DOM to be ready and components to be loaded
        setTimeout(() => {
            console.log('🔍 Setting up chatbot event listeners...');
            const btnOpen = document.getElementById('chatbotButton');
            const btnClose = document.getElementById('closeChatbot');
            const sendButton = document.getElementById('sendMessage');
            const inputField = document.getElementById('chatbotInput');
            const suggestion = document.querySelector('#suggestionBox .cursor-pointer');

            console.log('🔍 Chatbot elements found:', {
                btnOpen: !!btnOpen,
                btnClose: !!btnClose,
                sendButton: !!sendButton,
                inputField: !!inputField,
                suggestion: !!suggestion
            });

            if (btnOpen) {
                btnOpen.addEventListener('click', () => this.toggleChat());
                console.log('✅ Open button listener added');
            } else {
                console.error('❌ Chatbot open button not found');
            }

            if (btnClose) {
                btnClose.addEventListener('click', () => this.toggleChat());
                console.log('✅ Close button listener added');
            } else {
                console.error('❌ Chatbot close button not found');
            }

            if (sendButton) {
                sendButton.addEventListener('click', () => this.sendMessage());
                console.log('✅ Send button listener added');
            } else {
                console.error('❌ Send button not found');
            }

            if (inputField) {
                inputField.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        this.sendMessage();
                    }
                });

                // Auto-resize textarea
                inputField.addEventListener('input', function() {
                    this.style.height = 'auto';
                    this.style.height = (this.scrollHeight) + 'px';
                });
            }

            if (suggestion) {
                suggestion.addEventListener('click', () => {
                    const text = suggestion.textContent.trim();
                    if (inputField) {
                        inputField.value = text;
                        inputField.focus();
                    }
                });
            }
        }, 500);
    }

    toggleChat() {
        const panel = document.getElementById('chatbotPanel');
        if (!panel) return;

        this.isOpen = !this.isOpen;
        
        if (this.isOpen) {
            panel.classList.remove('opacity-0', 'scale-90', 'pointer-events-none');
            panel.classList.add('opacity-100', 'scale-100');
        } else {
            panel.classList.add('opacity-0', 'scale-90', 'pointer-events-none');
            panel.classList.remove('opacity-100', 'scale-100');
        }
    }

    initializeChat() {
        // Add welcome message after component loads
        setTimeout(() => {
            this.addWelcomeMessage();
        }, 1000);
    }

    addWelcomeMessage() {
        const welcomeMessages = [
            "Xin chào! Tôi là trợ lý ảo của Nhà hàng Phương Nam. Tôi có thể giúp bạn:",
            "• Tư vấn món ăn phù hợp",
            "• Thông tin về giá cả và khuyến mãi",
            "• Hướng dẫn đặt bàn",
            "• Giải đáp thắc mắc về nhà hàng",
            "",
            "Bạn muốn tôi giúp gì hôm nay?"
        ];

        welcomeMessages.forEach((message, index) => {
            setTimeout(() => {
                this.addMessageToChat('assistant', message);
            }, index * 500);
        });
    }

    async sendMessage() {
        console.log('📤 Sending message...');
        const inputField = document.getElementById('chatbotInput');
        if (!inputField) {
            console.error('❌ Input field not found');
            return;
        }

        const message = inputField.value.trim();
        console.log('📝 Message content:', message);

        if (!message) {
            console.log('⚠️ Empty message, skipping');
            return;
        }

        // Add user message
        this.addMessageToChat('user', message);
        this.chatHistory.push({ role: 'user', content: message });

        // Clear input
        inputField.value = '';
        inputField.style.height = 'auto';

        // Show typing indicator
        this.showTypingIndicator();

        try {
            console.log('🌐 Calling API...');
            // Send to API
            const response = await this.sendMessageToAPI(message, this.chatHistory);
            console.log('✅ API response received:', response);

            // Remove typing indicator
            this.hideTypingIndicator();

            // Add bot response
            this.addMessageToChat('assistant', response.message);
            this.chatHistory.push({ role: 'assistant', content: response.message });

        } catch (error) {
            console.error('❌ Chatbot error:', error);
            this.hideTypingIndicator();
            this.addMessageToChat('assistant', 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.');
        }
    }

    async sendMessageToAPI(message, history) {
        try {
            console.log('🔗 Making API request to:', 'http://localhost:3000/api/chat');
            console.log('📦 Request payload:', {
                messages: [
                    ...history.map(msg => ({ role: msg.role, content: msg.content })),
                    { role: 'user', content: message }
                ]
            });

            const response = await fetch('http://localhost:3000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        ...history.map(msg => ({ role: msg.role, content: msg.content })),
                        { role: 'user', content: message }
                    ]
                })
            });

            console.log('📡 Response status:', response.status, response.statusText);

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            console.log('✅ API response:', result);
            return result;
        } catch (error) {
            console.error('❌ API Error:', error);

            // Fallback responses
            console.log('🔄 Using fallback response');
            return this.getFallbackResponse(message);
        }
    }

    getFallbackResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('menu') || lowerMessage.includes('món ăn') || lowerMessage.includes('thực đơn')) {
            return {
                message: "Nhà hàng Phương Nam có nhiều món ăn đặc sắc như:\n• Cá lóc nướng trui - 185.000đ\n• Lẩu mắm - 250.000đ\n• Bánh xèo miền Tây - 95.000đ\n• Sườn nướng chao - 165.000đ\n\nBạn có thể xem thực đơn đầy đủ tại trang Menu của chúng tôi!"
            };
        }
        
        if (lowerMessage.includes('đặt bàn') || lowerMessage.includes('reservation')) {
            return {
                message: "Để đặt bàn, bạn có thể:\n• Gọi điện: 028 1234 5678\n• Đặt online qua website\n• Ghé trực tiếp: 123 Nguyễn Văn Linh, Quận 7, TP.HCM\n\nChúng tôi mở cửa từ 10:00 - 22:00 hàng ngày!"
            };
        }
        
        if (lowerMessage.includes('giá') || lowerMessage.includes('price') || lowerMessage.includes('cost')) {
            return {
                message: "Giá các món ăn tại Phương Nam rất hợp lý:\n• Khai vị: 45.000đ - 85.000đ\n• Món chính: 95.000đ - 250.000đ\n• Đồ uống: 30.000đ - 45.000đ\n\nHiện tại có khuyến mãi giảm 20% cho nhóm từ 4 người vào thứ 3-5!"
            };
        }
        
        if (lowerMessage.includes('địa chỉ') || lowerMessage.includes('address') || lowerMessage.includes('location')) {
            return {
                message: "Địa chỉ nhà hàng Phương Nam:\n📍 123 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh\n📞 028 1234 5678\n📧 contact@phuongnam.com\n\nChúng tôi rất mong được phục vụ bạn!"
            };
        }
        
        return {
            message: "Cảm ơn bạn đã liên hệ! Tôi có thể giúp bạn về:\n• Thông tin thực đơn và giá cả\n• Hướng dẫn đặt bàn\n• Địa chỉ và giờ mở cửa\n• Các chương trình khuyến mãi\n\nBạn muốn biết thêm về điều gì?"
        };
    }

    addMessageToChat(role, content) {
        const chatMessages = document.getElementById('chatbotMessages');
        if (!chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `flex ${role === 'assistant' ? 'justify-start' : 'justify-end'} mb-3`;
        
        const messageBubble = document.createElement('div');
        messageBubble.className = `p-3 rounded-2xl shadow-md inline-block max-w-[80%] ${
            role === 'assistant' 
                ? 'bg-white text-gray-800' 
                : 'bg-gradient-to-r from-green-400 to-blue-500 text-white'
        }`;
        
        // Handle line breaks in message
        const formattedContent = content.replace(/\n/g, '<br>');
        messageBubble.innerHTML = `<p>${formattedContent}</p>`;
        
        messageDiv.appendChild(messageBubble);
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    showTypingIndicator() {
        const chatMessages = document.getElementById('chatbotMessages');
        if (!chatMessages) return;

        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.className = 'flex justify-start mb-3';
        
        typingDiv.innerHTML = `
            <div class="bg-gray-200 p-3 rounded-2xl shadow-md inline-block">
                <div class="flex space-x-1">
                    <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                    <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                </div>
            </div>
        `;
        
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait for components to load
    setTimeout(() => {
        window.chatbot = new Chatbot();
    }, 1000);
});

// Export for global use
window.Chatbot = Chatbot;
