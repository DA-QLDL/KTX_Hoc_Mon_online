# KTX Hóc Môn v1.0.0 — Architecture B / production candidate

## Triển khai
Sao lưu hiện trạng Vercel và Supabase trước khi cập nhật. Sao chép **toàn bộ nội dung `deploy/`** vào thư mục gốc của repository `KTX_Hoc_Mon_online`, không sao chép `docs/` hay `tools/` lên website. Kiểm tra Preview trước khi phát hành Production.

## Kiến trúc
- 8 nhóm nghiệp vụ trong `deploy/assets/js/modules/`: admin, attendance, meals, overview, reports, residency, rooms, workers.
- `deploy/assets/js/core/`: mã dùng chung. 62 script nghiệp vụ giữ nguyên byte và thứ tự chạy.
- `deploy/assets/css/app.css`: CSS giữ nguyên thứ tự cascade, phong cách nút STEP100 từ STEP258.
- `deploy/api/`: API hiện có. Chưa thay đổi quyền Supabase/RLS.
- `deploy/sw.js`: cache mạng ưu tiên phiên bản mới, tách bảo vệ request API, giảm precache khởi động.
- Mã nguồn hợp lệ hóa đóng `</body></html>`; không thay đổi vị trí hoặc thứ tự các phần tử thực tế.

## Phạm vi thực hiện
Tối ưu kiến trúc phân phối, bộ nhớ đệm, tính tái lập và tài liệu phụ thuộc. **Không** tự nhận đã tái cấu trúc lại toàn bộ thuật toán, thay thế hệ phân quyền hay hoàn toàn loại bỏ các đoạn trùng CSS/JS khi chưa có kiểm thử tác vụ tương ứng. Biên bản sự vụ giữ ẩn trên Mobile.

## Nghiệm thu trước khi xuất bản
1. Kiểm tra đăng nhập Admin/nhân viên, RLS trực tiếp (không chỉ UI).
2. Kiểm tra hai KTX hiển thị song song, Quản lý công nhân, chuyển phòng, tìm kiếm, sửa dữ liệu có quyền.
3. Kiểm tra QR, điểm danh, suất ăn, xuất Excel, lịch sử và sao lưu/khôi phục.
4. Kiểm tra Mobile, hover nút STEP100, PWA sau khi tải lại.
5. Kiểm tra trên Vercel Preview, chụp lại cấu hình hiện tại để rollback.

## Tái tạo và audit
`tools/build_architecture_b.py` là công thức dựng/audit; muốn chạy lại cần đặt bản nguồn v1.0.0 được chỉ định trong đầu script tại đường dẫn tương ứng hoặc sửa cấu hình SOURCE/OUT trước khi chạy. `docs/FILE_HASHES.json` cho phép xác thực từng tệp; `docs/QA_SUMMARY.json` ghi giới hạn kiểm thử.
