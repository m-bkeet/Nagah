import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import { X, Sparkles, MessageCircle, Send, Bot, CheckCircle2, Cpu, GraduationCap, Mic, Camera, Share2, Copy } from 'lucide-react';
import { AllInOneLessonPlanModal } from './trainer/AllInOneLessonPlanModal';

interface AiAssistantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'manager' | 'developer' | 'social_bots' | 'trainer' | 'master_lesson';
}

const VoiceInputButton: React.FC<{
  onTranscript: (text: string) => void;
  onError?: (msg: string) => void;
  className?: string;
  label?: string;
}> = ({ onTranscript, onError, className = '', label = 'تسجيل صوتي' }) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      onError?.('متصفحك لا يدعم الإملاء الصوتي المباشر. يمكنك الكتابة أو استخدام Chrome / Edge.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ar-EG';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        let text = '';
        if (event && event.results) {
          for (let i = event.resultIndex || 0; i < event.results.length; i++) {
            const resItem = event.results[i];
            if (resItem?.[0]?.transcript) {
              text += resItem[0].transcript || '';
            }
          }
        }
        if (text.trim()) onTranscript(text.trim());
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`px-3 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 font-bold text-xs ${
        isListening
          ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-600/30'
          : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 hover:border-amber-500/50'
      } ${className}`}
      title={isListening ? 'جاري الاستماع... انقر للإيقاف' : 'إملاء صوتي بالمايك'}
    >
      <Mic className={`w-3.5 h-3.5 ${isListening ? 'animate-bounce text-white' : 'text-amber-400'}`} />
      <span className="text-[11px] font-bold">{isListening ? '🎤 تحدث الآن...' : label}</span>
    </button>
  );
};

export const AiAssistantsModal: React.FC<AiAssistantsModalProps> = ({ isOpen, onClose, initialTab = 'manager' }) => {
  const normalizedInitial: 'manager' | 'trainer' = initialTab === 'trainer' ? 'trainer' : 'manager';
  const [activeTab, setActiveTab] = useState<'manager' | 'trainer'>(normalizedInitial);
  const [isMasterLessonOpen, setIsMasterLessonOpen] = useState(initialTab === 'master_lesson');
  const [statusNotice, setStatusNotice] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showNotice = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setStatusNotice({ text, type });
    setTimeout(() => setStatusNotice(null), 3500);
  };

  useEffect(() => {
    if (isOpen) {
      if (initialTab === 'master_lesson') {
        setIsMasterLessonOpen(true);
      } else {
        setActiveTab(initialTab === 'trainer' ? 'trainer' : 'manager');
      }
    }
  }, [isOpen, initialTab]);

  // Manager Assistant state (Real Gemini AI)
  const [managerPrompt, setManagerPrompt] = useState('');
  const [managerChat, setManagerChat] = useState<{ sender: 'user' | 'ai'; text: string }[]>([
    { sender: 'ai', text: 'أهلاً بك يا سيادة المدير! أنا مساعدك الذكي المتصل ببيانات المركز الحقيقية. اسألني عن إحصائيات الطلاب، الخزينة، أو خطط التطوير وسأجيبك فوراً.' }
  ]);
  const [isManagerLoading, setIsManagerLoading] = useState(false);

  // Trainer Assistant state (Real Gemini Lecture Summarizer + Real Webcam Snapshot + Real Share)
  const [lectureTitle, setLectureTitle] = useState('ملخص حصة اليوم');
  const [summaryLang, setSummaryLang] = useState('ar');
  const [transcriptText, setTranscriptText] = useState('');
  const [generatedSummary, setGeneratedSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Webcam Snapshot state
  const [webcamActive, setWebcamActive] = useState(false);
  const [snapshotUrl, setSnapshotUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const startWebcam = async () => {
    try {
      setWebcamActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch {
      showNotice('تعذر تشغيل كاميرا اللابتوب. يرجى التأكد من صلاحيات المتصفح.', 'error');
      setWebcamActive(false);
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setWebcamActive(false);
  };

  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      setSnapshotUrl(dataUrl);
      stopWebcam();
      showNotice('📸 تم التقاط الصورة بنجاح! يمكنك تحميلها ومشاركتها مع أولياء الأمور.', 'success');
    }
  };

  const downloadSnapshot = () => {
    if (!snapshotUrl) return;
    const a = document.createElement('a');
    a.href = snapshotUrl;
    a.download = `lecture-stars-${Date.now()}.png`;
    a.click();
  };

  if (!isOpen) return null;

  const handleSendManager = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managerPrompt.trim() || isManagerLoading) return;
    const q = managerPrompt.trim();
    setManagerPrompt('');
    setManagerChat(prev => [...prev, { sender: 'user', text: q }]);
    setIsManagerLoading(true);
    try {
      const res = await api.askManagerAssistant(q);
      setManagerChat(prev => [...prev, { sender: 'ai', text: res.reply }]);
    } catch {
      setManagerChat(prev => [...prev, { sender: 'ai', text: 'عذراً، تعذر الاتصال بالمساعد الذكي حالياً.' }]);
    } finally {
      setIsManagerLoading(false);
    }
  };

  const handleSummarizeLecture = async () => {
    if (!transcriptText.trim()) {
      showNotice('يرجى كتابة أو إملاء ملاحظات الحصة أولاً لتوليد الملخص.', 'error');
      return;
    }
    setIsSummarizing(true);
    try {
      const res = await api.summarizeLecture({
        lectureTitle,
        transcript: transcriptText,
        language: summaryLang
      });
      setGeneratedSummary(res.summary);
      showNotice('✨ تم توليد ملخص الحصة بنجاح!', 'success');
    } catch {
      showNotice('تعذر توليد الملخص حالياً، يرجى المحاولة مجدداً.', 'error');
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleShareWhatsapp = () => {
    const content = (generatedSummary || transcriptText || lectureTitle).trim();
    if (!content) {
      showNotice('لا يوجد محتوى لمشاركته عبر واتساب بعد.', 'error');
      return;
    }
    const url = `https://wa.me/?text=${encodeURIComponent(`📘 ${lectureTitle}\n\n${content}`)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopySummary = async () => {
    const content = (generatedSummary || transcriptText || lectureTitle).trim();
    if (!content) return;
    try {
      await navigator.clipboard.writeText(`📘 ${lectureTitle}\n\n${content}`);
      showNotice('📋 تم نسخ الملخص إلى الحافظة — جاهز للصق في فيسبوك أو واتساب!', 'success');
    } catch {
      showNotice('تعذر النسخ التلقائي، يرجى تحديد النص ونسخه يدوياً.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-14 pb-4 px-2 sm:px-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn no-print" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[82vh] flex flex-col overflow-hidden text-slate-100 mt-1" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold shadow">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-100">مركز المساعد الذكي للمدرب والإدارة</h2>
              <p className="text-[11px] text-slate-400">تلخيص الحصص، تحليل بيانات المركز، وتجهيز حزم الدروس التفاعلية</p>
            </div>
          </div>
          <button
            onClick={() => { stopWebcam(); onClose(); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Inline Status Notice (Replaces browser alert()) */}
        {statusNotice && (
          <div className={`mx-4 mt-3 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border ${
            statusNotice.type === 'success'
              ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
              : statusNotice.type === 'error'
              ? 'bg-rose-950/70 border-rose-500/40 text-rose-300'
              : 'bg-sky-950/70 border-sky-500/40 text-sky-300'
          }`}>
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusNotice.text}</span>
          </div>
        )}

        {/* Tabs Bar (Real Features Only) */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-3 gap-1 overflow-x-auto text-xs mt-1">
          <button
            onClick={() => setActiveTab('trainer')}
            className={`flex items-center gap-1.5 py-2.5 px-3 font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'trainer'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>مساعد المدرب وتلخيص الحصص</span>
          </button>
          <button
            onClick={() => setIsMasterLessonOpen(true)}
            className="flex items-center gap-1.5 py-2.5 px-3 font-bold border-b-2 transition-all whitespace-nowrap border-purple-500 text-purple-300 bg-purple-500/15 hover:bg-purple-500/25"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>حزمة الدرس المتكاملة (AI) 🪄</span>
          </button>
          <button
            onClick={() => setActiveTab('manager')}
            className={`flex items-center gap-1.5 py-2.5 px-3 font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'manager'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>مساعد المدير الذكي</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-950/30">
          {activeTab === 'trainer' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Left Col: Multilingual Lecture Summarizer */}
              <div className="space-y-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg">
                <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <Mic className="w-4 h-4 text-amber-400" />
                  <span>تلخيص المحاضرة بالذكاء الاصطناعي</span>
                </h4>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-300">عنوان الحصة</label>
                      <VoiceInputButton
                        onTranscript={(text) => setLectureTitle(text)}
                        onError={(msg) => showNotice(msg, 'error')}
                        label="إملاء"
                      />
                    </div>
                    <input
                      type="text"
                      value={lectureTitle}
                      onChange={(e) => setLectureTitle(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">لغة الملخص المطلوبة</label>
                    <select
                      value={summaryLang}
                      onChange={(e) => setSummaryLang(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    >
                      <option value="ar">العربية (Arabic)</option>
                      <option value="en">الإنجليزية (English)</option>
                      <option value="fr">الفرنسية (French)</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-300">نقاط ومحتوى الحصة</label>
                      <VoiceInputButton
                        onTranscript={(text) => setTranscriptText(prev => prev ? `${prev} ${text}` : text)}
                        onError={(msg) => showNotice(msg, 'error')}
                        label="إملاء الشرح"
                      />
                    </div>
                    <textarea
                      rows={4}
                      value={transcriptText}
                      onChange={(e) => setTranscriptText(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                      placeholder="اكتب أو أملِ أهم نقاط الدرس والواجب المطلوب..."
                    />
                  </div>

                  <button
                    onClick={handleSummarizeLecture}
                    disabled={isSummarizing}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isSummarizing ? 'جاري توليد الملخص...' : '✨ توليد الملخص الذكي'}</span>
                  </button>

                  {generatedSummary && (
                    <div className="bg-slate-950 p-3 rounded-xl border border-amber-500/30 space-y-2">
                      <span className="text-[11px] font-bold text-amber-400">الملخص الجاهز للمشاركة:</span>
                      <div className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed bg-slate-900 p-2.5 rounded-lg border border-slate-800 max-h-40 overflow-y-auto">
                        {generatedSummary}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Col: Laptop Camera Snapshot & Real WhatsApp/Clipboard Sharing */}
              <div className="space-y-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg">
                <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-400" />
                  <span>صورة تكريم النجوم والمشاركة المباشرة</span>
                </h4>

                <div className="space-y-3">
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex flex-col items-center justify-center min-h-[170px] relative overflow-hidden">
                    {webcamActive ? (
                      <video ref={videoRef} className="w-full h-40 object-cover rounded-xl border border-emerald-500/40" />
                    ) : snapshotUrl ? (
                      <img src={snapshotUrl} alt="صورة الحصة" className="w-full h-40 object-cover rounded-xl border border-amber-500/40" />
                    ) : (
                      <div className="text-center py-6 text-slate-400 text-xs">
                        <Camera className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                        <p>التقط صورة تذكارية لنجوم الحصة لتحميلها ومشاركتها</p>
                      </div>
                    )}
                    <canvas ref={canvasRef} className="hidden" />
                  </div>

                  <div className="flex gap-2">
                    {!webcamActive ? (
                      <button
                        onClick={startWebcam}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-2"
                      >
                        <Camera className="w-4 h-4" />
                        <span>تشغيل الكاميرا</span>
                      </button>
                    ) : (
                      <button
                        onClick={takeSnapshot}
                        className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>📸 التقاط الصورة</span>
                      </button>
                    )}
                    {webcamActive && (
                      <button
                        onClick={stopWebcam}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
                      >
                        إيقاف
                      </button>
                    )}
                    {snapshotUrl && !webcamActive && (
                      <button
                        onClick={downloadSnapshot}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl"
                      >
                        تنزيل الصورة
                      </button>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <button
                      onClick={handleShareWhatsapp}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>📲 فتح واتساب ومشاركة الملخص مباشرة</span>
                    </button>

                    <button
                      onClick={handleCopySummary}
                      className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-2"
                    >
                      <Copy className="w-4 h-4 text-amber-400" />
                      <span>📋 نسخ الملخص للنشر على فيسبوك أو الجروب</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'manager' && (
            <div className="h-full flex flex-col space-y-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3 shadow">
                <Cpu className="w-6 h-6 text-amber-400 shrink-0" />
                <div>
                  <h3 className="font-bold text-sm text-slate-100">اسأل مساعد المدير عن بيانات المركز</h3>
                  <p className="text-xs text-slate-400">مثال: "ما هي إيرادات الخزينة اليوم؟" أو "اقترح خطة لتنشيط الحضور هذا الأسبوع"</p>
                </div>
              </div>

              <div className="flex-1 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col space-y-3 overflow-y-auto max-h-[380px]">
                {managerChat.map((msg, index) => (
                  <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                        msg.sender === 'user'
                          ? 'bg-amber-500 text-slate-950 font-medium rounded-bl-none shadow-lg shadow-amber-500/10'
                          : 'bg-slate-800 text-slate-200 border border-slate-700/60 rounded-br-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isManagerLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-800 text-slate-400 p-3 rounded-2xl text-xs animate-pulse">
                      المساعد الذكي يجهز الإجابة... 💡
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleSendManager} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={managerPrompt}
                  onChange={(e) => setManagerPrompt(e.target.value)}
                  placeholder="اكتب سؤالك أو استخدم الإملاء الصوتي..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
                <VoiceInputButton
                  onTranscript={(text) => setManagerPrompt(prev => prev ? `${prev} ${text}` : text)}
                  onError={(msg) => showNotice(msg, 'error')}
                  label="صوت"
                />
                <button
                  type="submit"
                  disabled={isManagerLoading}
                  className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-amber-500/20 flex items-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>إرسال</span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5 text-amber-400" />
            <span>أدوات ذكاء اصطناعي حقيقية متصلة بالمنصة</span>
          </span>
          <button
            onClick={() => { stopWebcam(); onClose(); }}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-xl border border-slate-700 transition-all"
          >
            إغلاق ✕
          </button>
        </div>
      </div>

      {isMasterLessonOpen && (
        <AllInOneLessonPlanModal
          isOpen={isMasterLessonOpen}
          onClose={() => setIsMasterLessonOpen(false)}
        />
      )}
    </div>
  );
};
