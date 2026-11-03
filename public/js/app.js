// ============================================================
// ĐẠI CHÁNH ĐIỆN VẠN PHẬT - FRONTEND ENGINE & AUDIO SYNTHESIZER
// High-Art Cinematic Zen Engine with Gemini 4 Argon Architecture
// ============================================================

// Vô hiệu hóa triệt để Web SpeechSynthesis để chặn hoàn toàn giọng robot tiếng Anh của Windows
if (typeof window !== 'undefined' && window.speechSynthesis) {
  try {
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak = function() {
      console.log('[TTS] Legacy speechSynthesis blocked. Playing 100% native Vietnamese audio MP3.');
    };
  } catch(e) {}
}

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]);
const safeImageUrl = value => {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? escapeHtml(url.href) : '';
  } catch (_) { return ''; }
};

// 1. WEB AUDIO API SYNTHESIZER (Chuông Chùa, Mõ Gỗ, Nhạc Thiền 432Hz)
class TempleAudioEngine {
  constructor() {
    this.ctx = null;
    this.soundEnabled = true;
    this.musicEnabled = false;
    this.musicVolume = 0.32;
    this.effectsVolume = 0.8;
    this.voiceActive = false;
    this.bgmPlayer = document.getElementById('bgm-player');
    this.bgmPlayer.volume = this.musicVolume;
    this.commentAudio = new Audio('/assets/comment_chime.mp3');
    this.commentAudio.preload = 'auto';
    this.commentAudio.volume = this.effectsVolume * 0.9;
    this.seatAudio = new Audio('/assets/seat_bell.mp3');
    this.seatAudio.preload = 'auto';
    this.seatAudio.volume = this.effectsVolume * 0.8;
    this.lastCommentAt = 0;
    this.lastSeatAt = 0;
    this.lastLikeAt = 0;
    this.duckTimer = null;
    this.onStatus = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Tiếng Chuông Chùa Đại Hồng Chung (Deep Bronze Tibetan Bell / Singing Bowl)
  playTempleBell(frequency = 216) {
    if (!this.soundEnabled) return;
    this.init();

    const now = this.ctx.currentTime;
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0.48 * this.effectsVolume, now);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 8.0);
    masterGain.connect(this.ctx.destination);

    // Rich inharmonic overtones
    const partials = [
      { f: frequency * 0.5, g: 0.55, t: 8.5 }, // Deep bass sub-hum
      { f: frequency, g: 1.0, t: 7.5 },        // Fundamental strike
      { f: frequency * 1.52, g: 0.65, t: 6.5 },// Minor third overtone
      { f: frequency * 2.01, g: 0.45, t: 5.5 },// Octave
      { f: frequency * 2.76, g: 0.35, t: 4.5 },// Metallic shimmer
      { f: frequency * 4.15, g: 0.22, t: 3.0 } // High chime
    ];

    partials.forEach(p => {
      const osc = this.ctx.createOscillator();
      const pGain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(p.f, now);
      osc.frequency.linearRampToValueAtTime(p.f * 0.996, now + p.t);

      pGain.gain.setValueAtTime(p.g, now);
      pGain.gain.exponentialRampToValueAtTime(0.0001, now + p.t);

      osc.connect(pGain);
      pGain.connect(masterGain);

      osc.start(now);
      osc.stop(now + p.t);
    });
  }

  // Tiếng Mõ Gỗ Chân Thực (Acoustic Wooden Fish Knock)
  playWoodenFish() {
    if (!this.soundEnabled) return;
    const nowMs = Date.now();
    if (nowMs - this.lastLikeAt < 2500) return;
    this.lastLikeAt = nowMs;
    this.init();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(780, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.12);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(650, now);
    filter.Q.setValueAtTime(4.5, now);

    gain.gain.setValueAtTime(0.48 * this.effectsVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  // A short wooden tap for ordinary comments; visual updates still happen for every comment.
  playChime() {
    if (!this.soundEnabled) return;
    const now = Date.now();
    if (now - this.lastCommentAt < 1800) return;
    this.lastCommentAt = now;
    this.duckMusic(700);
    this.commentAudio.pause();
    this.commentAudio.currentTime = 0;
    this.commentAudio.play().then(() => this.reportAudio('comment', 'playing'))
      .catch(() => this.reportAudio('comment', 'blocked'));
  }

  playSeatBell() {
    if (!this.soundEnabled) return;
    const now = Date.now();
    if (now - this.lastSeatAt < 3800) return;
    this.lastSeatAt = now;
    this.lastCommentAt = now;
    this.duckMusic(3000);
    this.seatAudio.pause();
    this.seatAudio.currentTime = 0;
    this.seatAudio.play().then(() => this.reportAudio('seat', 'playing'))
      .catch(() => this.reportAudio('seat', 'blocked'));
  }

  setLevels(settings) {
    if (!settings) return;
    this.musicVolume = Math.max(0, Math.min(1, Number(settings.musicVolume) || 0));
    this.effectsVolume = Math.max(0, Math.min(1, Number(settings.effectsVolume) || 0));
    this.commentAudio.volume = this.effectsVolume * 0.9;
    this.seatAudio.volume = this.effectsVolume * 0.8;
    this.bgmPlayer.volume = (this.voiceActive || this.duckTimer) ? this.musicVolume * 0.28 : this.musicVolume;
  }

  setVoiceActive(active) {
    this.voiceActive = active;
    this.bgmPlayer.volume = (active || this.duckTimer) ? this.musicVolume * 0.28 : this.musicVolume;
  }

  reportAudio(kind, status) {
    if (this.onStatus) this.onStatus({ kind, status });
  }

  duckMusic(duration) {
    if (!this.musicEnabled) return;
    this.bgmPlayer.volume = this.musicVolume * 0.28;
    clearTimeout(this.duckTimer);
    this.duckTimer = setTimeout(() => {
      this.duckTimer = null;
      if (!this.voiceActive) this.bgmPlayer.volume = this.musicVolume;
    }, duration);
  }

  toggleAmbientMusic() {
    if (this.musicEnabled) {
      this.stopAmbientMusic();
      return false;
    }
    this.startAmbientMusic();
    return true;
  }

  setBgmTrack(trackPath) {
    if (this.bgmPlayer.getAttribute('src') !== trackPath) this.bgmPlayer.src = trackPath;
  }

  startAmbientMusic() {
    this.bgmPlayer.volume = (this.voiceActive || this.duckTimer) ? this.musicVolume * 0.28 : this.musicVolume;
    this.bgmPlayer.play().then(() => {
      this.musicEnabled = true;
      this.reportAudio('music', 'playing');
    }).catch(() => {
      this.musicEnabled = false;
      this.reportAudio('music', 'blocked');
    });
  }

  primeMedia() {
    this.init();
    for (const audio of [this.commentAudio, this.seatAudio]) {
      const originalVolume = audio.volume;
      audio.volume = 0;
      audio.play().then(() => {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = originalVolume;
      }).catch(() => { audio.volume = originalVolume; });
    }
  }

  stopAmbientMusic() {
    clearTimeout(this.duckTimer);
    this.duckTimer = null;
    this.bgmPlayer.pause();
    this.musicEnabled = false;
    this.reportAudio('music', 'stopped');
  }
}

// 2. TEXT-TO-SPEECH (TTS) AI VOICE ANNOUNCER (CHUẨN TIẾNG VIỆT 100%)
class TempleAnnouncer {
  constructor() {
    this.enabled = true;
    this.audioQueue = [];
    this.isPlaying = false;
    this.volume = 0.8;
    this.onPlaybackChange = null;
  }

  announceGift(nickname, giftName, count) {
    if (!this.enabled) return;

    let audioPath = '/audio_tts/blessing_general.mp3';
    const gLower = (giftName || '').toLowerCase();
    if (gLower.includes('rose') || gLower.includes('hồng')) {
      audioPath = '/audio_tts/blessing_rose.mp3';
    } else if (gLower.includes('lion') || gLower.includes('sư tử')) {
      audioPath = '/audio_tts/blessing_lion.mp3';
    } else if (gLower.includes('universe') || gLower.includes('vũ trụ')) {
      audioPath = '/audio_tts/blessing_universe.mp3';
    }

    this.playAudioFile(audioPath);
  }

  playAudioFile(audioPath) {
    if (this.audioQueue.length >= 5) return;
    this.audioQueue.push(audioPath);
    this.processQueue();
  }

  async processQueue() {
    if (this.isPlaying || this.audioQueue.length === 0) return;
    this.isPlaying = true;
    const audio = new Audio(this.audioQueue.shift());
    audio.volume = this.volume;
    if (this.onPlaybackChange) this.onPlaybackChange(true);
    await new Promise(resolve => {
      const timeout = setTimeout(resolve, 15000);
      const finish = () => { clearTimeout(timeout); resolve(); };
      audio.addEventListener('ended', finish, { once: true });
      audio.addEventListener('error', finish, { once: true });
      audio.play().catch(finish);
    });
    audio.pause();
    if (this.onPlaybackChange) this.onPlaybackChange(false);
    this.isPlaying = false;
    if (this.audioQueue.length) setTimeout(() => this.processQueue(), 200);
  }
}

// 3. CANVAS MULTI-LAYER PARTICLES (Gemini 4 Argon Volumetric Formula)
class TempleAmbientCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.lastFrame = 0;
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.initParticles();
    this.animate();
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  initParticles() {
    this.particles = [];
    // Ultra-light 16 particles: 0% GPU load
    for (let i = 0; i < 16; i++) {
      this.particles.push(this.createParticle(true));
    }
  }

  createParticle(randomY = false) {
    const isLightMote = Math.random() > 0.4;
    return {
      type: isLightMote ? 'light' : 'smoke',
      x: isLightMote ? Math.random() * this.width : (this.width / 2 + (Math.random() - 0.5) * 80),
      y: randomY ? Math.random() * this.height : (isLightMote ? this.height + 10 : this.height * 0.45),
      size: isLightMote ? Math.random() * 2 + 1 : Math.random() * 6 + 4,
      speedY: isLightMote ? -(Math.random() * 0.8 + 0.3) : -(Math.random() * 0.6 + 0.4),
      speedX: (Math.random() - 0.5) * 0.4,
      opacity: isLightMote ? Math.random() * 0.6 + 0.3 : Math.random() * 0.15 + 0.05,
      wobbleOffset: Math.random() * Math.PI * 2
    };
  }

  animate(timestamp = 0) {
    requestAnimationFrame(time => this.animate(time));
    if (document.hidden || this.reducedMotion || timestamp - this.lastFrame < 66) return;
    this.lastFrame = timestamp;
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.y += p.speedY;
      p.x += p.speedX;

      // Wrap around
      if (p.y < -20) {
        p.y = this.height + 10;
        p.x = p.type === 'smoke' ? (this.width / 2 + (Math.random() - 0.5) * 80) : Math.random() * this.width;
      }

      this.ctx.globalAlpha = p.opacity;

      if (p.type === 'light') {
        this.ctx.fillStyle = '#ffe680';
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        this.ctx.fillStyle = 'rgba(230, 210, 190, 0.1)';
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

  }
}

// 4. MAIN APP CONTROLLER
class TempleApp {
  constructor() {
    this.audio = new TempleAudioEngine();
    this.announcer = new TempleAnnouncer();
    this.announcer.onPlaybackChange = active => this.audio.setVoiceActive(active);
    this.socket = null;
    this.state = null;
    this.popupTimeout = null;
    this.arrivalTimeout = null;
    this.pendingArrivals = new Map();
    this.seatSignature = '';
    this.donorSignature = '';
    this.lastBgmState = '';
    this.audio.onStatus = status => {
      if (document.body.classList.contains('stream-mode')) {
        this.socket?.emit('overlay:audio_status', status);
      }
    };

    // Elements
    this.countGong = document.getElementById('count-gong');
    this.countSeated = document.getElementById('count-seated');
    this.countLikes = document.getElementById('count-likes');
    this.honorPodium = document.getElementById('honor-podium');
    this.seatsGrid = document.getElementById('seats-grid');
    this.giftPopup = document.getElementById('grand-gift-popup');
    this.kickedNotice = document.getElementById('kicked-notice');

    this.initSocket();
    this.initUIControls();
    this.checkUrlParams();
  }

  checkUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const layout = params.get('layout');
    if (layout === 'horizontal') {
      document.body.className = 'horizontal';
    } else {
      document.body.className = 'vertical';
    }
    document.body.classList.toggle('stream-mode', params.get('stream') === '1');
  }

  initUIControls() {
    const btnSound = document.getElementById('btn-toggle-sound');
    btnSound.addEventListener('click', () => {
      this.audio.soundEnabled = !this.audio.soundEnabled;
      btnSound.textContent = this.audio.soundEnabled ? '🔊' : '🔇';
    });

    const btnMusic = document.getElementById('btn-toggle-music');
    btnMusic.addEventListener('click', () => {
      this.socket.emit('admin:bgm', {
        action: this.state?.bgm?.playing ? 'stop' : 'play',
        track: this.state?.bgm?.track || '/assets/tinh_tam_ambient.mp3'
      });
    });

    const btnLayout = document.getElementById('btn-toggle-layout');
    btnLayout.addEventListener('click', () => {
      const isVertical = document.body.classList.contains('vertical');
      document.body.className = isVertical ? 'horizontal' : 'vertical';
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'l' || e.key === 'L') {
        const isVertical = document.body.classList.contains('vertical');
        document.body.className = isVertical ? 'horizontal' : 'vertical';
      } else if (e.key === 'm' || e.key === 'M') {
        this.audio.soundEnabled = !this.audio.soundEnabled;
        btnSound.textContent = this.audio.soundEnabled ? '🔊' : '🔇';
      } else if (e.key === 'b' || e.key === 'B') {
        this.audio.playTempleBell();
      }
    });

    const unlockAudio = () => {
      this.audio.primeMedia();
      if (this.state?.bgm?.playing && this.audio.bgmPlayer.paused) this.audio.startAmbientMusic();
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('keydown', unlockAudio);
  }

  initSocket() {
    this.socket = io();

    this.socket.on('connect', () => {
      console.log('[Socket] Kết nối thành công đến máy chủ Chánh Điện!');
    });

    this.socket.on('state:init', (data) => {
      this.state = data;
      this.audio.setLevels(data.audioSettings);
      this.announcer.volume = data.audioSettings?.voiceVolume ?? 0.8;
      this.render();
      this.syncBgm(data.bgm);
    });

    this.socket.on('state:update', (data) => {
      this.state = data;
      this.audio.setLevels(data.audioSettings);
      this.announcer.volume = data.audioSettings?.voiceVolume ?? 0.8;
      this.render();
      this.syncBgm(data.bgm);
    });

    this.socket.on('layout:change', ({ layout }) => {
      document.body.className = layout;
    });

    this.socket.on('stream:event', ({ type, data }) => {
      this.handleStreamEvent(type, data);
    });

    this.socket.on('audio:comment_test', () => this.audio.playChime());
    this.socket.on('audio:seat_test', () => this.audio.playSeatBell());

    this.socket.on('audio:tts_test', ({ preset }) => {
      this.announcer.playAudioFile('/audio_tts/' + (preset || 'blessing_general.mp3'));
    });
  }

  syncBgm(bgm) {
    if (!bgm) return;
    const musicButton = document.getElementById('btn-toggle-music');
    if (musicButton) {
      musicButton.textContent = bgm.playing ? '🎵' : '🔇';
      musicButton.title = bgm.playing ? 'Tắt nhạc nền' : 'Bật nhạc nền';
    }
    const signature = `${bgm.playing}:${bgm.track}`;
    if (signature === this.lastBgmState) return;
    this.lastBgmState = signature;
    if (bgm.playing) {
      this.audio.setBgmTrack(bgm.track);
      this.audio.startAmbientMusic();
    } else {
      this.audio.stopAmbientMusic();
    }
  }

  handleStreamEvent(type, data) {
    const seatAction = data?.seatResult?.action;
    const justSeated = ['seated', 'replaced', 'promoted'].includes(seatAction);
    if (['user:join', 'user:chat', 'user:gift', 'user:like'].includes(type) && data?.seatResult) {
      const result = data.seatResult;
      if (['seated', 'replaced', 'promoted'].includes(result.action)) {
        this.pendingArrivals.set(result.seatIndex, {
          uniqueId: result.user.uniqueId,
          nickname: result.user.nickname,
          action: result.action
        });
      }
    }
    if (type === 'user:like') {
      if (justSeated) this.audio.playSeatBell();
      else this.audio.playWoodenFish();
      this.triggerBowing();
    } else if (type === 'user:chat') {
      if (justSeated) this.audio.playSeatBell();
      else this.audio.playChime();
    } else if (type === 'user:join') {
      if (justSeated) this.audio.playSeatBell();
    } else if (type === 'user:gift') {
      this.audio.duckMusic(2800);
      this.audio.playTempleBell();
      this.showGiftPopup(data);
      this.announcer.announceGift(data.user.nickname, data.giftName, data.giftCount);
      this.triggerAuraFlash(data.user.uniqueId);
    } else if (type === 'user:kicked') {
      this.showKickedToast(data);
    }
  }

  triggerBowing() {
    const seats = document.querySelectorAll('.seat-avatar-wrap');
    if (seats.length === 0) return;
    const randomSeat = seats[Math.floor(Math.random() * seats.length)];
    randomSeat.classList.add('bowing-anim');
    setTimeout(() => randomSeat.classList.remove('bowing-anim'), 950);
  }

  triggerAuraFlash(uniqueId) {
    const seatEl = [...this.seatsGrid.querySelectorAll('.seat-item')]
      .find(item => item.dataset.uid === String(uniqueId))?.querySelector('.seat-avatar-wrap');
    if (seatEl) {
      seatEl.classList.add('aura-burst-anim');
      setTimeout(() => seatEl.classList.remove('aura-burst-anim'), 1400);
    }
  }

  showGiftPopup(giftData) {
    if (this.popupTimeout) clearTimeout(this.popupTimeout);

    const avatar = document.getElementById('popup-avatar');
    const nickname = document.getElementById('popup-nickname');
    const giftName = document.getElementById('popup-gift-name');
    const blessing = document.getElementById('popup-blessing');

    avatar.src = giftData.user.avatarUrl || 'https://api.dicebear.com/7.x/notionists/svg?seed=buddha';
    nickname.textContent = giftData.user.nickname;
    giftName.textContent = `Cúng dường: ${giftData.giftCount} x ${giftData.giftName}`;
    blessing.textContent = `A Di Đà Phật • ${giftData.diamondCount} Kim Cương • Phước Đức Vô Lượng`;

    this.giftPopup.classList.remove('hidden');

    this.popupTimeout = setTimeout(() => {
      this.giftPopup.classList.add('hidden');
    }, 4500);
  }

  showKickedToast(kickData) {
    const textEl = document.getElementById('kicked-text');
    const nick = kickData.kickedUser ? kickData.kickedUser.nickname : 'Thí chủ';
    textEl.textContent = `${nick} đã viên mãn thời thiền, nhường bồ đoàn cho thiện duyên mới!`;
    this.kickedNotice.classList.remove('hidden');
    setTimeout(() => {
      this.kickedNotice.classList.add('hidden');
    }, 3500);
  }

  render() {
    if (!this.state) return;

    this.countGong.textContent = this.state.stats.gongCount || 0;
    this.countLikes.textContent = this.state.stats.totalLikes || 0;
    const seatedCount = this.state.seats.filter(s => s.user).length;
    this.countSeated.textContent = `${seatedCount}/${this.state.seats.length}`;

    const donorSignature = JSON.stringify(this.state.topDonators || []);
    if (donorSignature !== this.donorSignature) {
      this.donorSignature = donorSignature;
      this.renderHonorPodium();
    }
    const seatSignature = JSON.stringify(this.state.seats.map(s => [
      s.index, s.tier, s.user?.uniqueId, s.user?.nickname, s.user?.avatarUrl, s.user?.diamondSpent
    ]));
    if (seatSignature !== this.seatSignature) {
      this.seatSignature = seatSignature;
      this.renderSeats();
    }
    this.playPendingArrivals();
  }

  playPendingArrivals() {
    for (const [index, arrival] of this.pendingArrivals) {
      const seat = [...this.seatsGrid.querySelectorAll('.seat-item')]
        .find(item => Number(item.dataset.index) === Number(index));
      if (!seat || seat.dataset.uid !== String(arrival.uniqueId)) continue;
      seat.classList.add('seat-arriving');
      setTimeout(() => seat.classList.remove('seat-arriving'), 1500);
      const toast = document.getElementById('arrival-toast');
      document.getElementById('arrival-text').textContent = arrival.action === 'promoted'
        ? `${arrival.nickname} vừa lên đài sen`
        : `${arrival.nickname} vừa vào ngồi thiền`;
      toast.classList.remove('hidden');
      clearTimeout(this.arrivalTimeout);
      this.arrivalTimeout = setTimeout(() => toast.classList.add('hidden'), 2600);
      this.pendingArrivals.delete(index);
    }
  }

  renderHonorPodium() {
    const donors = this.state.topDonators || [];
    if (donors.length === 0) {
      this.honorPodium.innerHTML = `<div class="honor-empty">Chúc bạn một buổi thiền an yên</div>`;
      return;
    }

    const crowns = ['👑', '🥈', '🥉'];
    let html = '';
    donors.slice(0, 3).forEach((d, idx) => {
      html += `
        <div class="podium-item rank-${idx + 1}">
          <div class="avatar-wrap">
            <span class="crown">${crowns[idx] || '✨'}</span>
            <span class="avatar-fallback">✦</span>
            <img class="avatar" src="${safeImageUrl(d.avatarUrl)}" alt="${escapeHtml(d.nickname)}" onerror="this.style.display='none'">
          </div>
          <div class="donor-info">
            <div class="name">${escapeHtml(d.nickname)}</div>
            <div class="diamonds">💎 ${d.totalDiamonds}</div>
          </div>
        </div>
      `;
    });
    this.honorPodium.innerHTML = html;
  }

  renderSeats() {
    const seats = this.state.seats || [];
    const total = seats.length;
    const seatsPerRow = 6;
    const rowCount = Math.ceil(total / seatsPerRow);

    let html = '';

    for (let r = 0; r < rowCount; r++) {
      const rowSeats = seats.slice(r * seatsPerRow, (r + 1) * seatsPerRow);
      let tierClass = 'standard';
      let tierLabel = 'Bồ đoàn tĩnh tâm';

      if (r === 0) {
        tierClass = 'vip';
        tierLabel = 'Hàng sen vàng';
      } else if (r === 1) {
        tierClass = 'advanced';
        tierLabel = 'Hàng sen ngọc';
      }

      html += `<div class="row-label ${tierClass}">${tierLabel}</div>`;
      html += `<div class="seat-row">`;

      rowSeats.forEach(seat => {
        const u = seat.user;
        const isEmpty = !u;

        html += `
          <div class="seat-item tier-${seat.tier} ${isEmpty ? 'is-empty' : 'is-occupied'}" data-index="${seat.index}" data-uid="${u ? escapeHtml(u.uniqueId) : ''}">
            <div class="seat-avatar-wrap ${isEmpty ? '' : 'meditating'}">
              ${isEmpty ? `
                <span class="empty-lotus-icon">🪷</span>
              ` : `
                ${seat.tier === 'vip' ? '<span class="vip-crown">👑</span>' : ''}
                <span class="seat-avatar-fallback">✦</span>
                <img src="${safeImageUrl(u.avatarUrl)}" alt="${escapeHtml(u.nickname)}" onerror="this.style.display='none'">
                <div class="monk-robe-collar"><span class="prayer-hands">🙏</span></div>
              `}
            </div>
            <div class="lotus-base-3d"></div>
            <div class="seat-name" title="${u ? escapeHtml(u.nickname) : 'Đài sen chờ'}">${u ? escapeHtml(u.nickname) : 'Chỗ trống'}</div>
            ${u && seat.tier === 'vip' ? '<div class="seat-badge">💎 ' + (u.diamondSpent || 0) + '</div>' : ''}
          </div>
        `;
      });

      html += `</div>`;
    }

    this.seatsGrid.innerHTML = html;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new TempleAmbientCanvas('ambient-canvas');
  window.templeApp = new TempleApp();
});
