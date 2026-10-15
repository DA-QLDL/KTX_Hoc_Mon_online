# KTX Hóc Môn Online v27

Bản tái cấu trúc từ ứng dụng HTML v26 thành Next.js/Vercel + Supabase.

## Module đã chuyển

1. **Auth** — Supabase Auth + `app_accounts` + `access_requests`.
2. **Worker** — bảng `workers`, tìm kiếm/lọc, thêm/sửa/xóa theo quyền, export CSV.
3. **Audit** — trigger PostgreSQL ghi nhật ký thêm/sửa/xóa công nhân vào `audit_logs`.

Các module QR, Suất ăn, Tạm trú/Tạm vắng và Điều chuyển được giữ ở sidebar dưới trạng thái "Sau" để chuyển ở giai đoạn kế tiếp.

## 1. Chuẩn bị Supabase

Nếu project của bạn đã chạy `supabase_ktx_accounts_setup.sql` ở v23-v26 thì giữ nguyên.

Tiếp tục mở **SQL Editor** và chạy:

`supabase/001_online_core.sql`

SQL sẽ tạo `workers`, `audit_logs`, RLS theo vai trò/phạm vi và trigger audit.

## 2. Import dữ liệu công nhân cũ

Bảng mới `workers` chưa tự có 2.000+ hồ sơ đang nằm trong localStorage của v26.

Cách an toàn nhất cho lần đầu:

- Từ v26 xuất Excel/CSV danh sách công nhân.
- Chuẩn hóa header về các cột trong `supabase/002_import_workers_template.sql`.
- Supabase → Table Editor → workers → Import CSV.
- Kiểm tra tổng quân số trước khi dùng bản online làm dữ liệu chính.

Không xóa dữ liệu v26/localStorage cho đến khi đối chiếu xong.

## 3. Biến môi trường

Copy `.env.example` thành `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxx
```

Không dùng `service_role` hoặc Secret key trong frontend.

## 4. Chạy local

```bash
npm install
npm run dev
```

Mở `http://localhost:3000`.

## 5. Deploy Vercel

- Push folder này lên GitHub repository mới, ví dụ `KTX-HocMon-Online`.
- Vercel → Add New Project → Import repository.
- Thêm 2 Environment Variables giống `.env.local`.
- Deploy.
- Trong Supabase Auth → URL Configuration, đặt Site URL thành domain Vercel.

## 6. Phân quyền

- `admin`: toàn quyền; được xóa công nhân, quản lý tài khoản, xem Audit.
- `manager`: đọc/ghi công nhân trong phạm vi KTX/Dãy; xem Audit.
- `staff`: đọc/ghi công nhân trong phạm vi KTX/Dãy.
- `viewer`: chỉ đọc trong phạm vi KTX/Dãy.

Phạm vi được lấy trực tiếp từ `app_accounts.ktx` và `app_accounts.days` và được enforce bằng PostgreSQL RLS, không chỉ ẩn nút ở giao diện.

## 7. Kiến trúc

- `modules/auth`: AuthProvider, session, account/role.
- `modules/workers`: API và type công nhân.
- `modules/audit`: API và type nhật ký.
- `components`: sidebar/AppShell/PageHeader/modal.
- `app/*`: route riêng theo Next.js App Router.

Đây là nền tảng để chuyển tiếp QR → Tạm trú → Điều chuyển → Suất ăn mà không quay lại kiến trúc single-file.

## 8. Import CSV tiếng Việt (v28)

Trước khi dùng nút **Nhập CSV tiếng Việt**, chạy thêm:

`supabase/003_workers_vietnamese_import.sql`

Ứng dụng chấp nhận file CSV với tiêu đề tiếng Việt:

`STT;Họ và Tên;Mã NV;Tiểu Đoàn;Đơn vị;KTX;Dãy;Phòng;Giới tính;SĐT;CCCD;Ngày sinh;Thôn/Xóm;Xã/Phường;Tỉnh/TP;Ngày Vào KTX;Ngày Ra KTX;Số Ngày Lưu Trú;Tổ Trưởng;SĐT Tổ Trưởng;Trạng thái tạm trú, Tạm vắng`

Ngoài ra bộ ánh xạ vẫn nhận các tên cũ như `Name`, `MNV`, `battalion`, `Unit`, `Day`, `Rom`, `Gender`, `Phone`, `Dob`, `check_in_date`, `leader`.

CSV có thể dùng dấu `;` hoặc `,`. Ngày `DD/MM/YYYY` sẽ tự chuyển thành `YYYY-MM-DD` trước khi gửi lên Supabase. Người dùng không cần đổi tên tiêu đề sang tiếng Anh.
