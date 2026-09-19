import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Mic,
  MicOff,
  Square,
  Play,
  Pause,
  RotateCcw,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Award,
  BookOpen,
  Volume2,
  X,
  Send,
  Radio,
  FileAudio,
  Info,
  Check,
  Zap,
  HelpCircle,
  Clock
} from 'lucide-react';
import { audioService } from '../../services/audioService';
import { detectCurriculum, getVoiceSummaryTopicsForGrade, getGradeLessonsList } from '../../domain/curriculumRegistry';

interface VoiceSummaryRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: {
    id: string;
    fullName: string;
    code?: string;
    courseName?: string;
    grade?: string;
    stage?: string;
  };
  initialTopic?: string;
  onSubmitted?: (submission: any) => void;
  onShowToast?: (msg: string) => void;
}

export const VoiceSummaryRecorderModal: React.FC<VoiceSummaryRecorderModalProps> = ({
  isOpen,
  onClose,
  student,
  initialTopic = '',
  onSubmitted,
  onShowToast
}) => {
  // Mode: Record live mic vs Upload audio file
  const [activeMode, setActiveMode] = useState<'record' | 'upload'>('record');
  const [topicTitle, setTopicTitle] = useState(initialTopic || 'ملخص المحاضرة والمفاهيم العلمية');
  const [studentNotes, setStudentNotes] = useState('');
  
  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [liveTranscription, setLiveTranscription] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Submitting / AI Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Dynamic Grade & Curriculum detection
  const studentCurriculum = useMemo(() => {
    return detectCurriculum(student);
  }, [student]);

  const detectedGrade = student.grade || student.stage || studentCurriculum.gradeNameAr;
  const courseName = student.courseName || studentCurriculum.subjectNameAr;

  // Grade-Specific Quick Curriculum Topics for Voice Summaries
  const curriculumTopics = useMemo(() => {
    return getVoiceSummaryTopicsForGrade(studentCurriculum);
  }, [studentCurriculum]);

  useEffect(() => {
    if (initialTopic) {
      setTopicTitle(initialTopic);
    }
  }, [initialTopic]);

  // Handle Recording Timer
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 300) { // Max 5 minutes
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, isPaused]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  if (!isOpen) return null;

  const startRecording = async () => {
    try {
      setErrorMsg(null);
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus', 'audio/wav'];
      let supportedType = mimeTypes.find(t => MediaRecorder.isTypeSupported(t)) || '';
      
      const recorder = supportedType ? new MediaRecorder(stream, { mimeType: supportedType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const finalBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        setAudioBlob(finalBlob);
        const url = URL.createObjectURL(finalBlob);
        setAudioUrl(url);

        // Convert to Base64
        const reader = new FileReader();
        reader.readAsDataURL(finalBlob);
        reader.onloadend = () => {
          setAudioBase64(reader.result as string);
        };

        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start(250);
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);

      // Start Web Speech Recognition if supported
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const rec = new SpeechRecognition();
          rec.continuous = true;
          rec.interimResults = true;
          rec.lang = 'ar-EG';
          rec.onresult = (event: any) => {
            let transcript = '';
            for (let i = 0; i < event.results.length; i++) {
              transcript += event.results[i][0].transcript + ' ';
            }
            if (transcript.trim()) {
              setLiveTranscription(transcript.trim());
            }
          };
          rec.onerror = () => {};
          rec.start();
          recognitionRef.current = rec;
        } catch (e) {
          console.log('SpeechRecognition notice:', e);
        }
      }
    } catch (err: any) {
      console.error('Error accessing microphone:', err);
      setErrorMsg('تعذر الوصول إلى الميكروفون. يرجى التأكد من منح الإذن للمتصفح أو رفع ملف صوتي مسجل مسبقاً.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsRecording(false);
    setIsPaused(false);
  };

  const resetRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setAudioBase64(null);
    setRecordingTime(0);
    setIsRecording(false);
    setIsPaused(false);
    setLiveTranscription('');
    setEvaluationResult(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setAudioBlob(file);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setAudioBase64(reader.result as string);
    };
  };

  const togglePlayAudio = () => {
    if (!audioElementRef.current) return;
    if (isPlayingAudio) {
      audioElementRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioElementRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEvaluateAndSubmit = async () => {
    if (!audioBase64 && !liveTranscription && !studentNotes) {
      setErrorMsg('يرجى تسجيل الصوت أولاً أو كتابة ملاحظاتك لإجراء التقييم المفاهيمي.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      const payload = {
        traineeId: student.id,
        taskTitle: topicTitle || 'ملخص فويس للمحاضرة والمفاهيم',
        mediaType: 'audio',
        mediaBase64: audioBase64 || undefined,
        audioBase64: audioBase64 || undefined,
        audioDurationSeconds: recordingTime || 45,
        transcribedText: liveTranscription || undefined,
        studentNotes: studentNotes || undefined,
        studentGrade: detectedGrade,
        courseName: courseName
      };

      const res = await fetch('/api/student/submit-homework', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'فشل تقييم التسجيل الصوتي');
      }

      setEvaluationResult(data.submission);
      
      // Play celebratory chime
      try {
        audioService.playCelebrationCheer();
      } catch (e) {}

      if (onSubmitted) {
        onSubmitted(data.submission);
      }

      if (onShowToast) {
        onShowToast('🎙️ تم فحص التسجيل الصوتي وتقييم تناسق المفاهيم وإضافة النقاط بنجاح!');
      }
    } catch (err: any) {
      console.error('Error submitting voice evaluation:', err);
      setErrorMsg(err.message || 'حدث خطأ أثناء تقييم التسجيل الصوتي');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in" dir="rtl">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col my-auto">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-900 dark:text-slate-100 text-base">
                  مختبر التقييم الصوتي المفاهيمي الذكي 🎙️
                </h3>
                <span className="text-[10px] bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold px-2 py-0.5 rounded-lg border border-amber-500/30">
                  تصحيح تناسق المفاهيم
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                تسجيل ملخص للمحاضرة أو الكتاب وتصحيح المحتوى وفق منهج <span className="font-bold text-amber-600 dark:text-amber-400">{detectedGrade}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-5 flex-1">
          
          {/* Pedagogical Note / Clarification */}
          <div className="p-3.5 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-blue-900 dark:text-blue-200">
                🎯 كيف يقيمك الذكاء الاصطناعي؟
              </p>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                لا نقوم بمحاسبتك على زلات اللسان أو مخارج الحروف، بل نركز تماماً على <strong className="text-blue-700 dark:text-blue-300">صحة وتناسق المفاهيم العلمية ومطابقتها لمنهجك الدراسي</strong> (مثل تفريق المودم عن الراوتر والسويتش، وأنواع الشبكات السلكية واللاسلكية).
              </p>
            </div>
          </div>

          {!evaluationResult ? (
            <>
              {/* Step 1: Topic Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  اختر أو اكتب موضوع الملخص الصوتي:
                </label>
                
                {/* Topic quick chips */}
                <div className="flex flex-wrap gap-1.5">
                  {curriculumTopics.map((top, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTopicTitle(top.title)}
                      className={`text-[11px] font-bold px-2.5 py-1.5 rounded-xl border transition-all ${
                        topicTitle === top.title
                          ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs scale-[1.02]'
                          : 'bg-slate-100 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-400'
                      }`}
                    >
                      {top.title}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  value={topicTitle}
                  onChange={(e) => setTopicTitle(e.target.value)}
                  placeholder="عنوان أو موضوع الملخص الصوتي..."
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 shadow-xs mt-1"
                />
              </div>

              {/* Mode Switcher (Live Mic vs File Upload) */}
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setActiveMode('record')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    activeMode === 'record'
                      ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>تسجيل صوتي مباشر (الميكروفون)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMode('upload')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    activeMode === 'upload'
                      ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>رفع ملف صوتي من الجهاز</span>
                </button>
              </div>

              {/* MODE 1: LIVE RECORDING STUDIO */}
              {activeMode === 'record' && (
                <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-center space-y-4">
                  
                  {/* Timer & Status */}
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="flex items-center gap-2 text-2xl font-mono font-black text-slate-900 dark:text-slate-100">
                      <Clock className="w-5 h-5 text-amber-500" />
                      <span>{formatTimer(recordingTime)}</span>
                      <span className="text-xs font-sans text-slate-400">/ 05:00</span>
                    </div>

                    {isRecording && (
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-black animate-pulse">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                        <span>جاري التسجيل الصوتي... تحدث بطلاقة واشرح ما فهمته</span>
                      </div>
                    )}
                  </div>

                  {/* Animated Waveform Simulation */}
                  {isRecording && (
                    <div className="flex items-center justify-center gap-1.5 h-12 py-2">
                      {[40, 70, 30, 90, 60, 100, 50, 80, 45, 95, 65, 85, 35, 75, 55, 90].map((h, i) => (
                        <div
                          key={i}
                          className="w-1 bg-gradient-to-t from-amber-500 to-orange-500 rounded-full animate-pulse"
                          style={{
                            height: `${Math.max(15, (h * (Math.sin(recordingTime * 2 + i) + 1.2)) / 2.2)}%`,
                            animationDuration: `${0.3 + (i % 4) * 0.15}s`
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Action Controls */}
                  <div className="flex items-center justify-center gap-3 pt-2">
                    {!isRecording && !audioUrl && (
                      <button
                        type="button"
                        onClick={startRecording}
                        className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
                      >
                        <Mic className="w-4 h-4" />
                        <span>بدء التسجيل الصوتي الآن</span>
                      </button>
                    )}

                    {isRecording && (
                      <button
                        type="button"
                        onClick={stopRecording}
                        className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-lg shadow-rose-600/30 flex items-center gap-2 cursor-pointer animate-pulse"
                      >
                        <Square className="w-4 h-4 fill-white" />
                        <span>إيقاف وإنهاء التسجيل</span>
                      </button>
                    )}

                    {audioUrl && !isRecording && (
                      <div className="flex flex-wrap items-center justify-center gap-2 w-full">
                        <button
                          type="button"
                          onClick={togglePlayAudio}
                          className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-bold text-xs flex items-center gap-2"
                        >
                          {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                          <span>{isPlayingAudio ? 'إيقاف الاستماع' : 'استماع للتسجيل'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={resetRecording}
                          className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>إعادة التسجيل من جديد</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Hidden Audio Element */}
                  {audioUrl && (
                    <audio
                      ref={audioElementRef}
                      src={audioUrl}
                      onEnded={() => setIsPlayingAudio(false)}
                      className="hidden"
                    />
                  )}

                  {/* Real-time transcribed text preview */}
                  {liveTranscription && (
                    <div className="text-right p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                      <p className="text-[10px] font-bold text-slate-400">التفريغ الصوتي المباشر أثناء الحديث:</p>
                      <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed italic">
                        "{liveTranscription}"
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* MODE 2: FILE UPLOAD */}
              {activeMode === 'upload' && (
                <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-center space-y-4">
                  <label className="p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-500 text-center space-y-2 cursor-pointer transition-all group block">
                    <input
                      type="file"
                      accept="audio/*,.mp3,.wav,.m4a,.ogg,.webm,.aac"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FileAudio className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {audioBlob ? `ملف محدد: ${audioBlob.name || 'تسجيل صوتي'}` : 'اختر ملف تسجيل صوتي من هاتفك أو جهازك'}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        يدعم ملفات MP3, WAV, M4A, OGG, WebM
                      </p>
                    </div>
                  </label>

                  {audioUrl && (
                    <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <audio controls src={audioUrl} className="w-full h-8" />
                    </div>
                  )}
                </div>
              )}

              {/* Optional Written Notes */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  ملاحظات أو توضيحات إضافية للمدرب (اختياري):
                </label>
                <textarea
                  rows={2}
                  value={studentNotes}
                  onChange={(e) => setStudentNotes(e.target.value)}
                  placeholder="أي نقاط إضافية تريد لفت انتباه المدرب إليها بخصوص ملخصك..."
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 shadow-xs"
                />
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit & AI Evaluate Button */}
              <button
                type="button"
                onClick={handleEvaluateAndSubmit}
                disabled={isAnalyzing || isRecording}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:brightness-110 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <Zap className="w-5 h-5 animate-spin text-slate-950" />
                    <span>جاري تحليل وتصحيح المفاهيم العلمية بالذكاء الاصطناعي...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-slate-950 fill-slate-950" />
                    <span>إرسال وتصحيح الملخص الصوتي بالذكاء الاصطناعي الآن</span>
                  </>
                )}
              </button>
            </>
          ) : (
            /* STEP 2: RICH CONCEPTUAL AI EVALUATION REPORT DISPLAY */
            <div className="space-y-5 animate-scale-up">
              
              {/* Score & Rating Banner */}
              <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-3xl border border-indigo-500/30 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
                  <div className="text-center sm:text-right space-y-1">
                    <span className="text-[11px] bg-emerald-500/20 text-emerald-300 font-black px-3 py-1 rounded-xl border border-emerald-500/40">
                      ✓ تم تقييم المفاهيم بنجاح
                    </span>
                    <h4 className="text-lg font-black text-white mt-1">
                      {evaluationResult.taskTitle || topicTitle}
                    </h4>
                    <p className="text-xs text-slate-300">
                      المرحلة والمنهج: <span className="text-amber-400 font-bold">{evaluationResult.studentGradeLevel || detectedGrade}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-4 bg-white/10 p-3.5 rounded-2xl border border-white/10">
                    <div className="text-center">
                      <p className="text-[10px] text-slate-300 font-bold">الدرجة المفاهيمية</p>
                      <p className="text-2xl font-black text-amber-400">
                        {evaluationResult.grade} <span className="text-xs text-slate-300 font-normal">/ {evaluationResult.maxGrade || 100}</span>
                      </p>
                    </div>
                    <div className="h-8 w-px bg-white/20" />
                    <div className="text-center">
                      <p className="text-[10px] text-slate-300 font-bold">النقاط المكتسبة</p>
                      <p className="text-2xl font-black text-emerald-400">
                        +{evaluationResult.pointsAwarded || 25}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Badge Awarded if any */}
                {evaluationResult.badgeAwarded && (
                  <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-xl shrink-0">
                      {evaluationResult.badgeAwarded.icon || '🎖️'}
                    </div>
                    <div>
                      <p className="text-xs font-black text-amber-300">
                        🎉 تم منحك: {evaluationResult.badgeAwarded.title}
                      </p>
                      <p className="text-[10px] text-slate-300">
                        تقديراً لدقة الشرح والترابط المفاهيمي في تسجيلك الصوتي
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Voice Transcription */}
              {evaluationResult.voiceTranscription && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <h5 className="text-xs font-black text-slate-900 dark:text-slate-200 flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-amber-500" />
                    التفريغ الصوتي لما قلته في التسجيل:
                  </h5>
                  <p className="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 leading-relaxed font-mono">
                    "{evaluationResult.voiceTranscription}"
                  </p>
                </div>
              )}

              {/* Correct Concepts Mastered */}
              {evaluationResult.conceptsCovered && evaluationResult.conceptsCovered.length > 0 && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2.5">
                  <h5 className="text-xs font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    المفاهيم العلمية الصحيحة التي أتقنتها:
                  </h5>
                  <div className="space-y-1.5">
                    {evaluationResult.conceptsCovered.map((c: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-800 dark:text-slate-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Conceptual Corrections according to curriculum */}
              {evaluationResult.conceptCorrections && evaluationResult.conceptCorrections.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                  <h5 className="text-xs font-black text-amber-900 dark:text-amber-200 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    تصحيح وتدقيق المفاهيم وفق المنهج المقرر:
                  </h5>
                  <div className="space-y-2">
                    {evaluationResult.conceptCorrections.map((corr: any, idx: number) => (
                      <div key={idx} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-amber-500/20 space-y-1.5">
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          📌 {corr.concept}
                        </p>
                        {corr.studentSaid && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            ما ذكرته في التسجيل: <span className="line-through text-rose-500">{corr.studentSaid}</span>
                          </p>
                        )}
                        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                          ✓ التصحيح العلمي للمنهج: {corr.correctedExplanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Difficult Points Simplified */}
              {evaluationResult.difficultPointsExplained && evaluationResult.difficultPointsExplained.length > 0 && (
                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-2">
                  <h5 className="text-xs font-black text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    تبسيط وتوضيح النقاط الصعبة في الدرس:
                  </h5>
                  <div className="space-y-1.5">
                    {evaluationResult.difficultPointsExplained.map((dp: string, idx: number) => (
                      <p key={idx} className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        {dp}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* General Feedback */}
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                <strong className="block text-slate-900 dark:text-slate-100 font-black">
                  تقرير المرشد الأكاديمي الذكي:
                </strong>
                <p className="leading-relaxed">{evaluationResult.generalFeedback}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    resetRecording();
                    onClose();
                  }}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:brightness-110 shadow-md cursor-pointer"
                >
                  إغلاق والعودة إلى البوابة
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
