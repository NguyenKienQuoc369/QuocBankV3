# QUOCBANK - Hệ Thống Ngân Hàng Trực Tuyến

## Giới thiệu
QUOCBANK là một ứng dụng web ngân hàng hoàn chỉnh được chuyển đổi từ Python sang HTML/CSS/JavaScript. Ứng dụng cung cấp đầy đủ các tính năng quản lý tài khoản và giao dịch ngân hàng.

## Tính năng chính

### Cho người dùng:
1. **Tạo tài khoản mới** - Quy trình 5 bước với xác thực
2. **Đăng nhập** - Bảo mật với mật khẩu
3. **Quên mật khẩu** - Khôi phục qua câu hỏi bảo mật
4. **Nạp tiền** - Nạp tiền vào tài khoản
5. **Rút tiền** - Rút tiền với phí 0.5%
6. **Chuyển tiền** - Chuyển tiền cho tài khoản khác với phí 0.5%
7. **Xem sao kê** - Xem lịch sử giao dịch trên màn hình
8. **Xuất sao kê** - Tải file .txt chứa lịch sử giao dịch

### Cho quản trị viên:
1. **Xem tất cả tài khoản** - Danh sách đầy đủ với số dư
2. **Xem thông tin đăng nhập** - Xem mật khẩu và câu hỏi bảo mật
3. **Xóa toàn bộ dữ liệu** - Reset hệ thống về trạng thái ban đầu

### Tính năng khác:
- **Hỗ trợ** - Hướng dẫn giải quyết lỗi thường gặp
- **Lưu trữ dữ liệu** - Tự động lưu vào localStorage
- **Giao diện terminal** - Thiết kế giống terminal với hiệu ứng đẹp mắt

## Cách sử dụng

### Mở ứng dụng:
1. Mở file `quocbank.html` bằng trình duyệt web (Chrome, Firefox, Edge, Safari)
2. Hoặc double-click vào file `quocbank.html`

### Tạo tài khoản mới:
1. Chọn "1. Tạo tài khoản mới" từ menu chính
2. Làm theo 5 bước:
   - Bước 1: Nhập tên chủ tài khoản
   - Bước 2: Nhập mật khẩu (2 lần để xác nhận)
   - Bước 3: Nhập câu hỏi bảo mật
   - Bước 4: Nhập câu trả lời
   - Bước 5: Nhập số dư ban đầu (có thể để 0)
3. Hệ thống sẽ tạo STK (Số Tài Khoản) tự động bắt đầu từ 100001
4. Lưu lại STK để đăng nhập

### Đăng nhập:
1. Chọn "2. Đăng nhập"
2. Nhập STK và mật khẩu
3. Truy cập menu cá nhân để thực hiện giao dịch

### Thực hiện giao dịch:
- **Nạp tiền**: Nhập số tiền muốn nạp (không có phí)
- **Rút tiền**: Nhập số tiền muốn rút (phí 0.5%)
  - Ví dụ: Rút 1,000,000 VND cần có 1,005,000 VND
- **Chuyển tiền**: 
  - Bước 1: Nhập STK người nhận
  - Bước 2: Nhập số tiền (phí 0.5%)

### Quên mật khẩu:
1. Chọn "3. Quên mật khẩu"
2. Nhập STK của bạn
3. Trả lời câu hỏi bảo mật
4. Đặt mật khẩu mới

## Cấu trúc file

```
quocbank.html    - Cấu trúc HTML chính
quocbank.css     - Styling và giao diện
quocbank.js      - Logic xử lý và lưu trữ dữ liệu
README.md        - Hướng dẫn sử dụng
```

## Công nghệ sử dụng

- **HTML5** - Cấu trúc trang web
- **CSS3** - Styling với hiệu ứng terminal
- **JavaScript (ES6+)** - Logic nghiệp vụ
- **localStorage** - Lưu trữ dữ liệu cục bộ

## Lưu ý quan trọng

1. **Dữ liệu được lưu trong localStorage** của trình duyệt
2. **Không xóa cache/dữ liệu trình duyệt** nếu muốn giữ tài khoản
3. **Phí giao dịch**: 0.5% cho rút tiền và chuyển tiền
4. **STK bắt đầu từ 100001** và tăng dần
5. **Câu trả lời bảo mật không phân biệt HOA/thường**

## Tính năng điều hướng

- **Nút "Lùi"**: Quay lại bước trước trong form nhiều bước
- **Nút "Hủy"**: Hủy thao tác và quay về menu
- **Nút "Quay lại"**: Quay về menu trước đó

## Bảo mật

- Mật khẩu được lưu dưới dạng văn bản (chỉ dùng cho mục đích học tập)
- Câu hỏi bảo mật để khôi phục mật khẩu
- Admin có thể xem toàn bộ thông tin (chức năng quản trị)

## Hỗ trợ

Nếu gặp vấn đề, chọn "7. Hỗ trợ / Giải đáp lỗi" từ menu chính để xem hướng dẫn chi tiết.

## Tác giả

Chuyển đổi từ ứng dụng Python QUOCBANK sang HTML/CSS/JavaScript

## Giấy phép

Dự án học tập - Sử dụng tự do cho mục đích giáo dục
