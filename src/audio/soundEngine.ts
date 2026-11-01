class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;
  private currentVehicleType: string = 'fire';
  private audioBuffers: Map<string, AudioBuffer> = new Map();

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public init() {
    this.getContext();
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopEngine();
    } else {
      this.startEngine(this.currentVehicleType);
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // ------------------------------------------------------------------
  // 1. DYNAMIC VEHICLE ENGINE SYNTHESIZER
  // ------------------------------------------------------------------
  public startEngine(vehicleType: string = 'fire') {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    this.stopEngine();
    this.currentVehicleType = vehicleType;

    const baseFrequencies: Record<string, number> = {
      tractor: 42,
      fire: 55,
      jeep: 64,
      rocket: 85,
      boat: 52,
    };

    const baseFreq = baseFrequencies[vehicleType] || 55;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      this.engineOsc = osc;
      this.engineGain = gain;
      this.engineFilter = filter;

      osc.type = vehicleType === 'rocket' ? 'sine' : vehicleType === 'tractor' ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(baseFreq * 3.5, ctx.currentTime);

      gain.gain.setValueAtTime(0.06, ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
    } catch {}
  }

  public updateEngine(speedRatio: number, isAccelerating: boolean) {
    if (this.isMuted || !this.ctx || !this.engineOsc || !this.engineFilter || !this.engineGain) return;

    const baseFrequencies: Record<string, number> = {
      tractor: 42,
      fire: 55,
      jeep: 64,
      rocket: 85,
      boat: 52,
    };
    const baseFreq = baseFrequencies[this.currentVehicleType] || 55;

    const targetFreq = baseFreq + speedRatio * (baseFreq * 1.5) + (isAccelerating ? 15 : 0);
    const targetFilter = targetFreq * (isAccelerating ? 4.5 : 3.0);
    const targetGain = 0.05 + speedRatio * 0.05 + (isAccelerating ? 0.03 : 0);

    const now = this.ctx.currentTime;
    this.engineOsc.frequency.setTargetAtTime(targetFreq, now, 0.08);
    this.engineFilter.frequency.setTargetAtTime(targetFilter, now, 0.08);
    this.engineGain.gain.setTargetAtTime(targetGain, now, 0.08);
  }

  public stopEngine() {
    if (this.engineOsc) {
      try {
        this.engineOsc.stop();
        this.engineOsc.disconnect();
      } catch {}
      this.engineOsc = null;
    }
    if (this.engineGain) {
      this.engineGain.disconnect();
      this.engineGain = null;
    }
    if (this.engineFilter) {
      this.engineFilter.disconnect();
      this.engineFilter = null;
    }
  }

  // ------------------------------------------------------------------
  // 2. TACTILE VEHICLE HORNS & SIRENS
  // ------------------------------------------------------------------
  public playHorn(soundType: 'siren' | 'quack' | 'horn' | 'boing' | 'foghorn' = 'horn') {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    if (soundType === 'siren') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      gain.gain.setValueAtTime(0.12, ctx.currentTime);

      const now = ctx.currentTime;
      for (let i = 0; i < 4; i++) {
        osc.frequency.setValueAtTime(650, now + i * 0.25);
        osc.frequency.linearRampToValueAtTime(950, now + i * 0.25 + 0.12);
        osc.frequency.linearRampToValueAtTime(650, now + i * 0.25 + 0.24);
      }

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(now + 1.0);
    } else if (soundType === 'quack') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      const now = ctx.currentTime;

      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.25);

      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(now + 0.26);
    } else if (soundType === 'boing') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const now = ctx.currentTime;

      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(750, now + 0.35);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(now + 0.36);
    } else if (soundType === 'foghorn') {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = 'sawtooth';
      osc2.type = 'triangle';
      const now = ctx.currentTime;

      osc1.frequency.setValueAtTime(140, now);
      osc2.frequency.setValueAtTime(144, now);

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start();
      osc2.start();
      osc1.stop(now + 0.8);
      osc2.stop(now + 0.8);
    } else {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc1.type = 'triangle';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(440, now);
      osc2.frequency.setValueAtTime(554.37, now);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start();
      osc2.start();
      osc1.stop(now + 0.42);
      osc2.stop(now + 0.42);
    }
  }

  // ------------------------------------------------------------------
  // 3. ACTION & INTERACTIVE SOUND FX
  // ------------------------------------------------------------------
  public playWaterSpray() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const bufferSize = ctx.sampleRate * 0.25;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, ctx.currentTime);
      filter.Q.setValueAtTime(2.0, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
    } catch {}
  }

  public playTurbo() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(750, now + 0.4);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(now + 0.52);
  }

  public playStarCollect(count: number = 1) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const baseFreqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const now = ctx.currentTime;

    baseFreqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.12, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.28);
    });
  }

  public playJump(power: number = 1.0) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(450 * Math.max(0.8, power), now + 0.25);

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(now + 0.3);
  }

  public playLand(impact: number = 1.0) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.18);

    const landVol = Math.min(0.2, 0.08 * impact);
    gain.gain.setValueAtTime(landVol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(now + 0.22);
  }

  public playExtinguish() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const bufferSize = ctx.sampleRate * 0.35;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(3000, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.16, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  }

  public playSplash() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.3);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(now + 0.34);
  }

  public playAnimalSound(type: 'cow' | 'sheep' | 'chicken') {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    if (type === 'cow') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.linearRampToValueAtTime(95, now + 0.4);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.start();
      osc.stop(now + 0.46);
    } else if (type === 'sheep') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.linearRampToValueAtTime(200, now + 0.3);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
      osc.start();
      osc.stop(now + 0.33);
    } else {
      osc.type = 'square';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.12);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start();
      osc.stop(now + 0.16);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
  }

  // ------------------------------------------------------------------
  // 4. STUDIO HUMAN VOICE CLIPS (NATURAL SWEDISH PRONUNCIATION)
  // ------------------------------------------------------------------
  public async playVoiceClip(clipId: string, fallbackText?: string, lang: 'sv' | 'en' = 'sv') {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const prefix = lang === 'sv' ? 'sv_' : 'en_';
    const fullKey = clipId.startsWith('sv_') || clipId.startsWith('en_') ? clipId : `${prefix}${clipId}`;
    const url = `/audio/voices/${fullKey}.mp3`;

    try {
      let buffer = this.audioBuffers.get(fullKey);
      if (!buffer) {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Clip ${fullKey} not found`);
        const arrayBuf = await res.arrayBuffer();
        buffer = await ctx.decodeAudioData(arrayBuf);
        this.audioBuffers.set(fullKey, buffer);
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.95, ctx.currentTime);
      source.connect(gain);
      gain.connect(ctx.destination);
      source.start();
      return;
    } catch {
      if (fallbackText && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(fallbackText);
          utterance.lang = lang === 'sv' ? 'sv-SE' : 'en-GB';
          utterance.rate = 0.95;
          window.speechSynthesis.speak(utterance);
        } catch {}
      }
    }
  }
}

export const sounds = new SoundEngine();
