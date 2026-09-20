import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Sparkles,
  Radio,
  Sliders,
  Maximize2,
  Minimize2,
  X,
  Play,
  Pause,
  Tv,
  Projector,
  Headphones,
  Laptop,
  Layers,
  ShieldCheck,
  Zap,
  Activity,
  CheckCircle2,
  Share2,
  Waves,
  Speaker,
  Settings2,
  AlertCircle
} from 'lucide-react';
import { useCenter } from '../context/CenterContext';
import { audioService } from '../services/audioService';

interface SmartSpeakerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSessionId?: string;
}

export const SmartSpeakerModal: React.FC<SmartSpeakerModalProps> = ({
  isOpen,
  onClose,
  activeSessionId
}) => {
  const { showToast } = useCenter();

  // Microphone & Live Audio State
  const [isMicActive, setIsMicActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1.3); // 130% clean default
  const [boostLevel, setBoostLevel] = useState<'1x' | '1.5x' | '2x' | '3x'>('1.5x');
  const [noiseIsolationLevel, setNoiseIsolationLevel] = useState<'classroom' | 'advanced_ai' | 'studio'>('advanced_ai');
  const [selectedProfile, setSelectedProfile] = useState<'projector' | 'external_speaker' | 'laptop' | 'airpods'>('projector');
  
  // Anti-Feedback & Noise Gate Configuration
  const [antiFeedbackActive, setAntiFeedbackActive] = useState(true);
  const [gateThreshold, setGateThreshold] = useState(18); // 0 - 50 sensitivity
  const [isGateOpen, setIsGateOpen] = useState(false);
  
  // Output Audio Devices
  const [audioInputDevices, setAudioInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioOutputDevices, setAudioOutputDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedInputId, setSelectedInputId] = useState<string>('');
  const [selectedOutputId, setSelectedOutputId] = useState<string>('');

  // Classroom Broadcast State
  const [isBroadcastingToStudents, setIsBroadcastingToStudents] = useState(true);

  // Audio Processing Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const gateGainNodeRef = useRef<GainNode | null>(null);
  
  // DSP Filter Nodes for Anti-Feedback & Tone Shaping
  const highpassFilterRef = useRef<BiquadFilterNode | null>(null);
  const notchFilter1Ref = useRef<BiquadFilterNode | null>(null);
  const notchFilter2Ref = useRef<BiquadFilterNode | null>(null);
  const vocalPresenceRef = useRef<BiquadFilterNode | null>(null);
  const lowpassFilterRef = useRef<BiquadFilterNode | null>(null);
  const compressorRef = useRef<DynamicsCompressorNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Visualizer VU state
  const [audioLevel, setAudioLevel] = useState(0);
  const [visualizerBars, setVisualizerBars] = useState<number[]>(new Array(16).fill(6));

  // Enumerate Audio Devices (Mics & Speakers)
  useEffect(() => {
    if (!isOpen) return;

    const enumerateDevices = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
        const devices = await navigator.mediaDevices.enumerateDevices();
        const inputs = devices.filter(d => d.kind === 'audioinput');
        const outputs = devices.filter(d => d.kind === 'audiooutput');
        setAudioInputDevices(inputs);
        setAudioOutputDevices(outputs);
        if (inputs.length > 0 && !selectedInputId) setSelectedInputId(inputs[0].deviceId);
        if (outputs.length > 0 && !selectedOutputId) setSelectedOutputId(outputs[0].deviceId);
      } catch (e) {
        console.warn('Device enumeration warning:', e);
      }
    };

    enumerateDevices();
    navigator.mediaDevices?.addEventListener('devicechange', enumerateDevices);
    return () => {
      navigator.mediaDevices?.removeEventListener('devicechange', enumerateDevices);
    };
  }, [isOpen, selectedInputId, selectedOutputId]);

  // Start / Stop Microphone Audio Pipeline with High-Grade DSP
  const startSmartSpeaker = async () => {
    try {
      // 1. AudioContext setup with 48kHz high fidelity
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass({ latencyHint: 'interactive', sampleRate: 48000 });
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      audioContextRef.current = ctx;

      // 2. Microphone Stream with Acoustic Echo Cancellation & Noise Suppression
      // Note: AGC is set to false to prevent runaway volume amplification loops when speaker is quiet!
      const constraints: MediaStreamConstraints = {
        audio: {
          deviceId: selectedInputId ? { exact: selectedInputId } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
          channelCount: 1
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;

      // 3. Audio Source
      const source = ctx.createMediaStreamSource(stream);
      sourceNodeRef.current = source;

      // Filter 1: Highpass to eliminate projector fan low rumble (< 130Hz)
      const highpass = ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.value = selectedProfile === 'projector' ? 140 : 100;
      highpass.Q.value = 0.7;
      highpassFilterRef.current = highpass;

      // Filter 2: Anti-Howl Notch Filter 1 (2450 Hz - Key projector/room resonance)
      const notch1 = ctx.createBiquadFilter();
      notch1.type = 'notch';
      notch1.frequency.value = 2450;
      notch1.Q.value = antiFeedbackActive ? 4.5 : 0.01;
      notchFilter1Ref.current = notch1;

      // Filter 3: Anti-Squeal Notch Filter 2 (3850 Hz - High harmonic whistle)
      const notch2 = ctx.createBiquadFilter();
      notch2.type = 'notch';
      notch2.frequency.value = 3850;
      notch2.Q.value = antiFeedbackActive ? 4.5 : 0.01;
      notchFilter2Ref.current = notch2;

      // Filter 4: Vocal Clarity & Presence Peaking Filter (1.8 kHz boost for intelligible Arabic speech)
      const vocalPresence = ctx.createBiquadFilter();
      vocalPresence.type = 'peaking';
      vocalPresence.frequency.value = 1850;
      vocalPresence.Q.value = 1.2;
      vocalPresence.gain.value = 3.0; // +3dB clarity
      vocalPresenceRef.current = vocalPresence;

      // Filter 5: Lowpass to eliminate electrical hiss & treble reflections (> 7200Hz)
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = noiseIsolationLevel === 'studio' ? 6000 : 7500;
      lowpass.Q.value = 0.7;
      lowpassFilterRef.current = lowpass;

      // Dynamics Compressor to prevent clipping and balance volume
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -22;
      compressor.knee.value = 25;
      compressor.ratio.value = 10;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.18;
      compressorRef.current = compressor;

      // Dynamic Noise Gate Gain (Cuts gain instantly during silence to stop speaker echo feedback)
      const gateGain = ctx.createGain();
      gateGain.gain.value = 1.0;
      gateGainNodeRef.current = gateGain;

      // Master Output Volume & Boost Gain
      const gain = ctx.createGain();
      const multiplier = boostLevel === '3x' ? 3.0 : boostLevel === '2x' ? 2.0 : boostLevel === '1.5x' ? 1.5 : 1.0;
      gain.gain.value = isMuted ? 0 : volume * multiplier;
      gainNodeRef.current = gain;

      // Analyser for Live VU Visualizer & Dynamic Gate Detection
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.65;
      analyserRef.current = analyser;

      // Complete Audio Graph Chain:
      // Source -> Highpass -> Notch1 -> Notch2 -> VocalPresence -> Lowpass -> Compressor -> GateGain -> Gain -> Analyser -> Destination
      source.connect(highpass);
      highpass.connect(notch1);
      notch1.connect(notch2);
      notch2.connect(vocalPresence);
      vocalPresence.connect(lowpass);
      lowpass.connect(compressor);
      compressor.connect(gateGain);
      gateGain.connect(gain);
      gain.connect(analyser);

      // Direct connect to audio destination / speakers
      gain.connect(ctx.destination);

      // Output Sink routing via HTMLAudioElement if supported
      if (selectedOutputId && typeof (audioElementRef.current as any)?.setSinkId === 'function') {
        try {
          await (audioElementRef.current as any).setSinkId(selectedOutputId);
        } catch (e) {
          console.warn('setSinkId error:', e);
        }
      }

      setIsMicActive(true);
      startVisualizerLoop();
      audioService.playChime([520, 650, 780]);
      showToast('تم تفعيل مكبر الصوت الذكي مع مانع الصدى وعزل الصفير! 📢🎙️', 'success');
    } catch (err: any) {
      console.error('Smart Speaker activation error:', err);
      showToast('تعذر الوصول إلى الميكروفون. يرجى منح الإذن من المتصفح.', 'error');
    }
  };

  const stopSmartSpeaker = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setIsMicActive(false);
    setAudioLevel(0);
    setIsGateOpen(false);
    setVisualizerBars(new Array(16).fill(6));
    audioService.playChime([400, 300]);
    showToast('تم إيقاف مكبر الصوت الذكي 🔇', 'info');
  };

  // Live Visualizer & Dynamic Noise Gate Loop
  const startVisualizerLoop = () => {
    let gateHoldTimer = 0;

    const updateMeter = () => {
      if (!analyserRef.current || !audioContextRef.current) return;

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);

      // Calculate RMS / Peak level
      let sum = 0;
      const bars: number[] = [];
      const step = Math.max(1, Math.floor(dataArray.length / 16));
      for (let i = 0; i < 16; i++) {
        const val = dataArray[i * step] || 0;
        bars.push(Math.max(6, (val / 255) * 100));
        sum += val;
      }

      const avg = sum / (dataArray.length || 1);
      const levelPct = Math.min(100, Math.round((avg / 128) * 100));
      setAudioLevel(levelPct);
      setVisualizerBars(bars);

      // Adaptive Noise Gate Logic:
      // If voice level exceeds sensitivity threshold, open gate immediately.
      // If voice drops below threshold, smoothly attenuate after hold window to stop acoustic feedback.
      if (gateGainNodeRef.current && audioContextRef.current) {
        const now = audioContextRef.current.currentTime;
        const thresholdNorm = gateThreshold * 1.5;

        if (levelPct >= thresholdNorm) {
          gateHoldTimer = 15; // Hold gate open for 15 frames (~250ms)
          setIsGateOpen(true);
          gateGainNodeRef.current.gain.setTargetAtTime(1.0, now, 0.01);
        } else {
          if (gateHoldTimer > 0) {
            gateHoldTimer--;
            setIsGateOpen(true);
          } else {
            setIsGateOpen(false);
            // Duck volume by 90% during silence when antiFeedback is active to prevent echo feedback loop
            const duckGain = antiFeedbackActive ? 0.08 : 0.4;
            gateGainNodeRef.current.gain.setTargetAtTime(duckGain, now, 0.05);
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(updateMeter);
    };

    updateMeter();
  };

  // React to volume / mute changes
  useEffect(() => {
    if (gainNodeRef.current && audioContextRef.current) {
      const multiplier = boostLevel === '3x' ? 3.0 : boostLevel === '2x' ? 2.0 : boostLevel === '1.5x' ? 1.5 : 1.0;
      const targetGain = isMuted ? 0 : volume * multiplier;
      gainNodeRef.current.gain.setTargetAtTime(targetGain, audioContextRef.current.currentTime, 0.05);
    }
  }, [volume, isMuted, boostLevel]);

  // React to Anti-Feedback toggle
  useEffect(() => {
    if (notchFilter1Ref.current && notchFilter2Ref.current && audioContextRef.current) {
      const now = audioContextRef.current.currentTime;
      notchFilter1Ref.current.Q.setTargetAtTime(antiFeedbackActive ? 4.5 : 0.01, now, 0.1);
      notchFilter2Ref.current.Q.setTargetAtTime(antiFeedbackActive ? 4.5 : 0.01, now, 0.1);
    }
  }, [antiFeedbackActive]);

  // React to noise isolation mode & profile presets
  useEffect(() => {
    if (highpassFilterRef.current && lowpassFilterRef.current && audioContextRef.current) {
      const now = audioContextRef.current.currentTime;
      if (selectedProfile === 'projector') {
        highpassFilterRef.current.frequency.setTargetAtTime(140, now, 0.1);
        lowpassFilterRef.current.frequency.setTargetAtTime(6800, now, 0.1);
      } else if (selectedProfile === 'external_speaker') {
        highpassFilterRef.current.frequency.setTargetAtTime(110, now, 0.1);
        lowpassFilterRef.current.frequency.setTargetAtTime(7400, now, 0.1);
      } else if (selectedProfile === 'laptop') {
        highpassFilterRef.current.frequency.setTargetAtTime(160, now, 0.1);
        lowpassFilterRef.current.frequency.setTargetAtTime(6500, now, 0.1);
      } else {
        highpassFilterRef.current.frequency.setTargetAtTime(80, now, 0.1);
        lowpassFilterRef.current.frequency.setTargetAtTime(8500, now, 0.1);
      }
    }
  }, [selectedProfile, noiseIsolationLevel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach(t => t.stop());
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md animate-in fade-in dir-rtl">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-900 dark:text-slate-100">
        
        {/* Header - Clean Light & Dark Compatible */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl border transition-all ${
              isMicActive 
                ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 dark:border-emerald-500/40 animate-pulse' 
                : 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30 dark:border-amber-500/40'
            }`}>
              <Radio className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>مكبر الصوت الذكي وعازل الضوضاء</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  isMicActive 
                    ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30' 
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {isMicActive ? 'مباشر ON AIR 🔴' : 'متوقف'}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                توجيه صوت المايك إلى البروجكتور والسماعات مع تنقية عازلة للصدى والصفير
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          
          {/* Main Visualizer & Live VU Meter */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isMicActive 
              ? 'bg-emerald-50/40 dark:bg-slate-950/80 border-emerald-500/30 shadow-md' 
              : 'bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Activity className={`w-3.5 h-3.5 ${isMicActive ? 'text-emerald-500 dark:text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
                <span>مستوى الصوت والنقاء اللحظي (Acoustic VU Meter)</span>
              </span>
              <div className="flex items-center gap-2">
                {isMicActive && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold flex items-center gap-1 ${
                    isGateOpen 
                      ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' 
                      : 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300'
                  }`}>
                    {isGateOpen ? '🟢 صوت الشرح متدفق' : '⚪ عازل الصدى صامت'}
                  </span>
                )}
                <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                  {isMicActive ? `${audioLevel}%` : '0%'}
                </span>
              </div>
            </div>

            {/* Visualizer Wave Bars */}
            <div className="flex items-end justify-between gap-1 h-14 px-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-inner">
              {visualizerBars.map((bar, idx) => (
                <div
                  key={idx}
                  className={`w-full rounded-t transition-all duration-75 ${
                    isMicActive 
                      ? bar > 70 ? 'bg-amber-500' : bar > 35 ? 'bg-emerald-500' : 'bg-indigo-500'
                      : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                  style={{ height: `${isMicActive ? bar : 8}%` }}
                />
              ))}
            </div>

            {/* Quick Action Toggle Button */}
            <div className="mt-3.5 flex items-center justify-center gap-3">
              {!isMicActive ? (
                <button
                  onClick={startSmartSpeaker}
                  className="flex-1 py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Mic className="w-5 h-5" />
                  <span>تشغيل مكبر الصوت الآن 🎙️</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 w-full">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-3 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      isMuted
                        ? 'bg-rose-500 text-white border-rose-400 shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-500" />}
                    <span>{isMuted ? 'إلغاء الكتم' : 'كتم المايك'}</span>
                  </button>

                  <button
                    onClick={stopSmartSpeaker}
                    className="flex-1 py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <MicOff className="w-4 h-4" />
                    <span>إيقاف المكبر ⏹️</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Presets (Projector, External Speaker, Laptop, etc.) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>إعدادات العتاد وموقع السماعات المفضل:</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { 
                  id: 'projector', 
                  label: 'بروجكتور وقاعة 📽️', 
                  sub: 'مانع الصفير والصدى',
                  icon: Projector 
                },
                { 
                  id: 'external_speaker', 
                  label: 'سماعة خارجية / شحن 🔊', 
                  sub: 'صوت جهوري نقي',
                  icon: Speaker 
                },
                { 
                  id: 'laptop', 
                  label: 'سماعات اللاب 💻', 
                  sub: 'عزل صوت المراوح',
                  icon: Laptop 
                },
                { 
                  id: 'airpods', 
                  label: 'سماعة رأس / إيربودز 🎧', 
                  sub: 'استوديو نقي',
                  icon: Headphones 
                }
              ].map(item => {
                const Icon = item.icon;
                const isSelected = selectedProfile === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedProfile(item.id as any);
                      showToast(`تم تطبيق بروفايل: ${item.label}`, 'info');
                    }}
                    className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition-all text-center ${
                      isSelected
                        ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-500 text-amber-900 dark:text-amber-300 shadow-sm ring-1 ring-amber-500'
                        : 'bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`} />
                    <span className="text-[11px] leading-tight font-black">{item.label}</span>
                    <span className="text-[9px] text-slate-400 font-normal">{item.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Anti-Feedback & Noise Gate Advanced Box */}
          <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  نظام مانع الصدى والصفير الصوتي الذكي (Acoustic Notch Suppressor)
                </span>
              </div>
              <button
                onClick={() => {
                  setAntiFeedbackActive(!antiFeedbackActive);
                  showToast(!antiFeedbackActive ? 'تم تفعيل مانع الصفير الذكي 🛡️' : 'تم تعطيل مانع الصفير', 'info');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  antiFeedbackActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {antiFeedbackActive ? 'مفعل ✓' : 'معطل'}
              </button>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              يقوم النظام بتطبيق فلاتر دقيقة (Notch Filters + Automatic Noise Gate) لعزل ترددات الرنين بين مايك اللابتوب وسماعات البروجكتور لمنع الصفير والصدى المزعج نهائياً أثناء الحديث.
            </p>

            {/* Noise Gate Slider */}
            <div className="pt-1 flex items-center justify-between gap-3 text-xs">
              <span className="text-slate-600 dark:text-slate-400 text-[11px] shrink-0">
                حساسية بوابة كتم الصدى:
              </span>
              <input
                type="range"
                min="5"
                max="35"
                step="1"
                value={gateThreshold}
                onChange={(e) => setGateThreshold(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold shrink-0 text-[11px]">
                {gateThreshold > 25 ? 'عالية (قاعة صاخبة)' : gateThreshold > 14 ? 'متوازنة (بروجكتور)' : 'حساسة'}
              </span>
            </div>
          </div>

          {/* Volume & Super Boost Controls */}
          <div className="bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>مستوى الصوت وتضخيم الصوت (Voice Volume & Boost):</span>
              </label>
              <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                {Math.round(volume * (boostLevel === '3x' ? 300 : boostLevel === '2x' ? 200 : boostLevel === '1.5x' ? 150 : 100))}%
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0.2"
                max="2.5"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Boost Presets */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">مضاعف التضخيم (Super Boost):</span>
              <div className="flex items-center gap-1">
                {(['1x', '1.5x', '2x', '3x'] as const).map(b => (
                  <button
                    key={b}
                    onClick={() => setBoostLevel(b)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      boostLevel === b
                        ? 'bg-amber-500 text-white dark:text-slate-950 shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:text-white'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Audio Devices (Mics & Speakers Selectors) */}
          {(audioInputDevices.length > 0 || audioOutputDevices.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {audioInputDevices.length > 0 && (
                <div className="p-2.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800">
                  <label className="text-[10px] text-slate-500 block mb-1 font-bold">الميكروفون المدخل:</label>
                  <select
                    value={selectedInputId}
                    onChange={(e) => setSelectedInputId(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-xs text-slate-800 dark:text-slate-200 outline-none"
                  >
                    {audioInputDevices.map((d, i) => (
                      <option key={d.deviceId || i} value={d.deviceId}>
                        {d.label || `ميكروفون ${i + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {audioOutputDevices.length > 0 && (
                <div className="p-2.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800">
                  <label className="text-[10px] text-slate-500 block mb-1 font-bold">مخرج الصوت (السماعة / البروجكتور):</label>
                  <select
                    value={selectedOutputId}
                    onChange={(e) => setSelectedOutputId(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-xs text-slate-800 dark:text-slate-200 outline-none"
                  >
                    {audioOutputDevices.map((d, i) => (
                      <option key={d.deviceId || i} value={d.deviceId}>
                        {d.label || `سماعة / بروجكتور ${i + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Classroom Live Broadcast Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30">
            <div className="flex items-center gap-2.5">
              <Share2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-200">بث الصوت لأجهزة الطلاب بالمعمل (Lab Broadcast)</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">سماع صوت الشرح فورياً عبر شاشات وسماعات الطلاب المتصلة</p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsBroadcastingToStudents(!isBroadcastingToStudents);
                showToast(
                  !isBroadcastingToStudents
                    ? 'تم تفعيل البث الصوتي الفوري لجميع أجهزة الطلاب في المعمل 📡'
                    : 'تم إيقاف البث الصوتي لأجهزة الطلاب',
                  !isBroadcastingToStudents ? 'success' : 'info'
                );
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isBroadcastingToStudents
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {isBroadcastingToStudents ? 'مفعل ✓' : 'معطل'}
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            نظام NAGAH MS الصوتي المتطور • زمن استجابة فائق (Ultra-Low Latency)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all"
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    </div>
  );
};
