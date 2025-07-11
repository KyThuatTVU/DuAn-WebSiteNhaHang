const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET /api/khachhang - Get all customers
router.get('/', async (req, res) => {
  console.log('🔍 GET /api/khachhang called');
  
  try {
    // Mock data for now (since database connection issues)
    const mockCustomers = [
      {
        id: 1,
        full_name: 'Nguyễn Văn A',
        email: 'nguyenvana@email.com',
        phone: '0987654321',
        address: '123 Đường ABC, Quận 1, TP.HCM',
        created_at: '2024-01-15T10:30:00.000Z'
      },
      {
        id: 2,
        full_name: 'Trần Thị B',
        email: 'tranthib@email.com',
        phone: '0976543210',
        address: '456 Đường XYZ, Quận 2, TP.HCM',
        created_at: '2024-01-16T14:20:00.000Z'
      },
      {
        id: 3,
        full_name: 'Lê Văn C',
        email: 'levanc@email.com',
        phone: '0965432109',
        address: '789 Đường DEF, Quận 3, TP.HCM',
        created_at: '2024-01-17T09:15:00.000Z'
      },
      {
        id: 6,
        full_name: 'Nguyễn Huỳnh Kỳ Thuật Thuật',
        email: 'nguyenhuynhkithuat84tv@gmail.com',
        phone: '0123456789',
        address: 'Trà Vinh, Việt Nam',
        created_at: '2024-01-20T16:45:00.000Z'
      }
    ];

    console.log('✅ Returning mock customers:', mockCustomers.length);
    
    res.json({
      success: true,
      message: 'Lấy danh sách khách hàng thành công (Mock data)',
      data: mockCustomers,
      total: mockCustomers.length
    });

  } catch (error) {
    console.error('❌ Error in GET /api/khachhang:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách khách hàng',
      error: error.message
    });
  }
});

// GET /api/khachhang/:id - Get customer by ID
router.get('/:id', async (req, res) => {
  console.log('🔍 GET /api/khachhang/:id called with ID:', req.params.id);
  
  try {
    const customerId = parseInt(req.params.id);
    
    // Mock data for specific customers
    const mockCustomers = {
      1: {
        id: 1,
        full_name: 'Nguyễn Văn A',
        email: 'nguyenvana@email.com',
        phone: '0987654321',
        address: '123 Đường ABC, Quận 1, TP.HCM',
        created_at: '2024-01-15T10:30:00.000Z'
      },
      2: {
        id: 2,
        full_name: 'Trần Thị B',
        email: 'tranthib@email.com',
        phone: '0976543210',
        address: '456 Đường XYZ, Quận 2, TP.HCM',
        created_at: '2024-01-16T14:20:00.000Z'
      },
      3: {
        id: 3,
        full_name: 'Lê Văn C',
        email: 'levanc@email.com',
        phone: '0965432109',
        address: '789 Đường DEF, Quận 3, TP.HCM',
        created_at: '2024-01-17T09:15:00.000Z'
      },
      6: {
        id: 6,
        full_name: 'Nguyễn Huỳnh Kỳ Thuật Thuật',
        email: 'nguyenhuynhkithuat84tv@gmail.com',
        phone: '0123456789',
        address: 'Trà Vinh, Việt Nam',
        created_at: '2024-01-20T16:45:00.000Z'
      }
    };

    const customer = mockCustomers[customerId];
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khách hàng với ID này',
        data: null
      });
    }

    console.log('✅ Found customer:', customer);
    
    res.json({
      success: true,
      message: 'Lấy thông tin khách hàng thành công',
      data: customer
    });

  } catch (error) {
    console.error('❌ Error in GET /api/khachhang/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin khách hàng',
      error: error.message
    });
  }
});

// POST /api/khachhang/login - Simple login check
router.post('/login', async (req, res) => {
  console.log('🔍 POST /api/khachhang/login called');
  console.log('📨 Request body:', req.body);
  
  try {
    const { email, phone } = req.body;
    
    // Mock login - find customer by email or phone
    const mockCustomers = [
      {
        id: 1,
        full_name: 'Nguyễn Văn A',
        email: 'nguyenvana@email.com',
        phone: '0987654321',
        address: '123 Đường ABC, Quận 1, TP.HCM'
      },
      {
        id: 6,
        full_name: 'Nguyễn Huỳnh Kỳ Thuật Thuật',
        email: 'nguyenhuynhkithuat84tv@gmail.com',
        phone: '0123456789',
        address: 'Trà Vinh, Việt Nam'
      }
    ];

    const customer = mockCustomers.find(c => 
      c.email === email || c.phone === phone
    );

    if (customer) {
      console.log('✅ Customer found:', customer);
      res.json({
        success: true,
        message: 'Đăng nhập thành công',
        data: customer
      });
    } else {
      console.log('❌ Customer not found');
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy khách hàng với thông tin này',
        data: null
      });
    }

  } catch (error) {
    console.error('❌ Error in POST /api/khachhang/login:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng nhập',
      error: error.message
    });
  }
});

module.exports = router;
