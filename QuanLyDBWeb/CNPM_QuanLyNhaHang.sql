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
  id_loai    INT AUTO_INCREMENT PRIMARY KEY,
  ten_loai   VARCHAR(100) NOT NULL,
  mo_ta      TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Bảng khách hàng (giữ nguyên của bạn)
CREATE TABLE khach_hang (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  full_name   VARCHAR(255) NOT NULL,
  email       VARCHAR(255) NOT NULL UNIQUE,
  phone       VARCHAR(20)  NOT NULL,
  password    VARCHAR(255) NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 4. Bảng món ăn
CREATE TABLE mon_an (
  id_mon     INT AUTO_INCREMENT PRIMARY KEY,
  id_loai    INT NOT NULL,
  ten_mon    VARCHAR(150) NOT NULL,
  mo_ta      TEXT,
  gia        DECIMAL(10,2) NOT NULL,
  hinh_anh   VARCHAR(255) NOT NULL,
  trang_thai ENUM('kha_dung','het_hang') NOT NULL DEFAULT 'kha_dung',
  so_luong   INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_loai) REFERENCES loai_mon(id_loai)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 5. Bảng hóa đơn (tham chiếu khach_hang.id)
CREATE TABLE hoa_don (
  id_hoa_don INT AUTO_INCREMENT PRIMARY KEY,
  id_khach   INT NOT NULL,
  ngay_tao   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  loai_don   ENUM('tai_cho','giao_hang') NOT NULL,
  trang_thai ENUM('cho_xac_nhan','dang_phuc_vu','hoan_thanh','da_huy')
               NOT NULL DEFAULT 'cho_xac_nhan',
  tong_tien  DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (id_khach) REFERENCES khach_hang(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 6. Bảng chi tiết hóa đơn
CREATE TABLE chi_tiet_hoa_don (
  id_ct      INT AUTO_INCREMENT PRIMARY KEY,
  id_hoa_don INT NOT NULL,
  id_mon     INT NOT NULL,
  so_luong   INT NOT NULL,
  don_gia    DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (id_hoa_don) REFERENCES hoa_don(id_hoa_don)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (id_mon) REFERENCES mon_an(id_mon)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 7. Bảng đặt bàn
CREATE TABLE dat_ban (
  id_datban      INT AUTO_INCREMENT PRIMARY KEY,
  ten_khach      VARCHAR(100) NOT NULL,
  sdt            VARCHAR(20)  NOT NULL,
  email          VARCHAR(100),
  ngay           DATE         NOT NULL,
  gio            TIME         NOT NULL,
  so_luong_khach INT          NOT NULL,
  ghi_chu        TEXT,
  trang_thai     ENUM('cho_xac_nhan','da_xac_nhan','da_huy')
                   NOT NULL DEFAULT 'cho_xac_nhan',
  created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                   ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO loai_mon (ten_loai, mo_ta) VALUES
('Khai Vị', 'Các món ăn nhẹ mở đầu bữa ăn'),
('Món Chính', 'Các món ăn no'),
('Món Lẩu', 'Các loại lẩu'),
('Món Đặc Biệt', 'Các món đặc sản vùng miền');
-- 2. Món ăn (30 món, có id_loai đồng bộ)
INSERT INTO mon_an (id_loai, ten_mon, mo_ta, gia, hinh_anh, so_luong) VALUES
(1, 'Gỏi Ngó Sen Tôm Thịt',      'Ngó sen giòn mát hòa quyện cùng tôm tươi, thịt ba chỉ.', 85000, 'goingosen.jpg', 50),
(1, 'Chả Giò Phương Nam',        'Chả giò giòn rụm nhân tôm thịt và nấm thơm.', 75000, 'chagioPN.jpg', 100),
(2, 'Cá Lóc Nướng Trui',         'Cá lóc nướng trui phết mỡ hành, chấm mắm gừng.', 185000, 'calocnuongtrui.jpg', 30),
(3, 'Lẩu Mắm Đậm Đà',            'Lẩu mắm đặc sánh, bông điên điển, cá linh.', 250000, 'laumam.webp', 25),
(4, 'Bánh Xèo',                  'Bánh xèo vàng giòn, đầy ụ tôm thịt, rau sống.', 95000, 'banhxeo.jpg', 80),
(4, 'Cơm Tấm Sườn Nướng',        'Sườn nướng mật ong, cơm tấm mềm, trứng ốp la.', 80000, 'comtam.webp', 120),
(2, 'Hủ Tiếu Nam Vang',           'Nước dùng ngọt thanh, hủ tiếu dai với quẩy giòn.', 70000, 'hutieunamvang.webp', 90),
(2, 'Bún Bò Huế',                 'Bún bò cay nồng, giò heo và mắm ruốc đặc trưng.', 90000, 'bunbohue.png', 70),
(4, 'Bánh Khọt',                  'Bánh khọt nhỏ xinh nhân tôm, chấm mắm chua ngọt.', 85000, 'banhkhot.jpg', 60),
(4, 'Bánh Căn',                   'Bánh căn nóng hổi, nhân trứng cút hoặc mực.', 60000, 'banhcan.jpg', 75),
(2, 'Canh Chua Cá Lóc',           'Canh chua bông so đũa, dọc mùng, cá lóc thanh mát.', 120000, 'canhchuacaloc.jpg', 40),
(3, 'Lẩu Cá Kèo',                 'Lẩu cá kèo ngọt nước, khế chua và rau nhút.', 230000, 'laucakeo.jpg', 20),
(2, 'Bún Riêu Cua',               'Nước riêu cua thơm, bún tươi và chả cốm.', 75000, 'bunrieucua.jpg', 85),
(1, 'Nem Nướng Cái Răng',         'Nem nướng đậm vị, cuốn bánh tráng và rau sống.', 100000, 'nemnuong.jpg', 65),
(1, 'Gỏi Cuốn Tôm Thịt',          'Cuốn gỏi mát lành với tôm, thịt và rau sống.', 65000, 'goicuon.jpg', 150),
(4, 'Bánh Hỏi Heo Quay',          'Bánh hỏi mềm mịn kèm heo quay giòn rụm.', 120000, 'banhhoiheoquay.jpg', 55),
(2, 'Cháo Lươn Hải Phòng',        'Cháo lươn sánh mịn, thịt lươn dai ngọt.', 95000, 'chaoluong.jpg', 45),
(2, 'Bún Thịt Nướng',             'Bún tươi ăn cùng thịt nướng sả và đậu phộng.', 80000, 'bunthitnuong.jpg', 110),
(4, 'Cơm Gà Hội An',              'Cơm gà vàng ươm, kèm gỏi hành và nước chấm bí truyền.', 90000, 'comgahoian.jpeg', 95),
(2, 'Mỳ Quảng',                   'Mỳ Quảng đậm đà với tôm, thịt và bánh tráng giòn.', 85000, 'myquang.jpg', 70),
(2, 'Bánh Đa Cua',                'Bánh đa đỏ, riêu cua thơm lừng, giò heo bùi béo.', 80000, 'banhdacua.jpg', 80),
(2, 'Chả Cá Lã Vọng',             'Chả cá nghệ thơm nức, ăn cùng thì là và bún.', 150000, 'chacalavong.jpg', 35),
(3, 'Lẩu Đuôi Bò',                'Lẩu đuôi bò hầm mềm, nước dùng đậm vị.', 280000, 'lauduoibo.jpg', 15),
(2, 'Cá Kho Tộ',                  'Cá kho tộ gia truyền, thịt cá săn chắc, nước kho sóng sánh.', 130000, 'cakhoto.jpg', 50),
(2, 'Gà Nướng Muối Ớt',           'Gà nướng muối ớt, ươm mật ong, da giòn thịt mềm.', 180000, 'ganuongmuoiot.png', 40),
(1, 'Ốc Hấp Sả',                  'Ốc bươu hấp sả, chanh, thơm lừng vị miền Tây.', 95000, 'ochapsa.jpg', 60),
(1, 'Súp Cua',                    'Súp cua đặc sánh, nấm và hải sản.', 70000, 'supcua.jpg', 100),
(1, 'Bò Lá Lốt',                  'Bò cuốn lá lốt nướng than hoa, chấm mắm nêm.', 120000, 'bolalot.jpg', 70),
(1, 'Tôm Chiên Giòn',             'Tôm bọc bột giòn rụm, chấm mayonnaise cay nhẹ.', 160000, 'tomchiengion.jpg', 50),
(1, 'Gỏi Đu Đủ Thái',             'Gỏi đu đủ xanh giòn sần sật, vị chua cay đậm đà.', 75000, 'goidudu.jpg', 75);-- 3. Khách hàng mẫu
INSERT INTO khach_hang (full_name, phone, email, password) VALUES
  ('Nguyễn Văn A', '0901234567', 'a@example.com', 'password_a'),
  ('Trần Thị B',   '0912345678', 'b@example.com', 'password_b'),
  ('Lê Văn C',     '0987654321', 'c@example.com', 'password_c'),
  ('Phạm Thị D',   '0909876543', 'd@example.com', 'password_d'),
  ('Hoàng Văn E',  '0911100112', 'e@example.com', 'password_e');

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