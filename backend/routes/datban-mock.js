const express = require('express');
const router = express.Router();

// Mock data storage (in-memory)
let mockReservations = [];
let nextId = 1;

// Validation helper functions
const validateReservationData = (data) => {
  const errors = [];

  // Validate ten_khach
  if (!data.ten_khach || data.ten_khach.trim().length < 2) {
    errors.push('Họ tên phải có ít nhất 2 ký tự');
  }
  if (data.ten_khach && data.ten_khach.length > 100) {
    errors.push('Họ tên không được quá 100 ký tự');
  }
  if (data.ten_khach && !/^[a-zA-ZÀ-ỹ\s]+$/u.test(data.ten_khach)) {
    errors.push('Họ tên chỉ được chứa chữ cái và khoảng trắng');
  }

  // Validate sdt
  if (!data.sdt) {
    errors.push('Số điện thoại là bắt buộc');
  }
  const phone = data.sdt ? data.sdt.replace(/\s/g, '') : '';
  if (phone && !/^[0-9]{10,11}$/.test(phone)) {
    errors.push('Số điện thoại phải có 10-11 chữ số');
  }

  // Validate email if provided
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Email không đúng định dạng');
  }
  if (data.email && data.email.length > 100) {
    errors.push('Email không được quá 100 ký tự');
  }

  // Validate ngay
  if (!data.ngay) {
    errors.push('Ngày đặt bàn là bắt buộc');
  }
  if (data.ngay) {
    const reservationDate = new Date(data.ngay);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (reservationDate < today) {
      errors.push('Không thể đặt bàn cho ngày trong quá khứ');
    }
    
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    if (reservationDate > maxDate) {
      errors.push('Chỉ có thể đặt bàn trong vòng 30 ngày tới');
    }
  }

  // Validate gio
  if (!data.gio) {
    errors.push('Giờ đặt bàn là bắt buộc');
  }
  if (data.gio) {
    const [hours, minutes] = data.gio.split(':').map(Number);
    if (hours < 10 || hours > 21 || (hours === 21 && minutes > 30)) {
      errors.push('Giờ đặt bàn phải trong khung 10:00 - 21:30');
    }
    
    // Check if time has passed for today
    if (data.ngay) {
      const reservationDate = new Date(data.ngay);
      const today = new Date();
      
      if (reservationDate.toDateString() === today.toDateString()) {
        const reservationTime = new Date(`${data.ngay} ${data.gio}`);
        if (reservationTime <= new Date()) {
          errors.push('Không thể đặt bàn cho giờ đã qua');
        }
      }
    }
  }

  // Validate so_luong_khach
  if (!data.so_luong_khach) {
    errors.push('Số lượng khách là bắt buộc');
  }
  const guests = parseInt(data.so_luong_khach);
  if (isNaN(guests) || guests < 1 || guests > 20) {
    errors.push('Số lượng khách phải từ 1 đến 20 người');
  }

  // Validate ghi_chu
  if (data.ghi_chu && data.ghi_chu.length > 500) {
    errors.push('Ghi chú không được quá 500 ký tự');
  }

  return errors;
};

// Check for duplicate reservations
const checkDuplicateReservation = (sdt, ngay, gio, excludeId = null) => {
  return mockReservations.some(reservation => 
    reservation.sdt === sdt && 
    reservation.ngay === ngay && 
    reservation.gio === gio && 
    reservation.trang_thai !== 'da_huy' &&
    reservation.id_datban !== excludeId
  );
};

// POST /api/datban - Create new reservation
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    
    console.log('📝 Received reservation data:', data);
    
    // Validate input data
    const validationErrors = validateReservationData(data);
    if (validationErrors.length > 0) {
      console.log('❌ Validation errors:', validationErrors);
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: validationErrors
      });
    }

    // Check for duplicate reservations
    const isDuplicate = checkDuplicateReservation(data.sdt, data.ngay, data.gio);
    if (isDuplicate) {
      console.log('❌ Duplicate reservation found');
      return res.status(400).json({
        success: false,
        message: 'Bạn đã có đặt bàn vào thời gian này rồi'
      });
    }

    // Create new reservation
    const newReservation = {
      id_datban: nextId++,
      ten_khach: data.ten_khach.trim(),
      sdt: data.sdt.trim(),
      email: data.email ? data.email.trim() : null,
      ngay: data.ngay,
      gio: data.gio,
      so_luong_khach: parseInt(data.so_luong_khach),
      ghi_chu: data.ghi_chu ? data.ghi_chu.trim() : null,
      trang_thai: 'cho_xac_nhan',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    mockReservations.push(newReservation);
    
    console.log('✅ Reservation created successfully:', newReservation);
    
    res.status(201).json({
      success: true,
      message: 'Đặt bàn thành công! Chúng tôi sẽ liên hệ xác nhận trong vòng 15 phút.',
      data: newReservation,
      id: newReservation.id_datban
    });

  } catch (error) {
    console.error('❌ Error creating reservation:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi đặt bàn. Vui lòng thử lại sau.'
    });
  }
});

// GET /api/datban - Get all reservations
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    const status = req.query.status;
    const date = req.query.date;
    const phone = req.query.phone;
    
    let filteredReservations = [...mockReservations];
    
    if (status) {
      filteredReservations = filteredReservations.filter(r => r.trang_thai === status);
    }
    
    if (date) {
      filteredReservations = filteredReservations.filter(r => r.ngay === date);
    }
    
    if (phone) {
      filteredReservations = filteredReservations.filter(r => r.sdt.includes(phone));
    }
    
    const total = filteredReservations.length;
    const paginatedReservations = filteredReservations.slice(offset, offset + limit);
    
    res.json({
      success: true,
      data: paginatedReservations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error getting reservations:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi lấy danh sách đặt bàn'
    });
  }
});

// GET /api/datban/:id - Get single reservation
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID không hợp lệ'
      });
    }

    const reservation = mockReservations.find(r => r.id_datban === id);
    
    if (reservation) {
      res.json({
        success: true,
        data: reservation
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy đặt bàn'
      });
    }

  } catch (error) {
    console.error('Error getting reservation:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi lấy thông tin đặt bàn'
    });
  }
});

module.exports = router;
