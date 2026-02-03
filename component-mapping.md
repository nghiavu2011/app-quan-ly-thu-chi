# COMPONENT MAPPING - Design System

## Bảng Mapping: Component → Class Names → Dùng Ở Đâu

| # | Component | Class Names | Dùng Ở Đâu |
|---|-----------|-------------|------------|
| **1** | **Chips** | `.chip`, `.chip.selected`, `.chip:disabled`, `.chip-icon`, `.chip-close`, `.chip-group` | Quick Add (chọn category), Filter sheet, Settings (quản lý tags) |
| **2** | **Account Picker** | `.account-picker`, `.account-picker-header`, `.account-picker-item`, `.account-picker-item.selected`, `.account-picker-radio` | Quick Add (chọn tài khoản), Rental Transaction, Settings |
| **3** | **Date Picker Field** | `.date-field`, `.date-field-icon`, `.date-field-value`, `.date-field-placeholder`, `.date-picker-quick` | Quick Add, Filter, Rental Contract form |
| **4** | **Amount Keypad** | `.keypad`, `.keypad-btn`, `.keypad-btn.primary`, `.keypad-btn.helper`, `.amount-display`, `.amount-display-currency` | Quick Add Bottom Sheet, Rental Transaction |
| **5** | **KPI Card** | `.kpi-card`, `.kpi-card-label`, `.kpi-card-value`, `.kpi-card-value.positive`, `.kpi-card-value.negative`, `.kpi-card-trend`, `.kpi-grid` | Dashboard Thu Chi, Dashboard Thuê Nhà, Home |
| **6** | **Chart Card** | `.chart-card`, `.chart-card-header`, `.chart-card-title`, `.chart-card-body`, `.chart-card-legend`, `.chart-legend-item` | Dashboard (biểu đồ tháng/năm), Reports |
| **7** | **Empty State** | `.empty-state`, `.empty-state-icon`, `.empty-state-title`, `.empty-state-desc`, `.empty-state-actions` | Transactions List (trống), Units (trống), Tenants (trống) |
| **8** | **Error State** | `.error-state`, `.error-state-header`, `.error-state-list`, `.error-state-item`, `.error-state-fix`, `.error-state-actions` | Import Excel (validation errors), Form errors |
| **9** | **Undo Toast** | `.toast`, `.toast-icon`, `.toast-message`, `.toast-action`, `.toast-progress` | Sau khi lưu giao dịch, xóa item |

---

## Layout Primitives

| Component | Class Names | Dùng Ở Đâu |
|-----------|-------------|------------|
| **App Container** | `.app`, `.app-content` | Root layout wrapper |
| **Top Bar** | `.topbar`, `.topbar-back`, `.topbar-title`, `.topbar-actions`, `.topbar-btn` | Tất cả màn hình con (back navigation) |
| **Bottom Nav** | `.bottom-nav`, `.bottom-nav-item`, `.bottom-nav-item.active`, `.bottom-nav-item-icon`, `.bottom-nav-badge` | Luôn hiển thị ở bottom |
| **FAB** | `.fab` | Home, Transactions List, Rental screens |
| **Card** | `.card`, `.card-header`, `.card-title`, `.card-clickable` | Module cards (Home), Unit cards, Tenant cards |
| **List Item** | `.list-item`, `.list-item-icon`, `.list-item-content`, `.list-item-title`, `.list-item-subtitle`, `.list-item-value`, `.list-item-arrow` | Transactions list, Settings menu, Receivables |
| **Divider** | `.divider`, `.divider-text` | Giữa sections, date headers trong list |
| **Bottom Sheet** | `.bottom-sheet`, `.bottom-sheet-handle`, `.bottom-sheet-overlay` | Quick Add, Pickers, Filters |

---

## Buttons

| Variant | Class Names | Dùng Ở Đâu |
|---------|-------------|------------|
| Primary | `.btn.btn-primary` | Lưu, Xác nhận, CTA chính |
| Secondary | `.btn.btn-secondary` | Hủy, actions phụ |
| Ghost | `.btn.btn-ghost` | Text buttons, inline actions |
| Danger | `.btn.btn-danger` | Xóa, actions nguy hiểm |
| Large | `.btn.btn-lg` | Full-width CTAs |
| Small | `.btn.btn-sm` | Compact buttons |
| Block | `.btn.btn-block` | Full-width buttons |

---

## Text & Colors

| Class | Mô Tả |
|-------|-------|
| `.text-secondary` | Text màu xám nhạt |
| `.text-muted` | Text màu xám rất nhạt |
| `.text-success` | Text màu xanh lá (thu/positive) |
| `.text-danger` | Text màu đỏ (chi/negative) |
| `.text-warning` | Text màu vàng (pending) |
| `.text-amount` | Font lớn, bold cho số tiền |

---

## Responsive Classes

| Breakpoint | Min Width | Behavior |
|------------|-----------|----------|
| Mobile | 0px | Single column, bottom nav |
| Tablet | 768px | Centered content 600px, bottom nav centered |
| Desktop | 1024px | Left sidebar nav, content 800px |

---

## Accessibility

| Feature | Implementation |
|---------|----------------|
| Focus ring | `--focus-ring` variable, applied on `:focus-visible` |
| Tap target | Min 44px (`--tap-min`) |
| Large text mode | Add `.large-text` to body |
| Dark mode | Auto via `prefers-color-scheme` or `.dark` class |
| Screen reader | `.sr-only` for hidden labels |
