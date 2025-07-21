-- 🍽️ Restaurant Management System - Database Setup Script
-- Run this script to create database and user for local development

-- Create database
CREATE DATABASE IF NOT EXISTS QuanLyNhaHang 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

-- Create user for local development
CREATE USER IF NOT EXISTS 'restaurant_user'@'localhost' IDENTIFIED BY 'restaurant_pass';

-- Grant privileges
GRANT ALL PRIVILEGES ON QuanLyNhaHang.* TO 'restaurant_user'@'localhost';

-- Flush privileges
FLUSH PRIVILEGES;

-- Use the database
USE QuanLyNhaHang;

-- Show success message
SELECT 'Database and user created successfully!' as Status;
