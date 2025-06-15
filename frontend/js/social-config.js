// Social Authentication Configuration
const SOCIAL_CONFIG = {
    google: {
        clientId: '1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com', // Demo Client ID
        // Để lấy Client ID thật:
        // 1. Truy cập https://console.developers.google.com/
        // 2. Tạo project mới hoặc chọn project có sẵn
        // 3. Bật Google+ API và Google Sign-In API
        // 4. Tạo OAuth 2.0 Client ID
        // 5. Thêm domain của bạn vào Authorized JavaScript origins
        // 6. Thay thế Client ID demo bằng Client ID thật
    },
    
    facebook: {
        appId: '1234567890', // Demo App ID
        // Để lấy App ID thật:
        // 1. Truy cập https://developers.facebook.com/
        // 2. Tạo app mới
        // 3. Thêm Facebook Login product
        // 4. Cấu hình Valid OAuth Redirect URIs
        // 5. Thay thế App ID demo bằng App ID thật
        version: 'v18.0'
    }
};

// Cập nhật config cho social auth
if (window.socialAuth) {
    window.socialAuth.googleClientId = SOCIAL_CONFIG.google.clientId;
    window.socialAuth.facebookAppId = SOCIAL_CONFIG.facebook.appId;
}

// Export config
window.SOCIAL_CONFIG = SOCIAL_CONFIG;
