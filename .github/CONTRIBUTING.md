# 🤝 Contributing to Website Nhà Hàng

Cảm ơn bạn đã quan tâm đến việc đóng góp cho dự án! Tài liệu này sẽ hướng dẫn bạn quy trình đóng góp.

## 📋 Mục lục
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Submitting Changes](#submitting-changes)
- [Coding Standards](#coding-standards)
- [Testing](#testing)

## 📜 Code of Conduct
Dự án này tuân thủ [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/). Bằng cách tham gia, bạn đồng ý tuân thủ các quy tắc này.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MySQL 8.0+
- Git

### Fork và Clone
1. Fork repository này
2. Clone fork của bạn:
```bash
git clone https://github.com/YOUR_USERNAME/DuAnBaoCaoWeb.git
cd DuAnBaoCaoWeb
```

## 🛠️ Development Setup

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env  # Cấu hình environment variables
npm run dev
```

### Database Setup
```bash
# Import database
mysql -u root -p < QuanLyDBWeb/CNPM_QuanLyNhaHang.sql
```

### Frontend Setup
Frontend sử dụng vanilla HTML/CSS/JS, chỉ cần mở file HTML trong browser.

## 🔄 Making Changes

### Branch Naming Convention
- `feature/ten-tinh-nang` - Tính năng mới
- `bugfix/ten-loi` - Sửa lỗi
- `hotfix/ten-loi-gap` - Sửa lỗi khẩn cấp
- `docs/cap-nhat-tai-lieu` - Cập nhật tài liệu

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: Tính năng mới
- `fix`: Sửa lỗi
- `docs`: Cập nhật tài liệu
- `style`: Thay đổi format, không ảnh hưởng logic
- `refactor`: Refactor code
- `test`: Thêm hoặc sửa tests
- `chore`: Maintenance tasks

Ví dụ:
```
feat(auth): thêm tính năng đăng nhập với JWT

- Implement JWT authentication
- Add login/logout endpoints
- Update frontend login form

Closes #123
```

## 📤 Submitting Changes

### Pull Request Process
1. Tạo branch mới từ `develop`:
```bash
git checkout develop
git pull origin develop
git checkout -b feature/ten-tinh-nang
```

2. Thực hiện changes và commit:
```bash
git add .
git commit -m "feat: mô tả thay đổi"
```

3. Push branch:
```bash
git push origin feature/ten-tinh-nang
```

4. Tạo Pull Request từ branch của bạn đến `develop`

### PR Requirements
- [ ] Code follows coding standards
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No merge conflicts
- [ ] Descriptive PR title and description

## 📏 Coding Standards

### JavaScript
- Sử dụng ES6+ features
- Camel case cho variables và functions
- Pascal case cho classes
- Meaningful variable names
- Comment cho complex logic

### CSS
- BEM methodology cho class naming
- Mobile-first approach
- Consistent indentation (2 spaces)

### Database
- Snake case cho table và column names
- Descriptive table và column names
- Proper indexing

## 🧪 Testing

### Running Tests
```bash
cd backend
npm test
```

### Writing Tests
- Unit tests cho business logic
- Integration tests cho API endpoints
- Manual testing cho UI changes

### Test Coverage
Maintain minimum 70% test coverage cho backend code.

## 🐛 Bug Reports
Sử dụng [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md) khi báo cáo lỗi.

## 💡 Feature Requests
Sử dụng [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md) khi đề xuất tính năng mới.

## 📞 Getting Help
- Tạo issue với label `question`
- Liên hệ maintainers qua email
- Check existing documentation

## 🎉 Recognition
Contributors sẽ được ghi nhận trong:
- README.md
- Release notes
- Contributors page

Cảm ơn bạn đã đóng góp! 🙏
