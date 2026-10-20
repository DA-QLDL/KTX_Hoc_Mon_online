# STEP218 – Chuyển phòng

- Chuẩn hóa khóa KTX, Dãy, Phòng và tính số người từ danh sách W được tải bởi hệ thống; không tự cho số phòng về 0.
- Khi mở cửa sổ chuyển phòng sẽ gọi tải lại Supabase nếu kết nối sẵn sàng, không ghi dữ liệu lên Cloud.
- Hiển thị 15 phòng, khóa / đầy không cho chọn.
- Sửa nội suy định mức.
- Làm gọn Mobile 3 cột, màn rất nhỏ 2 cột, phân màu còn chỗ/ít chỗ/đầy, giữ nút thao tác.
- Nếu dữ liệu Supabase vẫn không đúng hiện trạng thực tế, phải kiểm tra danh sách công nhân/điều chuyển: không tự sửa số người hoặc tự đổi trạng thái hồ sơ.
- Cập nhật riêng index.html trên nhánh thử nghiệm, không chạy SQL.
