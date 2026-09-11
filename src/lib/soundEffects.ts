// Bộ hiệu ứng âm thanh sử dụng Web Audio API tổng hợp trực tiếp
// Đảm bảo chạy 100% offline, không phụ thuộc file mp3 ngoài và không có độ trễ

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Âm thanh tạch tạch khi vòng quay xoay
  public playTick() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }

  // Âm thanh vinh danh khi chọn xong học sinh
  public playFanfare() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const startTime = ctx.currentTime + index * 0.1;
      const duration = index === notes.length - 1 ? 0.6 : 0.18;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  }

  // Âm thanh trả lời đúng (+ sao thưởng)
  public playCorrect() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    // Chuông ngân 2 nốt cao tươi vui
    const notes = [659.25, 880.0]; // E5, A5
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const startTime = ctx.currentTime + idx * 0.12;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.5);
    });
  }

  // Âm thanh vỗ tay / động viên
  public playEncourage() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    // Chuỗi âm ấm áp khích lệ
    const notes = [440, 493.88, 523.25]; // A4, B4, C5
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + idx * 0.1;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.35);
    });
  }

  // Âm đếm ngược (nhịp tíc-tắc hồi hộp)
  public playCountdownTick(isUrgent = false) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    const freq = isUrgent ? 880 : 587.33; // D5 hoặc A5
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(isUrgent ? 0.25 : 0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  }

  // Âm thanh hết giờ (Buzzer)
  public playTimeUp() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.4);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  }

  // Tìm giọng Tiếng Việt tốt nhất từ danh sách voices
  private pickVietnameseVoice(): SpeechSynthesisVoice | null {
    const voices = window.speechSynthesis.getVoices();
    // Ưu tiên: giọng vi-VN online của Google > bất kỳ vi-VN nào > vi nào
    const online = voices.find(v => v.lang === 'vi-VN' && v.name.toLowerCase().includes('google'));
    if (online) return online;
    const exact = voices.find(v => v.lang === 'vi-VN');
    if (exact) return exact;
    const loose = voices.find(v => v.lang.startsWith('vi'));
    return loose ?? null;
  }

  // Phát âm đọc tên (Text-to-Speech) — ưu tiên giọng Tiếng Việt
  public speakText(text: string) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const doSpeak = () => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';
      utterance.rate = 0.95;
      utterance.pitch = 1.05;

      const viVoice = this.pickVietnameseVoice();
      if (viVoice) {
        utterance.voice = viVoice;
      }
      // Nếu không tìm thấy giọng Việt, vẫn giữ lang='vi-VN' để trình duyệt
      // tự chọn giọng phù hợp nhất có thể. Máy tính cần cài thêm
      // gói giọng đọc Tiếng Việt (Windows: Cài đặt → Thời gian & Ngôn ngữ
      // → Giọng nói → Thêm giọng nói → Tiếng Việt).

      window.speechSynthesis.speak(utterance);
    };

    // Chrome/Edge tải danh sách giọng bất đồng bộ — cần chờ
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      doSpeak();
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null;
        doSpeak();
      };
      // Fallback: nếu sự kiện không bao giờ bắn (Firefox/Safari) thì cứ speak
      setTimeout(doSpeak, 200);
    }
  }
}

export const sound = new SoundManager();
