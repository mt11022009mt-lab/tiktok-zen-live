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

## 💎 4. Cơ Chế Kiếm Tiền Thực Chiến
* **Tranh Bồ Đoàn:** Chỉ có 24 chỗ ngồi. Ai donate cao hơn sẽ thay thế người ngồi lâu không tương tác.
* **Bảng Vàng Công Đức:** Vinh danh TOP 3 Đại Thí Chủ trên đỉnh màn hình kích thích đua Top.
* **Ghim Giỏ Hàng:** Vừa phát live vừa ghim các sản phẩm: Vòng trầm hương, nụ trầm thác khói, chuông xoay Tây Tạng.
