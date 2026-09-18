import React, { useState, useEffect, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Tv,
  Radio,
  Sliders,
  Bell,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { projectorAudioService, AudioDeviceInfo } from '../../services/projectorAudioService';

interface ProjectorAudioControlBarProps {
  compact?: boolean;
}

export const ProjectorAudioControlBar: React.FC<ProjectorAudioControlBarProps> = ({ compact = false }) => {
  const [outputDevices, setOutputDevices] = useState<AudioDeviceInfo[]>([]);
  const [inputDevices, setInputDevices] = useState<AudioDeviceInfo[]>([]);
  const [selectedOutput, setSelectedOutput] = useState<string>('default');
  const [selectedInput, setSelectedInput] = useState<string>('default');
  const [isMicActive, setIsMicActive] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1.0);
  const [vuLevel, setVuLevel] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState<boolean>(!compact);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Load available devices
  const refreshDevices = useCallback(async () => {
    const outputs = await projectorAudioService.getAudioOutputDevices();
    const inputs = await projectorAudioService.getAudioInputDevices();
    setOutputDevices(outputs);
    setInputDevices(inputs);
  }, []);

  useEffect(() => {
    refreshDevices();
    
    // Listen for device change events (e.g. plugging HDMI cable)
    if (navigator.mediaDevices && navigator.mediaDevices.ondevicechange !== undefined) {
      navigator.mediaDevices.ondevicechange = () => {
        refreshDevices();
      };
    }

    return () => {
      projectorAudioService.stopMicPassthrough();
    };
  }, [refreshDevices]);

  const showStatus = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  // Toggle Live Mic Passthrough to Screen
  const handleToggleMic = async () => {
    if (isMicActive) {
      projectorAudioService.stopMicPassthrough();
      setIsMicActive(false);
      setVuLevel(0);
      showStatus('تم إيقاف بث صوت المايك للشاشة', 'info');
    } else {
      const res = await projectorAudioService.startMicPassthrough(
        selectedOutput,
        selectedInput,
        (level) => setVuLevel(level)
      );

      if (res.success) {
        setIsMicActive(true);
        setIsMuted(false);
        showStatus('🎙️ تم تشغيل وتوجيه صوت المايك مباشرة لشاشة العرض / البروجيكتور!', 'success');
      } else {
        showStatus(res.error || 'تعذر الوصول للميكروفون', 'error');
      }
    }
  };

  // Handle Output Device Change
  const handleOutputChange = async (deviceId: string) => {
    setSelectedOutput(deviceId);
    await projectorAudioService.setOutputDevice(deviceId);
    showStatus('تم تبديل مخرج الصوت إلى الجهاز المحدد', 'info');
  };

  // Handle Input Device Change
  const handleInputChange = async (deviceId: string) => {
    setSelectedInput(deviceId);
    if (isMicActive) {
      // restart with new input
      await projectorAudioService.startMicPassthrough(
        selectedOutput,
        deviceId,
        (level) => setVuLevel(level)
      );
    }
  };

  // Test Chime
  const handleTestChime = async () => {
    const ok = await projectorAudioService.playTestSound(selectedOutput);
    if (ok) {
      showStatus('🔔 تم إرسال نغمة اختبار الصوت لشاشة العرض / السماعات بنجاح!', 'success');
    }
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const muted = projectorAudioService.toggleMute();
    setIsMuted(muted);
    showStatus(muted ? '🔇 تم كتم صوت المايك مؤقتاً' : '🔊 تم إلغاء كتم الصوت', 'info');
  };

  // Volume Change
  const handleVolumeChange = (newVal: number) => {
    setVolume(newVal);
    projectorAudioService.setVolume(newVal);
  };

  return (
    <div
      className={`border rounded-2xl transition-all ${
        isMicActive
          ? 'bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
      } p-3.5 sm:p-4 text-slate-800 dark:text-slate-200`}
      dir="rtl"
    >
      {/* Top Header & Main Toggle Button */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              isMicActive
                ? 'bg-emerald-600 text-white shadow-lg animate-pulse'
                : 'bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30'
            }`}
          >
            {isMicActive ? <Mic className="w-5 h-5 text-white" /> : <Tv className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                توجيه صوت المايك لشاشة العرض / البروجيكتور (HDMI & Wireless)
              </h3>
              {isMicActive && (
                <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-black rounded-full animate-bounce">
                  بث مباشر 🎙️
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              يحول صوت مايك اللابتوب مباشرة إلى سماعات الشاشة/البروجيكتور لعرض واضح بدون صدى
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Test Sound Button */}
          <button
            type="button"
            onClick={handleTestChime}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
            title="إرسال نغمة تجريبية للشاشة للتأكد من وصول الصوت"
          >
            <Bell className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">تجربة صوت الشاشة 🔔</span>
            <span className="sm:hidden">تجربة 🔔</span>
          </button>

          {/* Master Live Mic Toggle */}
          <button
            type="button"
            onClick={handleToggleMic}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-md ${
              isMicActive
                ? 'bg-rose-600 hover:bg-rose-700 text-white border border-rose-500 shadow-rose-600/30'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border border-emerald-500 shadow-emerald-600/30'
            }`}
          >
            {isMicActive ? (
              <>
                <MicOff className="w-4 h-4 text-white" />
                <span className="text-white font-black">إيقاف بث الصوت ⏹️</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 text-white" />
                <span className="text-white font-black">تشغيل وتوجيه المايك للشاشة 🎙️</span>
              </>
            )}
          </button>

          {/* Toggle Expand Settings */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-xl transition-all cursor-pointer"
            title={isExpanded ? 'طي إعدادات الصوت' : 'توسيع خيارات المخارج'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Realtime VU Level Indicator when Live */}
      {isMicActive && (
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
            مستوى صوت المايك:
          </span>
          <div className="flex-1 h-3.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 relative">
            <div
              className={`h-full rounded-full transition-all duration-75 ${
                vuLevel > 75
                  ? 'bg-rose-500'
                  : vuLevel > 40
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(4, vuLevel))}%` }}
            />
          </div>
          <span className="text-xs font-mono font-black text-slate-700 dark:text-slate-300 w-10 text-left">
            {vuLevel}%
          </span>

          {/* Mute Button */}
          <button
            type="button"
            onClick={handleToggleMute}
            className={`p-1.5 rounded-lg border text-xs font-bold transition-all ${
              isMuted
                ? 'bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300'
            }`}
            title={isMuted ? 'إلغاء الكتم' : 'كتم المايك'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-600" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
          </button>
        </div>
      )}

      {/* Expandable Advanced Sound Settings (Output/Input selectors, Gain) */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          
          {/* Output Device (HDMI / Screen / Projector / Bluetooth) */}
          <div className="sm:col-span-5 space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Tv className="w-3.5 h-3.5 text-indigo-500" />
              <span>مخرج الصوت المستهدف (شاشة العرض / البروجيكتور):</span>
            </label>
            <select
              value={selectedOutput}
              onChange={(e) => handleOutputChange(e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold rounded-xl px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            >
              <option value="default">🔊 شاشة العرض التلقائية / HDMI الافتراضي</option>
              {outputDevices.filter(d => d.deviceId !== 'default').map((d, idx) => (
                <option key={d.deviceId || idx} value={d.deviceId}>
                  📺 {d.label || `مخرج صوت خارجي (${idx + 1})`}
                </option>
              ))}
            </select>
          </div>

          {/* Input Device (Microphone) */}
          <div className="sm:col-span-4 space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Mic className="w-3.5 h-3.5 text-teal-500" />
              <span>ميكروفون المدرب (الإدخال):</span>
            </label>
            <select
              value={selectedInput}
              onChange={(e) => handleInputChange(e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold rounded-xl px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            >
              <option value="default">🎙️ ميكروفون اللابتوب / الافتراضي</option>
              {inputDevices.filter(d => d.deviceId !== 'default').map((d, idx) => (
                <option key={d.deviceId || idx} value={d.deviceId}>
                  🎙️ {d.label || `ميكروفون خارجي (${idx + 1})`}
                </option>
              ))}
            </select>
          </div>

          {/* Volume Gain Slider */}
          <div className="sm:col-span-3 space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-blue-500" />
                <span>قوة التضخيم:</span>
              </span>
              <span className="font-mono text-blue-600 dark:text-blue-400">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.0"
              step="0.05"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>
      )}

      {/* Live Toast Status Feedback */}
      {statusMsg && (
        <div
          className={`mt-2 p-2 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30'
              : statusMsg.type === 'error'
              ? 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30'
              : 'bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-500/30'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : statusMsg.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          ) : (
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}
    </div>
  );
};
