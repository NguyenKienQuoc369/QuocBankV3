#!/bin/bash

# QUOCBANK Auto Deploy Script
# Script tự động deploy lên GitHub Pages

echo "=================================="
echo "  QUOCBANK - Auto Deploy Script  "
echo "=================================="
echo ""

# Kiểm tra git đã được cài đặt chưa
if ! command -v git &> /dev/null
then
    echo "❌ Git chưa được cài đặt. Vui lòng cài đặt Git trước."
    echo "   Tải tại: https://git-scm.com/downloads"
    exit 1
fi

echo "✅ Git đã được cài đặt"
echo ""

# Hỏi username GitHub
read -p "Nhập GitHub username của bạn: " github_username

if [ -z "$github_username" ]; then
    echo "❌ Username không được để trống!"
    exit 1
fi

# Hỏi tên repository
read -p "Nhập tên repository (mặc định: quocbank): " repo_name
repo_name=${repo_name:-quocbank}

echo ""
echo "📋 Thông tin deploy:"
echo "   - GitHub Username: $github_username"
echo "   - Repository: $repo_name"
echo "   - Website URL: https://$github_username.github.io/$repo_name/"
echo ""

read -p "Xác nhận deploy? (y/n): " confirm

if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "❌ Đã hủy deploy"
    exit 0
fi

echo ""
echo "🚀 Bắt đầu deploy..."
echo ""

# Kiểm tra xem đã init git chưa
if [ ! -d ".git" ]; then
    echo "📦 Khởi tạo Git repository..."
    git init
    echo "✅ Đã khởi tạo Git"
else
    echo "✅ Git repository đã tồn tại"
fi

# Thêm tất cả files
echo "📝 Thêm files..."
git add .

# Commit
echo "💾 Commit changes..."
git commit -m "Deploy QUOCBANK Banking System - $(date '+%Y-%m-%d %H:%M:%S')"

# Kiểm tra remote đã tồn tại chưa
if git remote | grep -q "origin"; then
    echo "🔄 Remote origin đã tồn tại, đang cập nhật..."
    git remote set-url origin "https://github.com/$github_username/$repo_name.git"
else
    echo "🔗 Thêm remote origin..."
    git remote add origin "https://github.com/$github_username/$repo_name.git"
fi

# Đổi branch sang main
echo "🌿 Chuyển sang branch main..."
git branch -M main

# Push lên GitHub
echo "⬆️  Đang push lên GitHub..."
git push -u origin main --force

echo ""
echo "=================================="
echo "✅ DEPLOY THÀNH CÔNG!"
echo "=================================="
echo ""
echo "🌐 Website của bạn:"
echo "   https://$github_username.github.io/$repo_name/"
echo ""
echo "📝 Lưu ý:"
echo "   - Đợi 1-2 phút để GitHub Pages build"
echo "   - Vào Settings → Pages để kích hoạt GitHub Pages"
echo "   - Chọn branch 'main' và folder '/ (root)'"
echo ""
echo "🎉 Chúc mừng! Website đã sẵn sàng!"
