/**
 * Lightbot Camp Studio 3D - Procedural Web Audio Sound Synthesizer
 * Zero-dependency, zero-404 Web Audio API implementation.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.6;

  constructor() {
    // Lazy initialize on first user interaction to satisfy browser autoplay policies
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.volume;
  }

  // Mechanical footstep servo & clank
  public playStep() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.08);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, t);

    gain.gain.setValueAtTime(this.volume * 0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.09);

    // Subtle metallic click layer
    const noise = this.ctx.createOscillator();
    const noiseGain = this.ctx.createGain();
    noise.type = 'square';
    noise.frequency.setValueAtTime(800, t);
    noise.frequency.exponentialRampToValueAtTime(200, t + 0.03);
    noiseGain.gain.setValueAtTime(this.volume * 0.15, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

    noise.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(t);
    noise.stop(t + 0.04);
  }

  // Turn servo motor whir
  public playTurn() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.linearRampToValueAtTime(380, t + 0.07);
    osc.frequency.exponentialRampToValueAtTime(160, t + 0.14);

    gain.gain.setValueAtTime(this.volume * 0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  // Hydraulic jump thrust
  public playJump() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(620, t + 0.18);

    gain.gain.setValueAtTime(this.volume * 0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.22);
  }

  // Landing impact shock
  public playLanding() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(110, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.15);

    gain.gain.setValueAtTime(this.volume * 0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.16);
  }

  // Crystal light beacon activation chime
  public playLight() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 pentatonic

    freqs.forEach((freq, idx) => {
      const startTime = t + idx * 0.05;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(this.volume * 0.35, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.7);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.75);
    });
  }

  // UI block click / placement
  public playClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(700, t);
    osc.frequency.exponentialRampToValueAtTime(350, t + 0.04);

    gain.gain.setValueAtTime(this.volume * 0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  // Blocked / invalid action error
  public playBlocked() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(130, t);
    osc.frequency.setValueAtTime(100, t + 0.08);

    gain.gain.setValueAtTime(this.volume * 0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.17);
  }

  // Victory fanfare
  public playVictory() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [
      { f: 523.25, d: 0.12 }, // C5
      { f: 659.25, d: 0.12 }, // E5
      { f: 783.99, d: 0.12 }, // G5
      { f: 1046.5, d: 0.4 },  // C6
    ];

    let offset = 0;
    notes.forEach((note) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, t + offset);

      gain.gain.setValueAtTime(0, t + offset);
      gain.gain.linearRampToValueAtTime(this.volume * 0.4, t + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + offset + note.d);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t + offset);
      osc.stop(t + offset + note.d + 0.05);

      offset += note.d * 0.85;
    });
  }
}

export const soundManager = new SoundManager();
