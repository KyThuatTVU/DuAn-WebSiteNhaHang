const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDatabaseStructure() {
    let connection;
    
    try {
        // Tạo kết nối database
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });

        console.log('✅ Kết nối database thành công');

        // Kiểm tra cấu trúc bảng hoa_don
        console.log('\n📋 Cấu trúc bảng hoa_don:');
        const [hoaDonStructure] = await connection.execute('DESCRIBE hoa_don');
        console.table(hoaDonStructure);

        // Kiểm tra cấu trúc bảng chi_tiet_hoa_don
        console.log('\n📋 Cấu trúc bảng chi_tiet_hoa_don:');
        const [chiTietStructure] = await connection.execute('DESCRIBE chi_tiet_hoa_don');
        console.table(chiTietStructure);

        // Kiểm tra dữ liệu hiện có
        console.log('\n📊 Dữ liệu hiện có trong hoa_don:');
        const [existingInvoices] = await connection.execute('SELECT * FROM hoa_don LIMIT 5');
        console.table(existingInvoices);

        console.log('\n📊 Dữ liệu hiện có trong chi_tiet_hoa_don:');
        const [existingDetails] = await connection.execute('SELECT * FROM chi_tiet_hoa_don LIMIT 5');
        console.table(existingDetails);

        // Kiểm tra user ID 17 có tồn tại không
        console.log('\n👤 Kiểm tra user ID 17:');
        const [user] = await connection.execute('SELECT * FROM khach_hang WHERE id = 17');
        if (user.length > 0) {
            console.log('✅ User ID 17 tồn tại:', user[0]);
        } else {
            console.log('❌ User ID 17 không tồn tại');
        }

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('✅ Đã đóng kết nối database');
        }
    }
}

// Chạy script
checkDatabaseStructure();
