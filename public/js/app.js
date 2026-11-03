// ============================================================
// ĐẠI CHÁNH ĐIỆN VẠN PHẬT - FRONTEND ENGINE & AUDIO SYNTHESIZER
// High-Art Cinematic Zen Engine with Gemini 4 Argon Architecture
// ============================================================

// 1. WEB AUDIO API SYNTHESIZER (Chuông Chùa, Mõ Gỗ, Nhạc Thiền 432Hz)
class TempleAudioEngine {
  constructor() {
    this.ctx = null;
    this.soundEnabled = true;
    this.musicEnabled = false;
    this.ambientNodes = null;
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
    masterGain.gain.setValueAtTime(0.85, now);
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

    gain.gain.setValueAtTime(0.75, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  // Tiếng Thỉnh Khánh / Chuông Bát Nhỏ (Hand Singing Bowl)
  playChime() {
    if (!this.soundEnabled) return;
    this.init();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(875, now + 2.5);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 2.5);
  }

  // Nhạc Thiền 432Hz Nền Tự Động (Generative Zen Drone)
  toggleAmbientMusic() {
    this.init();
    if (this.ambientNodes) {
      this.stopAmbientMusic();
      return false;
    } else {
      this.startAmbientMusic();
      return true;
    }
  }

  startAmbientMusic() {
    if (this.ambientNodes) return;
    this.init();

    const now = this.ctx.currentTime;
    const master = this.ctx.createGain();
    master.gain.setValueAtTime(0.001, now);
    master.gain.linearRampToValueAtTime(0.12, now + 3);
    master.connect(this.ctx.destination);

    const freqs = [108, 216, 324, 432, 648];
    const oscs = [];

    freqs.forEach(f => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);
      gain.gain.setValueAtTime(0.15 / freqs.length, now);

      if (panner) {
        panner.pan.setValueAtTime((Math.random() - 0.5) * 0.8, now);
        osc.connect(gain);
        gain.connect(panner);
        panner.connect(master);
      } else {
        osc.connect(gain);
        gain.connect(master);
      }

      osc.start(now);
      oscs.push(osc);
    });

    this.ambientNodes = { master, oscs };
    this.musicEnabled = true;
  }

  stopAmbientMusic() {
    if (!this.ambientNodes) return;
    const now = this.ctx.currentTime;
    this.ambientNodes.master.gain.linearRampToValueAtTime(0.0001, now + 1.5);
    setTimeout(() => {
      if (this.ambientNodes) {
        this.ambientNodes.oscs.forEach(o => {
          try { o.stop(); } catch(e) {}
        });
        this.ambientNodes = null;
      }
    }, 1600);
    this.musicEnabled = false;
  }
}

// 2. TEXT-TO-SPEECH (TTS) AI VOICE ANNOUNCER
class TempleAnnouncer {
  constructor() {
    this.enabled = true;
    this.synth = window.speechSynthesis || null;
    this.voice = null;
    this.initVoice();
  }

  initVoice() {
    if (!this.synth) return;
    const loadVoices = () => {
      const voices = this.synth.getVoices();
      this.voice = voices.find(v => v.lang.includes('vi') || v.lang.includes('VIE')) || voices[0];
    };
    loadVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }
  }

  announceGift(nickname, giftName, count) {
    if (!this.enabled || !this.synth) return;

    const cleanNick = nickname.replace(/[\d_.-]+/g, ' ').trim() || 'Thí chủ';
    const text = `Cảm ơn đại thí chủ ${cleanNick} đã phát tâm cúng dường ${count} ${giftName}. A Di Đà Phật, công đức vô lượng!`;

    const utter = new SpeechSynthesisUtterance(text);
    if (this.voice) utter.voice = this.voice;
    utter.rate = 0.95;
    utter.pitch = 1.0;
    utter.volume = 0.95;

    this.synth.cancel();
    this.synth.speak(utter);
  }
}

// 3. CANVAS MULTI-LAYER PARTICLES (Gemini 4 Argon Volumetric Formula)
class TempleAmbientCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
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
    // 55 particles: Volumetric incense smoke & Golden energy motes
    for (let i = 0; i < 55; i++) {
      this.particles.push(this.createParticle(true));
    }
  }

  createParticle(randomY = false) {
    const isLightMote = Math.random() > 0.45; // 55% golden sparkle motes, 45% incense smoke
    return {
      type: isLightMote ? 'light' : 'smoke',
      x: isLightMote ? Math.random() * this.width : (this.width / 2 + (Math.random() - 0.5) * 110),
      y: randomY ? Math.random() * this.height : (isLightMote ? this.height + 15 : this.height * 0.42),
      size: isLightMote ? Math.random() * 3 + 1 : Math.random() * 8 + 5,
      speedY: isLightMote ? -(Math.random() * 1.2 + 0.4) : -(Math.random() * 0.9 + 0.6),
      speedX: (Math.random() - 0.5) * (isLightMote ? 0.7 : 0.8),
      opacity: isLightMote ? Math.random() * 0.7 + 0.3 : Math.random() * 0.22 + 0.08,
      wobbleOffset: Math.random() * Math.PI * 2
    };
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.particles.forEach(p => {
      p.y += p.speedY;
      p.x += p.speedX + Math.sin(p.y * 0.012 + p.wobbleOffset) * 0.5;

      // Wrap around
      if (p.y < -30) {
        p.y = this.height + 20;
        p.x = p.type === 'smoke' ? (this.width / 2 + (Math.random() - 0.5) * 110) : Math.random() * this.width;
      }

      this.ctx.save();
      this.ctx.globalAlpha = p.opacity;

      if (p.type === 'light') {
        // Sacred Lotus Sparkle / Golden Energy Mote
        this.ctx.fillStyle = '#ffe680';
        this.ctx.shadowBlur = 8;
        this.ctx.shadowColor = '#f59e0b';
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        // Subtle Incense Smoke Wisp
        p.size += 0.02;
        this.ctx.fillStyle = 'rgba(215, 195, 175, 0.12)';
        this.ctx.shadowBlur = 8;
        this.ctx.shadowColor = 'rgba(245, 194, 66, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size * 1.6, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();
    });

    requestAnimationFrame(() => this.animate());
  }
}

// 4. MAIN APP CONTROLLER
class TempleApp {
  constructor() {
    this.audio = new TempleAudioEngine();
    this.announcer = new TempleAnnouncer();
    this.socket = null;
    this.state = null;
    this.popupTimeout = null;

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
  }

  initUIControls() {
    const btnSound = document.getElementById('btn-toggle-sound');
    btnSound.addEventListener('click', () => {
      this.audio.soundEnabled = !this.audio.soundEnabled;
      btnSound.textContent = this.audio.soundEnabled ? '🔊' : '🔇';
    });

    const btnMusic = document.getElementById('btn-toggle-music');
    btnMusic.addEventListener('click', () => {
      const isPlaying = this.audio.toggleAmbientMusic();
      btnMusic.textContent = isPlaying ? '🎵' : '🎶 (Tắt)';
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
      this.audio.init();
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
      this.render();
    });

    this.socket.on('state:update', (data) => {
      this.state = data;
      this.render();
    });

    this.socket.on('layout:change', ({ layout }) => {
      document.body.className = layout;
    });

    this.socket.on('stream:event', ({ type, data }) => {
      this.handleStreamEvent(type, data);
    });
  }

  handleStreamEvent(type, data) {
    if (type === 'user:like') {
      this.audio.playWoodenFish();
      this.triggerBowing();
    } else if (type === 'user:chat') {
      this.audio.playChime();
    } else if (type === 'user:gift') {
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
    const seatEl = document.querySelector(`[data-uid="${uniqueId}"] .seat-avatar-wrap`);
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

    this.renderHonorPodium();
    this.renderSeats();
  }

  renderHonorPodium() {
    const donors = this.state.topDonators || [];
    if (donors.length === 0) {
      this.honorPodium.innerHTML = `<div class="honor-empty">Chờ thiện nam tín nữ phát tâm cúng dường...</div>`;
      return;
    }

    const crowns = ['👑', '🥈', '🥉'];
    let html = '';
    donors.slice(0, 3).forEach((d, idx) => {
      html += `
        <div class="podium-item rank-${idx + 1}">
          <div class="avatar-wrap">
            <span class="crown">${crowns[idx] || '✨'}</span>
            <img class="avatar" src="${d.avatarUrl}" alt="${d.nickname}" onerror="this.src='https://api.dicebear.com/7.x/bottts/svg?seed=${d.uniqueId}'">
          </div>
          <div class="donor-info">
            <div class="name">${d.nickname}</div>
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
      let tierLabel = 'ĐỒNG TU THIỆN TÂM';

      if (r === 0) {
        tierClass = 'vip';
        tierLabel = '✨ HÀNG THƯỢNG PHẨM: CỬU PHẨM LIÊN HOA SEN VÀNG ✨';
      } else if (r === 1) {
        tierClass = 'advanced';
        tierLabel = '🌿 HÀNG TRUNG PHẨM: ĐÀI SEN NGỌC BÍCH TINH TẤN 🌿';
      }

      html += `<div class="row-label ${tierClass}">${tierLabel}</div>`;
      html += `<div class="seat-row">`;

      rowSeats.forEach(seat => {
        const u = seat.user;
        const isEmpty = !u;

        html += `
          <div class="seat-item tier-${seat.tier} ${isEmpty ? 'is-empty' : 'is-occupied'}" data-uid="${u ? u.uniqueId : ''}">
            <div class="seat-avatar-wrap ${isEmpty ? '' : 'meditating'}">
              ${isEmpty ? `
                <span class="empty-lotus-icon">🪷</span>
              ` : `
                ${seat.tier === 'vip' ? '<span class="vip-crown">👑</span>' : ''}
                <img src="${u.avatarUrl}" alt="${u.nickname}" onerror="this.src='https://api.dicebear.com/7.x/bottts/svg?seed=${u.uniqueId}'">
                <div class="monk-robe-collar"><span class="prayer-hands">🙏</span></div>
              `}
            </div>
            <div class="lotus-base-3d"></div>
            <div class="seat-name" title="${u ? u.nickname : 'Đài Sen Chờ'}">${u ? u.nickname : 'Cmt để ngồi'}</div>
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
