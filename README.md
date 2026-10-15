# KTX Hóc Môn Online v30

Tiếp tục từ v29.1, không loại bỏ chức năng cũ.

## Module Online/Supabase
- Auth / phân quyền
- Quản lý công nhân / CSV tiếng Việt
- Audit
- QR Portal
- Tạm trú · Tạm vắng
- Điều chuyển · Nghỉ việc
- **Báo cáo suất ăn** (v30)
- **Lọc trùng** (v30)
- **Tách/Gộp địa chỉ** (v30)

## Chức năng Legacy còn giữ
- PDF → ảnh
- Lưu trữ tài liệu
- Sao lưu · Khôi phục

## Cập nhật Supabase
Chạy `supabase/005_meal_online.sql` trong SQL Editor trước khi dùng Báo cáo suất ăn Online.

## Lưu ý
Báo cáo suất ăn Online giữ form nhập số suất, suất mặn/chay, cân định lượng, sao chép nội dung, tải Word và lưu lịch sử Supabase. Công cụ nhập thực đơn Excel nâng cao của v26 vẫn được giữ bằng nút mở Legacy để không mất chức năng trong giai đoạn chuyển đổi.


## v30.1
- Sửa build Vercel/Next.js 15 cho `/address-tools`: bọc `useSearchParams()` trong `Suspense`.
- Không thay đổi chức năng hay dữ liệu.
