#!/usr/bin/env node
// Simple test server để kiểm tra API endpoints

const http = require('http');
const url = require('url');

const PORT = 3000;

// Mock data
let reservations = [
  {
    id_datban: 1,
    ten_khach: "Nguyễn Văn A",
    sdt: "0987654321",
    email: "test@example.com",
    ngay: "2024-12-25",
    gio: "19:00:00",
    so_luong_khach: 4,
    ghi_chu: "Bàn gần cửa sổ",
    trang_thai: "cho_xac_nhan",
    created_at: new Date().toISOString()
  }
];

// Helper functions
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data, null, 2));
}

function parseBody(req, callback) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    try {
      const data = body ? JSON.parse(body) : {};
      callback(null, data);
    } catch (error) {
      callback(error, null);
    }
  });
}

// Server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;
  
  console.log(`📥 ${method} ${path}`);
  
  // Handle CORS preflight
  if (method === 'OPTIONS') {
    sendJSON(res, 200, { message: 'CORS OK' });
    return;
  }
  
  // Routes
  if (path === '/api/health') {
    sendJSON(res, 200, {
      success: true,
      message: 'Server is healthy',
      timestamp: new Date().toISOString()
    });
    return;
  }
  
  if (path === '/api/datban') {
    if (method === 'GET') {
      // GET /api/datban - List reservations
      sendJSON(res, 200, {
        success: true,
        message: 'Lấy danh sách đặt bàn thành công',
        data: reservations,
        total: reservations.length,
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    if (method === 'POST') {
      // POST /api/datban - Create reservation
      parseBody(req, (error, data) => {
        if (error) {
          sendJSON(res, 400, {
            success: false,
            message: 'Invalid JSON data'
          });
          return;
        }
        
        const newReservation = {
          id_datban: reservations.length + 1,
          ...data,
          trang_thai: 'cho_xac_nhan',
          created_at: new Date().toISOString()
        };
        
        reservations.push(newReservation);
        
        sendJSON(res, 201, {
          success: true,
          message: 'Đặt bàn thành công',
          data: newReservation,
          timestamp: new Date().toISOString()
        });
      });
      return;
    }
  }
  
  // Handle /api/datban/:id
  const datbanIdMatch = path.match(/^\/api\/datban\/(\d+)$/);
  if (datbanIdMatch) {
    const id = parseInt(datbanIdMatch[1]);
    const reservation = reservations.find(r => r.id_datban === id);
    
    if (method === 'GET') {
      // GET /api/datban/:id
      if (reservation) {
        sendJSON(res, 200, {
          success: true,
          data: reservation,
          timestamp: new Date().toISOString()
        });
      } else {
        sendJSON(res, 404, {
          success: false,
          message: 'Không tìm thấy đặt bàn'
        });
      }
      return;
    }
    
    if (method === 'PUT') {
      // PUT /api/datban/:id - Update reservation
      parseBody(req, (error, data) => {
        if (error) {
          sendJSON(res, 400, {
            success: false,
            message: 'Invalid JSON data'
          });
          return;
        }
        
        if (reservation) {
          Object.assign(reservation, data, {
            updated_at: new Date().toISOString()
          });
          
          sendJSON(res, 200, {
            success: true,
            message: 'Cập nhật đặt bàn thành công',
            data: reservation,
            timestamp: new Date().toISOString()
          });
        } else {
          sendJSON(res, 404, {
            success: false,
            message: 'Không tìm thấy đặt bàn'
          });
        }
      });
      return;
    }
    
    if (method === 'DELETE') {
      // DELETE /api/datban/:id
      if (reservation) {
        const index = reservations.findIndex(r => r.id_datban === id);
        reservations.splice(index, 1);
        
        sendJSON(res, 200, {
          success: true,
          message: 'Xóa đặt bàn thành công',
          data: { id_datban: id, deleted_at: new Date().toISOString() },
          timestamp: new Date().toISOString()
        });
      } else {
        sendJSON(res, 404, {
          success: false,
          message: 'Không tìm thấy đặt bàn'
        });
      }
      return;
    }
  }
  
  // Handle /api/datban/:id/status
  const statusMatch = path.match(/^\/api\/datban\/(\d+)\/status$/);
  if (statusMatch && method === 'PATCH') {
    const id = parseInt(statusMatch[1]);
    const reservation = reservations.find(r => r.id_datban === id);
    
    parseBody(req, (error, data) => {
      if (error) {
        sendJSON(res, 400, {
          success: false,
          message: 'Invalid JSON data'
        });
        return;
      }
      
      if (reservation) {
        reservation.trang_thai = data.trang_thai || reservation.trang_thai;
        reservation.updated_at = new Date().toISOString();
        
        sendJSON(res, 200, {
          success: true,
          message: 'Cập nhật trạng thái thành công',
          data: reservation,
          timestamp: new Date().toISOString()
        });
      } else {
        sendJSON(res, 404, {
          success: false,
          message: 'Không tìm thấy đặt bàn'
        });
      }
    });
    return;
  }
  
  // 404 for other routes
  sendJSON(res, 404, {
    success: false,
    message: 'API endpoint not found',
    path: path,
    method: method
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Test Server running on http://localhost:${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   GET    /api/health`);
  console.log(`   GET    /api/datban`);
  console.log(`   POST   /api/datban`);
  console.log(`   GET    /api/datban/:id`);
  console.log(`   PUT    /api/datban/:id`);
  console.log(`   DELETE /api/datban/:id`);
  console.log(`   PATCH  /api/datban/:id/status`);
  console.log(`\n✅ Tất cả phương thức RESTful đã sẵn sàng!`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
