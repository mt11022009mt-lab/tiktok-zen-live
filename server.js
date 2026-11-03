const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const { TikTokLiveConnection } = require('tiktok-live-connector');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Tắt cache triệt để để TikTok LIVE Studio luôn nạp mã JS/CSS/Audio mới nhất
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

app.use(express.static(path.join(__dirname, 'public'), {
  etag: false,
  maxAge: 0
}));

// REST API for Cloud/Headless Runner
app.post('/api/connect', (req, res) => {
  const { username } = req.body;
  if (username) {
    connectTikTok(username);
    return res.json({ success: true, message: `Đang kết nối tới @${username}` });
  }
  res.status(400).json({ error: 'Thiếu username' });
});

app.post('/api/disconnect', (req, res) => {
  disconnectTikTok();
  res.json({ success: true, message: 'Đã ngắt kết nối' });
});

app.get('/api/status', (req, res) => {
  res.json({
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    tiktokUsername: state.tiktokUsername,
    stats: state.stats
  });
});

// ==========================================
// STATE MANAGEMENT: SEATS & STATS
// ==========================================
const DEFAULT_TOTAL_SEATS = 24; // 4 rows of 6

const state = {
  tiktokUsername: '',
  isConnected: false,
  isConnecting: false,
  layout: 'vertical', // 'vertical' (9:16) or 'horizontal' (16:9)
  stats: {
    totalLikes: 0,
    totalGifts: 0,
    totalDiamonds: 0,
    gongCount: 0,
    viewers: 0
  },
  settings: {
    totalSeats: DEFAULT_TOTAL_SEATS,
    vipThreshold: 1, // diamonds needed for VIP promotion
    idleTimeoutSeconds: 120, // 2 minutes idle makes seat vulnerable to replacement
    enableTts: true,
    enableChime: true,
    enableMusic: true
  },
  seats: [],
  topDonators: [], // Array of { uniqueId, nickname, avatarUrl, totalDiamonds }
  recentEvents: [] // Array of recent log events
};

// Initialize Seats with starter meditators
function initSeats(count) {
  state.seats = [];
  for (let i = 0; i < count; i++) {
    let tier = 'standard';
    if (i < 6) {
      tier = 'vip'; // Top row (Golden Lotus)
    } else if (i < 12) {
      tier = 'advanced'; // Second row (Jade Lotus)
    } else {
      tier = 'standard'; // Third & fourth rows (Red Cushion)
    }
    state.seats.push({
      index: i,
      tier: tier,
      user: null
    });
  }

  // Pre-seed aesthetic meditators so temple looks lively & radiant
  const demoMeditators = [
    { uniqueId: 'zen_tue_tam', nickname: 'Tuệ Tâm', avatarUrl: 'https://api.dicebear.com/7.x/notionists/svg?seed=TueTam', tier: 'vip', diamonds: 99 },
    { uniqueId: 'zen_minh_an', nickname: 'Minh An', avatarUrl: 'https://api.dicebear.com/7.x/notionists/svg?seed=MinhAn', tier: 'vip', diamonds: 66 },
    { uniqueId: 'zen_dieu_thien', nickname: 'Diệu Thiện', avatarUrl: 'https://api.dicebear.com/7.x/notionists/svg?seed=DieuThien', tier: 'advanced', diamonds: 20 },
    { uniqueId: 'zen_phuc_duc', nickname: 'Phúc Đức', avatarUrl: 'https://api.dicebear.com/7.x/notionists/svg?seed=PhucDuc', tier: 'advanced', diamonds: 10 },
    { uniqueId: 'zen_an_lac', nickname: 'An Lạc', avatarUrl: 'https://api.dicebear.com/7.x/notionists/svg?seed=AnLac', tier: 'standard', diamonds: 0 },
    { uniqueId: 'zen_thien_dinh', nickname: 'Thiền Định', avatarUrl: 'https://api.dicebear.com/7.x/notionists/svg?seed=ThienDinh', tier: 'standard', diamonds: 0 }
  ];

  demoMeditators.forEach((demo, idx) => {
    let targetIdx = idx;
    if (demo.tier === 'vip') targetIdx = idx;
    else if (demo.tier === 'advanced') targetIdx = 6 + (idx - 2);
    else targetIdx = 12 + (idx - 4);

    if (state.seats[targetIdx]) {
      state.seats[targetIdx].user = {
        uniqueId: demo.uniqueId,
        nickname: demo.nickname,
        avatarUrl: demo.avatarUrl,
        seatedAt: Date.now(),
        lastActive: Date.now(),
        diamondSpent: demo.diamonds,
        commentsCount: 1,
        isDemo: true
      };
    }
  });

  state.topDonators = [
    { uniqueId: 'zen_tue_tam', nickname: 'Tuệ Tâm', avatarUrl: 'https://api.dicebear.com/7.x/notionists/svg?seed=TueTam', totalDiamonds: 99 },
    { uniqueId: 'zen_minh_an', nickname: 'Minh An', avatarUrl: 'https://api.dicebear.com/7.x/notionists/svg?seed=MinhAn', totalDiamonds: 66 },
    { uniqueId: 'zen_dieu_thien', nickname: 'Diệu Thiện', avatarUrl: 'https://api.dicebear.com/7.x/notionists/svg?seed=DieuThien', totalDiamonds: 20 }
  ];

  state.stats.gongCount = 108;
  state.stats.totalLikes = 2500;
}

initSeats(state.settings.totalSeats);

// Helper: Broadcast state changes
function broadcastState() {
  io.emit('state:update', {
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    tiktokUsername: state.tiktokUsername,
    layout: state.layout,
    stats: state.stats,
    settings: state.settings,
    seats: state.seats,
    topDonators: state.topDonators
  });
}

function broadcastEvent(type, data) {
  state.recentEvents.unshift({
    type,
    data,
    time: new Date().toLocaleTimeString('vi-VN')
  });
  if (state.recentEvents.length > 50) state.recentEvents.pop();
  io.emit('stream:event', { type, data });
}

// Seat Management Logic: Find user seat
function findUserSeatIndex(uniqueId) {
  return state.seats.findIndex(s => s.user && s.user.uniqueId === uniqueId);
}

// Seat Allocation / Placement
function assignSeatForUser(userData, priorityTier = 'standard') {
  const existingIdx = findUserSeatIndex(userData.uniqueId);

  // If user is already seated
  if (existingIdx !== -1) {
    const currentSeat = state.seats[existingIdx];
    currentSeat.user.nickname = userData.nickname || currentSeat.user.nickname;
    currentSeat.user.avatarUrl = userData.avatarUrl || currentSeat.user.avatarUrl;
    currentSeat.user.lastActive = Date.now();
    currentSeat.user.commentsCount = (currentSeat.user.commentsCount || 0) + 1;

    // Check if eligible for tier promotion (e.g. VIP)
    if (priorityTier === 'vip' && currentSeat.tier !== 'vip') {
      const emptyVipIdx = state.seats.findIndex(s => s.tier === 'vip' && !s.user);
      if (emptyVipIdx !== -1) {
        state.seats[emptyVipIdx].user = currentSeat.user;
        currentSeat.user = null;
        return { action: 'promoted', seatIndex: emptyVipIdx, user: state.seats[emptyVipIdx].user };
      }
    }
    return { action: 'updated', seatIndex: existingIdx, user: currentSeat.user };
  }

  // User is not seated, try to find an empty seat
  // If priority is VIP, check VIP seats first
  let targetSeatIdx = -1;
  if (priorityTier === 'vip') {
    targetSeatIdx = state.seats.findIndex(s => s.tier === 'vip' && !s.user);
  } else if (priorityTier === 'advanced') {
    targetSeatIdx = state.seats.findIndex(s => s.tier === 'advanced' && !s.user);
  }

  // If no prioritized seat, find any empty seat starting from bottom (standard) up
  if (targetSeatIdx === -1) {
    for (let i = state.seats.length - 1; i >= 0; i--) {
      if (!state.seats[i].user) {
        targetSeatIdx = i;
        break;
      }
    }
  }

  const now = Date.now();
  const newUser = {
    uniqueId: userData.uniqueId,
    nickname: userData.nickname || userData.uniqueId,
    avatarUrl: userData.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(userData.uniqueId)}`,
    diamondSpent: userData.diamondSpent || 0,
    likesGiven: userData.likesGiven || 0,
    commentsCount: 1,
    joinedAt: now,
    lastActive: now,
    role: priorityTier === 'vip' ? 'Đại Thí Chủ' : (priorityTier === 'advanced' ? 'Cư Sĩ Tinh Tấn' : 'Thiền Sinh')
  };

  // If an empty seat is found, assign it
  if (targetSeatIdx !== -1) {
    state.seats[targetSeatIdx].user = newUser;
    return { action: 'seated', seatIndex: targetSeatIdx, user: newUser };
  }

  // If all seats are FULL: Handle Replacement / Kick logic
  // Priority rule:
  // Donators (diamondSpent > 0) can replace inactive or non-donating users.
  // Find the most vulnerable seat (lowest diamonds, longest idle time in standard/advanced seats)
  let candidateIdx = -1;
  let minDiamonds = Infinity;
  let oldestActive = Infinity;

  for (let i = state.seats.length - 1; i >= 0; i--) {
    const seat = state.seats[i];
    if (!seat.user) continue;

    const userDiamonds = seat.user.diamondSpent || 0;
    const userLastActive = seat.user.lastActive || 0;

    // We never kick VIP tier unless the new donator has spent more than them
    if (seat.tier === 'vip' && (newUser.diamondSpent <= userDiamonds)) {
      continue;
    }

    if (userDiamonds < minDiamonds || (userDiamonds === minDiamonds && userLastActive < oldestActive)) {
      minDiamonds = userDiamonds;
      oldestActive = userLastActive;
      candidateIdx = i;
    }
  }

  // If replacement candidate found
  if (candidateIdx !== -1) {
    // Only replace if new user has higher priority or existing user is idle > timeout
    const existing = state.seats[candidateIdx].user;
    const isIdle = (now - existing.lastActive) > (state.settings.idleTimeoutSeconds * 1000);

    if (newUser.diamondSpent > (existing.diamondSpent || 0) || isIdle || newUser.diamondSpent > 0) {
      const kickedUser = existing;
      state.seats[candidateIdx].user = newUser;

      broadcastEvent('user:kicked', {
        seatIndex: candidateIdx,
        kickedUser: kickedUser,
        replacedBy: newUser,
        reason: newUser.diamondSpent > 0 ? 'Nhường bồ đoàn cho Đại Thí Chủ cúng dường' : 'Hết thời gian tĩnh tọa'
      });

      return { action: 'replaced', seatIndex: candidateIdx, user: newUser, kickedUser };
    }
  }

  return { action: 'full_room', user: newUser };
}

// Update Top Donators leaderboard
function updateTopDonators(uniqueId, nickname, avatarUrl, diamonds) {
  let donor = state.topDonators.find(d => d.uniqueId === uniqueId);
  if (donor) {
    donor.totalDiamonds += diamonds;
    donor.nickname = nickname || donor.nickname;
    donor.avatarUrl = avatarUrl || donor.avatarUrl;
  } else {
    state.topDonators.push({
      uniqueId,
      nickname,
      avatarUrl,
      totalDiamonds: diamonds
    });
  }
  // Sort descending and keep top 5
  state.topDonators.sort((a, b) => b.totalDiamonds - a.totalDiamonds);
  if (state.topDonators.length > 5) {
    state.topDonators.length = 5;
  }
}

// ==========================================
// TIKTOK LIVE CONNECTION MANAGER
// ==========================================
let tiktokLive = null;

function connectTikTok(username) {
  if (!username) return;
  username = username.replace(/^@/, '').trim();
  state.tiktokUsername = username;
  state.isConnecting = true;
  state.isConnected = false;
  broadcastState();

  if (tiktokLive) {
    try { tiktokLive.disconnect(); } catch (e) {}
  }

  try {
    tiktokLive = new TikTokLiveConnection(username, {
      processInitialData: true,
      enableExtendedGiftInfo: true
    });

    tiktokLive.connect().then(roomInfo => {
      state.isConnecting = false;
      state.isConnected = true;
      state.stats.viewers = roomInfo.roomUserCount || roomInfo.userCount || 0;
      console.log(`[TikTok Live] Đã kết nối thành công phòng live của: ${username}`);
      broadcastEvent('system:connected', { username, roomInfo });
      broadcastState();
    }).catch(err => {
      state.isConnecting = false;
      state.isConnected = false;
      console.error(`[TikTok Live] Lỗi kết nối tới ${username}:`, err.message || err);
      broadcastEvent('system:error', { message: `Không thể kết nối tới @${username}: ${err.message || 'Có thể kênh chưa bật live hoặc bị giới hạn IP'}` });
      broadcastState();
    });

    // Chat event
    tiktokLive.on('chat', data => {
      const userData = {
        uniqueId: data.uniqueId,
        nickname: data.nickname,
        avatarUrl: data.profilePictureUrl
      };
      const result = assignSeatForUser(userData, 'standard');
      broadcastEvent('user:chat', {
        user: userData,
        comment: data.comment,
        seatResult: result
      });
      broadcastState();
    });

    // Gift event
    tiktokLive.on('gift', data => {
      // Check if streak finished or standalone gift
      const diamondCount = (data.diamondCount || 1) * (data.repeatCount || 1);
      state.stats.totalGifts += (data.repeatCount || 1);
      state.stats.totalDiamonds += diamondCount;
      state.stats.gongCount += 1;

      const userData = {
        uniqueId: data.uniqueId,
        nickname: data.nickname,
        avatarUrl: data.profilePictureUrl,
        diamondSpent: diamondCount
      };

      updateTopDonators(data.uniqueId, data.nickname, data.profilePictureUrl, diamondCount);

      // Upgrade/assign seat with VIP priority if diamonds >= threshold
      const tierPriority = diamondCount >= state.settings.vipThreshold ? 'vip' : 'advanced';
      const result = assignSeatForUser(userData, tierPriority);

      broadcastEvent('user:gift', {
        user: userData,
        giftName: data.giftName || 'Hoa Hồng',
        giftId: data.giftId,
        giftCount: data.repeatCount || 1,
        diamondCount: diamondCount,
        seatResult: result
      });
      broadcastState();
    });

    // Like event -> Người thả tim được vào ngồi ghế ngay nếu còn chỗ
    tiktokLive.on('like', data => {
      const addedLikes = data.likeCount || 1;
      state.stats.totalLikes += addedLikes;
      state.stats.gongCount += 1;

      const userData = {
        uniqueId: data.uniqueId,
        nickname: data.nickname,
        avatarUrl: data.profilePictureUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.uniqueId)}`,
        likesGiven: addedLikes
      };
      const result = assignSeatForUser(userData, 'standard');

      broadcastEvent('user:like', {
        uniqueId: data.uniqueId,
        nickname: data.nickname,
        likeCount: addedLikes,
        totalLikes: state.stats.totalLikes,
        seatResult: result
      });
      broadcastState();
    });

    // Member join -> Người mới vào phòng được xếp vào ghế ngồi luôn nếu còn chỗ
    tiktokLive.on('member', data => {
      const userData = {
        uniqueId: data.uniqueId,
        nickname: data.nickname,
        avatarUrl: data.profilePictureUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.uniqueId)}`
      };
      const result = assignSeatForUser(userData, 'standard');

      broadcastEvent('user:join', {
        uniqueId: data.uniqueId,
        nickname: data.nickname,
        seatResult: result
      });
      broadcastState();
    });

    // Viewer count
    tiktokLive.on('roomUser', data => {
      state.stats.viewers = data.viewerCount || state.stats.viewers;
      broadcastState();
    });

    tiktokLive.on('streamEnd', () => {
      state.isConnected = false;
      broadcastEvent('system:streamEnd', {});
      broadcastState();
    });

  } catch (err) {
    state.isConnecting = false;
    state.isConnected = false;
    console.error('[TikTok Live] Lỗi khởi tạo connection:', err);
    broadcastEvent('system:error', { message: err.message });
    broadcastState();
  }
}

function disconnectTikTok() {
  if (tiktokLive) {
    try {
      tiktokLive.disconnect();
    } catch (e) {}
    tiktokLive = null;
  }
  state.isConnected = false;
  state.isConnecting = false;
  broadcastState();
}

// ==========================================
// SOCKET.IO REALTIME HANDLER
// ==========================================
io.on('connection', socket => {
  // Send initial full state on connect
  socket.emit('state:init', {
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    tiktokUsername: state.tiktokUsername,
    layout: state.layout,
    stats: state.stats,
    settings: state.settings,
    seats: state.seats,
    topDonators: state.topDonators,
    recentEvents: state.recentEvents.slice(0, 15)
  });

  // Admin Connect / Disconnect Live
  socket.on('admin:connect', ({ username }) => {
    connectTikTok(username);
  });

  socket.on('admin:disconnect', () => {
    disconnectTikTok();
  });

  // Admin Toggle Layout (Vertical 9:16 vs Horizontal 16:9)
  socket.on('admin:toggle_layout', ({ layout }) => {
    state.layout = layout || (state.layout === 'vertical' ? 'horizontal' : 'vertical');
    io.emit('layout:change', { layout: state.layout });
    broadcastState();
  });

  // Admin Reset All Seats
  socket.on('admin:reset_seats', () => {
    initSeats(state.settings.totalSeats);
    state.stats.gongCount = 0;
    broadcastEvent('system:reset', { message: 'Đã thanh tịnh lại toàn bộ bồ đoàn trong chánh điện.' });
    broadcastState();
  });

  // Admin Kick Specific Seat
  socket.on('admin:kick_seat', ({ seatIndex }) => {
    if (state.seats[seatIndex] && state.seats[seatIndex].user) {
      const user = state.seats[seatIndex].user;
      state.seats[seatIndex].user = null;
      broadcastEvent('user:kicked', {
        seatIndex,
        kickedUser: user,
        reason: 'Thí chủ đã viên mãn khóa thiền'
      });
      broadcastState();
    }
  });

  // Admin Update Settings
  socket.on('admin:update_settings', newSettings => {
    Object.assign(state.settings, newSettings);
    if (newSettings.totalSeats && newSettings.totalSeats !== state.seats.length) {
      initSeats(newSettings.totalSeats);
    }
    broadcastState();
  });

  // Admin Background Music & TTS Control
  socket.on('admin:bgm', data => {
    io.emit('audio:bgm', data);
  });

  socket.on('admin:test_tts', data => {
    io.emit('audio:tts_test', data);
  });

  // ==========================================
  // SIMULATOR HANDLERS (FOR TESTING WITHOUT LIVE)
  // ==========================================
  socket.on('sim:comment', data => {
    const defaultNicknames = [
      'Phật Tử Thiện Tâm', 'Hoa Sen Trắng', 'Tâm An Lạc', 'Tịnh Độ Cư Sĩ',
      'Đại Gia Bình Dương', 'Diệu Âm Cát Tường', 'Tu Tâm Dưỡng Tính', 'Thanh Tịnh Trúc Lâm',
      'Trầm Hương Phong Thủy', 'Vạn Sự Tùy Duyên', 'Cầu Bình An', 'An Nhiên Tự Tại'
    ];
    const randomNick = defaultNicknames[Math.floor(Math.random() * defaultNicknames.length)] + '_' + Math.floor(Math.random() * 900 + 100);
    const userId = data.uniqueId || `user_${Date.now()}`;
    const nickname = data.nickname || randomNick;
    const comment = data.comment || 'A Di Đà Phật, cầu bình an cho gia đình!';
    const avatarUrl = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(userId)}`;

    const user = { uniqueId: userId, nickname, avatarUrl };
    const result = assignSeatForUser(user, 'standard');

    broadcastEvent('user:chat', {
      user,
      comment,
      seatResult: result
    });
    broadcastState();
  });

  socket.on('sim:like', data => {
    const count = data.count || 10;
    state.stats.totalLikes += count;
    state.stats.gongCount += Math.ceil(count / 5);

    broadcastEvent('user:like', {
      uniqueId: data.uniqueId || 'sim_liker',
      nickname: data.nickname || 'Phật tử thả tim',
      likeCount: count,
      totalLikes: state.stats.totalLikes
    });
    broadcastState();
  });

  socket.on('sim:gift', data => {
    const gifts = [
      { name: 'Hoa Hồng', diamonds: 1, count: 1 },
      { name: 'Trái Tim Gỗ', diamonds: 5, count: 2 },
      { name: 'Chuông Ngân', diamonds: 20, count: 1 },
      { name: 'Nụ Trầm Hương', diamonds: 99, count: 1 },
      { name: 'Mũ Bảo Hiểm', diamonds: 99, count: 1 },
      { name: 'Đài Sen Vàng', diamonds: 500, count: 1 },
      { name: 'Sư Tử Hộ Pháp', diamonds: 1000, count: 1 },
      { name: 'Vũ Trụ Cực Lạc', diamonds: 5000, count: 1 }
    ];

    const gift = data.gift || gifts[Math.floor(Math.random() * gifts.length)];
    const diamondCount = gift.diamonds * (gift.count || 1);
    state.stats.totalGifts += (gift.count || 1);
    state.stats.totalDiamonds += diamondCount;
    state.stats.gongCount += 2;

    const donorNicks = ['Đại Thí Chủ Minh Trí', 'Thương Gia Phát Tâm', 'Phật Tử Vàng Mười', 'Đại Gia Hà Thành', 'Tâm Bồ Đề'];
    const userId = data.uniqueId || `donor_${Date.now()}`;
    const nickname = data.nickname || donorNicks[Math.floor(Math.random() * donorNicks.length)];
    const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(userId)}`;

    const user = {
      uniqueId: userId,
      nickname,
      avatarUrl,
      diamondSpent: diamondCount
    };

    updateTopDonators(userId, nickname, avatarUrl, diamondCount);

    const tierPriority = diamondCount >= state.settings.vipThreshold ? 'vip' : 'advanced';
    const result = assignSeatForUser(user, tierPriority);

    broadcastEvent('user:gift', {
      user,
      giftName: gift.name,
      giftCount: gift.count || 1,
      diamondCount: diamondCount,
      seatResult: result
    });
    broadcastState();
  });

  socket.on('sim:batch_fill', () => {
    // Fill 12 seats immediately for instant preview
    const sampleNames = [
      'Phật Tử Thiện Tâm', 'Hoa Sen Trắng', 'Tâm An Lạc', 'Tịnh Độ Cư Sĩ',
      'Đại Gia Bình Dương', 'Diệu Âm Cát Tường', 'Tu Tâm Dưỡng Tính', 'Thanh Tịnh Trúc Lâm',
      'Minh Trí Đại Sư', 'Ngọc Tâm Cát Tường', 'Vạn Phúc Lưu Gia', 'Chân Như An Lạc'
    ];
    sampleNames.forEach((name, i) => {
      const uid = `sample_${i + 1}`;
      const isVip = i < 3;
      const diamonds = isVip ? (100 * (4 - i)) : 0;
      const u = {
        uniqueId: uid,
        nickname: name,
        avatarUrl: `https://api.dicebear.com/7.x/notionists/svg?seed=${uid}`,
        diamondSpent: diamonds
      };
      if (diamonds > 0) updateTopDonators(uid, name, u.avatarUrl, diamonds);
      assignSeatForUser(u, isVip ? 'vip' : 'standard');
    });
    broadcastEvent('system:info', { message: 'Đã triệu tập 12 thiền sinh vào chánh điện!' });
    broadcastState();
  });
});

// Start Server
server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🌸 CHÁNH ĐIỆN THIỀN ONLINE TIKTOK LIVE ENGINE 🌸`);
  console.log(`====================================================`);
  console.log(`📺 Livestream Overlay (Màn hình chiếu OBS):`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`   http://localhost:${PORT}/?layout=vertical   (Khung Dọc 9:16)`);
  console.log(`   http://localhost:${PORT}/?layout=horizontal (Khung Ngang 16:9)`);
  console.log(`----------------------------------------------------`);
  console.log(`🎛️ Bảng Điều Khiển Admin & Giả Lập Test:`);
  console.log(`   http://localhost:${PORT}/admin.html`);
  console.log(`====================================================`);

  // Auto-connect if environment variable provided (Cloud/GitHub Actions)
  if (process.env.TIKTOK_USERNAME) {
    setTimeout(() => {
      console.log(`[Cloud Engine] Tự động kết nối tới kênh @${process.env.TIKTOK_USERNAME}...`);
      connectTikTok(process.env.TIKTOK_USERNAME);
    }, 2500);
  }
});
