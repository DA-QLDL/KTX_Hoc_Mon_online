# Dự án Android KTX Hóc Môn (mã nguồn, KHÔNG phải APK đã biên dịch)

1. Mở Android Studio, chọn **Open** thư mục `ANDROID_STUDIO_APK_SOURCE`.
2. Để Android Studio tải Gradle và Android SDK (yêu cầu Internet và Android SDK 35).
3. Chọn **Build > Build Bundle(s) / APK(s) > Build APK(s)** để tạo APK debug.
4. Muốn phát hành lâu dài, dùng **Build > Generate Signed Bundle / APK** và giữ khóa ký riêng an toàn.

Ứng dụng WebView mở website chính HTTPS; mọi tài khoản và dữ liệu tiếp tục dùng Supabase của website. Dự án này chưa được biên dịch/kiểm nghiệm Android tại đây. Camera quét QR, tải DOCX, file Excel, thông báo và các quyền có thể khác Chrome và cần kiểm thử/bổ sung tích hợp native. Không có quyền camera Android trong dự án nguồn; quét camera có thể không dùng được trong APK cho đến khi triển khai quyền runtime và WebChromeClient.onPermissionRequest. Do đó nên **cài bản PWA từ Chrome** để dùng thực tế trong giai đoạn này.
