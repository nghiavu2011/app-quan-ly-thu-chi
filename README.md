# Kakeibo Pro - Ứng Dụng Quản Lý Tài Chính Gia Đình & Thuê Nhà

Ứng dụng mobile-first giúp quản lý thu chi gia đình và hoạch toán thuê nhà, hỗ trợ nhập liệu bằng giọng nói và import/export Excel.

## 🎯 Tính năng chính

### 💰 Module Thu Chi Gia Đình
- Nhập giao dịch thu/chi nhanh chóng
- Phân loại theo danh mục và tag
- Quản lý nhiều tài khoản (ngân hàng, ví điện tử, tiền mặt)
- Dashboard với biểu đồ trực quan
- AI Insights phân tích chi tiêu

### 🏘️ Module Hoạch Toán Thuê Nhà
- Quản lý phòng/căn và trạng thái
- Quản lý người thuê và hợp đồng
- Theo dõi công nợ và nhắc việc
- Thu tiền thuê, điện, nước
- Quản lý đặt cọc/hoàn cọc

### 🎤 Nhập Liệu Giọng Nói
- Speech-to-Text tiếng Việt
- Parse câu nói tự nhiên thành giao dịch
- Xác nhận và chỉnh sửa trước khi lưu

### 📊 Import/Export Excel
- Import dữ liệu từ file Excel có sẵn
- Export backup ra Excel
- Mapping cột thông minh
- Validation dữ liệu

## 🛠️ Công nghệ sử dụng

- **Frontend**: HTML5, CSS3 (Design System), Vanilla JS
- **Design System**: Mobile-first, CSS Variables, Flexbox/Grid
- **Charts**: CSS-based charts (có thể tích hợp Chart.js/Recharts)
- **Voice**: Web Speech API / Google Cloud Speech-to-Text
- **Storage**: LocalStorage / IndexedDB (offline-first)

## 📱 UI Components

### Design System
- ✅ Typography & Spacing tokens
- ✅ Color palette (Light/Dark mode)
- ✅ 40+ UI components
- ✅ Responsive breakpoints
- ✅ Accessibility (WCAG 2.1)

### Components
- Bottom Navigation
- Floating Action Button (FAB)
- Bottom Sheet / Modal
- KPI Cards
- Chart Cards
- Form Controls
- Lists & Cards
- Toast Notifications
- Loading States
- Empty States

## 🚀 Quick Start

### Xem Preview
Mở file `preview.html` trong trình duyệt để xem tất cả màn hình.

```bash
# Hoặc chạy local server
python -m http.server 8000
# Truy cập: http://localhost:8000/preview.html
```

### Cấu trúc thư mục
```
📁 kakeibo-pro/
├── 📄 index.html              # Entry point
├── 📄 preview.html            # UI Preview (all screens)
├── 📄 design-system.css       # Design tokens & components
├── 📄 README.md               # This file
├── 📁 templates/
│   ├── home.html             # Trang chủ
│   ├── quick-add.html        # Thêm giao dịch nhanh
│   ├── dashboard.html        # Dashboard thu chi
│   ├── transactions-list.html # Danh sách giao dịch
│   ├── rental-units.html     # Quản lý phòng
│   ├── rental-tenants.html   # Quản lý người thuê
│   ├── rental-receivables.html # Công nợ
│   ├── settings.html         # Cài đặt
│   └── voice-input.html      # Nhập giọng nói
└── 📁 assets/
    └── (images, icons)
```

## 🎨 Design Principles

1. **Mobile-first**: Tối ưu cho điện thoại trước
2. **Thumb Zone**: CTA buttons trong vùng ngón cái
3. **Tối giản**: Mỗi màn hình chỉ làm 1 việc chính
4. **Accessibility**: Font lớn, contrast cao, voice input
5. **Max 2 cấp**: Bottom nav → Screen (không nested)

## 📋 Roadmap

### Phase 1: MVP (Hoàn thành)
- ✅ Design System & UI Templates
- ✅ Trang chủ, Dashboard, Quick Add
- ✅ Thu Chi cơ bản
- ✅ Thuê Nhà cơ bản

### Phase 2: Sắp tới
- [ ] JavaScript functionality
- [ ] Local Storage / IndexedDB
- [ ] Voice Input integration
- [ ] Import/Export Excel
- [ ] Push Notifications

### Phase 3: Nâng cao
- [ ] User authentication
- [ ] Cloud sync
- [ ] Multi-currency
- [ ] Banking API integration

## 🤝 Đóng góp

Mọi đóng góp đều được hoan nghênh! Vui lòng:
1. Fork repository
2. Tạo branch mới (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 👥 Team

- **UX/UI Designer**: Kakeibo Pro Team
- **Frontend Developer**: Community

---

Made with ❤️ in Vietnam

**Version**: 1.0.0  
**Last Updated**: 03/02/2026