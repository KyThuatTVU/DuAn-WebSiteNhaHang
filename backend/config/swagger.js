// Swagger Configuration - Enterprise Architecture
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Restaurant API - Ẩm Thực Phương Nam',
    version: '1.0.0',
    description: `
      API quản lý nhà hàng Ẩm Thực Phương Nam
      
      ## Tính năng chính:
      - Quản lý danh mục món ăn
      - Quản lý thông tin món ăn
      - Upload và quản lý hình ảnh
      - Tích hợp AI để tạo mô tả món ăn
      - Chatbot AI hỗ trợ khách hàng
      - Tích hợp Gemini AI và Groq AI
      
      ## Xác thực:
      API sử dụng JWT tokens để xác thực. Thêm token vào header:
      \`Authorization: Bearer <your-token>\`
    `,
    contact: {
      name: 'API Support',
      email: 'support@amthucphuongnam.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000/api',
      description: 'Development server'
    },
    {
      url: 'https://api.amthucphuongnam.com/api',
      description: 'Production server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Authorization header using the Bearer scheme'
      }
    },
    schemas: {
      // Error Response Schema
      ErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          message: {
            type: 'string',
            example: 'Có lỗi xảy ra'
          },
          error: {
            type: 'string',
            example: 'Chi tiết lỗi'
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-01T00:00:00.000Z'
          }
        }
      },
      // Success Response Schema
      SuccessResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          message: {
            type: 'string',
            example: 'Thành công'
          },
          data: {
            type: 'object',
            description: 'Dữ liệu trả về'
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-01T00:00:00.000Z'
          }
        }
      },
      // Category Schema
      Category: {
        type: 'object',
        required: ['name'],
        properties: {
          id: {
            type: 'integer',
            description: 'ID danh mục',
            example: 1
          },
          name: {
            type: 'string',
            description: 'Tên danh mục',
            example: 'Món chính',
            minLength: 1,
            maxLength: 100
          },
          description: {
            type: 'string',
            description: 'Mô tả danh mục',
            example: 'Các món ăn chính của nhà hàng',
            maxLength: 500
          },
          image_url: {
            type: 'string',
            description: 'URL hình ảnh danh mục',
            example: '/images/category1.jpg'
          },
          is_active: {
            type: 'boolean',
            description: 'Trạng thái hoạt động',
            example: true
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            description: 'Thời gian tạo',
            example: '2024-01-01T00:00:00.000Z'
          },
          updated_at: {
            type: 'string',
            format: 'date-time',
            description: 'Thời gian cập nhật',
            example: '2024-01-01T00:00:00.000Z'
          }
        }
      },
      // Food Schema
      Food: {
        type: 'object',
        required: ['name', 'price', 'category_id'],
        properties: {
          id: {
            type: 'integer',
            description: 'ID món ăn',
            example: 1
          },
          name: {
            type: 'string',
            description: 'Tên món ăn',
            example: 'Phở Bò',
            minLength: 1,
            maxLength: 200
          },
          description: {
            type: 'string',
            description: 'Mô tả món ăn',
            example: 'Phở bò truyền thống với nước dùng đậm đà',
            maxLength: 1000
          },
          price: {
            type: 'number',
            format: 'decimal',
            description: 'Giá món ăn (VNĐ)',
            example: 50000,
            minimum: 0
          },
          image_url: {
            type: 'string',
            description: 'URL hình ảnh món ăn',
            example: '/images/pho-bo.jpg'
          },
          category_id: {
            type: 'integer',
            description: 'ID danh mục',
            example: 1
          },
          category_name: {
            type: 'string',
            description: 'Tên danh mục',
            example: 'Món chính'
          },
          is_available: {
            type: 'boolean',
            description: 'Trạng thái có sẵn',
            example: true
          },
          ingredients: {
            type: 'string',
            description: 'Nguyên liệu',
            example: 'Thịt bò, bánh phở, hành lá, ngò gai'
          },
          cooking_time: {
            type: 'integer',
            description: 'Thời gian chế biến (phút)',
            example: 15
          },
          calories: {
            type: 'integer',
            description: 'Lượng calo',
            example: 350
          },
          spicy_level: {
            type: 'integer',
            description: 'Độ cay (1-5)',
            example: 2,
            minimum: 1,
            maximum: 5
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            description: 'Thời gian tạo',
            example: '2024-01-01T00:00:00.000Z'
          },
          updated_at: {
            type: 'string',
            format: 'date-time',
            description: 'Thời gian cập nhật',
            example: '2024-01-01T00:00:00.000Z'
          }
        }
      }
    },
    responses: {
      UnauthorizedError: {
        description: 'Không có quyền truy cập',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse'
            },
            example: {
              success: false,
              message: 'Không có quyền truy cập',
              error: 'Token không hợp lệ',
              timestamp: '2024-01-01T00:00:00.000Z'
            }
          }
        }
      },
      NotFoundError: {
        description: 'Không tìm thấy tài nguyên',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse'
            },
            example: {
              success: false,
              message: 'Không tìm thấy tài nguyên',
              error: 'Tài nguyên không tồn tại',
              timestamp: '2024-01-01T00:00:00.000Z'
            }
          }
        }
      },
      ValidationError: {
        description: 'Lỗi validation dữ liệu',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse'
            },
            example: {
              success: false,
              message: 'Dữ liệu không hợp lệ',
              error: 'Tên món ăn không được để trống',
              timestamp: '2024-01-01T00:00:00.000Z'
            }
          }
        }
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ]
};

// Options for swagger-jsdoc
const options = {
  definition: swaggerDefinition,
  apis: [
    './routes/*.js',
    './controllers/*.js',
    './models/*.js',
    './middleware/*.js'
  ]
};

// Initialize swagger-jsdoc
const specs = swaggerJsdoc(options);

// Swagger UI options
const swaggerUiOptions = {
  explorer: true,
  swaggerOptions: {
    docExpansion: 'none',
    filter: true,
    showRequestDuration: true,
    tryItOutEnabled: true,
    requestInterceptor: (req) => {
      req.headers['Content-Type'] = 'application/json';
      return req;
    }
  },
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #2c3e50; }
    .swagger-ui .scheme-container { background: #f8f9fa; padding: 10px; border-radius: 5px; }
  `,
  customSiteTitle: 'Restaurant API Documentation',
  customfavIcon: '/images/favicon.ico'
};

module.exports = {
  specs,
  swaggerUi,
  swaggerUiOptions
};
