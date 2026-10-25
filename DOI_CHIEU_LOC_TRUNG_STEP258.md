# Đối chiếu Lọc trùng STEP258 vs v1.0.64

- Trước khi khôi phục, đoạn lõi Lọc trùng hai bản gần như trùng nhau, ngoại trừ hàm định dạng ngày khi xuất Excel.
- Khác biệt còn lại: STEP258 dùng `w.ktx || 'KTX 1'` và `w.day || 'Dãy 1'`; v1.0.64 dùng `K(w)` và `String(w.day||'')`.
- Bản này khôi phục chính xác mã STEP258 ở hai vị trí trên.
- Không hoàn tác các module QR, Mobile, phân quyền và tiện ích khác.
- Chưa chạy nghiệm thu trên Supabase Production.
