// AI Service - Gemini & Groq Integration
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');
const { logger } = require('../utils/logger');
const { AppError } = require('../utils/helpers');

class AIService {
  constructor() {
    // Initialize Gemini AI
    this.geminiApiKey = process.env.GEMINI_API_KEY;
    this.gemini = this.geminiApiKey ? new GoogleGenerativeAI(this.geminiApiKey) : null;
    
    // Initialize Groq AI
    this.groqApiKey = process.env.GROQ_API_KEY;
    this.groq = this.groqApiKey ? new Groq({ apiKey: this.groqApiKey }) : null;
    
    // Default model configurations
    this.geminiModel = 'gemini-1.5-flash';
    this.groqModel = 'llama3-8b-8192';
    
    // Restaurant context for AI responses
    this.restaurantContext = `
Bạn là trợ lý AI của nhà hàng "Ẩm Thực Phương Nam" - một nhà hàng chuyên về các món ăn truyền thống miền Nam Việt Nam.

Thông tin về nhà hàng:
- Tên: Ẩm Thực Phương Nam
- Chuyên môn: Các món ăn truyền thống miền Nam
- Phong cách: Ấm cúng, thân thiện, hương vị đậm đà
- Đặc sản: Phở, Bún bò Huế, Bánh xèo, Gỏi cuốn, Cơm tấm, Bánh khọt

Vai trò của bạn:
1. Tư vấn món ăn cho khách hàng
2. Giải thích về các món ăn, nguyên liệu, cách chế biến
3. Đề xuất combo món ăn phù hợp
4. Trả lời các câu hỏi về nhà hàng
5. Hỗ trợ đặt bàn và thông tin liên hệ

Phong cách trả lời:
- Thân thiện, nhiệt tình
- Sử dụng tiếng Việt
- Ngắn gọn nhưng đầy đủ thông tin
- Luôn gợi ý thêm món ăn hoặc dịch vụ khác
`;

    this.initializeServices();
  }

  initializeServices() {
    if (this.gemini) {
      logger.info('✅ Gemini AI service initialized');
    } else {
      logger.warn('⚠️ Gemini API key not found. Set GEMINI_API_KEY in .env');
    }

    if (this.groq) {
      logger.info('✅ Groq AI service initialized');
    } else {
      logger.warn('⚠️ Groq API key not found. Set GROQ_API_KEY in .env');
    }

    if (!this.gemini && !this.groq) {
      logger.error('❌ No AI services available. Please configure API keys.');
    }
  }

  /**
   * Generate chat response using available AI service
   * @param {Array} messages - Chat history
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} AI response
   */
  async generateChatResponse(messages, options = {}) {
    try {
      const { 
        useGroq = false, 
        temperature = 0.7,
        maxTokens = 1000 
      } = options;

      // Try Groq first if requested or Gemini is not available
      if (useGroq || !this.gemini) {
        if (this.groq) {
          return await this.generateGroqResponse(messages, { temperature, maxTokens });
        }
      }

      // Fallback to Gemini
      if (this.gemini) {
        return await this.generateGeminiResponse(messages, { temperature, maxTokens });
      }

      throw new Error('No AI service available');

    } catch (error) {
      logger.error('AI Service Error:', error);
      return this.getFallbackResponse();
    }
  }

  /**
   * Generate response using Gemini AI
   */
  async generateGeminiResponse(messages, options = {}) {
    try {
      const model = this.gemini.getGenerativeModel({ 
        model: this.geminiModel,
        generationConfig: {
          temperature: options.temperature || 0.7,
          maxOutputTokens: options.maxTokens || 1000,
        }
      });

      // Convert messages to Gemini format
      const prompt = this.buildGeminiPrompt(messages);
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      logger.info('✅ Gemini response generated successfully');

      return {
        success: true,
        message: text,
        provider: 'gemini',
        model: this.geminiModel
      };

    } catch (error) {
      logger.error('Gemini API Error:', error);
      throw error;
    }
  }

  /**
   * Generate response using Groq AI
   */
  async generateGroqResponse(messages, options = {}) {
    try {
      // Convert messages to Groq format
      const groqMessages = this.buildGroqMessages(messages);

      const completion = await this.groq.chat.completions.create({
        messages: groqMessages,
        model: this.groqModel,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 1000,
        top_p: 1,
        stream: false
      });

      const responseText = completion.choices[0]?.message?.content || '';

      logger.info('✅ Groq response generated successfully');

      return {
        success: true,
        message: responseText,
        provider: 'groq',
        model: this.groqModel
      };

    } catch (error) {
      logger.error('Groq API Error:', error);
      throw error;
    }
  }

  /**
   * Build prompt for Gemini AI
   */
  buildGeminiPrompt(messages) {
    let prompt = this.restaurantContext + '\n\n';
    
    // Add conversation history
    messages.forEach(msg => {
      if (msg.role === 'user') {
        prompt += `Khách hàng: ${msg.content}\n`;
      } else if (msg.role === 'assistant') {
        prompt += `Trợ lý: ${msg.content}\n`;
      }
    });

    prompt += '\nTrợ lý: ';
    return prompt;
  }

  /**
   * Build messages for Groq AI
   */
  buildGroqMessages(messages) {
    const groqMessages = [
      {
        role: 'system',
        content: this.restaurantContext
      }
    ];

    // Add conversation history
    messages.forEach(msg => {
      groqMessages.push({
        role: msg.role,
        content: msg.content
      });
    });

    return groqMessages;
  }

  /**
   * Generate food description using AI
   */
  async generateFoodDescription(foodName, ingredients = '', category = '') {
    try {
      const prompt = `
Tạo mô tả hấp dẫn cho món ăn "${foodName}" của nhà hàng Ẩm Thực Phương Nam.

Thông tin món ăn:
- Tên món: ${foodName}
- Nguyên liệu: ${ingredients || 'Không có thông tin'}
- Danh mục: ${category || 'Không có thông tin'}

Yêu cầu:
- Mô tả ngắn gọn (2-3 câu)
- Nhấn mạnh hương vị đặc trưng
- Phong cách miền Nam
- Tạo cảm giác thèm ăn

Chỉ trả về mô tả, không cần thêm thông tin khác.
`;

      const messages = [{ role: 'user', content: prompt }];
      const response = await this.generateChatResponse(messages, { temperature: 0.8 });

      return response.success ? response.message : null;

    } catch (error) {
      logger.error('Error generating food description:', error);
      return null;
    }
  }

  /**
   * Get fallback response when AI services fail
   */
  getFallbackResponse() {
    const fallbackResponses = [
      'Xin lỗi, tôi đang gặp một chút vấn đề kỹ thuật. Bạn có thể liên hệ trực tiếp với nhà hàng để được hỗ trợ tốt nhất.',
      'Hiện tại hệ thống đang bảo trì. Vui lòng thử lại sau hoặc gọi điện đến nhà hàng để được tư vấn.',
      'Tôi đang không thể trả lời ngay bây giờ. Bạn có thể xem menu trên website hoặc liên hệ nhà hàng trực tiếp.',
      'Xin lỗi vì sự bất tiện. Để được hỗ trợ nhanh nhất, vui lòng liên hệ với nhân viên nhà hàng.'
    ];

    const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];

    return {
      success: true,
      message: randomResponse,
      provider: 'fallback',
      model: 'static'
    };
  }

  /**
   * Get service status
   */
  getServiceStatus() {
    return {
      gemini: {
        available: !!this.gemini,
        model: this.geminiModel,
        configured: !!this.geminiApiKey
      },
      groq: {
        available: !!this.groq,
        model: this.groqModel,
        configured: !!this.groqApiKey
      }
    };
  }
}

module.exports = new AIService();
