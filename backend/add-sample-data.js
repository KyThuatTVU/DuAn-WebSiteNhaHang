const mysql = require('mysql2/promise');
require('dotenv').config();

async function addSampleData() {
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

        // Thêm dữ liệu hóa đơn mẫu
        const invoiceQuery = `
            INSERT INTO hoa_don (id_khach, ngay_tao, loai_don, trang_thai, tong_tien, dia_chi_giao_hang, ghi_chu) 
            VALUES 
            (17, '2025-04-20 18:30:00', 'tai_cho', 'hoan_thanh', 355000, NULL, 'Đơn hàng tại chỗ'),
            (17, '2025-04-21 19:15:00', 'giao_hang', 'dang_phuc_vu', 245000, '123 Đường ABC, Quận 1, TP.HCM', 'Giao hàng tận nơi'),
            (17, '2025-04-22 12:00:00', 'tai_cho', 'cho_xac_nhan', 540000, NULL, 'Đơn hàng mới')
        `;

        const [invoiceResult] = await connection.execute(invoiceQuery);
        console.log('✅ Đã thêm', invoiceResult.affectedRows, 'hóa đơn mẫu');

        // Lấy ID của các hóa đơn vừa tạo
        const [invoices] = await connection.execute(
            'SELECT id_hoa_don FROM hoa_don WHERE id_khach = 17 ORDER BY id_hoa_don DESC LIMIT 3'
        );

        // Thêm chi tiết hóa đơn
        for (let i = 0; i < invoices.length; i++) {
            const invoiceId = invoices[i].id_hoa_don;
            
            let detailQuery;
            if (i === 0) { // Hóa đơn đầu tiên
                detailQuery = `
                    INSERT INTO chi_tiet_hoa_don (id_hoa_don, id_mon_an, ten_mon, gia, so_luong, thanh_tien)
                    VALUES 
                    (${invoiceId}, 1, 'Phở Bò Tái', 85000, 2, 170000),
                    (${invoiceId}, 2, 'Bún Bò Huế', 75000, 1, 75000),
                    (${invoiceId}, 3, 'Cơm Tấm Sườn', 65000, 1, 65000),
                    (${invoiceId}, 10, 'Trà Đá', 15000, 3, 45000)
                `;
            } else if (i === 1) { // Hóa đơn thứ hai
                detailQuery = `
                    INSERT INTO chi_tiet_hoa_don (id_hoa_don, id_mon_an, ten_mon, gia, so_luong, thanh_tien)
                    VALUES 
                    (${invoiceId}, 4, 'Bánh Mì Thịt Nướng', 35000, 2, 70000),
                    (${invoiceId}, 5, 'Chả Giò', 45000, 2, 90000),
                    (${invoiceId}, 8, 'Nước Cam', 25000, 1, 25000),
                    (${invoiceId}, 9, 'Cà Phê Sữa', 30000, 2, 60000)
                `;
            } else { // Hóa đơn thứ ba
                detailQuery = `
                    INSERT INTO chi_tiet_hoa_don (id_hoa_don, id_mon_an, ten_mon, gia, so_luong, thanh_tien)
                    VALUES 
                    (${invoiceId}, 1, 'Phở Bò Tái', 85000, 3, 255000),
                    (${invoiceId}, 2, 'Bún Bò Huế', 75000, 2, 150000),
                    (${invoiceId}, 6, 'Gỏi Cuốn', 40000, 2, 80000),
                    (${invoiceId}, 7, 'Nem Nướng', 55000, 1, 55000)
                `;
            }

            const [detailResult] = await connection.execute(detailQuery);
            console.log(`✅ Đã thêm ${detailResult.affectedRows} chi tiết cho hóa đơn ${invoiceId}`);
        }

        // Hiển thị dữ liệu đã thêm
        const [allInvoices] = await connection.execute(`
            SELECT 
                hd.id_hoa_don,
                hd.ngay_tao,
                hd.loai_don,
                hd.trang_thai,
                hd.tong_tien,
                hd.dia_chi_giao_hang,
                hd.ghi_chu,
                COUNT(ct.id_chi_tiet) as so_mon
            FROM hoa_don hd
            LEFT JOIN chi_tiet_hoa_don ct ON hd.id_hoa_don = ct.id_hoa_don
            WHERE hd.id_khach = 17
            GROUP BY hd.id_hoa_don
            ORDER BY hd.ngay_tao DESC
        `);

        console.log('\n📋 Danh sách hóa đơn đã thêm:');
        console.table(allInvoices);

        console.log('\n🎉 Hoàn thành thêm dữ liệu mẫu!');

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        
        if (error.code === 'ER_DUP_ENTRY') {
            console.log('ℹ️  Dữ liệu có thể đã tồn tại. Hãy kiểm tra database.');
        }
    } finally {
        if (connection) {
            await connection.end();
            console.log('✅ Đã đóng kết nối database');
        }
    }
}

// Chạy script
addSampleData();
