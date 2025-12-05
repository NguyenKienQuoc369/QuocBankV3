# 🏦 QUOCBANK V3 - Digital Banking Revolution

Ứng dụng ngân hàng số hiện đại với giao diện Glass Morphism và các tính năng bảo mật nâng cao.

![Version](https://img.shields.io/badge/version-1.1.0-blue)
![Status](https://img.shields.io/badge/status-Phase%201.1-green)
![Security](https://img.shields.io/badge/security-SHA--256-red)

---

## 📋 MỤC LỤC

- [Tính năng](#-tính-năng)
- [Cài đặt](#-cài-đặt)
- [Sử dụng](#-sử-dụng)
- [Bảo mật](#-bảo-mật)
- [Roadmap](#-roadmap)
- [Changelog](#-changelog)

---

## ✨ TÍNH NĂNG

### ✅ Đã có (Phase 1.1 - 83%)

#### 🔐 Bảo mật
- ✅ Mã hóa mật khẩu SHA-256
- ✅ Giới hạn đăng nhập sai (5 lần → khóa 5 phút)
- ✅ Session timeout (15 phút không hoạt động)
- ✅ Giới hạn giao dịch hàng ngày (50 triệu VNĐ)
- ✅ PIN system (Backend ready, UI coming soon)

#### 💰 Giao dịch
- ✅ Chuyển tiền giữa các tài khoản
- ✅ Nạp tiền
- ✅ Rút tiền
- ✅ Ghi chú cho giao dịch
- ✅ Lịch sử giao dịch chi tiết

#### 👤 Tài khoản
- ✅ Đăng ký tài khoản mới
- ✅ Đăng nhập bảo mật
- ✅ Xem số dư
- ✅ Đổi mật khẩu (Backend ready)

#### 🎨 Giao diện
- ✅ Glass Morphism Design
- ✅ Responsive layout
- ✅ Animated background
- ✅ Toast notifications
- ✅ Dark theme

### ⏳ Đang phát triển (Phase 1.2-1.4)

- ⏳ Settings page
- ⏳ Cập nhật thông tin cá nhân
- ⏳ Upload avatar
- ⏳ Danh bạ người nhận
- ⏳ OTP xác thực
- ⏳ Bộ lọc lịch sử
- ⏳ Tìm kiếm giao dịch
- ⏳ Xuất PDF sao kê

---

## 🚀 CÀI ĐẶT

### Yêu cầu
- Trình duyệt web hiện đại (Chrome, Firefox, Edge, Safari)
- Python 3 (để chạy local server) hoặc bất kỳ web server nào

### Cách 1: Sử dụng Python
```bash
# Clone hoặc download project
cd QuocBankV3

# Chạy server
python3 -m http.server 8080

# Mở browser
http://localhost:8080
```

### Cách 2: Sử dụng Live Server (VS Code)
1. Cài extension "Live Server"
2. Right-click vào `index.html`
3. Chọn "Open with Live Server"

### Cách 3: Mở trực tiếp
- Double-click vào `index.html`
- Một số tính năng có thể không hoạt động do CORS

---

## 📖 SỬ DỤNG

### 1. Đăng ký tài khoản

```
1. Mở ứng dụng
2. Click "Mở tài khoản mới"
3. Nhập thông tin:
   - Họ tên
   - Mật khẩu (tối thiểu 6 ký tự)
   - Số dư ban đầu
4. Click "ĐĂNG KÝ NGAY"
5. Lưu lại STK được cấp
```

**Lưu ý:** Mật khẩu sẽ được mã hóa SHA-256 tự động.

### 2. Đăng nhập

```
1. Nhập STK (6 chữ số)
2. Nhập mật khẩu
3. Click "ĐĂNG NHẬP"
```

**Bảo mật:**
- Sai mật khẩu 5 lần → Khóa tài khoản 5 phút
- Không hoạt động 15 phút → Tự động đăng xuất

### 3. Chuyển tiền

```
1. Click "Chuyển tiền" trong sidebar
2. Nhập STK người nhận
3. Nhập số tiền
4. Nhập ghi chú (tùy chọn)
5. Click "XÁC NHẬN GIAO DỊCH"
```

**Giới hạn:**
- Tổng chuyển tiền + rút tiền trong ngày: 50 triệu VNĐ
- Số dư phải đủ
- Không thể tự chuyển cho mình

### 4. Nạp tiền / Rút tiền

```
1. Click "Nạp tiền" hoặc "Rút tiền"
2. Nhập số tiền
3. Nhập ghi chú (tùy chọn)
4. Click "XÁC NHẬN GIAO DỊCH"
```

**Lưu ý:**
- Nạp tiền: Không giới hạn
- Rút tiền: Tính vào hạn mức 50 triệu/ngày

### 5. Xem lịch sử

```
1. Click "Lịch sử" trong sidebar
2. Xem tất cả giao dịch
3. Mỗi giao dịch hiển thị:
   - Loại (Thu/Chi)
   - Số tiền
   - Mô tả
   - Ghi chú
   - Thời gian
```

---

## 🔒 BẢO MẬT

### Mã hóa mật khẩu

```javascript
// SHA-256 hashing
const hashedPassword = await Security.hashPassword(password);
// Output: 64-character hex string
```

**Đặc điểm:**
- Sử dụng Web Crypto API
- One-way hashing (không thể decrypt)
- Tự động migrate tài khoản cũ

### Giới hạn đăng nhập

```javascript
// Login attempts tracking
loginAttempts: 0-5
lockedUntil: null | ISO timestamp

// Logic
if (loginAttempts >= 5) {
  lockedUntil = now + 5 minutes
}
```

**Cách unlock:**
- Đợi 5 phút
- Hoặc xóa localStorage (dev only)

### Session Management

```javascript
// Session timeout: 15 minutes
SESSION_DURATION = 15 * 60 * 1000

// Reset on activity
['mousedown', 'keydown', 'scroll', 'touchstart']
```

**Hoạt động:**
- Mỗi tương tác → Reset timer
- Hết 15 phút → Auto logout

### Daily Transaction Limit

```javascript
// Default limit
dailyLimit: 50,000,000 VNĐ

// Tracked transactions
- Chuyển tiền (transfer)
- Rút tiền (withdraw)

// Not tracked
- Nạp tiền (deposit)
```

**Reset:** Tự động vào 00:00 mỗi ngày

---

## 🗂️ CẤU TRÚC PROJECT

```
QuocBankV3/
├── index.html          # Main HTML
├── script.js           # JavaScript logic
├── style.css           # Styling
├── TODO.md            # Development tasks
├── CHANGELOG.md       # Version history
└── README.md          # This file
```

### Cấu trúc code

```javascript
// Security utilities
Security {
  hashPassword()
  generateOTP()
  validatePassword()
  validatePIN()
}

// Data model
BankModel {
  // Core
  save()
  createAccount()
  login()
  logout()
  getAccount()
  
  // Transactions
  transfer()
  updateBalance()
  
  // Security
  setPIN()
  verifyPIN()
  changePassword()
  resetDailyLimitIfNeeded()
  
  // Session
  initSession()
  resetSessionTimeout()
  
  // Migration
  migrateOldAccounts()
}

// UI controller
app {
  init()
  bindEvents()
  checkAuth()
  renderDashboard()
  renderContent()
  handleAction()
  notify()
}
```

---

## 📊 DỮ LIỆU

### LocalStorage

```javascript
// Key
'quocbank_v3'

// Structure
{
  accounts: {
    "123456": {
      id: "123456",
      name: "Nguyễn Văn A",
      pass: "hashed_sha256",
      balance: 10000000,
      history: [...],
      pin: "hashed_sha256",
      loginAttempts: 0,
      lockedUntil: null,
      email: "",
      phone: "",
      address: "",
      avatar: "",
      dailyLimit: 50000000,
      dailySpent: 0,
      lastResetDate: "Mon Jan 01 2024",
      beneficiaries: [],
      createdAt: "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Transaction History

```javascript
{
  type: "income" | "expense" | "create",
  amount: 100000,
  desc: "Mô tả giao dịch",
  note: "Ghi chú thêm",
  date: "2024-01-01T00:00:00.000Z",
  balance: 10000000
}
```

---

## 🛣️ ROADMAP

### ✅ Phase 1.1 - Bảo mật (83% done)
- [x] Password hashing
- [x] Login attempts
- [x] Session timeout
- [x] Daily limit
- [x] Transaction notes
- [ ] PIN modal UI

### ⏳ Phase 1.2 - Quản lý tài khoản
- [ ] Settings page
- [ ] Change password UI
- [ ] Update profile
- [ ] Avatar upload

### ⏳ Phase 1.3 - Giao dịch nâng cao
- [ ] Transaction notes UI
- [ ] OTP system
- [ ] Beneficiaries management
- [ ] PIN confirmation modal

### ⏳ Phase 1.4 - Lịch sử & Báo cáo
- [ ] Filter system
- [ ] Search functionality
- [ ] Export PDF
- [ ] Pagination

### 🔮 Phase 2 - Tính năng nâng cao
- [ ] Savings accounts
- [ ] Interest calculation
- [ ] Cards management
- [ ] Bill payments
- [ ] QR code payments
- [ ] Charts & analytics

### 🔮 Phase 3 - Chuyên nghiệp
- [ ] Loans system
- [ ] Scheduled transfers
- [ ] Admin dashboard
- [ ] Chat support
- [ ] Multi-language

---

## 🧪 TESTING

### Test Cases

#### 1. Security Tests
```bash
✓ Password hashing works
✓ Login attempts counter works
✓ Account locks after 5 failed attempts
✓ Session timeout after 15 minutes
✓ Daily limit enforced
```

#### 2. Transaction Tests
```bash
✓ Transfer between accounts
✓ Deposit money
✓ Withdraw money
✓ Transaction notes saved
✓ History updated correctly
```

#### 3. UI Tests
```bash
✓ Login/Register forms work
✓ Navigation works
✓ Toast notifications show
✓ Responsive design
✓ Animations smooth
```

---

## 🐛 KNOWN ISSUES

1. **PIN Modal chưa có UI** - Backend ready, cần implement modal
2. **Settings page chưa có** - Đang trong Phase 1.2
3. **Không có email notification** - Sẽ có trong Phase 2
4. **Chưa có 2FA** - Sẽ có trong Phase 2

---

## 💡 TIPS & TRICKS

### Reset tài khoản bị khóa (Dev only)
```javascript
// Open browser console
localStorage.removeItem('quocbank_v3')
// Reload page
```

### Xem dữ liệu trong localStorage
```javascript
// Open browser console
JSON.parse(localStorage.getItem('quocbank_v3'))
```

### Thay đổi session timeout
```javascript
// In script.js, line 40
this.SESSION_DURATION = 5 * 60 * 1000; // 5 minutes
```

### Thay đổi daily limit
```javascript
// In script.js, line 66
if (!acc.dailyLimit) acc.dailyLimit = 100000000; // 100 triệu
```

---

## 📝 CHANGELOG

Xem [CHANGELOG.md](CHANGELOG.md) để biết chi tiết các thay đổi.

---

## 🤝 CONTRIBUTING

Dự án này đang trong giai đoạn phát triển. Mọi đóng góp đều được hoan nghênh!

### Cách đóng góp
1. Fork project
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

---

## 📄 LICENSE

MIT License - Free to use for personal and commercial projects.

---

## 👨‍💻 AUTHOR

**BLACKBOXAI**
- Version: 1.1.0
- Date: 2024
- Status: Active Development

---

## 🙏 ACKNOWLEDGMENTS

- Font Awesome - Icons
- Google Fonts - Outfit font
- Web Crypto API - Security

---

## 📞 SUPPORT

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra [CHANGELOG.md](CHANGELOG.md)
2. Xem [TODO.md](TODO.md)
3. Mở issue trên GitHub

---

**⭐ Nếu thấy hữu ích, hãy star project này!**

---

*Last updated: 2024 - Phase 1.1 Complete (83%)*
