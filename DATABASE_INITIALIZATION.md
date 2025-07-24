# 🗄️ Database Initialization Guide

## 📋 Tổng quan

MySQL Docker container được cấu hình để tự động khởi tạo database với sample data từ thư mục `QuanLyDBWeb/`.

## 📁 Database Files

### **Initialization Files (Thứ tự thực thi)**
```
QuanLyDBWeb/
├── 00-create-database.sql    # Tạo database QuanLyNhaHang
└── init.sql                  # Import sample data (tables + data)
```

### **File Execution Order**
1. `00-create-database.sql` - Tạo database với charset utf8mb4
2. `init.sql` - Tạo tables và import sample data

## 🔧 Docker Configuration

### **Volume Mapping**
```yaml
# docker-compose.yml & docker-compose.dev.yml
volumes:
  - ./QuanLyDBWeb/00-create-database.sql:/docker-entrypoint-initdb.d/00-create-database.sql:ro
  - ./QuanLyDBWeb/init.sql:/docker-entrypoint-initdb.d/01-init-data.sql:ro
```

### **MySQL Environment**
```yaml
environment:
  MYSQL_ROOT_PASSWORD: TVU@842004
  MYSQL_DATABASE: QuanLyNhaHang
  MYSQL_USER: nhahang_user
  MYSQL_PASSWORD: nhahang_secure_password_2024
  MYSQL_CHARSET: utf8mb4
  MYSQL_COLLATION: utf8mb4_unicode_ci
```

## 📊 Sample Data Overview

### **Tables Created**
| Table | Records | Description |
|-------|---------|-------------|
| `khach_hang` | ~15 | Customer accounts |
| `loai_mon` | 4 | Food categories |
| `mon_an` | ~29 | Food items |
| `dat_ban` | ~18 | Table reservations |
| `hoa_don` | ~11 | Orders/Invoices |
| `admin_login` | 2 | Admin accounts |
| `nhan_vien` | 3 | Staff accounts |
| `users` | 0 | Empty user table |

### **Food Categories**
- **Món Chính** - Main dishes
- **Món Lẩu** - Hot pot dishes
- **Món Đặc Biệt** - Special regional dishes

### **Sample Food Items**
- Chả Giò Phương Nam - 75,000 VND
- Cá Lóc Nướng Trui - 185,000 VND
- Lẩu Mắm Đậm Đà - 250,000 VND
- Bánh Xèo - 95,000 VND
- Cơm Tấm Sườn Nướng - 80,000 VND
- ... và nhiều món khác

### **Admin Accounts**
- `admin` - Main administrator
- `viewer01` - Report viewer

## 🚀 Usage Commands

### **Check Database Initialization**
```bash
# Test database connection and data
make db-test

# Check sample data
make db-sample

# Show data summary
make db-summary
```

### **Manual Database Access**
```bash
# MySQL shell
make db-shell

# External connection
mysql -h localhost -P 3307 -u nhahang_user -p QuanLyNhaHang

# phpMyAdmin (development)
http://localhost:8081
```

## 🔍 Verification Steps

### **1. Check Container Status**
```bash
make status
# Should show database container as "Up"
```

### **2. Test Connection**
```bash
make db-test
# Should show successful connection and data counts
```

### **3. Verify Sample Data**
```bash
make db-sample
# Should display tables with data counts and sample records
```

### **4. Check Logs**
```bash
make logs-db
# Should show successful database initialization
```

## 🛠️ Troubleshooting

### **Database Not Initialized**
```bash
# Check initialization logs
docker-compose logs database | grep -i "init"

# Restart with fresh database
make down
docker volume rm duanbaocaoweb_mysql_data
make up
```

### **Sample Data Missing**
```bash
# Check if init files exist
ls -la QuanLyDBWeb/

# Verify file permissions
chmod 644 QuanLyDBWeb/*.sql

# Restart database container
docker-compose restart database
```

### **Connection Issues**
```bash
# Check database is ready
make db-status

# Test connection
make db-test-host

# Check port availability
netstat -tulpn | grep :3307
```

## 📝 Custom Data

### **Adding Custom Data**
1. Create new SQL file in `QuanLyDBWeb/`
2. Name it with prefix (e.g., `02-custom-data.sql`)
3. Add volume mapping in docker-compose.yml
4. Restart containers

### **Modifying Existing Data**
1. Edit `QuanLyDBWeb/init.sql`
2. Remove existing database volume
3. Restart containers to reinitialize

## 🔒 Security Notes

### **Default Credentials**
- **Root Password**: `TVU@842004`
- **App User**: `nhahang_user`
- **App Password**: `nhahang_secure_password_2024` (production)
- **App Password**: `nhahang_dev_password` (development)

### **Production Recommendations**
- Change default passwords
- Use environment variables for sensitive data
- Enable SSL connections
- Regular database backups

## 📈 Performance

### **Database Optimization**
- UTF8MB4 charset for full Unicode support
- Proper indexes on foreign keys
- Connection pooling in backend
- Timezone set to +07:00 (Vietnam)

### **Volume Persistence**
- Database data persisted in Docker volumes
- Survives container restarts
- Automatic backups recommended

## 🎯 Next Steps

1. **Start containers**: `make up`
2. **Verify initialization**: `make db-test`
3. **Check sample data**: `make db-sample`
4. **Access application**: http://localhost:80
5. **Test API**: http://localhost:3000/api/health

Database sẽ tự động được khởi tạo với đầy đủ sample data khi containers start lần đầu! 🎉
