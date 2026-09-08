// 8-bit Retro & Melancholic Ambient Sound Engine
// Optimized for web browser autoplay restrictions, high clarity, and tactile UI feedback

class ArcadeSoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  public bgmPlaying: boolean = false;
  private bgmTimer: number | null = null;
  private bgmFilter: BiquadFilterNode | null = null;
  private bgmGain: GainNode | null = null;
  private droneGain: GainNode | null = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private currentStep: number = 0;
  private isUnlocked: boolean = false;
  private lastHoverTime: number = 0;

  constructor() {
    // Register global user gesture listeners to proactively unlock Web Audio
    if (typeof window !== 'undefined') {
      const unlockHandler = () => {
        this.unlock().then(() => {
          if (this.enabled && !this.bgmPlaying) {
            this.startSadBgm();
          }
        });
      };

      ['pointerdown', 'touchstart', 'click', 'keydown'].forEach((evt) => {
        window.addEventListener(evt, unlockHandler, { once: false, passive: true });
      });
    }
  }

  // Ensure AudioContext is instantiated, resumed, and ready
  public async unlock(): Promise<AudioContext | null> {
    if (!this.enabled) return null;
    try {
      if (!this.ctx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
      this.isUnlocked = this.ctx?.state === 'running';
      return this.ctx;
    } catch (e) {
      console.warn('Audio unlock warning:', e);
      return this.ctx;
    }
  }

  private getContext(): AudioContext | null {
    if (!this.enabled) return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // --- Melancholic Ambient Background Music ---
  // A bittersweet, nostalgic tape-warmed progression in D minor / F major
  // Continuous warm drone pad + delicate music-box arpeggios
  async startSadBgm() {
    if (this.bgmPlaying) return;
    const ctx = await this.unlock();
    if (!ctx) return;

    this.bgmPlaying = true;

    try {
      // Warm low-pass tape filter
      if (!this.bgmFilter) {
        this.bgmFilter = ctx.createBiquadFilter();
        this.bgmFilter.type = 'lowpass';
        this.bgmFilter.frequency.setValueAtTime(750, ctx.currentTime);
        this.bgmFilter.Q.setValueAtTime(1.4, ctx.currentTime);

        this.bgmGain = ctx.createGain();
        // Clear, beautifully audible ambient volume level
        this.bgmGain.gain.setValueAtTime(0.24, ctx.currentTime);

        this.bgmFilter.connect(this.bgmGain);
        this.bgmGain.connect(ctx.destination);
      } else if (this.bgmGain) {
        this.bgmGain.gain.cancelScheduledValues(ctx.currentTime);
        this.bgmGain.gain.setValueAtTime(0.24, ctx.currentTime);
      }

      // Start gentle, warm ambient pad drone underneath
      this.startAmbientDrone(ctx);

      // Bittersweet chords (Root, 3rd, 5th, 7th/9th)
      // Dm9 -> Bbmaj7 -> Fmaj7 -> C(add9) -> Gm7 -> Asus4
      const chords: number[][] = [
        [146.83, 220.00, 261.63, 329.63, 349.23], // D3, A3, C4, E4, F4 (Dm9)
        [116.54, 174.61, 220.00, 293.66, 349.23], // Bb2, F3, A3, D4, F4 (Bbmaj7)
        [87.31, 130.81, 174.61, 220.00, 261.63],  // F2, C3, F3, A3, C4 (Fmaj7)
        [130.81, 196.00, 261.63, 293.66, 392.00], // C3, G3, C4, D4, G4 (Cadd9)
        [98.00, 146.83, 174.61, 220.00, 293.66],  // G2, D3, F3, A3, D4 (Gm7)
        [110.00, 164.81, 220.00, 293.66, 329.63], // A2, E3, A3, D4, E4 (Asus4)
      ];

      const playChordStep = () => {
        if (!this.bgmPlaying || !this.enabled) return;
        const currentCtx = this.getContext();
        if (!currentCtx || !this.bgmFilter) return;

        if (currentCtx.state === 'suspended') {
          currentCtx.resume().catch(() => {});
        }

        const chord = chords[this.currentStep % chords.length];
        this.currentStep++;
        const now = currentCtx.currentTime;

        // Warm fundamental bass note
        try {
          const bassOsc = currentCtx.createOscillator();
          const bassGain = currentCtx.createGain();
          bassOsc.type = 'sine';
          bassOsc.frequency.setValueAtTime(chord[0], now);
          bassGain.gain.setValueAtTime(0.001, now);
          bassGain.gain.linearRampToValueAtTime(0.16, now + 0.6);
          bassGain.gain.exponentialRampToValueAtTime(0.001, now + 4.2);
          bassOsc.connect(bassGain);
          bassGain.connect(this.bgmFilter);
          bassOsc.start(now);
          bassOsc.stop(now + 4.3);
        } catch (e) {}

        // Delicate music-box / bell arpeggio notes
        const notes = chord.slice(1);
        notes.forEach((freq, idx) => {
          try {
            const noteTime = now + 0.35 + idx * 0.72 + (idx % 2 === 0 ? 0.05 : -0.05);
            const osc = currentCtx.createOscillator();
            const g = currentCtx.createGain();

            // Alternating soft triangle and sine for warm retro music box
            osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
            osc.frequency.setValueAtTime(freq, noteTime);

            g.gain.setValueAtTime(0.0001, noteTime);
            g.gain.linearRampToValueAtTime(0.14, noteTime + 0.08);
            g.gain.exponentialRampToValueAtTime(0.0001, noteTime + 2.8);

            osc.connect(g);
            g.connect(this.bgmFilter!);
            osc.start(noteTime);
            osc.stop(noteTime + 2.9);
          } catch (e) {}
        });

        // Schedule next chord every 3.9 seconds
        this.bgmTimer = window.setTimeout(playChordStep, 3900);
      };

      playChordStep();
    } catch (err) {
      console.warn('Failed to start BGM:', err);
    }
  }

  // Soft continuous background ethereal drone
  private startAmbientDrone(ctx: AudioContext) {
    if (this.droneOsc1) return;
    try {
      this.droneOsc1 = ctx.createOscillator();
      this.droneOsc2 = ctx.createOscillator();
      this.droneGain = ctx.createGain();

      this.droneOsc1.type = 'sine';
      this.droneOsc1.frequency.setValueAtTime(73.42, ctx.currentTime); // D2
      this.droneOsc2.type = 'triangle';
      this.droneOsc2.frequency.setValueAtTime(146.83, ctx.currentTime); // D3 detuned

      this.droneGain.gain.setValueAtTime(0.001, ctx.currentTime);
      this.droneGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 2.0);

      this.droneOsc1.connect(this.droneGain);
      this.droneOsc2.connect(this.droneGain);
      if (this.bgmFilter) {
        this.droneGain.connect(this.bgmFilter);
      } else {
        this.droneGain.connect(ctx.destination);
      }

      this.droneOsc1.start();
      this.droneOsc2.start();
    } catch (e) {}
  }

  private stopAmbientDrone() {
    if (this.droneGain && this.ctx) {
      try {
        this.droneGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.4);
      } catch (e) {}
    }
    setTimeout(() => {
      try {
        this.droneOsc1?.stop();
        this.droneOsc2?.stop();
        this.droneOsc1?.disconnect();
        this.droneOsc2?.disconnect();
      } catch (e) {}
      this.droneOsc1 = null;
      this.droneOsc2 = null;
      this.droneGain = null;
    }, 450);
  }

  stopSadBgm() {
    this.bgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
    if (this.bgmGain && this.ctx) {
      try {
        this.bgmGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.4);
      } catch (e) {}
    }
    this.stopAmbientDrone();
  }

  toggleBgm(): boolean {
    if (this.bgmPlaying) {
      this.stopSadBgm();
      return false;
    } else {
      this.startSadBgm();
      return true;
    }
  }

  // --- SOUND EFFECTS FOR EVERY INTERACTIVE FEATURE ---

  // 1. General Button / Feature / Category Selection Click
  playSelect() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(360, now);
    osc.frequency.exponentialRampToValueAtTime(540, now + 0.06);
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  // 2. Micro hover blip when moving over graves or important buttons (debounced)
  playHover() {
    const nowMs = Date.now();
    if (nowMs - this.lastHoverTime < 80) return;
    this.lastHoverTime = nowMs;

    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(620, now);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.055);
  }

  // 3. Category Filter Switch (Thematic chime)
  playCategorySwitch(catId?: string | null) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    // Choose tone based on category
    let f1 = 440;
    let f2 = 660;
    if (catId === 'regret') { f1 = 330; f2 = 440; }
    else if (catId === 'failed_idea') { f1 = 520; f2 = 780; }
    else if (catId === 'cringe') { f1 = 400; f2 = 320; }
    else if (catId === 'financial_loss') { f1 = 494; f2 = 370; }
    else if (catId === 'missed_chance') { f1 = 392; f2 = 587; }
    else if (catId === 'career_blunder') { f1 = 350; f2 = 466; }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(f1, now);
    osc.frequency.setValueAtTime(f2, now + 0.05);
    gain.gain.setValueAtTime(0.20, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.17);
  }

  // 4. Candle Ignition: Warm resonant church-bell / memorial flame tone
  playCandle() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc1.frequency.exponentialRampToValueAtTime(1046.50, now + 0.35); // C6

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(659.25, now); // E5

    gain.gain.setValueAtTime(0.26, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.72);
    osc2.stop(now + 0.72);
  }

  // 5. Lay Memorial Flower: Romantic, delicate harp cascade
  playFlower() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880, 1108.73]; // A4, C#5, E5, A5, C#6
    
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.055);
      gain.gain.setValueAtTime(0.18, now + idx * 0.055);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.055 + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.055);
      osc.stop(now + idx * 0.055 + 0.46);
    });
  }

  // 6. Pour One Out: Liquid glug & splash for fallen blunders
  playPourOneOut() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const glugs = [740, 620, 520, 440, 360, 300];
    
    glugs.forEach((freq, idx) => {
      const t = now + idx * 0.07;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq - 140, t + 0.06);
      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.065);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.07);
    });
  }

  // 7. Consecrate & Bury Regret: Deep ceremonial spade dig & minor solemn chord
  playBury() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Heavy earth thud
    const bass = ctx.createOscillator();
    const bassG = ctx.createGain();
    bass.type = 'sine';
    bass.frequency.setValueAtTime(110, now);
    bass.frequency.exponentialRampToValueAtTime(38, now + 0.35);
    bassG.gain.setValueAtTime(0.35, now);
    bassG.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    bass.connect(bassG);
    bassG.connect(ctx.destination);
    bass.start(now);
    bass.stop(now + 0.42);

    // Solemn descending release notes
    const melody = [
      { freq: 329.63, dur: 0.22 }, // E4
      { freq: 293.66, dur: 0.22 }, // D4
      { freq: 261.63, dur: 0.25 }, // C4
      { freq: 220.00, dur: 0.55 }, // A3
    ];

    let t = now + 0.15;
    melody.forEach(({ freq, dur }) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(0.24, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + dur);
      t += dur * 0.85;
    });
  }

  // 8. Dice Roll / Randomizer rattle
  playDiceRoll() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    for (let i = 0; i < 5; i++) {
      const t = now + i * 0.045;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(450 + Math.random() * 400, t);
      g.gain.setValueAtTime(0.18, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.035);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.04);
    }
  }

  // 9. Burial Depth Selector (Heavy stone slide / subterranean vault lock)
  playDepthSelect(depth?: string) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const freq = depth === '50ft' ? 65 : depth === '12ft' ? 95 : depth === '6ft' ? 140 : 190;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq * 1.5, now);
    osc.frequency.exponentialRampToValueAtTime(freq, now + 0.18);
    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.24);
  }

  // 10. Material Selector (Slate, granite, neon, mossy, gilded)
  playMaterialSelect() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(580, now);
    osc.frequency.setValueAtTime(720, now + 0.04);
    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.11);
  }

  // 11. Modal Open / Dig Button Press
  playModalOpen() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(580, now + 0.15);
    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.24);
  }

  // 12. Modal Close
  playModalClose() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.12);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  // 13. Zoom in / Zoom out tick
  playZoom() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, now);
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.065);
  }

  // 14. Random Warp Teleport
  playWarp() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(980, now + 0.32);
    gain.gain.setValueAtTime(0.26, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  // 15. Coin / Memorial Note insertion
  playCoin() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(987.77, now); // B5
    osc1.frequency.setValueAtTime(1318.51, now + 0.08); // E6
    gain1.gain.setValueAtTime(0.24, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.42);
  }

  // 16. Camera Reset
  playCameraReset() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.2);
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  // 17. Tab Switching (in Info/Legal modal)
  playTabSwitch() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.setValueAtTime(560, now + 0.04);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.095);
  }
}

export const arcadeAudio = new ArcadeSoundEngine();
