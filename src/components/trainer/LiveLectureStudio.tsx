import React, { useState, useRef, useEffect } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  Edit3,
  MessageSquare,
  Users,
  Copy,
  Check,
  Share2,
  PhoneOff,
  Radio,
  Sparkles,
  Maximize2,
  Trash2,
  PenTool,
  Eraser,
  Palette
} from 'lucide-react';
import { Group, Trainer } from '../../types';

interface LiveLectureStudioProps {
  trainer: Trainer;
  activeGroup: Group | null;
  groups: Group[];
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const LiveLectureStudio: React.FC<LiveLectureStudioProps> = ({
  trainer,
  activeGroup,
  groups,
  onShowToast
}) => {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(activeGroup || groups[0] || null);
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeTool, setActiveTool] = useState<'video' | 'whiteboard'>('video');

  // Whiteboard drawing state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawColor, setDrawColor] = useState('#f59e0b');
  const [brushSize, setBrushSize] = useState(3);
  const [isEraser, setIsEraser] = useState(false);

  // Live Chat
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string; isTrainer: boolean }>>([
    { sender: 'نظام المعمل الذكي', text: 'تم فتح قاعة البث المباشر لمعمل النجاح بنجاح. الطلاب جاهزون للانضمام.', time: 'الآن', isTrainer: false }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Media Stream
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const [copiedLink, setCopiedLink] = useState(false);

  const studentJoinLink = `${window.location.origin}/?view=public_student_portal&group=${selectedGroup?.id || 'live'}&joinLecture=true`;

  const startMediaStream = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: isVideoEnabled,
          audio: isAudioEnabled
        });
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }
    } catch (err: any) {
      console.warn('Media stream access limited:', err);
    }
  };

  const stopMediaStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleStartLive = async () => {
    setIsLiveActive(true);
    await startMediaStream();
    onShowToast('تم بدء بث المحاضرة المباشرة للمعمل بنجاح! 🔴', 'success');
  };

  const handleEndLive = () => {
    stopMediaStream();
    setIsLiveActive(false);
    setIsScreenSharing(false);
    onShowToast('تم إنهاء البث المباشر وحفظ جلسة المحاضرة.', 'info');
  };

  const handleToggleVideo = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !isVideoEnabled;
      });
    }
    setIsVideoEnabled(!isVideoEnabled);
  };

  const handleToggleAudio = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !isAudioEnabled;
      });
    }
    setIsAudioEnabled(!isAudioEnabled);
  };

  const handleToggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          if (screenVideoRef.current) {
            screenVideoRef.current.srcObject = screenStream;
          }
          setIsScreenSharing(true);
          onShowToast('تمت مشاركة شاشة المعمل بنجاح!', 'success');

          screenStream.getVideoTracks()[0].onended = () => {
            setIsScreenSharing(false);
          };
        }
      } catch (err) {
        console.warn('Screen share cancelled');
      }
    } else {
      setIsScreenSharing(false);
    }
  };

  const handleCopyJoinLink = () => {
    navigator.clipboard.writeText(studentJoinLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    onShowToast('تم نسخ رابط انضمام الطلاب لقاعة المحاضرة!', 'success');
  };

  const handleShareWhatsApp = () => {
    const text = `السلام عليكم، رابط انضمام محاضرة اليوم (${selectedGroup?.name || 'المجموعة'}) بمركز النجاح للتدريب والاستشارات: ${studentJoinLink}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setChatMessages(prev => [
      ...prev,
      {
        sender: trainer.name || 'المدرب',
        text: chatInput.trim(),
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        isTrainer: true
      }
    ]);
    setChatInput('');
  };

  // Canvas Whiteboard Event Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = isEraser ? '#0f172a' : drawColor;
    ctx.lineWidth = isEraser ? brushSize * 4 : brushSize;
    ctx.lineCap = 'round';
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearWhiteboard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onShowToast('تم مسح السبورة الذكية', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              قاعة البث المباشر والمحاضرات الرقمية (Live & Zoom Classroom)
              {isLiveActive && (
                <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-black animate-pulse">
                  LIVE ON AIR
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              بث حي عالي الجودة للطلاب مع مشاركة شاشة المعمل، سبورة ذكية للشرح، وغرفة دردشة تفاعلية
            </p>
          </div>
        </div>

        {/* Group Selector & Live Toggle */}
        <div className="flex items-center gap-3">
          <select
            value={selectedGroup?.id || ''}
            onChange={(e) => {
              const g = groups.find(grp => grp.id === e.target.value);
              setSelectedGroup(g || null);
            }}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name} ({g.grade || 'مجموعة'})</option>
            ))}
          </select>

          {!isLiveActive ? (
            <button
              onClick={handleStartLive}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-lg shadow-red-600/30 transition-all active:scale-95"
            >
              <Radio className="w-4 h-4" />
              <span>بدء البث الحي</span>
            </button>
          ) : (
            <button
              onClick={handleEndLive}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-red-500/40 text-red-400 font-bold text-xs transition-all"
            >
              <PhoneOff className="w-4 h-4" />
              <span>إنهاء البث</span>
            </button>
          )}
        </div>
      </div>

      {/* Shareable Student Link Box */}
      <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-300 truncate w-full sm:w-auto">
          <Share2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-bold text-white shrink-0">رابط انضمام الطلاب:</span>
          <span className="text-slate-400 font-mono text-[11px] truncate">{studentJoinLink}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopyJoinLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition-all"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'تم النسخ' : 'نسخ الرابط'}</span>
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm"
          >
            <span>إرسال واتساب 💬</span>
          </button>
        </div>
      </div>

      {/* Live Stage & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Stage (Video or Whiteboard) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden relative min-h-[420px] flex flex-col items-center justify-center">
            {/* Tool Switcher */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700">
              <button
                onClick={() => setActiveTool('video')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTool === 'video' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                كاميرا المعمل
              </button>
              <button
                onClick={() => setActiveTool('whiteboard')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTool === 'whiteboard' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                السبورة التفاعلية ✏️
              </button>
            </div>

            {/* Video Canvas */}
            {activeTool === 'video' ? (
              <div className="w-full h-full min-h-[420px] bg-slate-950 flex items-center justify-center relative">
                {isLiveActive && isVideoEnabled ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover rounded-3xl"
                  />
                ) : (
                  <div className="text-center space-y-3 p-8">
                    <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                      <VideoOff className="w-10 h-10" />
                    </div>
                    <div className="text-sm font-bold text-slate-300">
                      {isLiveActive ? 'الكاميرا مغلقة حالياً' : 'قاعة البث غير مفعلة الآن'}
                    </div>
                    <p className="text-xs text-slate-500 max-w-sm">
                      اضغط على &quot;بدء البث الحي&quot; بالأعلى لتشغيل كاميرا المعمل والتواصل المباشر مع الطلاب
                    </p>
                  </div>
                )}

                {/* Screen Sharing Picture-in-Picture */}
                {isScreenSharing && (
                  <div className="absolute bottom-4 left-4 w-48 h-32 rounded-2xl border-2 border-amber-500 bg-black overflow-hidden shadow-2xl">
                    <video ref={screenVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <span className="absolute top-1 right-1 text-[9px] bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded font-black">
                      شاشة المعمل
                    </span>
                  </div>
                )}
              </div>
            ) : (
              /* Whiteboard Canvas */
              <div className="w-full h-full min-h-[420px] bg-slate-950 flex flex-col justify-between p-4 relative">
                {/* Whiteboard Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900 p-2.5 rounded-2xl border border-slate-800 z-10">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEraser(false)}
                      className={`p-2 rounded-xl transition-all ${!isEraser ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}
                      title="قلم الشرح"
                    >
                      <PenTool className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setIsEraser(true)}
                      className={`p-2 rounded-xl transition-all ${isEraser ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}
                      title="ممحاة"
                    >
                      <Eraser className="w-4 h-4" />
                    </button>

                    {/* Colors */}
                    <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800">
                      {['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#ffffff'].map(c => (
                        <button
                          key={c}
                          onClick={() => { setDrawColor(c); setIsEraser(false); }}
                          style={{ backgroundColor: c }}
                          className={`w-5 h-5 rounded-full border-2 transition-transform ${drawColor === c && !isEraser ? 'scale-125 border-white' : 'border-transparent'}`}
                        />
                      ))}
                    </div>

                    {/* Thickness */}
                    <select
                      value={brushSize}
                      onChange={(e) => setBrushSize(Number(e.target.value))}
                      className="bg-slate-950 text-white text-xs border border-slate-800 rounded-xl px-2 py-1.5"
                    >
                      <option value={2}>خط رفيع</option>
                      <option value={4}>خط متوسط</option>
                      <option value={8}>خط عريض</option>
                    </select>
                  </div>

                  <button
                    onClick={clearWhiteboard}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs font-bold transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>مسح السبورة</span>
                  </button>
                </div>

                {/* Canvas */}
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={380}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="w-full h-80 bg-slate-950 rounded-2xl cursor-crosshair border border-slate-800 my-2"
                />
              </div>
            )}
          </div>

          {/* Bottom Stream Control Bar */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-center gap-3">
            <button
              onClick={handleToggleVideo}
              className={`p-3.5 rounded-2xl font-bold transition-all ${
                isVideoEnabled ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-red-500/20 text-red-400 border border-red-500/40'
              }`}
              title="تشغيل/إيقاف الكاميرا"
            >
              {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>

            <button
              onClick={handleToggleAudio}
              className={`p-3.5 rounded-2xl font-bold transition-all ${
                isAudioEnabled ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-red-500/20 text-red-400 border border-red-500/40'
              }`}
              title="تشغيل/إيقاف الميكروفون"
            >
              {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            <button
              onClick={handleToggleScreenShare}
              className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl font-bold text-xs transition-all ${
                isScreenSharing ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              <Monitor className="w-5 h-5" />
              <span>{isScreenSharing ? 'إيقاف مشاركة الشاشة' : 'مشاركة شاشة المعمل (Screen Share)'}</span>
            </button>
          </div>
        </div>

        {/* Live Chat Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between h-[520px]">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                دردشة القاعة التفاعلية
              </h3>
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                متصل
              </span>
            </div>

            {/* Chat List */}
            <div className="space-y-3 overflow-y-auto max-h-[360px] py-4 pr-1">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl text-xs space-y-1 ${
                    msg.isTrainer
                      ? 'bg-amber-500/10 border border-amber-500/20 mr-4'
                      : 'bg-slate-950 border border-slate-800 ml-4'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-bold ${msg.isTrainer ? 'text-amber-400' : 'text-slate-300'}`}>
                      {msg.sender}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{msg.time}</span>
                  </div>
                  <p className="text-slate-200">{msg.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="اكتب رسالة أو توجيه للطلاب..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md"
            >
              إرسال
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
