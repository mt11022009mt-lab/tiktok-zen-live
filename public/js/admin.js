// ============================================================
// ADMIN & SIMULATOR LOGIC
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const socket = io();

  // Elements
  const tiktokUserInput = document.getElementById('tiktok-user');
  const btnConnect = document.getElementById('btn-connect');
  const btnDisconnect = document.getElementById('btn-disconnect');
  const statusIndicator = document.getElementById('status-indicator');

  const statViewers = document.getElementById('stat-viewers');
  const statLikes = document.getElementById('stat-likes');
  const statGong = document.getElementById('stat-gong');
  const statDiamonds = document.getElementById('stat-diamonds');

  const btnSimBatch = document.getElementById('btn-sim-batch');
  const btnSimChat = document.getElementById('btn-sim-chat');
  const btnSimReset = document.getElementById('btn-sim-reset');
  const btnSimLike10 = document.getElementById('btn-sim-like10');
  const btnSimLike50 = document.getElementById('btn-sim-like50');

  const btnGiftRose = document.getElementById('btn-gift-rose');
  const btnGiftBell = document.getElementById('btn-gift-bell');
  const btnGiftIncense = document.getElementById('btn-gift-incense');
  const btnGiftUniverse = document.getElementById('btn-gift-universe');

  const btnBgmChant = document.getElementById('btn-bgm-chant');
  const btnBgmZen = document.getElementById('btn-bgm-zen');
  const btnBgmStop = document.getElementById('btn-bgm-stop');
  const btnTestTts = document.getElementById('btn-test-tts');

  const btnLayoutVert = document.getElementById('btn-layout-vert');
  const btnLayoutHoriz = document.getElementById('btn-layout-horiz');
  const obsUrlInput = document.getElementById('obs-url-input');
  const btnCopyUrl = document.getElementById('btn-copy-url');
  const eventFeed = document.getElementById('event-feed');

  // Copy OBS URL
  btnCopyUrl.addEventListener('click', () => {
    obsUrlInput.select();
    navigator.clipboard.writeText(obsUrlInput.value);
    btnCopyUrl.textContent = '✅ Đã Chép!';
    setTimeout(() => { btnCopyUrl.textContent = '📋 Sao Chép'; }, 2000);
  });

  // Connect TikTok Live
  btnConnect.addEventListener('click', () => {
    const username = tiktokUserInput.value.trim();
    if (!username) {
      alert('Vui lòng nhập tên tài khoản TikTok (Username) đang live!');
      return;
    }
    btnConnect.disabled = true;
    statusIndicator.className = 'status-indicator connecting';
    statusIndicator.textContent = 'Đang kết nối...';
    socket.emit('admin:connect', { username });
  });

  // Disconnect TikTok Live
  btnDisconnect.addEventListener('click', () => {
    socket.emit('admin:disconnect');
  });

  // Layout Buttons
  btnLayoutVert.addEventListener('click', () => {
    btnLayoutVert.classList.add('active');
    btnLayoutHoriz.classList.remove('active');
    obsUrlInput.value = 'http://localhost:3000/?layout=vertical';
    socket.emit('admin:toggle_layout', { layout: 'vertical' });
  });

  btnLayoutHoriz.addEventListener('click', () => {
    btnLayoutHoriz.classList.add('active');
    btnLayoutVert.classList.remove('active');
    obsUrlInput.value = 'http://localhost:3000/?layout=horizontal';
    socket.emit('admin:toggle_layout', { layout: 'horizontal' });
  });

  // ==========================================
  // SIMULATOR BUTTONS (TESTING)
  // ==========================================
  btnSimBatch.addEventListener('click', () => {
    socket.emit('sim:batch_fill');
  });

  btnSimChat.addEventListener('click', () => {
    socket.emit('sim:comment', {});
  });

  btnSimReset.addEventListener('click', () => {
    if (confirm('Bạn có chắc muốn thanh tịnh, xóa hết người đang ngồi trên bồ đoàn?')) {
      socket.emit('admin:reset_seats');
    }
  });

  btnSimLike10.addEventListener('click', () => {
    socket.emit('sim:like', { count: 10 });
  });

  btnSimLike50.addEventListener('click', () => {
    socket.emit('sim:like', { count: 50 });
  });

  btnGiftRose.addEventListener('click', () => {
    socket.emit('sim:gift', { gift: { name: 'Hoa Hồng', diamonds: 1, count: 1 } });
  });

  btnGiftBell.addEventListener('click', () => {
    socket.emit('sim:gift', { gift: { name: 'Chuông Bát', diamonds: 20, count: 1 } });
  });

  btnGiftIncense.addEventListener('click', () => {
    socket.emit('sim:gift', { gift: { name: 'Nụ Trầm VIP', diamonds: 99, count: 1 } });
  });

  btnGiftUniverse.addEventListener('click', () => {
    socket.emit('sim:gift', { gift: { name: 'Vũ Trụ Cực Lạc', diamonds: 5000, count: 1 } });
  });

  // Background Music & TTS Handlers
  if (btnBgmChant) {
    btnBgmChant.addEventListener('click', () => {
      socket.emit('admin:bgm', { action: 'play', track: '/assets/nam_mo_a_di_da_phat.mp3' });
    });
  }

  if (btnBgmZen) {
    btnBgmZen.addEventListener('click', () => {
      socket.emit('admin:bgm', { action: 'play', track: '/assets/zen_meditation.mp3' });
    });
  }

  if (btnBgmStop) {
    btnBgmStop.addEventListener('click', () => {
      socket.emit('admin:bgm', { action: 'stop' });
    });
  }

  if (btnTestTts) {
    btnTestTts.addEventListener('click', () => {
      socket.emit('admin:test_tts', { preset: 'blessing_general.mp3' });
    });
  }

  // ==========================================
  // SOCKET STATE UPDATES
  // ==========================================
  function updateUIState(state) {
    if (!state) return;

    // Status Indicator
    if (state.isConnected) {
      statusIndicator.className = 'status-indicator connected';
      statusIndicator.textContent = `🟢 Đang live: @${state.tiktokUsername}`;
      btnConnect.disabled = true;
      btnDisconnect.disabled = false;
    } else if (state.isConnecting) {
      statusIndicator.className = 'status-indicator connecting';
      statusIndicator.textContent = `🟡 Đang kết nối...`;
      btnConnect.disabled = true;
      btnDisconnect.disabled = false;
    } else {
      statusIndicator.className = 'status-indicator';
      statusIndicator.textContent = 'Chưa kết nối';
      btnConnect.disabled = false;
      btnDisconnect.disabled = true;
    }

    if (state.tiktokUsername && !tiktokUserInput.value) {
      tiktokUserInput.value = state.tiktokUsername;
    }

    // Mini Stats
    statViewers.textContent = state.stats.viewers || 0;
    statLikes.textContent = state.stats.totalLikes || 0;
    statGong.textContent = state.stats.gongCount || 0;
    statDiamonds.textContent = state.stats.totalDiamonds || 0;

    // Layout
    if (state.layout === 'horizontal') {
      btnLayoutHoriz.classList.add('active');
      btnLayoutVert.classList.remove('active');
      obsUrlInput.value = 'http://localhost:3000/?layout=horizontal';
    } else {
      btnLayoutVert.classList.add('active');
      btnLayoutHoriz.classList.remove('active');
      obsUrlInput.value = 'http://localhost:3000/?layout=vertical';
    }
  }

  socket.on('state:init', updateUIState);
  socket.on('state:update', updateUIState);

  // Stream Event Feed Log
  socket.on('stream:event', ({ type, data }) => {
    addEventLog(type, data);
  });

  function addEventLog(type, data) {
    const entry = document.createElement('div');
    const time = new Date().toLocaleTimeString('vi-VN');

    if (type === 'user:chat') {
      entry.className = 'log-entry chat';
      entry.textContent = `[${time}] 💬 ${data.user.nickname}: "${data.comment}" (${data.seatResult.action === 'seated' ? 'Đã nhận bồ đoàn' : 'Đang ngồi'})`;
    } else if (type === 'user:gift') {
      entry.className = 'log-entry gift';
      entry.textContent = `[${time}] 🎁 ${data.user.nickname} cúng dường ${data.giftCount}x ${data.giftName} (💎 ${data.diamondCount})`;
    } else if (type === 'user:like') {
      entry.className = 'log-entry';
      entry.textContent = `[${time}] 💖 ${data.nickname} thả ${data.likeCount} tim (Gõ mõ)`;
    } else if (type === 'user:kicked') {
      entry.className = 'log-entry';
      entry.textContent = `[${time}] 🕊️ ${data.kickedUser ? data.kickedUser.nickname : 'Thiền sinh'} đã viên mãn thời thiền`;
    } else if (type === 'system:connected') {
      entry.className = 'log-entry gift';
      entry.textContent = `[${time}] 🟢 Đã kết nối thành công phòng live @${data.username}!`;
    } else if (type === 'system:error') {
      entry.className = 'log-entry';
      entry.style.color = '#e74c3c';
      entry.textContent = `[${time}] ⚠️ ${data.message}`;
    }

    eventFeed.insertBefore(entry, eventFeed.firstChild);
    while (eventFeed.children.length > 30) {
      eventFeed.removeChild(eventFeed.lastChild);
    }
  }
});
