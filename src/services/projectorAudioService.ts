// Real-time Audio Routing, Device Selection & Mic Loopback to Projector / External Screen

export interface AudioDeviceInfo {
  deviceId: string;
  label: string;
  groupId: string;
  kind: MediaDeviceKind;
}

class ProjectorAudioService {
  private audioContext: AudioContext | null = null;
  private micStream: MediaStream | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private audioElement: HTMLAudioElement | null = null;
  
  public isMicLive = false;
  public selectedOutputDeviceId = 'default';
  public selectedInputDeviceId = 'default';
  public currentVolume = 1.0;
  public isMuted = false;

  // Initialize or get AudioContext
  private getAudioContext(): AudioContext {
    if (!this.audioContext || this.audioContext.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioCtx();
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    return this.audioContext;
  }

  // Get list of connected audio output devices (Projector, HDMI, Bluetooth, Speakers)
  public async getAudioOutputDevices(): Promise<AudioDeviceInfo[]> {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        return [{ deviceId: 'default', label: 'مخرج الصوت الافتراضي للشاشة / الجهاز', groupId: '', kind: 'audiooutput' }];
      }
      const devices = await navigator.mediaDevices.enumerateDevices();
      const outputs = devices.filter(d => d.kind === 'audiooutput');
      
      if (outputs.length === 0) {
        return [{ deviceId: 'default', label: 'شاشة العرض / مخرج الصوت المتاح (HDMI/Default)', groupId: '', kind: 'audiooutput' }];
      }

      return outputs.map((d, idx) => ({
        deviceId: d.deviceId,
        label: d.label || `مخرج صوت ${idx + 1} (بروجيكتور / سماعات خارجية)`,
        groupId: d.groupId,
        kind: d.kind
      }));
    } catch (e) {
      console.warn('Could not enumerate audio output devices:', e);
      return [{ deviceId: 'default', label: 'مخرج الصوت الافتراضي (Default Speaker / HDMI)', groupId: '', kind: 'audiooutput' }];
    }
  }

  // Get list of connected audio input devices (Microphones)
  public async getAudioInputDevices(): Promise<AudioDeviceInfo[]> {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        return [{ deviceId: 'default', label: 'ميكروفون اللابتوب الافتراضي', groupId: '', kind: 'audioinput' }];
      }
      const devices = await navigator.mediaDevices.enumerateDevices();
      const inputs = devices.filter(d => d.kind === 'audioinput');

      if (inputs.length === 0) {
        return [{ deviceId: 'default', label: 'ميكروفون الجهاز الافتراضي', groupId: '', kind: 'audioinput' }];
      }

      return inputs.map((d, idx) => ({
        deviceId: d.deviceId,
        label: d.label || `ميكروفون ${idx + 1}`,
        groupId: d.groupId,
        kind: d.kind
      }));
    } catch (e) {
      console.warn('Could not enumerate audio input devices:', e);
      return [{ deviceId: 'default', label: 'الميكروفون الافتراضي', groupId: '', kind: 'audioinput' }];
    }
  }

  // Play test sound chime through the selected output device (HDMI/Projector/Screen)
  public async playTestSound(outputDeviceId?: string): Promise<boolean> {
    const devId = outputDeviceId || this.selectedOutputDeviceId || 'default';
    try {
      const ctx = this.getAudioContext();
      
      // If sinkId is supported on AudioContext
      if ('setSinkId' in ctx && devId && devId !== 'default') {
        try {
          await (ctx as any).setSinkId(devId);
        } catch (err) {
          console.warn('AudioContext setSinkId failed, using fallback audio element:', err);
        }
      }

      // Create a pleasant 3-tone chime (C5 -> E5 -> G5)
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        
        noteGain.gain.setValueAtTime(0, now + idx * 0.12);
        noteGain.gain.linearRampToValueAtTime(0.3, now + idx * 0.12 + 0.03);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.5);
        
        osc.connect(noteGain);
        noteGain.connect(ctx.destination);
        
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.55);
      });

      return true;
    } catch (e) {
      console.error('Error playing test sound:', e);
      return false;
    }
  }

  // Start routing microphone to external output (Projector / Screen) with anti-feedback filter
  public async startMicPassthrough(
    outputDeviceId?: string,
    inputDeviceId?: string,
    onLevelUpdate?: (level: number) => void
  ): Promise<{ success: boolean; error?: string }> {
    try {
      this.stopMicPassthrough();

      this.selectedOutputDeviceId = outputDeviceId || this.selectedOutputDeviceId || 'default';
      this.selectedInputDeviceId = inputDeviceId || this.selectedInputDeviceId || 'default';

      // Request microphone with echo cancellation and anti-howl parameters
      const constraints: MediaStreamConstraints = {
        audio: {
          deviceId: this.selectedInputDeviceId !== 'default' ? { exact: this.selectedInputDeviceId } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: false
      };

      this.micStream = await navigator.mediaDevices.getUserMedia(constraints);
      const ctx = this.getAudioContext();

      // Audio Graph: Mic -> High-Pass Filter (removes room rumble) -> Gain Node (volume) -> Analyser Node (VU meter) -> Destination
      this.micSource = ctx.createMediaStreamSource(this.micStream);
      
      // High-pass filter at 100Hz to eliminate mechanical low rumble
      this.filterNode = ctx.createBiquadFilter();
      this.filterNode.type = 'highpass';
      this.filterNode.frequency.setValueAtTime(100, ctx.currentTime);

      // Volume Gain
      this.gainNode = ctx.createGain();
      this.gainNode.gain.setValueAtTime(this.isMuted ? 0 : this.currentVolume, ctx.currentTime);

      // VU Analyser
      this.analyserNode = ctx.createAnalyser();
      this.analyserNode.fftSize = 64;

      // Connect Nodes
      this.micSource.connect(this.filterNode);
      this.filterNode.connect(this.gainNode);
      this.gainNode.connect(this.analyserNode);

      // Route audio to output
      if (!this.audioElement) {
        this.audioElement = new Audio();
        this.audioElement.autoplay = true;
      }

      // Create a stream destination to attach to HTMLAudioElement for setSinkId
      const streamDestination = ctx.createMediaStreamDestination();
      this.gainNode.connect(streamDestination);
      this.audioElement.srcObject = streamDestination.stream;

      if ('setSinkId' in this.audioElement && this.selectedOutputDeviceId && this.selectedOutputDeviceId !== 'default') {
        try {
          await (this.audioElement as any).setSinkId(this.selectedOutputDeviceId);
        } catch (sinkErr) {
          console.warn('Could not set sinkId on audioElement:', sinkErr);
        }
      }

      await this.audioElement.play().catch(() => {});

      this.isMicLive = true;

      // Realtime VU meter polling
      if (onLevelUpdate && this.analyserNode) {
        const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
        const poll = () => {
          if (!this.isMicLive || !this.analyserNode) return;
          this.analyserNode.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          const normalized = Math.min(100, Math.round((avg / 255) * 100 * 2));
          onLevelUpdate(normalized);
          requestAnimationFrame(poll);
        };
        requestAnimationFrame(poll);
      }

      return { success: true };
    } catch (e: any) {
      console.error('Error starting mic passthrough:', e);
      this.stopMicPassthrough();
      return { success: false, error: e.message || 'فشل تشغيل الميكروفون' };
    }
  }

  // Set Output Device (Sink ID)
  public async setOutputDevice(deviceId: string): Promise<boolean> {
    this.selectedOutputDeviceId = deviceId;
    if (this.audioElement && 'setSinkId' in this.audioElement) {
      try {
        await (this.audioElement as any).setSinkId(deviceId);
        return true;
      } catch (e) {
        console.warn('Failed to set sink id:', e);
        return false;
      }
    }
    return true;
  }

  // Set Mic Volume Gain (0.0 to 2.0)
  public setVolume(volume: number) {
    this.currentVolume = Math.max(0, Math.min(2.0, volume));
    if (this.gainNode && this.audioContext && !this.isMuted) {
      this.gainNode.gain.setValueAtTime(this.currentVolume, this.audioContext.currentTime);
    }
  }

  // Toggle Mute
  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.gainNode && this.audioContext) {
      this.gainNode.gain.setValueAtTime(this.isMuted ? 0 : this.currentVolume, this.audioContext.currentTime);
    }
    return this.isMuted;
  }

  // Stop Mic Routing
  public stopMicPassthrough() {
    this.isMicLive = false;
    if (this.micStream) {
      this.micStream.getTracks().forEach(t => t.stop());
      this.micStream = null;
    }
    if (this.micSource) {
      this.micSource.disconnect();
      this.micSource = null;
    }
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.srcObject = null;
    }
  }
}

export const projectorAudioService = new ProjectorAudioService();
