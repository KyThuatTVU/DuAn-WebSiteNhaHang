# Mobile UI Documentation - Restaurant Management System

## Tổng quan

Hệ thống UI mobile được thiết kế đặc biệt cho ứng dụng quản lý nhà hàng với giao diện đẹp, hiện đại và tối ưu cho thiết bị di động.

## Tính năng chính

### 🎨 Thiết kế đẹp
- Gradient màu sắc hiện đại
- Hiệu ứng animation mượt mà
- Responsive design cho mọi kích thước màn hình
- Dark mode support
- Blur effects và backdrop filters

### 📱 Tối ưu cho Mobile
- Touch-friendly interface
- Swipe gestures
- Pull-to-refresh
- Haptic feedback (vibration)
- Safe area support cho iPhone X+
- PWA ready

### 🚀 Hiệu suất cao
- CSS variables cho customization dễ dàng
- Optimized animations
- Lazy loading support
- Skeleton loading states
- Efficient DOM manipulation

## Cấu trúc Files

```
frontend/
├── css/
│   └── mobile-responsive.css    # CSS chính cho mobile UI
├── js/
│   └── mobile-utils.js         # JavaScript utilities
├── mobile-Index-new.html       # Trang chủ mobile
├── mobile-Menu-new.html        # Trang menu mobile
├── mobile-demo.html            # Demo UI components
└── MOBILE-UI-README.md         # Tài liệu này
```

## Components có sẵn

### 1. Layout Components
- `mobile-header` - Header với gradient và blur effect
- `mobile-nav` - Bottom navigation với indicators
- `mobile-container` - Container responsive
- `mobile-page-content` - Main content area

### 2. Button Components
- `mobile-btn` - Button chính với ripple effect
- `mobile-btn-primary` - Button primary style
- `mobile-btn-secondary` - Button secondary style
- `mobile-btn-icon` - Icon button tròn
- `mobile-fab` - Floating action button

### 3. Card Components
- `mobile-card` - Card container với shadow
- `mobile-card-header` - Card header
- `mobile-card-body` - Card content
- `mobile-card-footer` - Card footer

### 4. Form Components
- `mobile-input` - Input field với focus effects
- `mobile-textarea` - Textarea field
- `mobile-select` - Select dropdown
- `mobile-search-bar` - Search bar với icon

### 5. Navigation Components
- `mobile-tabs` - Tab navigation
- `mobile-tab` - Individual tab
- `mobile-nav-item` - Bottom nav item

### 6. Feedback Components
- `mobile-badge` - Status badges
- `mobile-toast` - Toast notifications
- `mobile-modal` - Modal dialogs
- `mobile-loading` - Loading spinner
- `mobile-progress` - Progress bar

### 7. Utility Classes
- Spacing: `mobile-p-*`, `mobile-m-*`, `mobile-space-*`
- Colors: `mobile-text-*`, `mobile-bg-*`
- Typography: `mobile-text-*`, `mobile-font-*`
- Layout: `mobile-flex`, `mobile-grid`, `mobile-items-*`

## Cách sử dụng

### 1. Import CSS và JS
```html
<link rel="stylesheet" href="css/mobile-responsive.css">
<script src="js/mobile-utils.js"></script>
```

### 2. Basic Layout Structure
```html
<body class="mobile-bg-light">
    <!-- Header -->
    <header class="mobile-header">
        <div class="mobile-header-content">
            <!-- Header content -->
        </div>
    </header>

    <!-- Main Content -->
    <main class="mobile-page-content">
        <div class="mobile-container mobile-py-lg">
            <!-- Page content -->
        </div>
    </main>

    <!-- Bottom Navigation -->
    <nav class="mobile-nav">
        <div class="mobile-nav-content">
            <!-- Nav items -->
        </div>
    </nav>
</body>
```

### 3. Sử dụng Components

#### Button Example
```html
<button class="mobile-btn mobile-btn-primary">
    <i class="fas fa-heart mobile-mr-sm"></i>
    Primary Button
</button>
```

#### Card Example
```html
<div class="mobile-card">
    <div class="mobile-card-body">
        <h4 class="mobile-font-semibold">Card Title</h4>
        <p class="mobile-text-secondary">Card content</p>
    </div>
</div>
```

#### Toast Notification
```javascript
showToast('Thông báo thành công!', 'success', 3000);
```

#### Modal Dialog
```javascript
showModal(`
    <div class="mobile-text-center">
        <h3>Modal Title</h3>
        <p>Modal content</p>
        <button class="mobile-btn mobile-btn-primary" onclick="closeModal(this.closest('.mobile-modal'))">
            OK
        </button>
    </div>
`);
```

## Customization

### 1. CSS Variables
Bạn có thể tùy chỉnh màu sắc và spacing bằng cách override CSS variables:

```css
:root {
    --mobile-primary: #your-color;
    --mobile-secondary: #your-color;
    --mobile-spacing-md: 1.5rem;
}
```

### 2. Animation Timing
```css
:root {
    --mobile-transition-fast: 0.15s;
    --mobile-transition-normal: 0.3s;
    --mobile-transition-slow: 0.5s;
}
```

## JavaScript API

### MobileUtils Class
```javascript
// Toast notifications
showToast(message, type, duration);

// Modal dialogs
showModal(content, options);
closeModal(modal);

// Vibration feedback
vibrate(pattern);

// Storage helpers
setStorage(key, value);
getStorage(key);
removeStorage(key);
```

## Browser Support

- iOS Safari 12+
- Chrome Mobile 70+
- Firefox Mobile 68+
- Samsung Internet 10+
- Edge Mobile 79+

## Performance Tips

1. **Lazy Loading**: Sử dụng intersection observer cho images
2. **Animation**: Sử dụng `transform` và `opacity` cho animations
3. **Touch Events**: Sử dụng `passive: true` cho touch listeners
4. **Memory**: Cleanup event listeners khi không cần thiết

## Accessibility

- Semantic HTML structure
- ARIA labels và roles
- Keyboard navigation support
- Screen reader friendly
- High contrast mode support
- Reduced motion support

## Demo

Xem demo đầy đủ tại: `mobile-demo.html`

## Troubleshooting

### Common Issues

1. **CSS không load**: Kiểm tra đường dẫn file CSS
2. **JavaScript errors**: Đảm bảo mobile-utils.js được load trước
3. **Animation lag**: Kiểm tra GPU acceleration
4. **Touch events**: Đảm bảo viewport meta tag đúng

### Debug Mode
```javascript
// Enable debug mode
localStorage.setItem('mobile-debug', 'true');
```

## Updates & Changelog

### Version 1.0.0
- Initial release
- Basic components và utilities
- Responsive design
- Animation system
- Toast và modal system

---

**Developed by**: Restaurant Management Team  
**Last Updated**: 2025-07-14  
**Version**: 1.0.0
