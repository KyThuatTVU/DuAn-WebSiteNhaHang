-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: QuanLyNhaHang
-- ------------------------------------------------------
-- Server version	8.0.41

-- Use the correct database
USE QuanLyNhaHang;

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin_login`
--

DROP TABLE IF EXISTS `admin_login`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_login` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_login`
--

LOCK TABLES `admin_login` WRITE;
/*!40000 ALTER TABLE `admin_login` DISABLE KEYS */;
INSERT INTO `admin_login` VALUES (1,'admin','$2y$10$gT9yvK2.QYw8i9J0p.1jR.iP1zV4G3H1gB/C2uJ5o/R.T8k7L0F.G','Quản Trị Viên Chính',NULL,'2025-07-01 06:19:22'),(2,'viewer01','$2y$10$aX.Z3fE9rV6.o/O7tY5wUuT4xL9zR8dG7iJ6p.H3wQ1iV.N2o/K.S','Người Xem Báo Cáo',NULL,'2025-07-01 06:19:22');
/*!40000 ALTER TABLE `admin_login` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dat_ban`
--

DROP TABLE IF EXISTS `dat_ban`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dat_ban` (
  `id_datban` int NOT NULL AUTO_INCREMENT,
  `ten_khach` varchar(100) NOT NULL,
  `sdt` varchar(20) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `ngay` date NOT NULL,
  `gio` time NOT NULL,
  `so_luong_khach` int NOT NULL,
  `ghi_chu` text,
  `trang_thai` enum('cho_xac_nhan','da_xac_nhan','da_huy') NOT NULL DEFAULT 'cho_xac_nhan',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_datban`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dat_ban`
--

LOCK TABLES `dat_ban` WRITE;
/*!40000 ALTER TABLE `dat_ban` DISABLE KEYS */;
INSERT INTO `dat_ban` VALUES (2,'Trần Thị B','0912345678','b@example.com','2025-05-11','12:00:00',2,'Có trẻ em theo cùng','cho_xac_nhan','2025-07-04 03:48:14','2025-07-04 03:48:14'),(3,'Lê Văn C','0987654321','c@example.com','2025-05-12','20:15:00',6,'Chúc mừng sinh nhật','cho_xac_nhan','2025-07-04 03:48:14','2025-07-04 03:48:14'),(4,'Nguyễn Huỳnh Kỹ Thuật','0986764692','nguyenhuynhkithuat84tv@gmail.com','2025-07-11','19:00:00',2,NULL,'cho_xac_nhan','2025-07-11 03:24:41','2025-07-11 03:24:41'),(5,'Nguyễn Huỳnh Kỹ Thuật','0986764692','nguyenhuynhkithuat84tv@gmail.com','2025-07-11','19:00:00',2,NULL,'cho_xac_nhan','2025-07-11 03:24:41','2025-07-11 03:24:41'),(6,'Nguyễn Huỳnh Kỹ Thuật','0986764692','nguyenhuynhkithuat84tv@gmail.com','2025-07-18','19:00:00',2,NULL,'cho_xac_nhan','2025-07-11 05:58:38','2025-07-11 05:58:38'),(7,'Bạch Tuyết','0388853044','bachtuyet@123.com','2025-07-11','19:00:00',2,NULL,'da_huy','2025-07-11 06:02:09','2025-07-14 03:38:31'),(8,'Bạch Tuyết','0388853044','bachtuyet@123.com','2025-07-11','19:00:00',2,NULL,'cho_xac_nhan','2025-07-11 06:02:09','2025-07-11 06:02:09'),(9,'Mỹ Hoa','0388853044','nguyenhuynhkithuat84tv@gmail.com','2025-07-11','20:30:00',20,'sinh nhật','cho_xac_nhan','2025-07-11 06:59:16','2025-07-11 06:59:16'),(10,'Nguyễn Huỳnh Kỹ Thuật','0987654321','nguyenhuynhkithuat84tv@gmail.com','2025-07-14','19:00:00',2,NULL,'da_xac_nhan','2025-07-14 03:23:08','2025-07-17 02:33:23'),(11,'Nguyễn Huỳnh Kỹ Thuật','0987654321','nguyenhuynhkithuat84tv@gmail.com','2025-07-14','19:00:00',2,NULL,'cho_xac_nhan','2025-07-14 03:23:08','2025-07-14 03:23:08'),(12,'Lê Thị Hoa','0986764692','hoa@gmail.com','2025-07-19','18:00:00',6,'Sinh nhật nam','cho_xac_nhan','2025-07-19 06:19:29','2025-07-19 06:19:29'),(13,'Kỹ Thuật','0986764692','nguyenhuynhkithuat84tv@gmail.com','2025-07-19','19:00:00',12,'Sinh nhật nam','cho_xac_nhan','2025-07-19 06:19:48','2025-07-19 06:19:48'),(14,'Kỹ Thuật','0986764692','nguyenhuynhkithuat84tv@gmail.com','2025-07-25','21:00:00',15,NULL,'cho_xac_nhan','2025-07-19 06:20:05','2025-07-19 06:20:05'),(15,'Lê Thị Hoa','0987654321','nguyenhuynhkithuat84tv@gmail.com','2025-07-28','20:30:00',3,NULL,'da_xac_nhan','2025-07-19 06:20:28','2025-07-19 06:20:48'),(16,'Lê thị a','0987676545','hoa123@gmail.com','2025-07-19','20:00:00',2,NULL,'cho_xac_nhan','2025-07-19 06:21:50','2025-07-19 06:21:50'),(17,'Kỹ Thuật','0986764692','nguyenhuynhkithuat84tv@gmail.com','2025-07-21','19:00:00',2,NULL,'cho_xac_nhan','2025-07-21 09:43:08','2025-07-21 09:43:08'),(18,'Kỹ Thuật','0986764692','nguyenhuynhkithuat84tv@gmail.com','2025-07-21','19:00:00',2,NULL,'cho_xac_nhan','2025-07-21 09:43:08','2025-07-21 09:43:08');
/*!40000 ALTER TABLE `dat_ban` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hoa_don`
--

DROP TABLE IF EXISTS `hoa_don`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hoa_don` (
  `id_hoa_don` int NOT NULL AUTO_INCREMENT,
  `id_khach` int NOT NULL,
  `ngay_tao` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `loai_don` enum('tai_cho','giao_hang') NOT NULL,
  `trang_thai` enum('cho_xac_nhan','dang_phuc_vu','hoan_thanh','da_huy') NOT NULL DEFAULT 'cho_xac_nhan',
  `tong_tien` decimal(12,2) NOT NULL,
  `dia_chi_giao_hang` text,
  `ghi_chu` text,
  PRIMARY KEY (`id_hoa_don`),
  KEY `fk_hoa_don_khach_hang` (`id_khach`),
  CONSTRAINT `fk_hoa_don_khach_hang` FOREIGN KEY (`id_khach`) REFERENCES `khach_hang` (`id`) ON DELETE CASCADE,
  CONSTRAINT `hoa_don_ibfk_1` FOREIGN KEY (`id_khach`) REFERENCES `khach_hang` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hoa_don`
--

LOCK TABLES `hoa_don` WRITE;
/*!40000 ALTER TABLE `hoa_don` DISABLE KEYS */;
INSERT INTO `hoa_don` VALUES (1,1,'2025-04-20 18:30:00','tai_cho','hoan_thanh',355000.00,NULL,NULL),(2,2,'2025-04-21 19:15:00','giao_hang','dang_phuc_vu',245000.00,NULL,NULL),(3,3,'2025-04-22 12:00:00','tai_cho','cho_xac_nhan',540000.00,NULL,NULL),(4,9,'2025-07-05 15:05:27','tai_cho','cho_xac_nhan',200000.00,NULL,NULL),(5,9,'2025-07-05 15:06:13','tai_cho','cho_xac_nhan',200000.00,NULL,NULL),(6,9,'2025-07-05 15:06:41','tai_cho','cho_xac_nhan',200000.00,NULL,NULL),(7,9,'2025-07-05 15:08:09','tai_cho','cho_xac_nhan',200000.00,NULL,NULL),(8,9,'2025-07-05 15:11:01','tai_cho','cho_xac_nhan',200000.00,NULL,NULL),(9,9,'2025-07-05 15:11:34','tai_cho','cho_xac_nhan',200000.00,NULL,NULL),(10,9,'2025-07-05 15:12:39','tai_cho','cho_xac_nhan',200000.00,NULL,NULL),(11,9,'2025-07-05 15:15:07','tai_cho','cho_xac_nhan',200000.00,NULL,NULL);
/*!40000 ALTER TABLE `hoa_don` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `khach_hang`
--

DROP TABLE IF EXISTS `khach_hang`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `khach_hang` (
  `id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `khach_hang`
--

LOCK TABLES `khach_hang` WRITE;
/*!40000 ALTER TABLE `khach_hang` DISABLE KEYS */;
INSERT INTO `khach_hang` VALUES (1,'Nguyễn Văn A','a@example.com','0901234567','password_a','2025-07-04 03:48:07'),(2,'Trần Thị B','b@example.com','0912345678','password_b','2025-07-04 03:48:07'),(3,'Lê Văn C','c@example.com','0987654321','password_c','2025-07-04 03:48:07'),(4,'Phạm Thị D','d@example.com','0909876543','password_d','2025-07-04 03:48:07'),(5,'Hoàng Văn E','e@example.com','0911100112','password_e','2025-07-04 03:48:07'),(6,'Nguyễn Huỳnh Kỹ Thuật Thuật','nguyenhuynhkithuat84tv@gmail.com','0388853044','$2b$12$XHKYXFHhgvIZDrLQE9Eu/e5R6yTF8sB3A510Eb7RxLUN4J0Xf2Rry','2025-07-04 03:55:22'),(7,'Bạch Tuyết','bachtuyet@gmail.com','0','$2b$12$M7FAq4e0NXqPvLwXTOMqIuq/Fd5xSdO/sF8288Uh2fxMe3e9VE7u2','2025-07-05 06:26:35'),(8,'Bạch Tuyết','bachtuyet123@gmail.com','0388853044','$2b$12$XGogoPHXbOpDPKDMnZsfx.R70nPvIwAvND3Am9LGGQyRNMj2qM3SO','2025-07-05 06:26:44'),(9,'Bạch Tuyết','bachtuyet004@gmail.com','0388853044','$2b$12$WePrQkvk9zuP6XV7/42s2OEnDRrQinAmxsExj8UgaHsrFoZJJT4Km','2025-07-05 06:39:09'),(10,'Hứa Thị Thảo Vy','Vy@gmail.com','0388853044','$2b$12$Gl5xcuwhAk95G29MSAdbC.aFtTzlZKRDSELn8Dcg2gpGF3lz/BP6.','2025-07-14 04:28:52'),(11,'Nguyễn Nhật Trường','nhattruong84tv@gmail.com','0388853044','$2b$12$/lRpo2J.UnqxT1G4Ez2hPOqiB46GtpQ1trqil23nbbwITjM9.eMIy','2025-07-16 15:33:07'),(12,'User Test Auth','userauth@example.com','0999888777','$2b$12$eQSBVtW30QSRyEcOEOwY3u8wh.1e.GPLleamX5HPchu4KLIekLPaK','2025-07-20 03:04:12'),(13,'Lê Thị Hoa','hoale123@gmail.com','0968756787','$2b$12$5bsBZxUPLiKcZOryXwrD5ecn3Zq6VNSVT9mXeXKzrz6EL2eskgwAS','2025-07-20 03:12:50'),(14,'Nguyễn Văn A','user@example.com','0123456789','$2b$12$75B74YKcssGMas3BOOblreIDdlgYfdV1rTsnxHNAl2aPbi9wmDS4.','2025-07-21 08:57:02'),(15,'Test User','test@restaurant.com','0123456789','$2b$12$sOobeXAQ4YeohBRA7vurIejBuWojUNZCfkPlJJSmWMdwfK7khlFcy','2025-07-21 10:15:26');
/*!40000 ALTER TABLE `khach_hang` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loai_mon`
--

DROP TABLE IF EXISTS `loai_mon`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loai_mon` (
  `id_loai` int NOT NULL AUTO_INCREMENT,
  `ten_loai` varchar(100) NOT NULL,
  `mo_ta` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_loai`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loai_mon`
--

LOCK TABLES `loai_mon` WRITE;
/*!40000 ALTER TABLE `loai_mon` DISABLE KEYS */;
INSERT INTO `loai_mon` VALUES (1,'Món Chính (Updated)','Các món ăn chính của nhà hàng - đã cập nhật','2025-07-04 03:47:57'),(2,'Món Chính','Các món ăn no','2025-07-04 03:47:57'),(3,'Món Lẩu','Các loại lẩu','2025-07-04 03:47:57'),(4,'Món Đặc Biệt','Các món đặc sản vùng miền','2025-07-04 03:47:57');
/*!40000 ALTER TABLE `loai_mon` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mon_an`
--

DROP TABLE IF EXISTS `mon_an`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mon_an` (
  `id_mon` int NOT NULL AUTO_INCREMENT,
  `id_loai` int NOT NULL,
  `ten_mon` varchar(150) NOT NULL,
  `mo_ta` text,
  `gia` decimal(10,2) NOT NULL,
  `hinh_anh` varchar(255) NOT NULL,
  `trang_thai` enum('kha_dung','het_hang') NOT NULL DEFAULT 'kha_dung',
  `so_luong` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_mon`),
  KEY `id_loai` (`id_loai`),
  CONSTRAINT `mon_an_ibfk_1` FOREIGN KEY (`id_loai`) REFERENCES `loai_mon` (`id_loai`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mon_an`
--

LOCK TABLES `mon_an` WRITE;
/*!40000 ALTER TABLE `mon_an` DISABLE KEYS */;
INSERT INTO `mon_an` VALUES (2,1,'Chả Giò Phương Nam','Chả giò giòn rụm nhân tôm thịt và nấm thơm.',75000.00,'chagioPN.jpg','kha_dung',100,'2025-07-04 03:48:02','2025-07-04 03:48:02'),(3,2,'Cá Lóc Nướng Trui','Cá lóc nướng trui phết mỡ hành, chấm mắm gừng.',185000.00,'calocnuongtrui.jpg','kha_dung',30,'2025-07-04 03:48:02','2025-07-04 03:48:02'),(4,3,'Lẩu Mắm Đậm Đà','Lẩu mắm đặc sánh, bông điên điển, cá linh.',250000.00,'laumam.webp','kha_dung',25,'2025-07-04 03:48:02','2025-07-04 03:48:02'),(5,4,'Bánh Xèo','Bánh xèo vàng giòn, đầy ụ tôm thịt, rau sống.',95000.00,'banhxeo.jpg','kha_dung',80,'2025-07-04 03:48:02','2025-07-04 03:48:02'),(6,4,'Cơm Tấm Sườn Nướng','Sườn nướng mật ong, cơm tấm mềm, trứng ốp la.',80000.00,'comtam.webp','kha_dung',120,'2025-07-04 03:48:02','2025-07-04 03:48:02'),(7,2,'Hủ Tiếu Nam Vang','Nước dùng ngọt thanh, hủ tiếu dai với quẩy giòn.',70000.00,'hutieunamvang.webp','kha_dung',90,'2025-07-04 03:48:02','2025-07-04 03:48:02'),(8,2,'Bún Bò Huế','Bún bò cay nồng, giò heo và mắm ruốc đặc trưng.',90000.00,'bunbohue.png','kha_dung',70,'2025-07-04 03:48:02','2025-07-04 03:48:02'),(9,4,'Bánh Khọt','Bánh khọt nhỏ xinh nhân tôm, chấm mắm chua ngọt.',85000.00,'banhkhot.jpg','kha_dung',60,'2025-07-04 03:48:02','2025-07-04 03:48:02'),(10,4,'Bánh Căn','Bánh căn nóng hổi, nhân trứng cút hoặc mực.',60000.00,'banhcan.jpg','kha_dung',75,'2025-07-04 03:48:02','2025-07-04 03:48:02'),(11,2,'Canh Chua Cá Lóc','Canh chua bông so đũa, dọc mùng, cá lóc thanh mát.',120000.00,'canhchuacaloc.jpg','kha_dung',40,'2025-07-04 03:48:02','2025-07-04 03:48:02'),(12,3,'Lẩu Cá Kèo','Lẩu cá kèo ngọt nước, khế chua và rau nhút.',230000.00,'laucakeo.jpg','kha_dung',20,'2025-07-04 03:48:02','2025-07-04 03:48:02'),(13,2,'Bún Riêu Cua','Nước riêu cua thơm, bún tươi và chả cốm.',75000.00,'bunrieucua.jpg','kha_dung',85,'2025-07-04 03:48:02','2025-07-04 03:48:02'),(14,1,'Nem Nướng Cái Răng','Nem nướng đậm vị, cuốn bánh tráng và rau sống.',100000.00,'nemnuong.jpg','kha_dung',65,'2025-07-04 03:48:02','2025-07-04 03:48:02'),(15,1,'Gỏi Cuốn Tôm Thịt','Cuốn gỏi mát lành với tôm, thịt và rau sống.',65000.00,'goicuon.jpg','kha_dung',150,'2025-07-04 03:48:02','2025-07-04 03:48:02'),(16,4,'Bánh Hỏi Heo Quay','Bánh hỏi mềm mịn kèm heo quay giòn rụm.',120000.00,'banhhoiheoquay.jpg','kha_dung',55,'2025-07-04 03:48:02','2025-07-04 03:48:02'),(17,2,'Cháo Lươn Hải Phòng','Cháo lươn sánh mịn, thịt lươn dai ngọt.',95000.00,'chaoluong.jpg','kha_dung',45,'2025-07-04 03:48:02','2025-07-04 03:48:02'),(18,2,'Bún Thịt Nướng','Bún tươi ăn cùng thịt nướng sả và đậu phộng.',80000.00,'bunthitnuong.jpg','kha_dung',110,'2025-07-04 03:48:02','2025-07-04 03:48:02'),(19,4,'Cơm Gà Hội An','Cơm gà vàng ươm, kèm gỏi hành và nước chấm bí truyền.',90000.00,'comgahoian.jpeg','kha_dung',95,'2025-07-04 03:48:02','2025-07-04 03:48:02'),(20,2,'Mỳ Quảng','Mỳ Quảng đậm đà với tôm, thịt và bánh tráng giòn.',85000.00,'myquang.jpg','kha_dung',70,'2025-07-04 03:48:02','2025-07-04 03:48:02'),(21,2,'Bánh Đa Cua','Bánh đa đỏ, riêu cua thơm lừng, giò heo bùi béo.',80000.00,'banhdacua.jpg','kha_dung',80,'2025-07-04 03:48:02','2025-07-04 03:48:02'),(22,2,'Chả Cá Lã Vọng','Chả cá nghệ thơm nức, ăn cùng thì là và bún.',150000.00,'chacalavong.jpg','kha_dung',35,'2025-07-04 03:48:02','2025-07-04 03:48:02'),(23,3,'Lẩu Đuôi Bò','Lẩu đuôi bò hầm mềm, nước dùng đậm vị.',280000.00,'lauduoibo.jpg','kha_dung',15,'2025-07-04 03:48:02','2025-07-04 03:48:02'),(24,2,'Cá Kho Tộ','Cá kho tộ gia truyền, thịt cá săn chắc, nước kho sóng sánh.',130000.00,'cakhoto.jpg','kha_dung',50,'2025-07-04 03:48:02','2025-07-04 03:48:02'),(25,2,'Gà Nướng Muối Ớt','Gà nướng muối ớt, ươm mật ong, da giòn thịt mềm.',180000.00,'ganuongmuoiot.png','kha_dung',40,'2025-07-04 03:48:02','2025-07-04 03:48:02'),(26,1,'Ốc Hấp Sả','Ốc bươu hấp sả, chanh, thơm lừng vị miền Tây.',95000.00,'ochapsa.jpg','kha_dung',60,'2025-07-04 03:48:02','2025-07-04 03:48:02'),(27,1,'Súp Cua','Súp cua đặc sánh, nấm và hải sản.',70000.00,'supcua.jpg','kha_dung',100,'2025-07-04 03:48:02','2025-07-04 03:48:02'),(28,1,'Bò Lá Lốt','Bò cuốn lá lốt nướng than hoa, chấm mắm nêm.',120000.00,'bolalot.jpg','kha_dung',70,'2025-07-04 03:48:02','2025-07-04 03:48:02'),(29,1,'Tôm Chiên Giòn','Tôm bọc bột giòn rụm, chấm mayonnaise cay nhẹ.',160000.00,'tomchiengion.jpg','kha_dung',50,'2025-07-04 03:48:02','2025-07-04 03:48:02'),(30,1,'Gỏi Đu Đủ Thái','Gỏi đu đủ xanh giòn sần sật, vị chua cay đậm đà.',75000.00,'goidudu.jpg','kha_dung',75,'2025-07-04 03:48:02','2025-07-04 03:48:02');
/*!40000 ALTER TABLE `mon_an` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nhan_vien`
--

DROP TABLE IF EXISTS `nhan_vien`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nhan_vien` (
  `id_nhan_vien` int NOT NULL AUTO_INCREMENT,
  `ho_ten` varchar(100) NOT NULL,
  `ten_dang_nhap` varchar(50) NOT NULL,
  `mat_khau` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `sdt` varchar(20) DEFAULT NULL,
  `vai_tro` enum('quan_ly','thu_ngan','nhan_vien') NOT NULL DEFAULT 'nhan_vien',
  `trang_thai` enum('hoat_dong','da_khoa') NOT NULL DEFAULT 'hoat_dong',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_nhan_vien`),
  UNIQUE KEY `ten_dang_nhap` (`ten_dang_nhap`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nhan_vien`
--

LOCK TABLES `nhan_vien` WRITE;
/*!40000 ALTER TABLE `nhan_vien` DISABLE KEYS */;
INSERT INTO `nhan_vien` VALUES (1,'Bùi Văn Quản','manager01','hashed_password_manager','manager@nhahang.com','0988888888','quan_ly','hoat_dong','2025-07-01 06:05:47','2025-07-01 06:05:47'),(2,'Trần Thị Thu Ngân','cashier01','hashed_password_cashier','cashier01@nhahang.com','0977777777','thu_ngan','hoat_dong','2025-07-01 06:05:47','2025-07-01 06:05:47'),(3,'Lê Minh Phục Vụ','staff01','hashed_password_staff','staff01@nhahang.com','0966666666','nhan_vien','hoat_dong','2025-07-01 06:05:47','2025-07-01 06:05:47');
/*!40000 ALTER TABLE `nhan_vien` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-24  9:18:55
