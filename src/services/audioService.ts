/**
 * Centralized Professional Audio Architecture & Controller for Nagah Management System
 * Includes:
 * 1. GeminiTTSProvider (Primary) - Server-side high quality audio generation
 * 2. BrowserSpeechProvider (Fallback) - Filtered Arabic male voice web speech synthesis
 * 3. AudioController - Central state manager tracking all active audio, timers, speech, and network calls
 */

export class GeminiTTSProvider {
  /**
   * Request TTS audio from server-side Gemini route
   */
  public async speak(
    text: string,
    options?: { promptStyle?: string; signal?: AbortSignal }
  ): Promise<HTMLAudioElement | null> {
    try {
      const res = await fetch('/api/gemini/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          promptStyle: options?.promptStyle
        }),
        signal: options?.signal
      });

      if (!res.ok) return null;
      const data = await res.json();

      if (data.success && (data.audio || data.audioBase64)) {
        const base64 = data.audio || data.audioBase64;
        const audio = new Audio(`data:audio/wav;base64,${base64}`);
        return audio;
      }
      return null;
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        console.log('[GeminiTTSProvider] TTS request aborted');
      } else {
        console.warn('[GeminiTTSProvider] Fetch failed:', err?.message || err);
      }
      return null;
    }
  }
}

export class BrowserSpeechProvider {
  private knownFemaleKeywords = [
    'zira', 'hazel', 'susan', 'salma', 'laila', 'female', 'woman',
    'أنثى', 'امرأة', 'حسناء', 'hoda', 'noha', 'mariam', 'samantha',
    'victoria', 'karen', 'fiona', 'veena', 'moira', 'claire', 'stephanie',
    'mona', 'rasha', 'zeina', 'fatima', 'layla', 'sara', 'mary', 'alice',
    'katya', 'helena', 'sabina', 'hedda', 'yuna', 'kyoko', 'ting-ting',
    'sin-ji', 'mei-jia'
  ];

  private knownMaleKeywords = [
    'maged', 'tarik', 'hamed', 'naayf', 'shakir', 'male', 'رجل', 'ذكري', 'مذكر', 'ذكر'
  ];

  /**
   * Load voices asynchronously waiting for voiceschanged if needed
   */
  public async getVoices(): Promise<SpeechSynthesisVoice[]> {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return [];
    }

    const current = window.speechSynthesis.getVoices();
    if (current && current.length > 0) {
      return current;
    }

    return new Promise((resolve) => {
      let resolved = false;
      const onVoicesChanged = () => {
        if (resolved) return;
        resolved = true;
        window.speechSynthesis.onvoiceschanged = null;
        resolve(window.speechSynthesis.getVoices());
      };

      window.speechSynthesis.onvoiceschanged = onVoicesChanged;

      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          if (window.speechSynthesis.onvoiceschanged === onVoicesChanged) {
            window.speechSynthesis.onvoiceschanged = null;
          }
          resolve(window.speechSynthesis.getVoices());
        }
      }, 500);
    });
  }

  /**
   * Select best Arabic male voice excluding female voices
   */
  public getBestArabicMaleVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
    if (!voices || voices.length === 0) return null;

    // Filter out voices with known female names
    const nonFemaleVoices = voices.filter(v => {
      const nameLower = (v.name || '').toLowerCase();
      return !this.knownFemaleKeywords.some(kw => nameLower.includes(kw));
    });

    // Priority 1: Non-female Arabic voice with explicit male keyword
    let voice = nonFemaleVoices.find(v =>
      (v.lang.startsWith('ar') || v.lang.includes('EG')) &&
      this.knownMaleKeywords.some(kw => v.name.toLowerCase().includes(kw))
    );

    // Priority 2: Any non-female Egyptian Arabic voice
    if (!voice) {
      voice = nonFemaleVoices.find(v => v.lang === 'ar-EG' || v.lang.includes('ar_EG'));
    }

    // Priority 3: Any non-female Arabic voice
    if (!voice) {
      voice = nonFemaleVoices.find(v => v.lang.startsWith('ar'));
    }

    // Priority 4: Any non-female voice if no Arabic non-female voice exists
    if (!voice) {
      voice = nonFemaleVoices[0] || null;
    }

    return voice;
  }

  /**
   * Speak text using Web Speech API
   */
  public async speak(text: string, options?: { signal?: AbortSignal }): Promise<void> {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (options?.signal?.aborted) return;

    window.speechSynthesis.cancel();

    const voices = await this.getVoices();
    if (options?.signal?.aborted) return;

    const bestVoice = this.getBestArabicMaleVoice(voices);

    return new Promise((resolve) => {
      try {
        const utter = new SpeechSynthesisUtterance(text);
        if (bestVoice) {
          utter.voice = bestVoice;
        }
        utter.lang = 'ar-EG';
        utter.pitch = 0.85; // Natural resonance
        utter.rate = 0.92;  // Radio presenter pace
        utter.volume = 1.0;

        let finished = false;
        const cleanup = () => {
          if (finished) return;
          finished = true;
          if (options?.signal) {
            options.signal.removeEventListener('abort', onAbort);
          }
          resolve();
        };

        const onAbort = () => {
          try {
            window.speechSynthesis.cancel();
          } catch (e) {}
          cleanup();
        };

        if (options?.signal) {
          options.signal.addEventListener('abort', onAbort);
        }

        utter.onend = () => cleanup();
        utter.onerror = () => cleanup();

        window.speechSynthesis.speak(utter);
      } catch (err) {
        console.warn('[BrowserSpeechProvider] Speech synthesis failed:', err);
        resolve();
      }
    });
  }
}

export class AudioController {
  private activeAudioElements: Set<HTMLAudioElement> = new Set();
  private activeAbortControllers: Set<AbortController> = new Set();
  private activeTimers: Set<ReturnType<typeof setTimeout>> = new Set();
  private activeOscillators: Set<OscillatorNode> = new Set();
  private audioCtx: AudioContext | null = null;

  private geminiProvider = new GeminiTTSProvider();
  private browserProvider = new BrowserSpeechProvider();

  private lastEventId: string | null = null;
  private lastEventTime = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.stopAll());

      // Silently and automatically unlock audio on any initial interaction without prompt
      const autoUnlock = () => {
        this.unlockAudio();
        ['click', 'touchstart', 'pointerdown', 'keydown'].forEach((evt) => {
          window.removeEventListener(evt, autoUnlock);
        });
      };
      ['click', 'touchstart', 'pointerdown', 'keydown'].forEach((evt) => {
        window.addEventListener(evt, autoUnlock, { passive: true });
      });
    }
  }

  /**
   * Complete, instant, and absolute stop of ALL audio across the app!
   */
  public stopAll(): void {
    this.cancelSpeech();
    this.stopHtmlAudio();
    this.cancelPendingAudio();
    this.clearAudioTimers();
    this.stopOscillators();
  }

  /**
   * Cancel SpeechSynthesis
   */
  public cancelSpeech(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
  }

  /**
   * Stop and reset all HTMLAudioElement playback
   */
  public stopHtmlAudio(): void {
    this.activeAudioElements.forEach((audio) => {
      try {
        audio.pause();
        audio.currentTime = 0;
        audio.src = '';
      } catch (e) {}
    });
    this.activeAudioElements.clear();
  }

  /**
   * Abort all pending fetch requests (e.g. Gemini TTS calls)
   */
  public cancelPendingAudio(): void {
    this.activeAbortControllers.forEach((ctrl) => {
      try {
        ctrl.abort('AudioController.stopAll called');
      } catch (e) {}
    });
    this.activeAbortControllers.clear();
  }

  /**
   * Clear all audio sequence timers
   */
  public clearAudioTimers(): void {
    this.activeTimers.forEach((timer) => clearTimeout(timer));
    this.activeTimers.clear();
  }

  /**
   * Stop all active Web Audio synth oscillators
   */
  private stopOscillators(): void {
    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {}
    });
    this.activeOscillators.clear();
  }

  /**
   * Full cleanup
   */
  public dispose(): void {
    this.stopAll();
    if (this.audioCtx) {
      try {
        this.audioCtx.close().catch(() => {});
      } catch (e) {}
      this.audioCtx = null;
    }
  }

  /**
   * Register a managed HTMLAudioElement
   */
  public registerAudioElement(audio: HTMLAudioElement): void {
    this.activeAudioElements.add(audio);
    const cleanup = () => {
      this.activeAudioElements.delete(audio);
    };
    audio.addEventListener('ended', cleanup, { once: true });
    audio.addEventListener('pause', cleanup, { once: true });
    audio.addEventListener('error', cleanup, { once: true });
  }

  /**
   * Register a timer handle
   */
  public registerTimer(timer: ReturnType<typeof setTimeout>): ReturnType<typeof setTimeout> {
    this.activeTimers.add(timer);
    return timer;
  }

  /**
   * Create a managed AbortController
   */
  public createAbortController(): AbortController {
    const ctrl = new AbortController();
    this.activeAbortControllers.add(ctrl);
    return ctrl;
  }

  /**
   * Unlock Web Audio API context
   */
  public unlockAudio(): void {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        if (!this.audioCtx) {
          this.audioCtx = new AudioContextClass();
        }
        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume().catch(() => {});
        }
      }
    } catch (e) {
      console.warn('[AudioController] Unlock audio error:', e);
    }
  }

  private getAudioContext(): AudioContext | null {
    if (!this.audioCtx) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      } catch (e) {}
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  /**
   * Play Egyptian Radio Announcer Star Winner Announcement
   * Primary: Gemini TTS
   * Fallback: BrowserSpeechProvider (Male Arabic Voice)
   */
  public async playWinnerAnnouncement(winnerName: string, eventId?: string): Promise<void> {
    // 1. Instantly stop all existing audio first!
    this.stopAll();

    // 2. Prevent Duplicate Event Execution (Idempotency)
    const now = Date.now();
    if (eventId && this.lastEventId === eventId && (now - this.lastEventTime) < 5000) {
      console.log('[AudioController] Ignored duplicate winner announcement eventId:', eventId);
      return;
    }
    if (eventId) {
      this.lastEventId = eventId;
      this.lastEventTime = now;
    }

    this.unlockAudio();
    this.playSessionEndFanfare();

    // 3. Dynamic Egyptian Radio Presenter Script
    const scriptText = `والآن يا أبطال النجاح... جاءت لحظة التتويج! نجم المحاضرة وصاحب المركز الأول اليوم هو... ${winnerName}! ألف مبروك يا بطل! وتستاهل كل النجوم!`;

    const abortCtrl = this.createAbortController();

    // 4. Try Primary Provider (Gemini TTS)
    const promptStyle = `انطق هذه الجملة بصوت مذيع إذاعي مصري رجالي، حماسي جداً، جهوري، ودافئ بلهجة مصرية عامية طبيعية 100%. النص هو: "${scriptText}"`;
    const geminiAudio = await this.geminiProvider.speak(scriptText, {
      promptStyle,
      signal: abortCtrl.signal
    });

    if (abortCtrl.signal.aborted) return;

    if (geminiAudio) {
      this.registerAudioElement(geminiAudio);
      try {
        await geminiAudio.play();
        return; // Successfully played Gemini TTS audio
      } catch (e) {
        console.warn('[AudioController] Gemini Audio element play failed, using fallback:', e);
      }
    }

    // 5. Fallback Provider (BrowserSpeechProvider)
    if (!abortCtrl.signal.aborted) {
      await this.browserProvider.speak(scriptText, { signal: abortCtrl.signal });
    }
  }

  /**
   * Speak arbitrary text
   */
  public async speakText(text: string, options?: { promptStyle?: string; eventId?: string }): Promise<void> {
    this.stopAll();

    if (options?.eventId) {
      const now = Date.now();
      if (this.lastEventId === options.eventId && (now - this.lastEventTime) < 5000) {
        return;
      }
      this.lastEventId = options.eventId;
      this.lastEventTime = now;
    }

    const abortCtrl = this.createAbortController();
    const geminiAudio = await this.geminiProvider.speak(text, {
      promptStyle: options?.promptStyle,
      signal: abortCtrl.signal
    });

    if (abortCtrl.signal.aborted) return;

    if (geminiAudio) {
      this.registerAudioElement(geminiAudio);
      try {
        await geminiAudio.play();
        return;
      } catch (e) {}
    }

    if (!abortCtrl.signal.aborted) {
      await this.browserProvider.speak(text, { signal: abortCtrl.signal });
    }
  }

  /**
   * Pre-session alert chime
   */
  public playPreSessionAlert(): void {
    this.stopAll();
    this.unlockAudio();
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.15);
        osc.stop(ctx.currentTime + i * 0.15 + 0.4);
        this.activeOscillators.add(osc);
      });
    } catch (e) {}
  }

  /**
   * Session start fanfare
   */
  public playSessionStartAlert(): void {
    this.stopAll();
    this.unlockAudio();
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
        gain.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.12);
        osc.stop(ctx.currentTime + i * 0.12 + 0.5);
        this.activeOscillators.add(osc);
      });
    } catch (e) {}
  }

  /**
   * 5-minute warning chime
   */
  public playFiveMinuteWarningAlert(): void {
    this.stopAll();
    this.unlockAudio();
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const notes = [659.25, 587.33, 523.25];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.2);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.2 + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.2);
        osc.stop(ctx.currentTime + i * 0.2 + 0.6);
        this.activeOscillators.add(osc);
      });
    } catch (e) {}
  }

  /**
   * Session ended fanfare
   */
  public playSessionEndFanfare(): void {
    this.unlockAudio();
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
        gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.15);
        osc.stop(ctx.currentTime + i * 0.15 + 0.8);
        this.activeOscillators.add(osc);
      });
    } catch (e) {}
  }

  /**
   * Play realistic crowd applause / clapping synthesized with Web Audio API
   */
  public playClapping(durationSeconds = 3.5): void {
    this.unlockAudio();
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const sampleRate = ctx.sampleRate;
      const bufferSize = sampleRate * Math.min(durationSeconds, 6);
      const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
      const output = buffer.getChannelData(0);

      // Generate random clapping handclaps across the duration
      let currentSample = 0;
      while (currentSample < bufferSize - 4000) {
        // Random clap length (40ms - 90ms)
        const clapSamples = Math.floor(sampleRate * (0.04 + Math.random() * 0.05));
        const clapVolume = 0.3 + Math.random() * 0.7;

        for (let i = 0; i < clapSamples && currentSample + i < bufferSize; i++) {
          const decay = Math.exp(-i / (sampleRate * 0.015));
          const noise = (Math.random() * 2 - 1) * decay * clapVolume;
          output[currentSample + i] += noise * 0.25;
        }

        // Random interval between claps (30ms - 100ms) to simulate audience
        const intervalSamples = Math.floor(sampleRate * (0.025 + Math.random() * 0.065));
        currentSample += intervalSamples;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;

      // Bandpass filter for natural handclap sound
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1200;
      filter.Q.value = 2.5;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.setValueAtTime(0.4, ctx.currentTime + durationSeconds - 0.8);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSeconds);

      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noiseSource.start();
      noiseSource.stop(ctx.currentTime + durationSeconds);
    } catch (e) {
      console.warn('[AudioController] playClapping error:', e);
    }
  }

  /**
   * Custom chime frequencies
   */
  public playChime(freqs: number[]): void {
    this.unlockAudio();
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, ctx.currentTime + idx * 0.2);
        gain.gain.setValueAtTime(0.25, ctx.currentTime + idx * 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.2 + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.2);
        osc.stop(ctx.currentTime + idx * 0.2 + 0.5);
        this.activeOscillators.add(osc);
      });
    } catch (e) {}
  }
}

export const audioService = new AudioController();
