TRIỂN KHAI KTX HÓC MÔN v1.0.0

1. Tạo backup online/local trước khi cập nhật.
2. Upload/commit toàn bộ file trong gói này vào root repository trong MỘT commit.
3. Không xóa index.html ở một commit riêng trước khi upload file mới.
4. Kiểm tra Vercel Production Branch = main và deployment mới phải trỏ đúng commit vừa upload.
5. Khi deployment Ready, mở web và hard refresh một lần để Service Worker nhận cache v1.0.0.
6. Vào Hệ thống → Nghiệm thu Production, kiểm tra đủ checklist.
7. Vào Hệ thống → Phát hành v1.0. Nếu đủ điều kiện mới tạo Git tag/release v1.0.0.

Rollback: dùng deployment Stable gần nhất trên Vercel hoặc khôi phục commit trước đó; không xóa dữ liệu Supabase.
