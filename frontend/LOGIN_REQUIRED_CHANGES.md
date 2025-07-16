# Tính Năng Yêu Cầu Đăng Nhập - Tóm Tắt Thay Đổi

## Mô Tả Tính Năng
Đã bổ sung tính năng yêu cầu đăng nhập trước khi có thể:
- Thêm món ăn vào giỏ hàng
- Xem giỏ hàng

## Các File Đã Được Sửa Đổi

### 1. frontend/js/cart.js
**Thay đổi chính:**
- Thêm hàm `checkAuthBeforeAddToCart()` để kiểm tra đăng nhập trước khi thêm món ăn
- Sửa đổi hàm `addToCart()` để gọi kiểm tra đăng nhập trước
- Sửa đổi hàm `openCartModal()` để kiểm tra đăng nhập trước khi mở giỏ hàng
- Thêm hàm `showLoginRequiredForAddToCart()` để hiển thị thông báo yêu cầu đăng nhập
- Sửa đổi hàm `requireCustomerInfo()` để chỉ cho phép user đã đăng nhập

**Chi tiết thay đổi:**
```javascript
// Kiểm tra đăng nhập trước khi thêm món ăn
addToCart(item, buttonElement = null, quantity = 1) {
    if (!this.checkAuthBeforeAddToCart()) {
        return false;
    }
    // ... rest of the function
}

// Kiểm tra đăng nhập trước khi mở giỏ hàng
openCartModal() {
    if (!this.checkAuthBeforeCart()) {
        return false;
    }
    // ... rest of the function
}
```

### 2. frontend/menu-db.html
**Thay đổi chính:**
- Thêm hàm `checkUserLogin()` để kiểm tra trạng thái đăng nhập
- Thêm hàm `showLoginRequired()` để hiển thị thông báo yêu cầu đăng nhập
- Sửa đổi hàm `cart.add()` để kiểm tra đăng nhập trước khi thêm món ăn
- Thêm event listener cho nút giỏ hàng để kiểm tra đăng nhập

**Chi tiết thay đổi:**
```javascript
// Kiểm tra đăng nhập trong cart.add()
add(item, qty) {
    if (!checkUserLogin()) {
        showLoginRequired();
        return false;
    }
    // ... rest of the function
}

// Event listener cho nút giỏ hàng
cartBtn.addEventListener('click', () => {
    if (!checkUserLogin()) {
        showLoginRequired();
        return;
    }
    // Show cart logic
});
```

### 3. frontend/test-login-required.html (Mới)
**Mục đích:**
- File test để kiểm tra tính năng yêu cầu đăng nhập
- Cho phép test các scenario: đăng nhập, đăng xuất, thêm món ăn, xem giỏ hàng
- Hiển thị kết quả test real-time

## Cách Hoạt Động

### Khi User Chưa Đăng Nhập:
1. **Thêm món ăn:** Hiển thị thông báo "Vui lòng đăng nhập để thêm món ăn vào giỏ hàng!"
2. **Xem giỏ hàng:** Hiển thị thông báo yêu cầu đăng nhập và mở modal đăng nhập
3. **Redirect:** Sau khi đăng nhập thành công, user được redirect về trang menu hoặc giỏ hàng

### Khi User Đã Đăng Nhập:
1. **Thêm món ăn:** Cho phép thêm món ăn vào giỏ hàng bình thường
2. **Xem giỏ hàng:** Cho phép xem và quản lý giỏ hàng

## Kiểm Tra Đăng Nhập

### Phương thức kiểm tra:
1. **Primary:** Sử dụng `window.auth.isAuthenticated` và `window.auth.user`
2. **Fallback:** Kiểm tra `localStorage.getItem('userData')` hoặc `localStorage.getItem('user')`

### Điều kiện hợp lệ:
- User data tồn tại trong localStorage
- User data có thể parse thành JSON
- User object có thuộc tính `id`

## Thông Báo và UX

### Thông báo lỗi:
- **Thêm món ăn:** Notification warning với thời gian hiển thị 4 giây
- **Xem giỏ hàng:** Modal yêu cầu đăng nhập

### Redirect sau đăng nhập:
- **Từ thêm món ăn:** Redirect về menu (`redirectAfterLogin: 'menu'`)
- **Từ xem giỏ hàng:** Redirect về giỏ hàng (`redirectAfterLogin: 'cart'`)

## Test và Debugging

### Sử dụng file test:
1. Mở `frontend/test-login-required.html` trong browser
2. Test các scenario đăng nhập/đăng xuất
3. Test thêm món ăn và xem giỏ hàng
4. Xem kết quả real-time

### Console logs:
- Tất cả các hàm kiểm tra đăng nhập đều có console.log để debug
- Có thể theo dõi flow trong Developer Tools

## Tương Thích

### Các trang được bảo vệ:
- ✅ Menu-new.html (sử dụng CartManager)
- ✅ menu-db.html (sử dụng cart object riêng)
- ✅ Tất cả trang có component cart-modal

### Các trang không bị ảnh hưởng:
- Index-new.html (trang chủ)
- gioithieu-new.html (giới thiệu)
- lienhe&datban-new.html (liên hệ & đặt bàn)

## Lưu Ý Quan Trọng

1. **Backward Compatibility:** Tính năng này không ảnh hưởng đến user đã đăng nhập
2. **Multiple Auth Systems:** Hỗ trợ cả auth.js và localStorage fallback
3. **User Experience:** Thông báo rõ ràng và redirect thông minh sau đăng nhập
4. **Security:** Không lưu trữ thông tin nhạy cảm, chỉ kiểm tra trạng thái đăng nhập
