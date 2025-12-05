# QUOCBANK V3 - CHANGELOG

## Version 1.1.0 - Phase 1.1 Bảo Mật (Đã hoàn thành 83%)

### 🔒 TÍNH NĂNG BẢO MẬT MỚI

#### 1. **Mã hóa mật khẩu SHA-256**
- ✅ Tất cả mật khẩu được hash bằng SHA-256
- ✅ Tự động migrate mật khẩu cũ khi đăng nhập
- ✅ Validate độ dài mật khẩu tối thiểu 6 ký tự

**Cách sử dụng:**
- Đăng ký tài khoản mới: Mật khẩu tự động được mã hóa
- Tài khoản cũ: Tự động hash khi đăng nhập lần đầu

#### 2. **Giới hạn đăng nhập sai**
- ✅ Đếm số lần đăng nhập sai
- ✅ Khóa tài khoản sau 5 lần sai
- ✅ Thời gian khóa: 5 phút
- ✅ Hiển thị số lần thử còn lại

**Cách test:**
1. Đăng nhập với mật khẩu sai 5 lần
2. Tài khoản sẽ bị khóa 5 phút
3. Thông báo hiển thị thời gian còn lại

#### 3. **Session Timeout**
- ✅ Tự động đăng xuất sau 15 phút không hoạt động
- ✅ Reset timer khi có hoạt động (click, scroll, type)
- ✅ Thông báo trước khi đăng xuất

**Cách hoạt động:**
- Không tương tác trong 15 phút → Tự động logout
- Mỗi lần click/scroll/type → Reset timer về 15 phút

#### 4. **Ghi chú giao dịch**
- ✅ Thêm field ghi chú cho mọi giao dịch
- ✅ Hiển thị trong lịch sử
- ✅ Tùy chọn (không bắt buộc)

**Cách sử dụng:**
1. Vào Chuyển tiền / Nạp tiền / Rút tiền
2. Nhập số tiền
3. Nhập ghi chú (tùy chọn)
4. Xác nhận giao dịch

#### 5. **Giới hạn giao dịch hàng ngày**
- ✅ Hạn mức mặc định: 50,000,000 VNĐ/ngày
- ✅ Tự động reset vào 00:00 mỗi ngày
- ✅ Áp dụng cho: Chuyển tiền & Rút tiền
- ✅ Không giới hạn Nạp tiền

**Cách hoạt động:**
- Tổng tiền chuyển + rút trong ngày không vượt quá 50 triệu
- Vượt hạn mức → Từ chối giao dịch
- Ngày mới → Reset về 0

#### 6. **Đổi mật khẩu** (Backend ready)
- ✅ Method `changePassword(oldPass, newPass)`
- ✅ Validate mật khẩu cũ
- ✅ Hash mật khẩu mới
- ⏳ UI chưa có (Phase 1.2)

#### 7. **PIN System** (Backend ready)
- ✅ Method `setPIN(pin)` - Đặt PIN 6 số
- ✅ Method `verifyPIN(pin)` - Xác thực PIN
- ✅ PIN được hash như password
- ⏳ UI modal xác nhận chưa có

---

### 📊 CẤU TRÚC DỮ LIỆU MỚI

```javascript
account = {
  // Existing
  id: "123456",
  name: "Nguyễn Văn A",
  pass: "hashed_password_sha256",
  balance: 10000000,
  history: [...],
  
  // New Security Fields
  pin: "hashed_pin_sha256",
  loginAttempts: 0,
  lockedUntil: null,
  
  // New Profile Fields
  email: "",
  phone: "",
  address: "",
  avatar: "",
  
  // New Transaction Limits
  dailyLimit: 50000000,
  dailySpent: 0,
  lastResetDate: "Mon Jan 01 2024",
  
  // New Features
  beneficiaries: [],
  createdAt: "2024-01-01T00:00:00.000Z"
}

transaction = {
  type: "income/expense/create",
  amount: 100000,
  desc: "Mô tả giao dịch",
  note: "Ghi chú thêm", // NEW
  date: "2024-01-01T00:00:00.000Z",
  balance: 10000000 // NEW - Số dư sau giao dịch
}
```

---

### 🧪 HƯỚNG DẪN TEST

#### Test 1: Đăng ký tài khoản mới
1. Mở http://localhost:8080
2. Click "Mở tài khoản mới"
3. Nhập thông tin (mật khẩu < 6 ký tự sẽ bị từ chối)
4. Đăng ký thành công → Nhận STK

#### Test 2: Đăng nhập sai nhiều lần
1. Đăng nhập với mật khẩu sai
2. Thông báo: "Sai mật khẩu. Còn X lần thử"
3. Sau 5 lần → "Tài khoản bị khóa 5 phút"
4. Đợi 5 phút hoặc xóa localStorage để unlock

#### Test 3: Session timeout
1. Đăng nhập thành công
2. Không tương tác trong 15 phút
3. Tự động logout với thông báo

#### Test 4: Giao dịch với ghi chú
1. Đăng nhập
2. Chuyển tiền / Nạp / Rút
3. Nhập ghi chú
4. Kiểm tra lịch sử → Ghi chú hiển thị

#### Test 5: Giới hạn giao dịch
1. Đăng nhập
2. Chuyển tiền 30 triệu → OK
3. Chuyển tiền thêm 25 triệu → Bị từ chối
4. Tổng trong ngày không vượt 50 triệu

---

### 🔧 TECHNICAL DETAILS

**Security Utilities:**
- `Security.hashPassword(password)` - SHA-256 hashing
- `Security.generateOTP()` - Random 6-digit OTP
- `Security.validatePassword(password)` - Check min length
- `Security.validatePIN(pin)` - Check 6 digits

**BankModel Methods:**
- `migrateOldAccounts()` - Auto migrate old data
- `initSession()` - Setup session timeout
- `resetSessionTimeout()` - Reset 15min timer
- `login(id, pass)` - Login with security checks
- `setPIN(pin)` - Set transaction PIN
- `verifyPIN(pin)` - Verify PIN
- `changePassword(oldPass, newPass)` - Change password
- `resetDailyLimitIfNeeded(user)` - Reset daily limit

---

### 📝 NOTES

1. **Backward Compatibility:** Tài khoản cũ tự động migrate khi load app
2. **Performance:** SHA-256 hashing là async, có thể delay nhẹ khi đăng nhập/đăng ký
3. **Storage:** Tất cả data lưu trong localStorage với key `quocbank_v3`
4. **Security:** Đây là demo app, production cần backend thực sự

---

### 🚀 NEXT STEPS (Phase 1.2)

1. Tạo Settings page
2. UI đổi mật khẩu
3. UI đặt/đổi PIN
4. Modal xác nhận PIN cho giao dịch
5. Form cập nhật thông tin cá nhân
6. Upload avatar

---

### 🐛 KNOWN ISSUES

- ⚠️ PIN modal chưa có UI
- ⚠️ Settings page chưa có
- ⚠️ Chưa có email/SMS notification
- ⚠️ Chưa có 2FA

---

**Version:** 1.1.0  
**Date:** 2024  
**Author:** BLACKBOXAI  
**Status:** Phase 1.1 - 83% Complete
