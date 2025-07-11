// Database Configuration
require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'TVU@842004',
  database: process.env.DB_NAME || 'QuanLyNhaHang',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
  // Removed invalid options: acquireTimeout, timeout, reconnect
  charset: 'utf8mb4',
  timezone: '+07:00'
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
const testConnection = async () => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.query('SELECT 1');
    console.log('✅ Database connected successfully!');
    return true;
  } catch (err) {
    console.error('❌ Failed to connect to the database:');
    console.error(err.message);
    return false;
  } finally {
    if (connection) connection.release();
  }
};

// Initialize database tables
const initializeTables = async () => {
  try {
    const connection = await pool.getConnection();

    // Create dat_ban table if not exists
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS dat_ban (
        id_datban INT AUTO_INCREMENT PRIMARY KEY,
        ten_khach VARCHAR(100) NOT NULL,
        sdt VARCHAR(20) NOT NULL,
        email VARCHAR(100),
        ngay DATE NOT NULL,
        gio TIME NOT NULL,
        so_luong_khach INT NOT NULL,
        ghi_chu TEXT,
        trang_thai ENUM('cho_xac_nhan','da_xac_nhan','da_huy')
          NOT NULL DEFAULT 'cho_xac_nhan',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_ngay_gio (ngay, gio),
        INDEX idx_sdt (sdt),
        INDEX idx_trang_thai (trang_thai),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await connection.execute(createTableQuery);
    console.log('✅ Table dat_ban initialized successfully');

    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize tables:', error.message);
    return false;
  }
};

// Initialize database connection
const initDatabase = async () => {
  const isConnected = await testConnection();
  if (!isConnected) {
    throw new Error('Database connection failed');
  }

  // Initialize tables
  await initializeTables();
};

// Execute query with error handling
const executeQuery = async (query, params = []) => {
  try {
    const [rows] = await pool.execute(query, params);
    return { success: true, data: rows };
  } catch (error) {
    console.error('Database query error:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  pool,
  testConnection,
  initDatabase,
  initializeTables,
  executeQuery
};
