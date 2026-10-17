CÁCH ĐƯA BẢN STABLE LÊN PRODUCTION

1. Giải nén ZIP.
2. Upload toàn bộ file vào ROOT repo GitHub KTX_Hoc_Mon_online.
3. Không xóa index.html trước rồi mới upload lại.
4. Commit một lần, ví dụ: "Stable Production 101".
5. Vercel phải tự tạo deployment mới từ nhánh main.
6. Kiểm tra Source của deployment không được là commit "Delete index.html".
7. Khi Ready + Production, mở https://ktx-hoc-mon-online.vercel.app và Ctrl+F5.

Rollback:
- Vercel > Deployments > chọn deployment Stable trước đó > Promote/Instant Rollback.
