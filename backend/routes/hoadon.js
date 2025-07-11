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

// POST /api/hoadon - Create new invoice
router.post('/', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const data = req.body;
    console.log('📝 Received invoice data:', data);
    
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

    // Insert invoice into hoa_don table
    const insertInvoiceQuery = `
      INSERT INTO hoa_don (id_khach, loai_don, trang_thai, tong_tien, dia_chi_giao_hang, ghi_chu) 
      VALUES (?, ?, 'cho_xac_nhan', ?, ?, ?)
    `;
    
    const invoiceParams = [
      data.id_khach,
      data.loai_don,
      parseFloat(data.tong_tien),
      data.dia_chi_giao_hang || null,
      data.ghi_chu || null
    ];

    const [invoiceResult] = await connection.execute(insertInvoiceQuery, invoiceParams);
    const invoiceId = invoiceResult.insertId;

    // Insert invoice details into chi_tiet_hoa_don table
    for (const item of data.cart_items) {
      const insertDetailQuery = `
        INSERT INTO chi_tiet_hoa_don (id_hoa_don, id_mon_an, so_luong, gia_ban, thanh_tien) 
        VALUES (?, ?, ?, ?, ?)
      `;
      
      const thanhTien = parseFloat(item.price) * parseInt(item.quantity);
      const detailParams = [
        invoiceId,
        item.id,
        parseInt(item.quantity),
        parseFloat(item.price),
        thanhTien
      ];

      await connection.execute(insertDetailQuery, detailParams);
    }

    await connection.commit();

    // Get the created invoice with details
    const getInvoiceQuery = `
      SELECT h.*, k.full_name, k.email, k.phone 
      FROM hoa_don h 
      LEFT JOIN khach_hang k ON h.id_khach = k.id 
      WHERE h.id_hoa_don = ?
    `;
    const [invoiceData] = await connection.execute(getInvoiceQuery, [invoiceId]);

    // Get invoice details
    const getDetailsQuery = `
      SELECT ct.*, m.ten_mon 
      FROM chi_tiet_hoa_don ct 
      LEFT JOIN mon_an m ON ct.id_mon_an = m.id 
      WHERE ct.id_hoa_don = ?
    `;
    const [detailsData] = await connection.execute(getDetailsQuery, [invoiceId]);

    console.log('✅ Invoice created successfully:', invoiceId);
    
    res.status(201).json({
      success: true,
      message: 'Tạo hóa đơn thành công!',
      data: {
        invoice: invoiceData[0],
        details: detailsData,
        id: invoiceId
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('❌ Error creating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi tạo hóa đơn. Vui lòng thử lại sau.'
    });
  } finally {
    connection.release();
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
      LEFT JOIN mon_an m ON ct.id_mon_an = m.id 
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

module.exports = router;
