-- 0. Dọn sạch
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS chi_tiet_hoa_don;
DROP TABLE IF EXISTS hoa_don;
DROP TABLE IF EXISTS dat_ban;
DROP TABLE IF EXISTS mon_an;
DROP TABLE IF EXISTS khach_hang;
DROP TABLE IF EXISTS loai_mon;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Tạo CSDL
CREATE DATABASE IF NOT EXISTS QuanLyNhaHang
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE QuanLyNhaHang;

-- 2. Bảng loại món ăn
CREATE TABLE loai_mon (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  ten_loai   VARCHAR(100) NOT NULL,
  mo_ta      TEXT,
  hinh_anh   VARCHAR(255),
  thu_tu     INT DEFAULT 0,
  trang_thai ENUM('active','inactive') DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_trang_thai (trang_thai),
  INDEX idx_thu_tu (thu_tu)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Bảng khách hàng
CREATE TABLE khach_hang (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  full_name   VARCHAR(100) NOT NULL,
  email       VARCHAR(100) UNIQUE NOT NULL,
  phone       VARCHAR(20) NOT NULL,
  password    VARCHAR(255) NOT NULL,
  address     TEXT,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Bảng món ăn
CREATE TABLE mon_an (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  ten_mon    VARCHAR(100) NOT NULL,
  mo_ta      TEXT,
  gia        DECIMAL(10,2) NOT NULL,
  hinh_anh   VARCHAR(255),
  id_loai    INT NOT NULL,
  trang_thai ENUM('available','unavailable') DEFAULT 'available',
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_loai) REFERENCES loai_mon(id) ON DELETE CASCADE,
  INDEX idx_id_loai (id_loai),
  INDEX idx_trang_thai (trang_thai),
  INDEX idx_is_featured (is_featured)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng hóa đơn và chi tiết hóa đơn đã được loại bỏ
-- Sử dụng dữ liệu ảo trong frontend thay thế

-- 5. Bảng đặt bàn
CREATE TABLE dat_ban (
  id_datban      INT AUTO_INCREMENT PRIMARY KEY,
  ten_khach      VARCHAR(100) NOT NULL,
  sdt            VARCHAR(20) NOT NULL,
  email          VARCHAR(100),
  ngay           DATE NOT NULL,
  gio            TIME NOT NULL,
  so_luong_khach INT NOT NULL,
  ghi_chu        TEXT,
  trang_thai     ENUM('cho_xac_nhan','da_xac_nhan','da_huy') NOT NULL DEFAULT 'cho_xac_nhan',
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_ngay_gio (ngay, gio),
  INDEX idx_sdt (sdt),
  INDEX idx_trang_thai (trang_thai),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO loai_mon (ten_loai, mo_ta, thu_tu) VALUES
('Món Khai Vị', 'Các món khai vị hấp dẫn', 2),
('Món Chính', 'Các món ăn chính của nhà hàng', 1),
('Lẩu', 'Các món lẩu đặc sắc', 5),
('Món Tráng Miệng', 'Các món tráng miệng ngọt ngào', 3),
('Đồ Uống', 'Các loại đồ uống giải khát', 4);
-- 2. Món ăn (30 món, có id_loai đồng bộ)
INSERT INTO mon_an (id_loai, ten_mon, mo_ta, gia, hinh_anh, is_featured) VALUES
(1, 'Gỏi Ngó Sen Tôm Thịt',      'Ngó sen giòn mát hòa quyện cùng tôm tươi, thịt ba chỉ.', 85000, 'img/goingosen.jpg', FALSE),
(1, 'Chả Giò Phương Nam',        'Chả giò giòn rụm nhân tôm thịt và nấm thơm.', 75000, 'img/chagioPN.jpg', FALSE),
(2, 'Cá Lóc Nướng Trui',         'Cá lóc nướng trui phết mỡ hành, chấm mắm gừng.', 185000, 'img/calocnuongtrui.jpg', TRUE),
(3, 'Lẩu Mắm Đậm Đà',            'Lẩu mắm đặc sánh, bông điên điển, cá linh.', 250000, 'img/laumam.webp', TRUE),
(1, 'Bánh Xèo',                  'Bánh xèo vàng giòn, đầy ụ tôm thịt, rau sống.', 95000, 'img/banhxeo.jpg', TRUE),
(2, 'Cơm Tấm Sườn Nướng',        'Sườn nướng mật ong, cơm tấm mềm, trứng ốp la.', 80000, 'img/comtam.webp', TRUE),
(2, 'Hủ Tiếu Nam Vang',           'Nước dùng ngọt thanh, hủ tiếu dai với quẩy giòn.', 70000, 'img/hutieunamvang.webp', FALSE),
(2, 'Bún Bò Huế',                 'Bún bò cay nồng, giò heo và mắm ruốc đặc trưng.', 90000, 'img/bunbohue.png', FALSE),
(1, 'Bánh Khọt',                  'Bánh khọt nhỏ xinh nhân tôm, chấm mắm chua ngọt.', 85000, 'img/banhkhot.jpg', FALSE),
(1, 'Bánh Căn',                   'Bánh căn nóng hổi, nhân trứng cút hoặc mực.', 60000, 'img/banhcan.jpg', FALSE),
(2, 'Canh Chua Cá Lóc',           'Canh chua bông so đũa, dọc mùng, cá lóc thanh mát.', 120000, 'img/canhchuacaloc.jpg', FALSE),
(3, 'Lẩu Cá Kèo',                 'Lẩu cá kèo ngọt nước, khế chua và rau nhút.', 230000, 'img/laucakeo.jpg', TRUE),
(2, 'Bún Riêu Cua',               'Nước riêu cua thơm, bún tươi và chả cốm.', 75000, 'img/bunrieucua.jpg', FALSE),
(1, 'Nem Nướng Cái Răng',         'Nem nướng đậm vị, cuốn bánh tráng và rau sống.', 100000, 'img/nemnuong.jpg', FALSE),
(1, 'Gỏi Cuốn Tôm Thịt',          'Cuốn gỏi mát lành với tôm, thịt và rau sống.', 65000, 'img/goicuon.jpg', FALSE),
(2, 'Bánh Hỏi Heo Quay',          'Bánh hỏi mềm mịn kèm heo quay giòn rụm.', 120000, 'img/banhhoiheoquay.jpg', FALSE),
(2, 'Cháo Lươn Hải Phòng',        'Cháo lươn sánh mịn, thịt lươn dai ngọt.', 95000, 'img/chaoluong.jpg', FALSE),
(2, 'Bún Thịt Nướng',             'Bún tươi ăn cùng thịt nướng sả và đậu phộng.', 80000, 'img/bunthitnuong.jpg', FALSE),
(2, 'Cơm Gà Hội An',              'Cơm gà vàng ươm, kèm gỏi hành và nước chấm bí truyền.', 90000, 'img/comgahoian.jpeg', FALSE),
(2, 'Mỳ Quảng',                   'Mỳ Quảng đậm đà với tôm, thịt và bánh tráng giòn.', 85000, 'img/myquang.jpg', FALSE),
(2, 'Bánh Đa Cua',                'Bánh đa đỏ, riêu cua thơm lừng, giò heo bùi béo.', 80000, 'img/banhdacua.jpg', FALSE),
(2, 'Chả Cá Lã Vọng',             'Chả cá nghệ thơm nức, ăn cùng thì là và bún.', 150000, 'img/chacalavong.jpg', FALSE),
(3, 'Lẩu Đuôi Bò',                'Lẩu đuôi bò hầm mềm, nước dùng đậm vị.', 280000, 'img/lauduoibo.jpg', FALSE),
(2, 'Cá Kho Tộ',                  'Cá kho tộ gia truyền, thịt cá săn chắc, nước kho sóng sánh.', 130000, 'img/cakhoto.jpg', FALSE),
(2, 'Gà Nướng Muối Ớt',           'Gà nướng muối ớt, ươm mật ong, da giòn thịt mềm.', 180000, 'img/ganuongmuoiot.png', FALSE),
(1, 'Ốc Hấp Sả',                  'Ốc bươu hấp sả, chanh, thơm lừng vị miền Tây.', 95000, 'img/ochapsa.jpg', FALSE),
(1, 'Súp Cua',                    'Súp cua đặc sánh, nấm và hải sản.', 70000, 'img/supcua.jpg', FALSE),
(1, 'Bò Lá Lốt',                  'Bò cuốn lá lốt nướng than hoa, chấm mắm nêm.', 120000, 'img/bolalot.jpg', FALSE),
(1, 'Tôm Chiên Giòn',             'Tôm bọc bột giòn rụm, chấm mayonnaise cay nhẹ.', 160000, 'img/tomchiengion.jpg', FALSE),
(1, 'Gỏi Đu Đủ Thái',             'Gỏi đu đủ xanh giòn sần sật, vị chua cay đậm đà.', 75000, 'img/goidudu.jpg', FALSE),
-- Thêm một số món tráng miệng và đồ uống
(4, 'Chè Bà Ba', 'Chè bà ba ngọt mát', 20000, 'img/chebap.webp', FALSE),
(5, 'Trà Đá', 'Trà đá mát lạnh', 10000, 'img/tratac.jpg', FALSE),
(5, 'Nước Sam Lạnh', 'Nước sam giải nhiệt', 15000, 'img/nuocsamlanh.jpg', FALSE);-- 3. Khách hàng mẫu
INSERT INTO khach_hang (full_name, phone, email, password, address) VALUES
  ('Nguyễn Văn A', '0901234567', 'nguyenvana@email.com', '$2b$10$example', '123 Đường ABC, Quận 1, TP.HCM'),
  ('Trần Thị B',   '0912345678', 'tranthib@email.com', '$2b$10$example', '456 Đường XYZ, Quận 2, TP.HCM'),
  ('Lê Văn C',     '0987654321', 'levanc@email.com', '$2b$10$example', '789 Đường DEF, Quận 3, TP.HCM'),
  ('Phạm Thị D',   '0909876543', 'phamthid@email.com', '$2b$10$example', '321 Đường GHI, Quận 4, TP.HCM'),
  ('Hoàng Văn E',  '0911100112', 'hoangvane@email.com', '$2b$10$example', '654 Đường JKL, Quận 5, TP.HCM');

-- 5. Đặt bàn mẫu
INSERT INTO dat_ban 
  (ten_khach, sdt, email, ngay, gio, so_luong_khach, ghi_chu)
VALUES
  ('Nguyễn Văn A','0901234567','a@example.com','2025-05-10','18:30:00',4,'Ưu tiên góc yên tĩnh'),
  ('Trần Thị B',  '0912345678','b@example.com','2025-05-11','12:00:00',2,'Có trẻ em theo cùng'),
  ('Lê Văn C',    '0987654321','c@example.com','2025-05-12','20:15:00',6,'Chúc mừng sinh nhật');

-- 6. Hóa đơn mẫu
INSERT INTO hoa_don (id_khach, ngay_tao, loai_don, trang_thai, tong_tien) VALUES
  (1, '2025-04-20 18:30:00', 'tai_cho',     'hoan_thanh', 355000),
  (2, '2025-04-21 19:15:00', 'giao_hang',    'dang_phuc_vu',245000),
  (3, '2025-04-22 12:00:00', 'tai_cho',     'cho_xac_nhan',540000);
  ALTER TABLE hoa_don ADD COLUMN dia_chi_giao_hang TEXT AFTER tong_tien;
ALTER TABLE hoa_don ADD COLUMN ghi_chu TEXT AFTER dia_chi_giao_hang;

-- 7. Chi tiết hóa đơn (tham chiếu mon_an, hoa_don)
INSERT INTO chi_tiet_hoa_don (id_hoa_don, id_mon, so_luong, don_gia) VALUES
  -- HD #1
  (1, 1, 2, 85000),
  (1, 3, 1, 185000),
  -- HD #2
  (2, 5, 1, 95000),
  (2, 2, 2, 75000),
  -- HD #3
  (3, 4, 1, 250000),
  (3, 6, 1, 80000),
  (3, 7, 3, 70000);
USE QuanLyNhaHang;

-- 1. Loại món
SELECT * FROM loai_mon;

-- 2. Khách hàng
SELECT * FROM khach_hang;

-- 3. Món ăn
SELECT * FROM mon_an;

-- 4. Hóa đơn
SELECT * FROM hoa_don;

-- 5. Chi tiết hóa đơn
SELECT * FROM chi_tiet_hoa_don;

-- 6. Đặt bàn
SELECT * FROM dat_ban;

-- 6. Đặt bàn