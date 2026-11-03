#!/bin/bash
set -e

echo "========================================================"
echo "🌸 KHỞI ĐỘNG HỆ THỐNG LIVESTREAM CHÁNH ĐIỆN THỬ NGHIỆM 🌸"
echo "========================================================"

# Kiểm tra bắt buộc cả Stream Key và RTMP Server do TikTok cấp
if [ -z "$TIKTOK_STREAM_KEY" ]; then
  echo "❌ LỖI: Chưa cấu hình Secret TIKTOK_STREAM_KEY trong GitHub Secrets!"
  exit 1
fi

if [ -z "$TIKTOK_RTMP_URL" ]; then
  echo "❌ LỖI: Chưa cấu hình Secret TIKTOK_RTMP_URL! Bạn phải lấy Server URL chính xác từ Live Studio của TikTok."
  exit 1
fi

RTMP_SERVER="${TIKTOK_RTMP_URL%/}"
FULL_STREAM_URL="${RTMP_SERVER}/${TIKTOK_STREAM_KEY}"

# Tính toán thời lượng stream từ input (mặc định 60 phút, tối đa 300 phút)
MINUTES="${STREAM_DURATION_MINUTES:-60}"
if [ "$MINUTES" -gt 300 ]; then
  MINUTES=300
fi
DURATION_SEC=$((MINUTES * 60))

echo "📡 Server RTMP: $RTMP_SERVER"
echo "👤 Kênh TikTok: ${TIKTOK_USERNAME:-Chưa đặt}"
echo "⏱️ Thời lượng phiên: $MINUTES phút ($DURATION_SEC giây)"
echo "📺 Độ phân giải: 1080x1920 (Chuẩn Dọc TikTok 9:16)"

# 1. Khởi động màn hình ảo Xvfb
echo "1️⃣ Khởi động Xvfb Virtual Framebuffer (:99)..."
export DISPLAY=:99
Xvfb :99 -screen 0 1080x1920x24 -ac +extension GLX +render -noreset &
XVFB_PID=$!
sleep 2

# 2. Khởi động hệ thống âm thanh ảo PulseAudio
echo "2️⃣ Cấu hình Virtual Audio PulseAudio..."
pulseaudio --start --exit-idle-time=-1 || true
pactl load-module module-null-sink sink_name=VirtualAudioSink sink_properties=device.description=VirtualAudioSink || true
pactl set-default-sink VirtualAudioSink || true
pactl load-module module-native-protocol-tcp auth-anonymous=1 || true

# 3. Khởi động Web Server Chánh Điện
echo "3️⃣ Khởi động Node.js Server..."
export PORT=3000
node server.js &
SERVER_PID=$!
sleep 3

# 4. Mở Google Chrome chế độ Kiosk Full màn hình trên Display :99
echo "4️⃣ Mở Google Chrome hiển thị Chánh Điện..."
google-chrome \
  --no-sandbox \
  --disable-gpu \
  --disable-dev-shm-usage \
  --disable-software-rasterizer \
  --window-size=1080,1920 \
  --window-position=0,0 \
  --kiosk \
  --autoplay-policy=no-user-gesture-required \
  --use-fake-ui-for-media-stream \
  --alsa-output-device=VirtualAudioSink \
  "http://localhost:3000/?layout=vertical" &
CHROME_PID=$!
sleep 6

# 5. Khởi động FFmpeg Stream thẳng lên TikTok
echo "5️⃣ Bắt đầu bắn luồng RTMP lên TikTok..."

# Bẫy tín hiệu để dọn dẹp an toàn khi dừng tiến trình
cleanup() {
  echo "Dọn dẹp các tiến trình nền..."
  kill -9 $CHROME_PID $SERVER_PID $XVFB_PID 2>/dev/null || true
}
trap cleanup EXIT INT TERM

ffmpeg -y \
  -f x11grab -draw_mouse 0 -video_size 1080x1920 -framerate 30 -i :99.0 \
  -f pulse -i VirtualAudioSink.monitor \
  -c:v libx264 -preset veryfast -tune zerolatency -b:v 2500k -maxrate 3000k -bufsize 6000k \
  -pix_fmt yuv420p -g 60 -keyint_min 30 \
  -c:a aac -b:a 128k -ar 44100 \
  -t $DURATION_SEC \
  -f flv "$FULL_STREAM_URL"

echo "✅ Đã hoàn thành phiên phát sóng $MINUTES phút!"
