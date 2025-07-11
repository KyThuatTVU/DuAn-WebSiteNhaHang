const express = require('express');
const router = express.Router();
const { pool, executeQuery } = require('../config/database');

// Validation helper functions
const validateInvoiceData = (data) => {
  const errors = [];

  // Validate id_khach
  if (!data.id_khach) {
    errors.push('ID khách hàng là bắt buộc');
  }

  // Validate loai_don
  if (!data.loai_don || !['tai_cho', 'giao_hang'].includes(data.loai_don)) {
    errors.push('Loại đơn phải là "tai_cho" hoặc "giao_hang"');
  }

  // Validate tong_tien
  if (!data.tong_tien || isNaN(data.tong_tien) || parseFloat(data.tong_tien) <= 0) {
    errors.push('Tổng tiền phải là số dương');
  }

  // Validate dia_chi_giao_hang for delivery orders
  if (data.loai_don === 'giao_hang' && !data.dia_chi_giao_hang) {
    errors.push('Địa chỉ giao hàng là bắt buộc cho đơn giao hàng');
  }

  // Validate cart_items
  if (!data.cart_items || !Array.isArray(data.cart_items) || data.cart_items.length === 0) {
    errors.push('Giỏ hàng không được trống');
  }

  // Validate each cart item
  if (data.cart_items) {
    data.cart_items.forEach((item, index) => {
      if (!item.id || !item.name || !item.price || !item.quantity) {
        errors.push(`Món ăn thứ ${index + 1} thiếu thông tin`);
      }
      if (isNaN(item.price) || parseFloat(item.price) <= 0) {
        errors.push(`Giá món ăn thứ ${index + 1} không hợp lệ`);
      }
      if (isNaN(item.quantity) || parseInt(item.quantity) <= 0) {
        errors.push(`Số lượng món ăn thứ ${index + 1} không hợp lệ`);
      }
    });
  }

  return errors;
};

// POST /api/hoadon - Create new invoice (MOCK DATABASE VERSION)
router.post('/', async (req, res) => {
  console.log('🔍 POST /api/hoadon called - MOCK DATABASE VERSION');
  console.log('📨 Request body:', req.body);

  try {
    const data = req.body;

    // Validate input data
    const validationErrors = validateInvoiceData(data);
    if (validationErrors.length > 0) {
      console.log('❌ Validation errors:', validationErrors);
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: validationErrors
      });
    }

    // Simulate database operations with mock data
    console.log('🎭 Simulating database transaction...');

    // Generate mock invoice ID (simulating AUTO_INCREMENT)
    const mockHoaDonId = Math.floor(Math.random() * 1000) + 1;
    console.log('✅ Mock hóa đơn created with ID:', mockHoaDonId);

    // Simulate inserting cart items
    const cartItems = data.cart_items || [];
    const mockChiTietHoaDon = [];

    for (let i = 0; i < cartItems.length; i++) {
      const item = cartItems[i];
      const itemPrice = item.price || 0;
      const itemQuantity = item.quantity || 1;
      const thanhTien = itemPrice * itemQuantity;

      const mockChiTiet = {
        id_ct: i + 1,
        id_hoa_don: mockHoaDonId,
        id_mon: item.id || 1,
        so_luong: itemQuantity,
        don_gia: itemPrice,
        thanh_tien: thanhTien,
        created_at: new Date().toISOString()
      };

      mockChiTietHoaDon.push(mockChiTiet);
      console.log(`✅ Mock chi tiết created: ${item.name} x${itemQuantity} = ${thanhTien}đ`);
    }

    console.log('✅ Mock transaction completed successfully');

    // Determine status based on payment method
    let trangThai = 'cho_xac_nhan';
    if (data.payment_method === 'bank_transfer') {
      trangThai = data.payment_status === 'pending_approval' ? 'cho_duyet' : 'cho_xac_nhan';
    }

    // Prepare response (simulating database structure)
    const response = {
      success: true,
      message: 'Tạo hóa đơn thành công! (Mock Database)',
      data: {
        invoice: {
          id_hoa_don: mockHoaDonId,
          id_khach: data.id_khach || 1,
          loai_don: data.loai_don || 'tai_cho',
          trang_thai: trangThai,
          tong_tien: data.tong_tien || 0,
          dia_chi_giao_hang: data.dia_chi_giao_hang || null,
          ghi_chu: data.ghi_chu || null,
          payment_method: data.payment_method || 'cash',
          payment_status: data.payment_status || 'completed',
          ngay_tao: new Date().toISOString()
        },
        details: cartItems.map((item, index) => ({
          id_ct: index + 1,
          id_hoa_don: mockHoaDonId,
          id_mon: item.id || 1,
          ten_mon: item.name || `Món ăn ${index + 1}`,
          so_luong: item.quantity || 1,
          don_gia: item.price || 0,
          thanh_tien: (item.price || 0) * (item.quantity || 1)
        })),
        id: mockHoaDonId,
        // Additional info for demo
        database_simulation: {
          hoa_don_table: {
            id_hoa_don: mockHoaDonId,
            id_khach: data.id_khach || 1,
            ngay_tao: new Date().toISOString(),
            loai_don: data.loai_don || 'tai_cho',
            trang_thai: 'cho_xac_nhan',
            tong_tien: data.tong_tien || 0,
            dia_chi_giao_hang: data.dia_chi_giao_hang || null,
            ghi_chu: data.ghi_chu || null
          },
          chi_tiet_hoa_don_table: mockChiTietHoaDon
        }
      }
    };

    console.log('✅ Mock database response prepared');
    console.log('📊 Simulated hoa_don table insert:', response.data.database_simulation.hoa_don_table);
    console.log('📊 Simulated chi_tiet_hoa_don table inserts:', response.data.database_simulation.chi_tiet_hoa_don_table.length, 'records');

    res.status(201).json(response);

  } catch (error) {
    console.error('❌ Unexpected error in POST /api/hoadon:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server không xác định',
      error: error.message
    });
  }
});

// GET /api/hoadon - Get all invoices with pagination and filters
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    const status = req.query.status;
    const date = req.query.date;
    const customerId = req.query.customer_id;
    
    let whereConditions = [];
    let params = [];
    
    if (status) {
      whereConditions.push('h.trang_thai = ?');
      params.push(status);
    }
    
    if (date) {
      whereConditions.push('DATE(h.ngay_tao) = ?');
      params.push(date);
    }
    
    if (customerId) {
      whereConditions.push('h.id_khach = ?');
      params.push(customerId);
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM hoa_don h 
      LEFT JOIN khach_hang k ON h.id_khach = k.id 
      ${whereClause}
    `;
    const countResult = await executeQuery(countQuery, params);
    const total = countResult.success ? countResult.data[0].total : 0;
    
    // Get invoices
    const selectQuery = `
      SELECT h.*, k.full_name, k.email, k.phone 
      FROM hoa_don h 
      LEFT JOIN khach_hang k ON h.id_khach = k.id 
      ${whereClause} 
      ORDER BY h.ngay_tao DESC 
      LIMIT ? OFFSET ?
    `;
    const selectParams = [...params, limit, offset];
    const result = await executeQuery(selectQuery, selectParams);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } else {
      throw new Error(result.error);
    }

  } catch (error) {
    console.error('Error getting invoices:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi lấy danh sách hóa đơn'
    });
  }
});

// GET /api/hoadon/:id - Get single invoice with details
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID không hợp lệ'
      });
    }

    // Get invoice
    const invoiceQuery = `
      SELECT h.*, k.full_name, k.email, k.phone 
      FROM hoa_don h 
      LEFT JOIN khach_hang k ON h.id_khach = k.id 
      WHERE h.id_hoa_don = ?
    `;
    const invoiceResult = await executeQuery(invoiceQuery, [id]);
    
    if (!invoiceResult.success || invoiceResult.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hóa đơn'
      });
    }

    // Get invoice details
    const detailsQuery = `
      SELECT ct.*, m.ten_mon, m.hinh_anh
      FROM chi_tiet_hoa_don ct
      LEFT JOIN mon_an m ON ct.id_mon = m.id
      WHERE ct.id_hoa_don = ?
    `;
    const detailsResult = await executeQuery(detailsQuery, [id]);
    
    res.json({
      success: true,
      data: {
        invoice: invoiceResult.data[0],
        details: detailsResult.success ? detailsResult.data : []
      }
    });

  } catch (error) {
    console.error('Error getting invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi lấy thông tin hóa đơn'
    });
  }
});

// PUT /api/hoadon/:id/status - Update invoice status
router.put('/:id/status', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { trang_thai } = req.body;
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID không hợp lệ'
      });
    }

    if (!trang_thai || !['cho_xac_nhan', 'dang_phuc_vu', 'hoan_thanh', 'da_huy'].includes(trang_thai)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ'
      });
    }

    // Check if invoice exists
    const checkQuery = 'SELECT * FROM hoa_don WHERE id_hoa_don = ?';
    const checkResult = await executeQuery(checkQuery, [id]);
    
    if (!checkResult.success || checkResult.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hóa đơn'
      });
    }

    // Update status
    const updateQuery = 'UPDATE hoa_don SET trang_thai = ? WHERE id_hoa_don = ?';
    const result = await executeQuery(updateQuery, [trang_thai, id]);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Cập nhật trạng thái thành công'
      });
    } else {
      throw new Error(result.error);
    }

  } catch (error) {
    console.error('Error updating invoice status:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi cập nhật trạng thái'
    });
  }
});

// PUT /api/hoadon/:id/approve - Admin approve invoice
router.put('/:id/approve', async (req, res) => {
  console.log('🔍 PUT /api/hoadon/:id/approve called with ID:', req.params.id);
  console.log('📨 Request body:', req.body);

  try {
    const invoiceId = parseInt(req.params.id);
    const { action } = req.body; // 'approve' or 'reject'

    // Mock approval process
    console.log(`🎭 Mock ${action} invoice ID:`, invoiceId);

    let newStatus = 'cho_xac_nhan';
    let message = 'Hóa đơn đã được xử lý';

    if (action === 'approve') {
      newStatus = 'da_duyet';
      message = 'Hóa đơn đã được duyệt thành công!';
    } else if (action === 'reject') {
      newStatus = 'da_huy';
      message = 'Hóa đơn đã bị từ chối!';
    }

    console.log(`✅ Mock invoice ${invoiceId} status changed to:`, newStatus);

    const response = {
      success: true,
      message: message,
      data: {
        id_hoa_don: invoiceId,
        trang_thai: newStatus,
        updated_at: new Date().toISOString(),
        approved_by: 'admin', // Mock admin user
        action: action
      }
    };

    console.log('✅ Approval response prepared:', response);
    res.json(response);

  } catch (error) {
    console.error('❌ Error in PUT /api/hoadon/:id/approve:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xử lý duyệt hóa đơn',
      error: error.message
    });
  }
});

module.exports = router;
