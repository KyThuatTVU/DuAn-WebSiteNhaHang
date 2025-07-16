# Tính Năng Tự Động Đăng Xuất - Tài Liệu Chi Tiết

## Mô Tả Tính Năng
Đã bổ sung tính năng tự động đăng xuất sau 2 phút không hoạt động với các đặc điểm:
- Token có thời hạn 2 phút
- Tự động đăng xuất khi không có hoạt động trong 2 phút
- Hiển thị cảnh báo 30 giây trước khi đăng xuất
- Hiển thị dialog thông báo "Phiên làm việc đã hết hạn"
- Cho phép gia hạn session khi có hoạt động

## Các File Đã Được Sửa Đổi

### 1. Backend Changes

#### backend/middleware/auth.js
**Thay đổi chính:**
- Token expiry từ 24h → 2m (2 phút)
- Thêm `tokenExpiry` timestamp trong response
- Thêm `iat` (issued at) trong JWT payload

```javascript
// Token với thời hạn ngắn
const token = jwt.sign({
    id: user.id,
    email: user.email,
    iat: Math.floor(Date.now() / 1000)
}, JWT_SECRET, { expiresIn: '2m' });

// Response với tokenExpiry
res.json({
    success: true,
    message: 'Đăng nhập thành công',
    khach_hang: userWithoutPassword,
    token,
    refreshToken,
    expiresIn: '2m',
    tokenExpiry: Date.now() + (2 * 60 * 1000)
});
```

#### backend/middleware/auth-simple.js
**Thay đổi tương tự:**
- Token expiry từ 24h → 2m
- Thêm tokenExpiry trong response

### 2. Frontend Changes

#### frontend/js/auth.js
**Thay đổi chính:**

**Cấu hình thời gian:**
```javascript
const auth = {
    INACTIVITY_TIMEOUT: 2 * 60 * 1000, // 2 phút không hoạt động
    WARNING_TIME: 30 * 1000, // 30 giây trước khi đăng xuất
    TOKEN_REFRESH_INTERVAL: 90 * 1000, // 90 giây (refresh trước khi token hết hạn)
    TOKEN_EXPIRY: 2 * 60 * 1000, // 2 phút
    SESSION_CHECK_INTERVAL: 10 * 1000, // Kiểm tra session mỗi 10 giây
    // ...
};
```

**Các hàm mới được thêm:**

1. **startSessionCheck()** - Kiểm tra session định kỳ
2. **checkTokenExpiry()** - Kiểm tra token có hết hạn không
3. **handleSessionExpired()** - Xử lý khi session hết hạn
4. **showSessionExpiredDialog()** - Hiển thị dialog thông báo
5. **showSessionWarning()** - Hiển thị cảnh báo sắp hết hạn
6. **extendSession()** - Gia hạn session
7. **refreshAccessToken()** - Refresh token mới

**Activity Tracking được cải thiện:**
- Theo dõi các events: mousedown, mousemove, keypress, scroll, touchstart, click
- Reset timer khi có hoạt động
- Hiển thị warning 30 giây trước khi đăng xuất
- Tự động đăng xuất sau 2 phút không hoạt động

## Cách Hoạt Động

### 1. Khi User Đăng Nhập:
1. Server tạo token với thời hạn 2 phút
2. Frontend lưu token và tokenExpiry
3. Bắt đầu activity tracking
4. Bắt đầu session check (mỗi 10 giây)
5. Bắt đầu token refresh (sau 90 giây)

### 2. Trong Quá Trình Sử Dụng:
1. **Có hoạt động:** Reset activity timer
2. **Không hoạt động 1.5 phút:** Hiển thị warning
3. **Không hoạt động 2 phút:** Tự động đăng xuất

### 3. Session Check:
- Kiểm tra token expiry mỗi 10 giây
- Nếu token hết hạn: Tự động đăng xuất
- Nếu sắp hết hạn (30 giây): Hiển thị warning

### 4. Warning System:
```javascript
// Cảnh báo hiển thị 30 giây trước khi đăng xuất
showSessionWarning() {
    // Hiển thị popup với countdown
    // Nút "Gia hạn" để extend session
}
```

### 5. Auto Logout:
```javascript
handleSessionExpired() {
    // Hiển thị dialog "Phiên làm việc đã hết hạn"
    // Tự động redirect đến login sau 5 giây
    // Hoặc click "Đăng nhập lại"
}
```

## UI/UX Components (Bắt Buộc Xác Nhận)

### 1. Session Warning Dialog (Cảnh báo - Modal bắt buộc)
- **Hiển thị:** Modal toàn màn hình với overlay đen
- **Thiết kế:** Trắng với viền vàng, icon cảnh báo
- **Countdown:** 30 giây đếm ngược real-time
- **Nút hành động:**
  - "Gia hạn phiên làm việc" (xanh lá)
  - "Đăng xuất ngay" (đỏ)
- **Bắt buộc:** Không thể đóng bằng ESC hoặc click outside
- **Tự động:** Đăng xuất khi countdown = 0

### 2. Session Expired Dialog (Hết hạn - Modal bắt buộc)
- **Hiển thị:** Modal toàn màn hình với overlay đen đậm
- **Thiết kế:** Trắng với viền đỏ, icon cảnh báo lớn
- **Thông báo:** Rõ ràng về việc hết phiên 2 phút
- **Nút hành động:** "Đăng nhập lại" (đỏ, toàn bộ chiều rộng)
- **Bắt buộc:** Không thể đóng bằng bất kỳ cách nào
- **Không tự động:** Chỉ đóng khi user click nút

### 3. Đặc Điểm Bảo Mật:
```
🔒 KHÔNG thể bỏ qua hộp thoại
🔒 KHÔNG thể đóng bằng ESC key
🔒 KHÔNG thể đóng bằng click outside
🔒 PHẢI xác nhận để tiếp tục
🔒 UI rõ ràng, không thể nhầm lẫn
```

### 4. Thông báo chi tiết:
```
Warning: "Phiên của bạn sẽ hết hạn trong X giây"
Expired: "Phiên làm việc của bạn đã hết hạn do không có hoạt động trong 2 phút.
         Vui lòng đăng nhập lại để tiếp tục."
```

## Token Management

### 1. Token Lifecycle:
- **Tạo:** 2 phút expiry
- **Refresh:** Tự động sau 90 giây (nếu có hoạt động)
- **Expire:** Tự động đăng xuất

### 2. Refresh Strategy:
- Tự động refresh khi còn 30 giây
- Manual refresh khi user click "Gia hạn"
- Fallback logout nếu refresh thất bại

### 3. Storage:
```javascript
localStorage.setItem('token', token);
localStorage.setItem('tokenExpiry', tokenExpiry);
localStorage.setItem('refreshToken', refreshToken);
```

## Activity Detection (Ràng Buộc Chặt Chẽ)

### 1. Tracked Events (Chỉ Tương Tác Thực Sự):
- **mousedown** - Nhấn chuột
- **keydown, keypress** - Gõ phím
- **touchstart** - Chạm màn hình
- **click** - Click chuột

### 2. Events KHÔNG Được Theo Dõi:
- ❌ **mousemove** - Di chuyển chuột (không reset timer)
- ❌ **scroll** - Cuộn trang (không reset timer)
- ❌ **focus, blur** - Focus/unfocus (không reset timer)

### 3. Timer Reset:
- Chỉ khi có tương tác thực sự → reset activity timer
- Ẩn warning nếu đang hiển thị
- Restart countdown

### 4. Ràng Buộc Chặt Chẽ:
- Chỉ mở màn hình mà không click/gõ phím → Tự động đăng xuất
- Di chuyển chuột không được tính là hoạt động
- Cuộn trang không được tính là hoạt động

## Testing

### 1. File Test: `frontend/test-auto-logout.html`
**Tính năng test:**
- Mock login với token 2 phút
- Hiển thị countdown real-time
- Mô phỏng hoạt động
- Test refresh token
- Tự động mô phỏng hoạt động

**Cách sử dụng:**
1. Mở file test trong browser
2. Click "Đăng Nhập Test"
3. Quan sát countdown timer
4. Test các scenario:
   - Không hoạt động → Auto logout
   - Có hoạt động → Timer reset
   - Click "Gia hạn" → Extend session

### 2. Test Scenarios:
1. **Normal Usage:** User hoạt động bình thường
2. **Idle Timeout:** User không hoạt động 2 phút
3. **Warning Response:** User click "Gia hạn" khi có warning
4. **Token Refresh:** Tự động refresh token
5. **Network Error:** Xử lý lỗi khi refresh token

## Security Features

### 1. Token Security:
- Short-lived tokens (2 minutes)
- Automatic refresh with refresh token
- Secure logout on expiry

### 2. Session Management:
- Real-time session validation
- Activity-based session extension
- Secure cleanup on logout

### 3. User Experience:
- Clear warning messages
- Graceful session expiry handling
- Easy re-authentication

## Configuration

### 1. Thời gian có thể điều chỉnh:
```javascript
INACTIVITY_TIMEOUT: 2 * 60 * 1000, // Thời gian không hoạt động
WARNING_TIME: 30 * 1000, // Thời gian cảnh báo
TOKEN_REFRESH_INTERVAL: 90 * 1000, // Interval refresh token
```

### 2. Backend token expiry:
```javascript
{ expiresIn: '2m' } // Có thể thay đổi thành '5m', '10m', etc.
```

## Compatibility

### 1. Backward Compatibility:
- Hoạt động với tất cả trang hiện có
- Không ảnh hưởng đến user đã đăng nhập
- Tương thích với cart system

### 2. Browser Support:
- Modern browsers với localStorage
- JavaScript ES6+ features
- CustomEvent API

## Troubleshooting

### 1. Common Issues:
- **Token không refresh:** Kiểm tra refreshToken trong localStorage
- **Warning không hiển thị:** Kiểm tra DOM và CSS
- **Auto logout không hoạt động:** Kiểm tra activity tracking

### 2. Debug Tools:
- Console logs cho tất cả auth operations
- Test file với real-time monitoring
- Browser DevTools localStorage inspection
