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

// Initialize database connection
const initDatabase = async () => {
  const isConnected = await testConnection();
  if (!isConnected) {
    console.error('Database connection failed. Exiting...');
    process.exit(1);
  }
};

module.exports = {
  pool,
  testConnection,
  initDatabase
};
