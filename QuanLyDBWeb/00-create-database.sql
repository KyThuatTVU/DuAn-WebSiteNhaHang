-- ==============================================
-- DATABASE INITIALIZATION SCRIPT
-- Restaurant Management System - Docker
-- ==============================================

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS QuanLyNhaHang
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Use the database
USE QuanLyNhaHang;

-- Set proper character set and collation
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Display initialization message
SELECT 'Database QuanLyNhaHang created successfully!' as message;
