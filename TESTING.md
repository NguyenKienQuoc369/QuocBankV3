# 🧪 QUOCBANK V3 - TESTING GUIDE

## 📋 OVERVIEW

File này hướng dẫn cách test toàn diện các tính năng đã implement trong Phase 1.1.

---

## 🚀 QUICK START

### Option 1: Automated Tests (Recommended)

1. **Mở ứng dụng:**
   ```
   http://localhost:8080
   ```

2. **Mở Browser Console:**
   - Chrome/Edge: `F12` hoặc `Ctrl+Shift+J`
   - Firefox: `F12` hoặc `Ctrl+Shift+K`
   - Safari: `Cmd+Option+C`

3. **Load test suite:**
   ```javascript
   // Copy nội dung file test-suite.js và paste vào console
   // Hoặc dùng:
   fetch('test-suite.js').then(r => r.text()).then(eval)
   ```

4. **Xem kết quả:**
   - Test suite sẽ chạy tự động
   - Kết quả hiển thị trong console
   - 34 tests sẽ được thực hiện

### Option 2: Manual UI Testing

Làm theo checklist bên dưới.

---

## ✅ MANUAL TESTING CHECKLIST

### PHASE 1: AUTHENTICATION & SECURITY

#### Test 1.1: Đăng ký tài khoản
- [ ] Click "Mở tài khoản mới"
- [ ] Nhập tên: "Test User"
- [ ] Nhập mật khẩu: "12345" (< 6 ký tự)
- [ ] **Expected:** Thông báo lỗi "Mật khẩu phải có ít nhất 6 ký tự"
- [ ] Nhập mật khẩu: "123456" (>= 6 ký tự)
- [ ] Nhập số dư: 1000000
- [ ] Click "ĐĂNG KÝ NGAY"
- [ ] **Expected:** Thông báo thành công + STK 6 chữ số
- [ ] **Lưu STK để test tiếp**

#### Test 1.2: Đăng nhập thành công
- [ ] Nhập STK vừa tạo
- [ ] Nhập mật khẩu đúng: "123456"
- [ ] Click "ĐĂNG NHẬP"
- [ ] **Expected:** Vào dashboard, hiển thị tên + STK

#### Test 1.3: Đăng nhập sai mật khẩu
- [ ] Logout (click icon power-off)
- [ ] Nhập STK
- [ ] Nhập mật khẩu sai: "wrong1"
- [ ] **Expected:** "Sai mật khẩu. Còn 4 lần thử"
- [ ] Thử lại với "wrong2"
- [ ] **Expected:** "Còn 3 lần thử"
- [ ] Tiếp tục đến lần thứ 5
- [ ] **Expected:** "Tài khoản bị khóa 5 phút"

#### Test 1.4: Tài khoản bị khóa
- [ ] Thử đăng nhập với mật khẩu đúng
- [ ] **Expected:** "Tài khoản bị khóa. Vui lòng thử lại sau X phút"
- [ ] **Unlock:** Mở console, chạy:
  ```javascript
  const db = JSON.parse(localStorage.getItem('quocbank_v3'));
  db.accounts['YOUR_STK'].lockedUntil = null;
  db.accounts['YOUR_STK'].loginAttempts = 0;
  localStorage.setItem('quocbank_v3', JSON.stringify(db));
  location.reload();
  ```

#### Test 1.5: Password hashing
- [ ] Mở console
- [ ] Chạy:
  ```javascript
  const db = JSON.parse(localStorage.getItem('quocbank_v3'));
  console.log(db.accounts['YOUR_STK'].pass);
  ```
- [ ] **Expected:** String 64 ký tự (SHA-256 hash)
- [ ] **Not:** Mật khẩu plain text

#### Test 1.6: Session timeout
- [ ] Đăng nhập thành công
- [ ] Không tương tác trong 15 phút
- [ ] **Expected:** Tự động logout + thông báo
- [ ] **Quick test:** Mở console, chạy:
  ```javascript
  bank.SESSION_DURATION = 10000; // 10 seconds
  bank.resetSessionTimeout();
  // Đợi 10 giây
  ```

---

### PHASE 2: TRANSACTIONS

#### Test 2.1: Chuyển tiền thành công
- [ ] Tạo tài khoản thứ 2 (STK khác)
- [ ] Đăng nhập tài khoản 1
- [ ] Click "Chuyển tiền"
- [ ] Nhập STK người nhận (tài khoản 2)
- [ ] Nhập số tiền: 100000
- [ ] Nhập ghi chú: "Test transfer"
- [ ] Click "XÁC NHẬN"
- [ ] **Expected:** Thông báo thành công
- [ ] Kiểm tra số dư giảm 100,000
- [ ] Đăng nhập tài khoản 2
- [ ] **Expected:** Số dư tăng 100,000

#### Test 2.2: Chuyển tiền với ghi chú
- [ ] Vào "Lịch sử"
- [ ] Xem giao dịch vừa rồi
- [ ] **Expected:** Hiển thị "Test transfer" trong mô tả

#### Test 2.3: Chuyển tiền không đủ số dư
- [ ] Chuyển tiền: 10,000,000 (nhiều hơn số dư)
- [ ] **Expected:** "Số dư không đủ"

#### Test 2.4: Chuyển tiền cho chính mình
- [ ] Nhập STK của chính mình
- [ ] **Expected:** "Không thể tự chuyển cho mình"

#### Test 2.5: Chuyển tiền đến STK không tồn tại
- [ ] Nhập STK: 999999
- [ ] **Expected:** "Người nhận không tồn tại"

#### Test 2.6: Nạp tiền
- [ ] Click "Nạp tiền"
- [ ] Nhập số tiền: 500000
- [ ] Nhập ghi chú: "Salary"
- [ ] Click "XÁC NHẬN"
- [ ] **Expected:** Số dư tăng 500,000

#### Test 2.7: Rút tiền thành công
- [ ] Click "Rút tiền"
- [ ] Nhập số tiền: 200000
- [ ] Nhập ghi chú: "ATM"
- [ ] Click "XÁC NHẬN"
- [ ] **Expected:** Số dư giảm 200,000

#### Test 2.8: Rút tiền không đủ số dư
- [ ] Rút tiền: 10,000,000
- [ ] **Expected:** "Số dư không đủ"

---

### PHASE 3: DAILY TRANSACTION LIMIT

#### Test 3.1: Giao dịch dưới hạn mức
- [ ] Reset daily spent (console):
  ```javascript
  const db = JSON.parse(localStorage.getItem('quocbank_v3'));
  db.accounts['YOUR_STK'].dailySpent = 0;
  localStorage.setItem('quocbank_v3', JSON.stringify(db));
  ```
- [ ] Chuyển tiền: 10,000,000
- [ ] **Expected:** Thành công

#### Test 3.2: Giao dịch vượt hạn mức
- [ ] Chuyển tiền thêm: 45,000,000
- [ ] **Expected:** "Vượt hạn mức giao dịch hàng ngày (50,000,000₫)"

#### Test 3.3: Nạp tiền không tính vào hạn mức
- [ ] Nạp tiền: 100,000,000
- [ ] **Expected:** Thành công (không bị giới hạn)

#### Test 3.4: Daily limit reset
- [ ] Mở console:
  ```javascript
  const db = JSON.parse(localStorage.getItem('quocbank_v3'));
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  db.accounts['YOUR_STK'].lastResetDate = yesterday.toDateString();
  localStorage.setItem('quocbank_v3', JSON.stringify(db));
  location.reload();
  ```
- [ ] Chuyển tiền: 10,000,000
- [ ] **Expected:** Thành công (limit đã reset)

---

### PHASE 4: HISTORY & DATA

#### Test 4.1: Lịch sử giao dịch
- [ ] Click "Lịch sử"
- [ ] **Expected:** Hiển thị tất cả giao dịch
- [ ] Kiểm tra mỗi giao dịch có:
  - [ ] Icon (mũi tên lên/xuống)
  - [ ] Mô tả
  - [ ] Ghi chú (nếu có)
  - [ ] Thời gian
  - [ ] Số tiền (màu xanh/đỏ)

#### Test 4.2: Số dư sau giao dịch
- [ ] Mở console:
  ```javascript
  const db = JSON.parse(localStorage.getItem('quocbank_v3'));
  console.log(db.accounts['YOUR_STK'].history[0]);
  ```
- [ ] **Expected:** Object có field `balance`

#### Test 4.3: LocalStorage persistence
- [ ] Reload trang (F5)
- [ ] **Expected:** Vẫn đăng nhập, data không mất
- [ ] Đóng tab, mở lại
- [ ] **Expected:** Cần đăng nhập lại (session mới)

---

### PHASE 5: UI/UX

#### Test 5.1: Navigation
- [ ] Click từng tab trong sidebar
- [ ] **Expected:** Tab active highlight
- [ ] Content thay đổi đúng

#### Test 5.2: Toast notifications
- [ ] Thực hiện giao dịch thành công
- [ ] **Expected:** Toast xanh với icon check
- [ ] Thực hiện giao dịch thất bại
- [ ] **Expected:** Toast đỏ với icon warning
- [ ] Toast tự động biến mất sau 3 giây

#### Test 5.3: Form validation
- [ ] Nhập số tiền âm
- [ ] **Expected:** Bị từ chối
- [ ] Nhập số tiền = 0
- [ ] **Expected:** Bị từ chối

#### Test 5.4: Responsive design
- [ ] Resize browser window
- [ ] **Expected:** Layout adapt
- [ ] Test trên mobile (F12 > Device toolbar)

#### Test 5.5: Animations
- [ ] **Expected:** Background orbs di chuyển mượt
- [ ] Hover buttons có hiệu ứng
- [ ] Toast slide in từ phải

---

## 🔍 ADVANCED TESTING

### Test Migration
```javascript
// Tạo tài khoản cũ (không hash)
const db = JSON.parse(localStorage.getItem('quocbank_v3'));
db.accounts['777777'] = {
    id: '777777',
    name: 'Old User',
    pass: 'plaintext',
    balance: 1000000,
    history: []
};
localStorage.setItem('quocbank_v3', JSON.stringify(db));

// Reload để trigger migration
location.reload();

// Kiểm tra
const newDb = JSON.parse(localStorage.getItem('quocbank_v3'));
console.log(newDb.accounts['777777'].pass.length); // Should be 64
```

### Test PIN System (Backend)
```javascript
// Set PIN
await bank.setPIN('123456');
console.log('PIN set:', bank.getAccount().pin !== null);

// Verify correct PIN
const correct = await bank.verifyPIN('123456');
console.log('Correct PIN:', correct === true);

// Verify wrong PIN
const wrong = await bank.verifyPIN('654321');
console.log('Wrong PIN:', wrong === false);
```

### Test Change Password (Backend)
```javascript
// Change password
const result = await bank.changePassword('oldpass', 'newpass123');
console.log('Password changed:', result.success);

// Try login with new password
bank.logout();
const login = await bank.login('YOUR_STK', 'newpass123');
console.log('Login with new pass:', login.success);
```

---

## 📊 EXPECTED RESULTS

### All Tests Should Pass:
- ✅ 34/34 automated tests
- ✅ All manual UI tests
- ✅ No console errors
- ✅ Data persists correctly
- ✅ Security features work

### Performance:
- Page load: < 1s
- Transaction: < 100ms
- Hash password: < 50ms
- Session check: < 10ms

---

## 🐛 TROUBLESHOOTING

### Issue: Tests fail
**Solution:** Clear localStorage and retry
```javascript
localStorage.removeItem('quocbank_v3');
location.reload();
```

### Issue: Account locked
**Solution:** Unlock manually
```javascript
const db = JSON.parse(localStorage.getItem('quocbank_v3'));
Object.keys(db.accounts).forEach(id => {
    db.accounts[id].lockedUntil = null;
    db.accounts[id].loginAttempts = 0;
});
localStorage.setItem('quocbank_v3', JSON.stringify(db));
location.reload();
```

### Issue: Session timeout too fast
**Solution:** Increase duration
```javascript
// In script.js, line 40
this.SESSION_DURATION = 60 * 60 * 1000; // 1 hour
```

---

## 📝 TEST REPORT TEMPLATE

```
QUOCBANK V3 - TEST REPORT
Date: [DATE]
Tester: [NAME]
Version: 1.1.0

AUTOMATED TESTS:
- Total: 34
- Passed: __/34
- Failed: __/34
- Success Rate: __%

MANUAL UI TESTS:
- Authentication: __ PASS / __ FAIL
- Transactions: __ PASS / __ FAIL
- Daily Limit: __ PASS / __ FAIL
- History: __ PASS / __ FAIL
- UI/UX: __ PASS / __ FAIL

ISSUES FOUND:
1. [Description]
2. [Description]

RECOMMENDATIONS:
1. [Recommendation]
2. [Recommendation]

OVERALL STATUS: ✅ PASS / ❌ FAIL
```

---

## 🎯 NEXT STEPS

After all tests pass:
1. ✅ Mark Phase 1.1 as complete
2. 🚀 Start Phase 1.2 (Settings page)
3. 📝 Update TODO.md
4. 🎉 Celebrate!

---

**Happy Testing! 🧪**
