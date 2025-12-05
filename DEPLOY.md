# Hướng dẫn Deploy QUOCBANK lên GitHub Pages

## Bước 1: Tạo Repository trên GitHub

1. Truy cập https://github.com và đăng nhập
2. Click nút **"New"** hoặc **"+"** → **"New repository"**
3. Đặt tên repository: `quocbank` (hoặc tên bạn muốn)
4. Chọn **Public** (để deploy miễn phí)
5. **KHÔNG** chọn "Add a README file"
6. Click **"Create repository"**

## Bước 2: Upload Code lên GitHub

### Cách 1: Sử dụng Git Command Line (Khuyến nghị)

Mở terminal trong thư mục chứa code và chạy:

```bash
# Khởi tạo git repository
git init

# Thêm tất cả files
git add .

# Commit
git commit -m "Initial commit - QUOCBANK Banking System"

# Thêm remote repository (thay YOUR_USERNAME bằng username GitHub của bạn)
git remote add origin https://github.com/YOUR_USERNAME/quocbank.git

# Đổi branch sang main
git branch -M main

# Push code lên GitHub
git push -u origin main
```

### Cách 2: Upload trực tiếp qua GitHub Web

1. Vào repository vừa tạo
2. Click **"uploading an existing file"**
3. Kéo thả các files sau vào:
   - `index.html`
   - `quocbank.css`
   - `quocbank.js`
   - `README.md`
   - `.gitignore`
4. Click **"Commit changes"**

## Bước 3: Kích hoạt GitHub Pages

1. Vào repository của bạn trên GitHub
2. Click tab **"Settings"**
3. Scroll xuống phần **"Pages"** ở menu bên trái
4. Trong phần **"Source"**:
   - Chọn branch: **main**
   - Chọn folder: **/ (root)**
5. Click **"Save"**
6. Đợi 1-2 phút để GitHub build

## Bước 4: Truy cập Website

Website của bạn sẽ có địa chỉ:
```
https://YOUR_USERNAME.github.io/quocbank/
```

Thay `YOUR_USERNAME` bằng username GitHub của bạn.

## Ví dụ cụ thể:

Nếu username GitHub của bạn là `nguyenvana`, thì:
- Repository URL: `https://github.com/nguyenvana/quocbank`
- Website URL: `https://nguyenvana.github.io/quocbank/`

## Cập nhật Website

Mỗi khi bạn muốn cập nhật website:

```bash
# Thêm các thay đổi
git add .

# Commit với message mô tả
git commit -m "Update: mô tả thay đổi"

# Push lên GitHub
git push
```

Website sẽ tự động cập nhật sau 1-2 phút.

## Lưu ý quan trọng:

1. **Repository phải là Public** để dùng GitHub Pages miễn phí
2. **File chính phải tên là `index.html`** (đã tạo sẵn)
3. Dữ liệu được lưu trong **localStorage của trình duyệt**, không lưu trên server
4. Mỗi người dùng sẽ có dữ liệu riêng trên máy của họ
5. Website hoàn toàn **miễn phí** và **không giới hạn traffic**

## Tùy chỉnh Domain (Tùy chọn)

Nếu bạn có domain riêng:
1. Vào Settings → Pages
2. Thêm domain vào phần "Custom domain"
3. Cấu hình DNS theo hướng dẫn của GitHub

## Troubleshooting

### Website không hiển thị sau khi deploy:
- Đợi thêm 5-10 phút
- Xóa cache trình duyệt (Ctrl + Shift + R)
- Kiểm tra lại Settings → Pages đã chọn đúng branch chưa

### Lỗi 404:
- Đảm bảo file `index.html` nằm ở root folder
- Kiểm tra tên file viết đúng (phân biệt hoa thường)

### CSS/JS không load:
- Kiểm tra đường dẫn trong `index.html`
- Đảm bảo tất cả files đã được push lên GitHub

## Hỗ trợ

Nếu gặp vấn đề, tham khảo:
- GitHub Pages Documentation: https://docs.github.com/en/pages
- GitHub Community: https://github.community/

---

**Chúc bạn deploy thành công! 🚀**
