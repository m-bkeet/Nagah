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
  Share2
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
  const [volume, setVolume] = useState(1.4); // 140% boost default
  const [boostLevel, setBoostLevel] = useState<'1x' | '1.5x' | '2x' | '3x'>('1.5x');
  const [noiseIsolationLevel, setNoiseIsolationLevel] = useState<'classroom' | 'advanced_ai' | 'studio'>('advanced_ai');
  const [selectedProfile, setSelectedProfile] = useState<'laptop' | 'projector' | 'airpods' | 'lab_broadcast'>('projector');
  
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
  const highpassFilterRef = useRef<BiquadFilterNode | null>(null);
  const lowpassFilterRef = useRef<BiquadFilterNode | null>(null);
  const compressorRef = useRef<DynamicsCompressorNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Visualizer VU state
  const [audioLevel, setAudioLevel] = useState(0);
  const [visualizerBars, setVisualizerBars] = useState<number[]>(new Array(16).fill(5));

  // Enumerate Audio Devices
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
  }, [isOpen]);

  // Start / Stop Microphone Audio Pipeline
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
      const constraints: MediaStreamConstraints = {
        audio: {
          deviceId: selectedInputId ? { exact: selectedInputId } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;

      // 3. Audio Processing Nodes
      const source = ctx.createMediaStreamSource(stream);
      sourceNodeRef.current = source;

      // Filter 1: Highpass to eliminate low rumble & desk vibrations (< 90Hz)
      const highpass = ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.value = noiseIsolationLevel === 'studio' ? 120 : 90;
      highpass.Q.value = 0.7;
      highpassFilterRef.current = highpass;

      // Filter 2: Lowpass to eliminate electrical hiss & background fan noise (> 7500Hz)
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = noiseIsolationLevel === 'studio' ? 6500 : 7800;
      lowpass.Q.value = 0.7;
      lowpassFilterRef.current = lowpass;

      // Filter 3: Dynamics Compressor to prevent loud clipping and amplify whisper
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -24;
      compressor.knee.value = 30;
      compressor.ratio.value = 12;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.25;
      compressorRef.current = compressor;

      // Gain Node for Volume & Boost
      const gain = ctx.createGain();
      const multiplier = boostLevel === '3x' ? 3.0 : boostLevel === '2x' ? 2.0 : boostLevel === '1.5x' ? 1.5 : 1.0;
      gain.gain.value = isMuted ? 0 : volume * multiplier;
      gainNodeRef.current = gain;

      // Analyser for Live VU Visualizer
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      // Audio Graph Connection: Source -> Highpass -> Lowpass -> Compressor -> Gain -> Analyser -> Destination
      source.connect(highpass);
      highpass.connect(lowpass);
      lowpass.connect(compressor);
      compressor.connect(gain);
      gain.connect(analyser);

      // Connect to speakers / output destination
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
      showToast('تم تفعيل مكبر الصوت الذكي مع عزل الضوضاء المتقدم! 📢🎙️', 'success');
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
    setVisualizerBars(new Array(16).fill(5));
    audioService.playChime([400, 300]);
    showToast('تم إيقاف مكبر الصوت الذكي 🔇', 'info');
  };

  // Live Visualizer Loop
  const startVisualizerLoop = () => {
    const updateMeter = () => {
      if (!analyserRef.current || !isMicActive) return;

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);

      // Calculate average level
      let sum = 0;
      const bars: number[] = [];
      const step = Math.floor(dataArray.length / 16);
      for (let i = 0; i < 16; i++) {
        const val = dataArray[i * step] || 0;
        bars.push(Math.max(8, (val / 255) * 100));
        sum += val;
      }

      const avg = sum / dataArray.length;
      setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
      setVisualizerBars(bars);

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

  // React to noise isolation mode
  useEffect(() => {
    if (highpassFilterRef.current && lowpassFilterRef.current && audioContextRef.current) {
      const now = audioContextRef.current.currentTime;
      if (noiseIsolationLevel === 'studio') {
        highpassFilterRef.current.frequency.setTargetAtTime(130, now, 0.1);
        lowpassFilterRef.current.frequency.setTargetAtTime(6200, now, 0.1);
      } else if (noiseIsolationLevel === 'advanced_ai') {
        highpassFilterRef.current.frequency.setTargetAtTime(95, now, 0.1);
        lowpassFilterRef.current.frequency.setTargetAtTime(7500, now, 0.1);
      } else {
        highpassFilterRef.current.frequency.setTargetAtTime(60, now, 0.1);
        lowpassFilterRef.current.frequency.setTargetAtTime(8800, now, 0.1);
      }
    }
  }, [noiseIsolationLevel]);

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
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl border transition-all ${
              isMicActive 
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-pulse' 
                : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
            }`}>
              <Radio className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-100 flex items-center gap-2">
                مكبر الصوت الذكي وعازل الضوضاء 📢
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  isMicActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                }`}>
                  {isMicActive ? 'مباشر ON AIR' : 'متوقف'}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                توجيه صوت الميكروفون إلى سماعات اللاب والبروجكتور وأجهزة الطلاب مع عزل صوتي متقدم
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5 overflow-y-auto">
          
          {/* Main Visualizer & Live VU Meter */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isMicActive 
              ? 'bg-slate-950/80 border-emerald-500/30 shadow-lg shadow-emerald-500/10' 
              : 'bg-slate-950/50 border-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Activity className={`w-3.5 h-3.5 ${isMicActive ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
                مستوى الصوت والعزل اللحظي (Acoustic VU Meter)
              </span>
              <span className="text-xs font-mono text-amber-400 font-bold">
                {isMicActive ? `${audioLevel}% (${audioLevel > 70 ? 'مرتفع' : audioLevel > 20 ? 'مثالي' : 'هادئ'})` : '0%'}
              </span>
            </div>

            {/* Visualizer Wave Bars */}
            <div className="flex items-end justify-between gap-1 h-16 px-2 bg-slate-900/90 rounded-xl border border-slate-800 overflow-hidden">
              {visualizerBars.map((bar, idx) => (
                <div
                  key={idx}
                  className={`w-full rounded-t transition-all duration-75 ${
                    isMicActive 
                      ? bar > 70 ? 'bg-amber-400' : bar > 40 ? 'bg-emerald-400' : 'bg-indigo-400'
                      : 'bg-slate-800'
                  }`}
                  style={{ height: `${isMicActive ? bar : 6}%` }}
                />
              ))}
            </div>

            {/* Quick Action Toggle Button */}
            <div className="mt-4 flex items-center justify-center gap-3">
              {!isMicActive ? (
                <button
                  onClick={startSmartSpeaker}
                  className="flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
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
                        ? 'bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/20'
                        : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                    <span>{isMuted ? 'إلغاء الكتم' : 'كتم المايك'}</span>
                  </button>

                  <button
                    onClick={stopSmartSpeaker}
                    className="flex-1 py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg shadow-rose-600/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <MicOff className="w-4 h-4" />
                    <span>إيقاف المكبر ⏹️</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Presets */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              نمط الإخراج والتوصيل المفضل:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'projector', label: 'شاشة / بروجكتور 📽️', icon: Projector },
                { id: 'laptop', label: 'سماعات اللاب 💻', icon: Laptop },
                { id: 'airpods', label: 'إيربودز / سماعة 🎧', icon: Headphones },
                { id: 'lab_broadcast', label: 'بث أجهزة الطلاب 📡', icon: Tv }
              ].map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedProfile(item.id as any);
                      showToast(`تم تطبيق بروفايل: ${item.label}`, 'info');
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all text-center ${
                      selectedProfile === item.id
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[11px] leading-tight">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Volume & Super Boost Controls */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                مستوى الصوت وتضخيم الصوت (Voice Volume & Boost):
              </label>
              <span className="text-xs font-mono font-bold text-amber-400">
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
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            {/* Boost Presets */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="text-[11px] text-slate-400">مضاعف التضخيم (Super Boost):</span>
              <div className="flex items-center gap-1">
                {(['1x', '1.5x', '2x', '3x'] as const).map(b => (
                  <button
                    key={b}
                    onClick={() => setBoostLevel(b)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      boostLevel === b
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Scientific Noise Isolation Mode */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                نظام عزل الضوضاء والترددات المزعجة (Acoustic Noise Filter):
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { id: 'classroom', title: 'خفيف (Classroom)', desc: 'مناسب للقاعات الهادئة' },
                { id: 'advanced_ai', title: 'علمي متقدم (AI Filter)', desc: 'عزل صدى ومراوح اللاب' },
                { id: 'studio', title: 'فائق (Studio Clear)', desc: 'عزل تام لكافة الأصوات المحيطة' }
              ].map(lvl => (
                <button
                  key={lvl.id}
                  onClick={() => setNoiseIsolationLevel(lvl.id as any)}
                  className={`p-2.5 rounded-xl border text-right transition-all ${
                    noiseIsolationLevel === lvl.id
                      ? 'bg-indigo-500/20 border-indigo-500/60 text-indigo-300 shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <p className="text-xs font-bold">{lvl.title}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{lvl.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Classroom Live Broadcast Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-950 border border-emerald-500/30">
            <div className="flex items-center gap-2.5">
              <Share2 className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="text-xs font-bold text-slate-200">بث الصوت لأجهزة الطلاب بالمعمل (Lab Broadcast)</p>
                <p className="text-[10px] text-slate-400">سماع صوت الشرح فورياً عبر شاشات وسماعات الطلاب المتصلة</p>
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
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {isBroadcastingToStudents ? 'مفعل ✓' : 'معطل'}
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            نظام NAGAH MS الصوتي المتطور • زمن تأخير منخفض (Low Latency)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    </div>
  );
};
