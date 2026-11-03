# 🌸 CHÁNH ĐIỆN TỊNH TÂM - TIKTOK LIVE INTERACTIVE STREAM ENGINE 🌸

Hệ thống Livestream Tương Tác Chánh Điện / Thiền Viện Online dành cho TikTok Live Studio & OBS Studio. 
Tự động bắt sự kiện người xem bình luận, thả tim và tặng quà (donate) để cấp bồ đoàn tĩnh tọa, thăng tòa VIP Sen Vàng, rền chuông Đại Hồng Chung và AI xướng danh công đức.

---

## 🚀 1. Hướng Dẫn Khởi Động Nhanh (1-Click)

1. Mở thư mục dự án: `C:\Users\Administrator\.gemini\antigravity\scratch\tiktok-zen-live`
2. Nhấp đúp vào file **`start.bat`** (hoặc mở Terminal chạy `node server.js`).
3. Màn hình console sẽ hiện:
   - 📺 **Màn hình Overlay Chánh Điện (Cho OBS):** `http://localhost:3000/?layout=vertical`
   - 🎛️ **Bảng Điều Khiển & Giả Lập Test (Admin):** `http://localhost:3000/admin.html`

---

## 📹 2. Hướng Dẫn Thêm Vào OBS Studio / TikTok LIVE Studio

1. Mở **OBS Studio** (hoặc **TikTok LIVE Studio**).
2. Tại khung **Sources (Nguồn)**, bấm dấu **`+`** -> Chọn **Browser (Trình duyệt)**.
3. Đặt tên nguồn: `ChanhDienLive`.
4. Cài đặt các thông số:
   * **URL:** `http://localhost:3000/?layout=vertical` *(Khung Dọc)* hoặc `http://localhost:3000/?layout=horizontal` *(Khung Ngang)*.
   * **Width (Chiều rộng):** `1080` (Dọc) hoặc `1920` (Ngang).
   * **Height (Chiều cao):** `1920` (Dọc) hoặc `1080` (Ngang).
   * **FPS:** `30` hoặc `60`.
   * **Tích chọn:** *Control audio via OBS* (Để nghe tiếng chuông mõ qua OBS) và *Shutdown source when not visible*.
5. Bấm **OK**. Màn hình Chánh Điện lung linh sẽ hiện ra ngay lập tức!

---

## 🎮 3. Cách Sử Dụng Bảng Điều Khiển Admin (Giả Lập & Live Thật)

Truy cập: **`http://localhost:3000/admin.html`** trên trình duyệt Chrome/Edge:

1. **Bộ Giả Lập (Test trước khi live thật):**
   * **👥 Lấp đầy 12 bồ đoàn ngay:** Tự động sinh 12 thiền sinh ảo vào ngồi để xem layout đẹp mắt.
   * **💬 1 Người Cmt vào ngồi:** Thử nghiệm người mới bình luận chiếm 1 chỗ ngồi.
   * **💖 Thả Tim / Gõ Mõ:** Kích hoạt tiếng mõ cốc cốc và các thiền sinh cúi lạy Phật.
   * **🎁 Tặng Quà Cúng Dường (Hoa Hồng, Trầm Hương, Vũ Trụ):**
     * Avatar người donate phóng to giữa màn hình.
     * Tiếng Chuông Đại Hồng Chung ngân vang sâu lắng.
     * Giọng đọc AI tự động cảm ơn và chúc bình an.
     * Thăng hạng lên **Bồ Đoàn Sen Vàng VIP** có vầng hào quang lộng lẫy.
2. **Khi Kênh Đang Bật Live Thật:**
   * Nhập username TikTok (ví dụ: `thaythichthien`) vào ô `@username`.
   * Bấm **Bắt Đầu Kết Nối Live**. Hệ thống sẽ tự động bắt luồng WebSocket thật 100%.

---

## ⚠️ 5. Đánh Giá Thực Tế Về Thử Nghiệm Cloud Stream (GitHub Actions)

Mô hình chạy stream qua GitHub Actions được thiết lập như **một giải pháp thử nghiệm kỹ thuật**, KHÔNG nên xem là hạ tầng phát sóng 24/7 ổn định thay thế cho máy chủ chuyên dụng vì các lý do sau:

1. **Vòng đời Stream Key của TikTok:** Trên TikTok, Stream Key thường chỉ có hiệu lực cho một phiên phát sóng duy nhất. Khi một phiên ngắt (dù chỉ vài giây), phiên live có thể bị TikTok tự động đóng, dẫn tới việc dùng lại key cũ cho phiên tiếp theo sẽ thất bại.
2. **Độ trễ và giới hạn của CI/CD:** GitHub Actions sinh ra để build/test code, không phải đài truyền hình. Các tác vụ cron có độ trễ thực tế từ 15-45 phút và có thể bị trôi lịch hoặc hủy khi hệ thống quá tải.
3. **Chính sách sử dụng chấp nhận được (AUP):** Việc liên tục sử dụng tài nguyên CI/CD miễn phí để mã hóa video phát trực tiếp dài hạn có thể vi phạm điều khoản chống lạm dụng tài nguyên của nền tảng.

👉 **Khuyến nghị chuẩn sản xuất:**
- **Để phát sóng 24/7 chuyên nghiệp và lâu dài:** Hãy sử dụng **OBS Studio chạy trên Cloud VPS Windows riêng biệt** (hoặc một máy tính phụ/laptop cắm mạng ở nhà). Cách này đảm bảo không bao giờ bị cắt luồng, giữ vững phiên live và an toàn 100% cho kênh.
