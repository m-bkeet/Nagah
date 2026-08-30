import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import { X, Sparkles, Code, MessageCircle, Send, Bot, CheckCircle2, ShieldCheck, Cpu, GraduationCap, Video, Mic, Camera, Globe, Share2, Square } from 'lucide-react';

interface AiAssistantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'manager' | 'developer' | 'social_bots' | 'trainer';
}

const VoiceInputButton: React.FC<{
  onTranscript: (text: string) => void;
  className?: string;
  label?: string;
}> = ({ onTranscript, className = '', label = 'تسجيل صوتي' }) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('متصفحك لا يدعم خاصية التعرف الصوتي المباشر. يمكنك استخدام الكيبورد أو تجربة متصفح Chrome/Edge.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ar-EG';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

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
        if (text.trim()) {
          onTranscript(text.trim());
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
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
      title={isListening ? 'جاري الاستماع... انقر للإيقاف' : 'إملاء صوتي بالمايك (تحويل الصوت لنص)'}
    >
      <Mic className={`w-3.5 h-3.5 ${isListening ? 'animate-bounce text-white' : 'text-amber-400'}`} />
      <span className="text-[11px] font-bold">{isListening ? '🎤 تحدث الآن...' : label}</span>
    </button>
  );
};

export const AiAssistantsModal: React.FC<AiAssistantsModalProps> = ({ isOpen, onClose, initialTab = 'manager' }) => {
  const [activeTab, setActiveTab] = useState<'manager' | 'developer' | 'social_bots' | 'trainer'>(initialTab);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Manager Assistant state
  const [managerPrompt, setManagerPrompt] = useState('');
  const [managerChat, setManagerChat] = useState<{ sender: 'user' | 'ai'; text: string }[]>([
    { sender: 'ai', text: 'أهلاً بك يا سيادة المدير! أنا مساعدك الشخصي الذكي. يمكنك طلبي بأي أمر في البرنامج (مثل إحصائيات الدورات، تحليل الخزينة، أداء المدربين) وسأقوم بتنفيذه أو الإجابة عليه فوراُ.' }
  ]);
  const [isManagerLoading, setIsManagerLoading] = useState(false);

  // Developer Agent state
  const [devPrompt, setDevPrompt] = useState('');
  const [devResult, setDevResult] = useState('');
  const [isDevLoading, setIsDevLoading] = useState(false);
  const [autoApplyOnGenerate, setAutoApplyOnGenerate] = useState(true);
  const [isAutoApplying, setIsAutoApplying] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');

  // Social & WhatsApp Bot Simulation state
  const [fbName, setFbName] = useState('أحمد محمد إبراهيم');
  const [fbPhone, setFbPhone] = useState('01098765432');
  const [fbMessage, setFbMessage] = useState('مهتم جداً بدورة البرمجة، ما هي التفاصيل وطريقة الحجز؟');
  const [fbResult, setFbResult] = useState<{ reply: string; traineeName?: string } | null>(null);
  const [isFbLoading, setIsFbLoading] = useState(false);

  const [waTraineeCode, setWaTraineeCode] = useState('A001');
  const [waHomework, setWaHomework] = useState('حل الواجب العملي الخاص بتصميم الواجهات وربط قواعد البيانات بنجاح.');
  const [waResult, setWaResult] = useState<{ grade: number; pointsAwarded: number; feedback: string } | null>(null);
  const [isWaLoading, setIsWaLoading] = useState(false);

  // Trainer Assistant State
  const [lectureTitle, setLectureTitle] = useState('محاضرة البرمجة المتقدمة وتطبيقات الويب');
  const [selectedGroup, setSelectedGroup] = useState('المجموعة الأولى - صباحي');
  const [summaryLang, setSummaryLang] = useState('ar');
  const [transcriptText, setTranscriptText] = useState('تم شرح الأطراف الخلفية APIs وقواعد البيانات وربط الواجهات وتأمين بيانات الجلسات بنجاح.');
  const [generatedSummary, setGeneratedSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Lecture Recording state
  const [isLectureRecording, setIsLectureRecording] = useState(false);
  const [lectureRecSeconds, setLectureRecSeconds] = useState(0);
  const recTimerRef = useRef<any>(null);

  // Webcam Snapshot state
  const [webcamActive, setWebcamActive] = useState(false);
  const [snapshotUrl, setSnapshotUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (isLectureRecording) {
      recTimerRef.current = setInterval(() => setLectureRecSeconds(s => s + 1), 1000);
    } else {
      if (recTimerRef.current) clearInterval(recTimerRef.current);
    }
    return () => {
      if (recTimerRef.current) clearInterval(recTimerRef.current);
    };
  }, [isLectureRecording]);

  const startWebcam = async () => {
    try {
      setWebcamActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      alert('تعذر تشغيل كاميرا اللابتوب. يجدر التأكد من صلاحيات المتصفح.');
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
      alert('تم التقاط صورة المحاضرة وتكريم النجوم بنجاح! جاهزة للنشر على فيسبوك وواتساب.');
    }
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
    } catch (err: any) {
      setManagerChat(prev => [...prev, { sender: 'ai', text: 'عذراً، حدث خطأ أثناء الاتصال بالمساعد الذكي.' }]);
    } finally {
      setIsManagerLoading(false);
    }
  };

  const handleRunDeveloper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!devPrompt.trim() || isDevLoading || isAutoApplying) return;
    setIsDevLoading(true);
    setDevResult('');
    setApplyMessage('');

    try {
      const res = await api.askDeveloperAgent(devPrompt.trim());
      setDevResult(res.result);

      if (autoApplyOnGenerate) {
        setIsAutoApplying(true);
        const applyRes = await api.applyDeveloperCode({
          prompt: devPrompt.trim(),
          code: res.result
        });
        setApplyMessage(applyRes.message || 'تم دمج وتطبيق التعديل البرمجي بنجاح على التطبيق!');
        setTimeout(() => {
          window.location.reload();
        }, 1600);
      }
    } catch (err: any) {
      setDevResult('فشل توليد الكود أو المقترح البرمجي');
    } finally {
      setIsDevLoading(false);
      setIsAutoApplying(false);
    }
  };

  const handleManualAutoApply = async () => {
    if (!devResult || isAutoApplying) return;
    setIsAutoApplying(true);
    try {
      const applyRes = await api.applyDeveloperCode({
        prompt: devPrompt.trim() || 'تحديث واجهة مخصص',
        code: devResult
      });
      setApplyMessage(applyRes.message || 'تم الدمج والتطبيق بنجاح!');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      alert('فشل تطبيق الكود البرمجي');
    } finally {
      setIsAutoApplying(false);
    }
  };

  const handleTestFbBot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFbLoading(true);
    setFbResult(null);
    try {
      const res = await api.simulateFacebookLead({
        senderName: fbName,
        phone: fbPhone,
        message: fbMessage
      });
      setFbResult({
        reply: res.reply,
        traineeName: res.trainee?.fullName
      });
    } catch (err: any) {
      setFbResult({ reply: err.message || 'فشل محاكاة بوت فيسبوك' });
    } finally {
      setIsFbLoading(false);
    }
  };

  const handleTestWaBot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsWaLoading(true);
    setWaResult(null);
    try {
      const searchRes = await api.search(waTraineeCode);
      const trainee = searchRes?.trainees?.[0];
      if (!trainee) {
        alert('لم يتم العثور على متدرب بهذا الكود في البرنامج');
        setIsWaLoading(false);
        return;
      }
      const res = await api.submitWhatsappHomework({
        traineeId: trainee.id,
        homeworkText: waHomework
      });
      setWaResult(res);
    } catch (err: any) {
      alert(err.message || 'فشل تصحيح الواجب عبر واتساب');
    } finally {
      setIsWaLoading(false);
    }
  };

  const handleSummarizeLecture = async () => {
    setIsSummarizing(true);
    try {
      const res = await api.summarizeLecture({
        lectureTitle,
        transcript: transcriptText,
        language: summaryLang
      });
      setGeneratedSummary(res.summary);
    } catch (err: any) {
      alert('فشل تلخيص المحاضرة');
    } finally {
      setIsSummarizing(false);
    }
  };

  const handlePublishToWhatsapp = async () => {
    try {
      const res = await api.publishSocial({
        groupName: selectedGroup,
        channel: 'whatsapp',
        content: generatedSummary || transcriptText,
        imageUrl: snapshotUrl || undefined
      });
      alert(res.message);
    } catch (err: any) {
      alert('فشل الإرسال لجروب الواتساب');
    }
  };

  const handlePublishToFacebook = async () => {
    try {
      const res = await api.publishSocial({
        groupName: selectedGroup,
        channel: 'facebook',
        content: generatedSummary || 'لوحة نجوم المحاضرة وتكريم المتدربين المتفوقين في مركز النجاح.',
        imageUrl: snapshotUrl || undefined
      });
      alert(res.message);
    } catch (err: any) {
      alert('فشل النشر على فيسبوك');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-14 pb-4 px-2 sm:px-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn no-print" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[82vh] flex flex-col overflow-hidden text-slate-100 mt-1" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold shadow">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-100">مركز الذكاء الاصطناعي والمساعد الذكي</h2>
              <p className="text-[11px] text-slate-400">إدارة الذكاء الاصطناعي، وتسجيل المحاضرات، وبوتات التواصل</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-3 gap-1 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('trainer')}
            className={`flex items-center gap-1.5 py-2 px-3 font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'trainer'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>مساعد المدرب</span>
          </button>
          <button
            onClick={() => setActiveTab('manager')}
            className={`flex items-center gap-1.5 py-2 px-3 font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'manager'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>مساعد المدير</span>
          </button>
          <button
            onClick={() => setActiveTab('developer')}
            className={`flex items-center gap-1.5 py-2 px-3 font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'developer'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>زر المطور</span>
          </button>
          <button
            onClick={() => setActiveTab('social_bots')}
            className={`flex items-center gap-1.5 py-2 px-3 font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'social_bots'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>ربط التواصل</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-950/30">
          
          {/* TAB 0: Trainer Assistant */}
          {activeTab === 'trainer' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-amber-950/60 to-slate-900 border border-amber-500/30 p-4 rounded-3xl flex items-center justify-between shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
                    🎓
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-amber-300">مساعد المدرب الذكي (Lecture & Star Publisher)</h3>
                    <p className="text-xs text-slate-300">تسجيل المحاضرة، تلخيصها بأي لغة، نشر لوحة النجوم، والتصوير بالكاميرا بعد انتهاء المحاضرة للواتس وفيسبوك</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left Col: Recording & Multilingual Summary */}
                <div className="space-y-4 bg-slate-900/90 border border-slate-800 p-5 rounded-3xl shadow-xl">
                  <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                    <Mic className="w-4 h-4 text-amber-400" />
                    <span>تسجيل المحاضرة والتلخيص الفوري</span>
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-300">عنوان المحاضرة</label>
                        <VoiceInputButton
                          onTranscript={(text) => setLectureTitle(text)}
                          label="تسجيل صوتي"
                        />
                      </div>
                      <input
                        type="text"
                        value={lectureTitle}
                        onChange={(e) => setLectureTitle(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">المجموعة المستهدفة</label>
                        <select
                          value={selectedGroup}
                          onChange={(e) => setSelectedGroup(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                        >
                          <option value="المجموعة الأولى - صباحي">المجموعة الأولى - صباحي</option>
                          <option value="المجموعة الثانية - مسائي">المجموعة الثانية - مسائي</option>
                          <option value="مجموعة البرمجة المتقدمة">مجموعة البرمجة المتقدمة</option>
                        </select>
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
                    </div>

                    {/* Recording Action Bar */}
                    <div className="flex items-center justify-between bg-slate-950 p-3 rounded-2xl border border-slate-800">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsLectureRecording(!isLectureRecording)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                            isLectureRecording
                              ? 'bg-rose-600 text-white animate-pulse'
                              : 'bg-amber-500 text-slate-950 font-black'
                          }`}
                        >
                          {isLectureRecording ? <Square className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
                          <span>{isLectureRecording ? `إيقاف التسجيل (${lectureRecSeconds}ث)` : 'بدء تسجيل المحاضرة'}</span>
                        </button>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {isLectureRecording ? '🔴 جاري التسجيل الحي...' : 'جاهز للتسجيل'}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-300">محتوى أو تفريغ المحاضرة (Transcript)</label>
                        <VoiceInputButton
                          onTranscript={(text) => setTranscriptText(prev => prev ? `${prev} ${text}` : text)}
                          label="إملاء الشرح صوتاً"
                        />
                      </div>
                      <textarea
                        rows={3}
                        value={transcriptText}
                        onChange={(e) => setTranscriptText(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                        placeholder="أدخل ملاحظات المحاضرة أو تفريغ الصوت..."
                      />
                    </div>

                    <button
                      onClick={handleSummarizeLecture}
                      disabled={isSummarizing}
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{isSummarizing ? 'جاري توليد الملخص الذكي...' : '✨ توليد الملخص الذكي بالمجموعة واللغة المحددة'}</span>
                    </button>

                    {generatedSummary && (
                      <div className="bg-slate-950 p-3 rounded-xl border border-amber-500/30 space-y-2 animate-fadeIn">
                        <span className="text-[11px] font-bold text-amber-400">الملخص المولد للمحاضرة:</span>
                        <div className="text-xs text-slate-200 whitespace-pre-wrap font-mono leading-relaxed bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                          {generatedSummary}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Col: Laptop Webcam Snapshot & WhatsApp/Facebook Sharing */}
                <div className="space-y-4 bg-slate-900/90 border border-slate-800 p-5 rounded-3xl shadow-xl">
                  <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-emerald-400" />
                    <span>صورة كاميرا اللابتوب بعد انتهاء المحاضرة للنجوم</span>
                  </h4>

                  <div className="space-y-3">
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex flex-col items-center justify-center min-h-[180px] relative overflow-hidden">
                      {webcamActive ? (
                        <video ref={videoRef} className="w-full h-40 object-cover rounded-xl border border-emerald-500/40" />
                      ) : snapshotUrl ? (
                        <img src={snapshotUrl} alt="Snapshot" className="w-full h-40 object-cover rounded-xl border border-amber-500/40" />
                      ) : (
                        <div className="text-center py-6 text-slate-400 text-xs">
                          <Camera className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                          <p>انقر أدناه لتشغيل الكاميرا والتقاط صورة جماعية أو للنجوم المتفوقين</p>
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
                          <span>تشغيل كاميرا اللابتوب</span>
                        </button>
                      ) : (
                        <button
                          onClick={takeSnapshot}
                          className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow flex items-center justify-center gap-2"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>📸 التقاط الصورة الآن</span>
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
                    </div>

                    {/* Sharing to WhatsApp Groups & Facebook */}
                    <div className="pt-3 border-t border-slate-800 space-y-2.5">
                      <span className="block text-xs font-bold text-slate-300">مشاركة النجوم والملخص عبر القنوات:</span>
                      
                      <button
                        onClick={handlePublishToWhatsapp}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>📤 إرسال الملخص ورابط النجوم لجروب واتساب ({selectedGroup})</span>
                      </button>

                      <button
                        onClick={handlePublishToFacebook}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>📘 نشر لوحة النجوم وصورة المحاضرة على صفحة فيسبوك</span>
                      </button>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 1: Manager Assistant */}
          {activeTab === 'manager' && (
            <div className="h-full flex flex-col space-y-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow">
                <div className="flex items-center gap-3">
                  <Cpu className="w-6 h-6 text-amber-400" />
                  <div>
                    <h3 className="font-bold text-sm text-slate-100">اسأل مساعد المدير أي شيء عن المركز</h3>
                    <p className="text-xs text-slate-400">مثال: "ما هي إيرادات الخزينة اليوم؟" أو "اقترح علي خطة تسويقية للدورات الجديدة"</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col space-y-3 overflow-y-auto max-h-[420px]">
                {managerChat.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
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
                      المساعد الذكي يكتب الرد... 💡
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleSendManager} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={managerPrompt}
                  onChange={(e) => setManagerPrompt(e.target.value)}
                  placeholder="اكتب طلبك أو استخدم زر الإملاء الصوتي لمدير النظام..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
                <VoiceInputButton
                  onTranscript={(text) => setManagerPrompt(prev => prev ? `${prev} ${text}` : text)}
                  label="تحدث صوتاً"
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

          {/* TAB 2: Developer Agent (Google AI Studio) */}
          {activeTab === 'developer' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/30 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-indigo-400" />
                  <div>
                    <h3 className="font-bold text-sm text-indigo-200">زر المطور الذكي (بنفس إمكانيات Google AI Studio)</h3>
                    <p className="text-xs text-indigo-300/80">اطلب أي تحديث، تصميم جديد، أو إضافة برمجية في البرنامج وسيقوم بتوليد الكود والتنفيذ الفوري.</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleRunDeveloper} className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-300">ماذا تريد أن أطور أو أعدل في البرنامج؟</label>
                    <VoiceInputButton
                      onTranscript={(text) => setDevPrompt(prev => prev ? `${prev} ${text}` : text)}
                      label="إملاء التعديل صوتاً"
                    />
                  </div>
                  <textarea
                    rows={3}
                    value={devPrompt}
                    onChange={(e) => setDevPrompt(e.target.value)}
                    placeholder="مثال: أضف تقرير رسومي جديد للمصروفات الشهرية، أو عدل تصميم بطاقة المتدرب..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <label className="flex items-center gap-2 text-xs text-indigo-300 font-bold cursor-pointer bg-indigo-950/40 p-2 px-3 rounded-xl border border-indigo-500/20">
                    <input
                      type="checkbox"
                      checked={autoApplyOnGenerate}
                      onChange={(e) => setAutoApplyOnGenerate(e.target.checked)}
                      className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                    />
                    <span>⚡ دمج وتطبيق الكود تلقائياً في النظام وتحديث الشاشة فور التوليد</span>
                  </label>
                  <button
                    type="submit"
                    disabled={isDevLoading || isAutoApplying}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 disabled:opacity-50"
                  >
                    <Code className="w-4 h-4" />
                    <span>{isDevLoading ? 'جاري توليد الكود والتنفيذ التلقائي...' : '⚡ تنفيذ التعديل وتوليد الكود'}</span>
                  </button>
                </div>
              </form>

              {applyMessage && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-2xl flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>{applyMessage}</span>
                </div>
              )}

              {devResult && (
                <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl p-4 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-indigo-400">نتيجة التحليل والكود المقترح من المطور الذكي:</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleManualAutoApply}
                        disabled={isAutoApplying}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-bold shadow flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>⚡ دمج وتطبيق آلي فوراً في النظام</span>
                      </button>
                      <button
                        onClick={() => navigator.clipboard.writeText(devResult)}
                        className="px-2.5 py-1.5 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 rounded-xl text-[10px] font-bold border border-indigo-800"
                      >
                        نسخ الكود
                      </button>
                    </div>
                  </div>
                  <pre className="bg-slate-950 p-3 rounded-xl text-[11px] text-slate-200 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {devResult}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Social & WhatsApp Bots */}
          {activeTab === 'social_bots' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Facebook Messenger Auto-Register */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                  <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
                    📘
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-100">بوت فيسبوك مسنجر والرد الآلي</h3>
                    <p className="text-xs text-slate-400">الرد على المهتمين وتسجيل أسمائهم كمتدربين تلقائياً</p>
                  </div>
                </div>

                <form onSubmit={handleTestFbBot} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">اسم العميل (المتقدم)</label>
                    <input
                      type="text"
                      value={fbName}
                      onChange={(e) => setFbName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">رقم الموبايل</label>
                    <input
                      type="text"
                      value={fbPhone}
                      onChange={(e) => setFbPhone(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-300">رسالة العميل على الصفحة</label>
                      <VoiceInputButton
                        onTranscript={(text) => setFbMessage(text)}
                        label="تسجيل بصوتك"
                      />
                    </div>
                    <input
                      type="text"
                      value={fbMessage}
                      onChange={(e) => setFbMessage(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isFbLoading}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                  >
                    <span>{isFbLoading ? 'جاري المحاكاة والتسجيل...' : '🚀 تجربة استقبال رسالة فيسبوك وتسجيل المتدرب'}</span>
                  </button>
                </form>

                {fbResult && (
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-blue-500/30 space-y-2 animate-fadeIn">
                    <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>تم بنجاح! تم تسجيل المتدرب في قاعدة البيانات</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <strong>رد البوت على العميل:</strong> {fbResult.reply}
                    </p>
                  </div>
                )}
              </div>

              {/* WhatsApp Homework Grading Bot */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                    💚
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-100">بوت واتساب لتصحيح الواجبات</h3>
                    <p className="text-xs text-slate-400">استلام واجبات الطلاب، تصحيحها، ومنحهم درجات ونقاط</p>
                  </div>
                </div>

                <form onSubmit={handleTestWaBot} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">كود المتدرب (مثل A001)</label>
                    <input
                      type="text"
                      value={waTraineeCode}
                      onChange={(e) => setWaTraineeCode(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-300">نص الواجب المرسل عبر واتساب</label>
                      <VoiceInputButton
                        onTranscript={(text) => setWaHomework(prev => prev ? `${prev} ${text}` : text)}
                        label="إملاء الواجب صوتاً"
                      />
                    </div>
                    <textarea
                      rows={3}
                      value={waHomework}
                      onChange={(e) => setWaHomework(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isWaLoading}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                  >
                    <span>{isWaLoading ? 'جاري التصحيح وإضافة النقاط...' : '✨ استلام وتصحيح الواجب وإضافة النقاط'}</span>
                  </button>
                </form>

                {waResult && (
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-emerald-500/30 space-y-2 animate-fadeIn">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                      <span>الدرجة: {waResult.grade}%</span>
                      <span>+ {waResult.pointsAwarded} نقطة تميز 🌟</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      {waResult.feedback}
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer Close Button */}
        <div className="px-6 py-3.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">مركز الذكاء الاصطناعي وبوتات التواصل الآلي</span>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-xl border border-slate-700 transition-all shadow"
          >
            إغلاق النافذة ✕
          </button>
        </div>

      </div>
    </div>
  );
};
