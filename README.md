# Tịnh tâm thiền đường — TikTok LIVE

Trang dọc 9:16 cho OBS, có 24 chỗ ngồi. Khi nhận sự kiện người xem vào phòng, bình luận hoặc tặng quà, người đó được xếp chỗ và hiệu ứng xuất hiện ngay trên ghế. Số liệu và bảng tri ân bắt đầu từ 0. Nút giả lập trong trang quản trị chỉ để thử trước khi live.

## Mở trên máy này

1. Đóng cửa sổ `node server.js` cũ nếu đang chạy. Mở `start.bat` trong thư mục này. Nếu máy báo cổng 3000 đang bận, tìm cửa sổ server cũ thay vì chạy thêm bản thứ hai.
2. Mở `http://localhost:3000/admin.html`. Ở đây có nút giả lập một người vào ngồi và nút xóa ghế.
3. Mở `http://localhost:3000/?layout=vertical` để xem trước. Đường dẫn dán vào OBS là **`http://localhost:3000/obs`**; đường dẫn này tự mở khung dọc và ẩn các nút điều khiển khỏi video.
4. Sau khi đã bắt đầu phiên TikTok LIVE, nhập `@username` vào trang quản trị và bấm kết nối. Trạng thái phải chuyển sang **Đang live**. Nếu chưa phát live hoặc TikTok không cho phép đọc sự kiện, ghế sẽ không nhận người thật.

Nếu chuyển sang máy khác: cài Node.js và Python, rồi trong thư mục dự án chạy `npm install` và `python -m pip install TikTokLive requests` trước khi mở `start.bat`.

## Phát bằng OBS, không cần TikTok LIVE Studio

1. Kiểm tra tài khoản TikTok có mục phát từ PC/Mac hoặc quyền lấy **RTMP server và stream key**. Quyền này do TikTok cấp cho từng tài khoản/khu vực; trang HTML không tự phát lên TikTok được.
2. Trong OBS: tạo Scene dọc, đặt cả **Base Canvas** và **Output** là `720 × 1280`, `30 FPS` để bắt đầu nhẹ máy. Thêm đúng một **Browser Source** với URL `http://localhost:3000/obs`, Width `720`, Height `1280`. Nếu máy khỏe và chữ cần nét hơn, dùng `1080 × 1920`.
3. OBS → Settings → Stream → chọn Custom, dán RTMP server và stream key của **phiên hiện tại**. Giữ stream key riêng tư.
4. OBS → Settings → Output → chọn bộ mã hóa phần cứng H.264 nếu có: NVIDIA NVENC, Intel QSV hoặc AMD AMF. Bắt đầu với bitrate video khoảng `2500–3500 Kbps` cho `720 × 1280 @ 30 FPS`, âm thanh AAC `128 Kbps`.
5. Trong thuộc tính Browser Source của OBS, bật **Control audio via OBS**. Nhạc Tịnh Tâm tự bật ở mức nhỏ. Bình luận thường gõ một tiếng mõ ngắn, người mới vào ngồi có chuông trầm riêng; nhạc tự hạ khi có tiếng chuông hoặc giọng cảm ơn. Kiểm tra thanh âm lượng Browser Source trước khi bấm **Start Streaming**. Tránh mở thêm tab overlay trong Chrome lúc live vì sẽ phát hai bản âm thanh và tốn RAM.

Nếu tài khoản không có RTMP/stream key, không thể dùng trực tiếp cách OBS → RTMP. Một số tài khoản TikTok Shop có thể dùng **LIVE Manager + OBS Virtual Camera**; tùy quyền tài khoản. OBS Virtual Camera chỉ đưa hình, nên cần chọn nguồn âm thanh riêng trong LIVE Manager.

## Kiểm tra nhanh

- Nhấn **1 Người Cmt Vào Ngồi** trong trang quản trị: ghế phải sáng lên, hiện tên và số chỗ ngồi tăng.
- Nhấn **Thử tiếng bình luận trên OBS** và **Thử chuông người vào ngồi**: thanh âm lượng Browser Source phải nhảy. Nếu trang quản trị báo bị chặn âm, trong OBS nhấp chuột phải nguồn Browser → **Interact** → nhấp một lần vào hình để mở âm thanh.
- Ba thanh trượt ở trang quản trị chỉnh riêng nhạc nền, chuông/mõ và giọng cảm ơn ngay khi đang live. Nếu phòng chat đông, tiếng mõ được giới hạn nhịp để không lấn phần thiền.
- Trình phát trong trang quản trị chỉ để nghe thử trên tab đó. Nút bật/tắt nhạc điều khiển overlay trong OBS, tránh phát hai bản cùng lúc.
- Nhấn **Thanh Tịnh** để xóa người giả lập trước khi live thật.
- Nếu OBS hiện giao diện cũ, bấm **Refresh cache of current page** trong thuộc tính Browser Source.
- Nếu không nhận người: xem trạng thái kết nối và nhật ký ở trang quản trị, kiểm tra TikTok LIVE đã bắt đầu chưa.

Lưu ý: các sự kiện TikTok được nhận qua thư viện `TikTokLive` không chính thức, nên TikTok thay đổi có thể làm kết nối ngừng hoạt động. Không có bảo đảm 100% sẽ bắt được mọi người vào phòng.

## Cách chọn âm thanh

Các buổi thiền chuông công khai của Japan Foundation dùng tiếng chuông có âm ngân dài và để khoảng yên giữa các lần gõ: https://www.la.jpf.go.jp/ac-others65-virtualmeditation. Hai bộ live chánh điện công khai tách tiếng mõ, chuông, giọng đọc theo từng loại tương tác và hạ nhạc lúc có lời nói: https://github.com/zane-tv/tiktok-live-temple-rpc và https://github.com/thonh14/chua-online. Bản này áp dụng cách phân vai đó cho phòng thiền có ghế ngồi; các file nhạc và tiếng chuông/mõ mới được tạo riêng cho dự án, không lấy âm thanh từ các nguồn trên.
