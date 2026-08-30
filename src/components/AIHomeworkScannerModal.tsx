import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  UserCheck,
  Award,
  Star,
  Send,
  BookOpen,
  ChevronRight,
  Eye,
  Check,
  XCircle,
  FileCheck2,
  GraduationCap,
  MessageCircle,
  Sliders,
  ScanLine
} from 'lucide-react';
import { api } from '../services/api';
import { useCenter } from '../context/CenterContext';
import { Trainee, Course } from '../types';

interface AIHomeworkScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTraineeId?: string;
  defaultCourseId?: string;
  onGradeSaved?: (result: any) => void;
  courses?: Course[];
  trainees?: Trainee[];
}

export const AIHomeworkScannerModal: React.FC<AIHomeworkScannerModalProps> = ({
  isOpen,
  onClose,
  defaultTraineeId,
  defaultCourseId,
  onGradeSaved,
  courses: propCourses,
  trainees: propTrainees
}) => {
  const { showToast, refreshAll } = useCenter();

  // Local state fallback if metadata props are not passed
  const [localCourses, setLocalCourses] = useState<Course[]>([]);
  const [localTrainees, setLocalTrainees] = useState<Trainee[]>([]);
  const [isLoadingMeta, setIsLoadingMeta] = useState(false);

  const coursesList = propCourses || localCourses;
  const traineesList = propTrainees || localTrainees;

  // Mode: 'capture' -> 'analyzing' -> 'results' -> 'saved'
  const [step, setStep] = useState<'capture' | 'analyzing' | 'results' | 'saved'>('capture');

  // Input states
  const [selectedCourseId, setSelectedCourseId] = useState<string>(defaultCourseId || '');
  const [selectedTraineeId, setSelectedTraineeId] = useState<string>(defaultTraineeId || '');

  // Initialize course selection once courses load
  useEffect(() => {
    if (coursesList.length > 0 && !selectedCourseId) {
      setSelectedCourseId(defaultCourseId || coursesList[0].id);
    }
  }, [coursesList, defaultCourseId, selectedCourseId]);

  // Load metadata dynamically if not provided as props
  useEffect(() => {
    if (isOpen) {
      if (!propCourses || !propTrainees) {
        setIsLoadingMeta(true);
        Promise.all([
          !propCourses ? api.getCourses() : Promise.resolve([]),
          !propTrainees ? api.getTrainees() : Promise.resolve([])
        ])
          .then(([coursesRes, traineesRes]) => {
            if (!propCourses && Array.isArray(coursesRes)) {
              setLocalCourses(coursesRes);
            }
            if (!propTrainees && Array.isArray(traineesRes)) {
              setLocalTrainees(traineesRes);
            }
          })
          .catch(err => {
            console.error('Failed to load metadata in AI scanner:', err);
          })
          .finally(() => {
            setIsLoadingMeta(false);
          });
      }
    }
  }, [isOpen, propCourses, propTrainees]);
  const [homeworkTitle, setHomeworkTitle] = useState<string>('واجب تطبيق الدرس - الكتاب المدرسي');
  const [maxScore, setMaxScore] = useState<number>(100);
  const [answerKey, setAnswerKey] = useState<string>('');
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // Image & Camera States
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // AI Evaluation Results
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [matchedTrainee, setMatchedTrainee] = useState<Trainee | null>(null);
  const [customScore, setCustomScore] = useState<number>(100);
  const [customPoints, setCustomPoints] = useState<number>(20);
  const [isSaving, setIsSaving] = useState(false);
  const [savedData, setSavedData] = useState<any>(null);

  // Auto-fill course/trainee if passed
  useEffect(() => {
    if (defaultCourseId) setSelectedCourseId(defaultCourseId);
    if (defaultTraineeId && traineesList.length > 0) {
      setSelectedTraineeId(defaultTraineeId);
      const tr = traineesList.find(t => t.id === defaultTraineeId);
      if (tr) setMatchedTrainee(tr);
    }
  }, [defaultCourseId, defaultTraineeId, traineesList]);

  // Start / Stop Camera
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      showToast('تعذر فتح الكاميرا، يرجى السماح بالوصول أو اختيار صورة من الملفات', 'error');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const toggleCameraFacing = async () => {
    stopCamera();
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
    setTimeout(() => {
      startCamera();
    }, 200);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setImagePreview(dataUrl);
      setImageBase64(dataUrl);
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImagePreview(dataUrl);
      setImageBase64(dataUrl);
      stopCamera();
    };
    reader.readAsDataURL(file);
  };

  // Perform AI Grading Scan
  const handleStartScan = async () => {
    if (!imageBase64) {
      showToast('يرجى التقاط صورة لصفحة الواجب أو رفعها أولاً', 'error');
      return;
    }

    setStep('analyzing');
    try {
      const currentCourse = coursesList.find(c => c.id === selectedCourseId);
      const res = await api.gradeHomeworkScan({
        imageBase64,
        mimeType: 'image/jpeg',
        answerKey: answerKey.trim() || undefined,
        examOrHomeworkTitle: homeworkTitle.trim() || 'واجب مدرسي مصحح بالذكاء الاصطناعي',
        maxScore: maxScore,
        courseId: selectedCourseId,
        courseName: currentCourse?.name
      });

      if (res.success && res.data) {
        setAnalysisResult(res.data);
        setCustomScore(res.data.score);
        setCustomPoints(res.data.suggestedPoints || 20);

        // Find or match trainee
        if (selectedTraineeId) {
          const manualTrainee = traineesList.find(t => t.id === selectedTraineeId);
          setMatchedTrainee(manualTrainee || null);
        } else if (res.matchedTrainee) {
          const fullTrainee = traineesList.find(t => t.id === res.matchedTrainee?.id) || (res.matchedTrainee as any);
          setMatchedTrainee(fullTrainee || null);
          if (fullTrainee?.id) {
            setSelectedTraineeId(fullTrainee.id);
          }
        } else if (Array.isArray(traineesList) && traineesList.length > 0) {
          setMatchedTrainee(traineesList[0] || null);
          if (traineesList[0]?.id) {
            setSelectedTraineeId(traineesList[0].id);
          }
        }

        setStep('results');
        showToast('تم مسح الصفحة والتعرف على كود الطالب وحلوله بنجاح! ✨', 'success');
      } else {
        throw new Error('لم يتم استلام نتيجة من المصحح الذكي');
      }
    } catch (err: any) {
      console.error('Scan grading error:', err);
      showToast(err.message || 'حدث خطأ أثناء تحليل الصورة، يرجى المحاولة مرة أخرى', 'error');
      setStep('capture');
    }
  };

  // Confirm and Save to Student Record
  const handleConfirmSave = async () => {
    const targetTrainee = matchedTrainee || traineesList.find(t => t.id === selectedTraineeId);
    if (!targetTrainee) {
      showToast('يرجى تحديد المتدرب أولاً لحفظ الدرجة في ملفه', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const res = await api.confirmGradeScan({
        traineeId: targetTrainee.id,
        title: homeworkTitle.trim() || analysisResult?.detectedTitle || 'واجب مصحح بالذكاء الاصطناعي',
        score: customScore,
        maxScore: maxScore,
        percentage: Math.round((customScore / maxScore) * 100),
        rating: analysisResult?.rating || 'ممتاز',
        awardedPoints: customPoints,
        feedback: analysisResult?.generalFeedback || '',
        mistakes: analysisResult?.mistakes || [],
        scannedImage: imagePreview || undefined,
        courseId: selectedCourseId || targetTrainee.courseId
      });

      if (res.success) {
        setSavedData(res);
        setStep('saved');
        showToast(`تم حفظ الدرجة وإضافة +${customPoints} نقطة للمتدرب (${targetTrainee.fullName}) بنجاح! 🌟`, 'success');
        refreshAll();
        if (onGradeSaved) onGradeSaved(res);
      }
    } catch (err: any) {
      showToast(err.message || 'فشل حفظ الدرجة في السجل', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset for next paper
  const handleResetForNext = () => {
    setImagePreview(null);
    setImageBase64(null);
    setAnalysisResult(null);
    setMatchedTrainee(null);
    setSelectedTraineeId('');
    setStep('capture');
  };

  // Send WhatsApp Report to Parent
  const handleSendWhatsApp = () => {
    const targetTrainee = matchedTrainee || traineesList.find(t => t.id === selectedTraineeId);
    const phone = targetTrainee?.parentPhone || targetTrainee?.phone;
    if (!phone) {
      showToast('لا يوجد رقم هاتف مسجل لولي الأمر', 'error');
      return;
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const title = homeworkTitle.trim() || 'واجب مدرسي';
    const scoreText = `${customScore} من ${maxScore} (${Math.round((customScore / maxScore) * 100)}%)`;
    const rating = analysisResult?.rating || 'ممتاز';
    const feedback = analysisResult?.generalFeedback || 'أداء رائع ومتميز!';

    const message = `🌟 *تقرير تصحيح فوري من مركز النجاح للتدريب والاستشارات* 🌟
--------------------------------------
👤 *اسم المتدرب:* ${targetTrainee?.fullName}
🔖 *كود المتدرب:* ${targetTrainee?.code || '---'}
📚 *الواجب/التقييم:* ${title}
🎯 *الدرجة المستحقة:* ${scoreText}
🏆 *التقدير العام:* ${rating}
⭐ *نقاط التميز المضافة للرصيد:* +${customPoints} نقطة

📝 *ملاحظات وتوجيهات المصحح الذكي:*
"${feedback}"

نتمنى لمتدربنا العزيز دوام التفوق والنجاح المستمر! 👏✨`;

    const url = `https://wa.me/${cleanPhone.startsWith('0') ? '2' + cleanPhone : cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 rounded-2xl backdrop-blur-sm shadow-inner">
              <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold tracking-tight">مصحح الواجبات والاختبارات بالذكاء الاصطناعي</h3>
                <span className="text-xs bg-amber-400/90 text-slate-950 font-black px-2.5 py-0.5 rounded-full shadow-sm">
                  Gemini Vision 3.7
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
                مسح صورة صفحة الكتاب أو الاختبار وتصحيحها ورصد الدرجات لسجل الطالب تلقائياً عبر الكود
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* STEP 1: CAPTURE / UPLOAD */}
          {step === 'capture' && (
            <div className="space-y-6">
              
              {/* Instructions banner */}
              <div className="p-4 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 border border-amber-300/40 dark:border-amber-700/40 rounded-2xl flex items-start gap-3">
                <div className="p-2 bg-amber-500 text-white rounded-xl shrink-0 mt-0.5 shadow-sm">
                  <ScanLine className="w-5 h-5" />
                </div>
                <div className="text-sm">
                  <span className="font-bold text-amber-950 dark:text-amber-200">
                    💡 طريقة العمل البسيطة:
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">
                    اطلب من الطالب كتابة كوده (مثل <strong className="text-emerald-700 dark:text-emerald-400 font-mono">A001</strong> أو <strong className="text-emerald-700 dark:text-emerald-400 font-mono">N001</strong>) في أعلى الصفحة. وجّه الكاميرا أو ارفع صورة ورقة الواجب، وسيقوم الذكاء الاصطناعي بقراءة الكود، تصحيح الحلول، واحتساب الدرجات وإضافتها لملف الطالب فوراً!
                  </p>
                </div>
              </div>

              {/* Assessment Meta Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    الدورة / المادة التدريبية
                  </label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {coursesList.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    عنوان الواجب / الاختبار
                  </label>
                  <input
                    type="text"
                    value={homeworkTitle}
                    onChange={(e) => setHomeworkTitle(e.target.value)}
                    placeholder="مثال: واجب الدرس الثالث - تكنولوجيا المعلومات"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    الدرجة الكلية القصوى
                  </label>
                  <input
                    type="number"
                    value={maxScore}
                    onChange={(e) => setMaxScore(Number(e.target.value) || 100)}
                    min={5}
                    max={1000}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Advanced Settings Toggle (Optional Answer Key / Manual Trainee override) */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                  className="text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1.5"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  {showAdvancedSettings ? 'إخفاء الإعدادات الإضافية ونموذج الإجابة' : 'إظهار إعدادات إضافية (نموذج إجابة / تحديد طالب يدوي)'}
                </button>

                {showAdvancedSettings && (
                  <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-3 animate-in fade-in duration-150">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          تحديد المتدرب يدوياً (اختياري، إن لم يُكتب الكود على الورقة)
                        </label>
                        <select
                          value={selectedTraineeId}
                          onChange={(e) => {
                            setSelectedTraineeId(e.target.value);
                            const tr = traineesList.find(t => t.id === e.target.value);
                            if (tr) setMatchedTrainee(tr);
                          }}
                          className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        >
                          <option value="">-- التعرف التلقائي الذكي عبر الكود المكتوب --</option>
                          {traineesList.map(t => (
                            <option key={t.id} value={t.id}>[{t.code}] {t.fullName}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          نموذج الإجابة المعتمد (اختياري - سيفحص الذكاء الاصطناعي الأسئلة تلقائياً إن تركته فارغاً)
                        </label>
                        <input
                          type="text"
                          value={answerKey}
                          onChange={(e) => setAnswerKey(e.target.value)}
                          placeholder="مثال: 1-أ، 2-صح، 3-ج، 4-خطأ"
                          className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Camera Live View or Upload Box */}
              <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl overflow-hidden bg-slate-900/5 dark:bg-slate-950/40 min-h-[320px] flex items-center justify-center">
                
                {isCameraActive ? (
                  <div className="relative w-full h-[360px] bg-black flex items-center justify-center">
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />

                    {/* Camera Guidance Overlay */}
                    <div className="absolute inset-0 border-4 border-emerald-400/70 m-6 rounded-2xl pointer-events-none flex flex-col justify-between p-4">
                      <div className="bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-full self-center backdrop-blur-sm flex items-center gap-1.5">
                        <ScanLine className="w-4 h-4 text-emerald-400 animate-pulse" />
                        اجعل كود الطالب بالأعلى ومحتوى الورقة داخل الإطار
                      </div>
                      <div className="text-center text-white/90 text-xs bg-black/50 px-2 py-1 rounded-lg self-center">
                        اضغط على زر التقاط الصورة عند وضوح الورقة
                      </div>
                    </div>

                    {/* Controls Bar */}
                    <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-4 z-10">
                      <button
                        type="button"
                        onClick={toggleCameraFacing}
                        className="p-3 bg-white/20 hover:bg-white/30 text-white rounded-full backdrop-blur-md transition-transform active:scale-95"
                        title="تبديل الكاميرا"
                      >
                        <RefreshCw className="w-5 h-5" />
                      </button>

                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-xl flex items-center gap-2 transition-transform active:scale-95"
                      >
                        <Camera className="w-5 h-5" />
                        التقاط صورة الصفحة 📸
                      </button>

                      <button
                        type="button"
                        onClick={stopCamera}
                        className="p-3 bg-rose-500/80 hover:bg-rose-600 text-white rounded-full backdrop-blur-md transition-transform active:scale-95"
                        title="إلغاء الكاميرا"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : imagePreview ? (
                  <div className="relative w-full p-4 flex flex-col items-center justify-center">
                    <img
                      src={imagePreview}
                      alt="Scanned Homework"
                      className="max-h-[340px] w-auto rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 object-contain"
                    />

                    <div className="mt-4 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setImageBase64(null);
                          startCamera();
                        }}
                        className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Camera className="w-4 h-4" />
                        إعادة التصوير
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        اختيار صورة أخرى
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center shadow-inner">
                      <Camera className="w-8 h-8" />
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                        تصوير صفحة الواجب أو ورقة الاختبار
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                        التقط صورة واضحة ومباشرة لصفحة الكتاب أو الاختبار، أو اختر صورة من جهازك
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={startCamera}
                        className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-bold rounded-2xl shadow-md flex items-center gap-2 transition-transform active:scale-95"
                      >
                        <Camera className="w-4 h-4" />
                        فتح كاميرا الهاتف / الكمبيوتر
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-5 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 text-sm font-bold rounded-2xl shadow-sm flex items-center gap-2 transition-transform active:scale-95"
                      >
                        <Upload className="w-4 h-4" />
                        رفع صورة من الملفات
                      </button>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Action Submit Button */}
              {imagePreview && !isCameraActive && (
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleStartScan}
                    className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2.5 text-base transition-all transform active:scale-95"
                  >
                    <Sparkles className="w-5 h-5 text-amber-300 animate-spin" style={{ animationDuration: '3s' }} />
                    بدء المسح وتصحيح الواجب بالذكاء الاصطناعي ✨
                  </button>
                </div>
              )}

            </div>
          )}

          {/* STEP 2: ANALYZING STATE */}
          {step === 'analyzing' && (
            <div className="py-16 text-center space-y-6">
              <div className="relative mx-auto w-24 h-24">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-ping"></div>
                <div className="relative w-24 h-24 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-full flex items-center justify-center text-white shadow-xl">
                  <Sparkles className="w-12 h-12 text-amber-300 animate-pulse" />
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                  جارٍ فحص وتحليل ورقة الواجب بالذكاء الاصطناعي...
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  يتم استخراج كود الطالب من أعلى الصفحة، قراءة الإجابات بخط اليد، وتصحيح التمارين بدقة فائقة.
                </p>
              </div>

              <div className="max-w-md mx-auto p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-right text-xs space-y-2 font-mono">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <Check className="w-4 h-4" /> 1. قراءة الترويسة واستخراج كود الطالب
                </div>
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <Check className="w-4 h-4" /> 2. مطابقة الكود مع قاعدة بيانات المتدربين
                </div>
                <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 animate-pulse">
                  <Sparkles className="w-4 h-4" /> 3. تقييم الإجابات واحتساب الدرجات والنقاط...
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: RESULTS & VERIFICATION */}
          {step === 'results' && analysisResult && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Top Banner: Student Identification Card */}
              <div className="p-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-500/30 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white font-bold flex items-center justify-center text-xl shadow-md overflow-hidden">
                    {matchedTrainee?.photoUrl ? (
                      <img src={matchedTrainee.photoUrl} alt="Student" className="w-full h-full object-cover" />
                    ) : (
                      matchedTrainee?.fullName?.substring(0, 1) || '🎓'
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-black text-slate-900 dark:text-white">
                        {matchedTrainee?.fullName || analysisResult?.detectedStudentName || 'متدرب غير محدد'}
                      </h4>
                      <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-xs font-mono font-bold rounded-lg border border-emerald-300 dark:border-emerald-700">
                        كود: {matchedTrainee?.code || analysisResult?.detectedStudentCode || '---'}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                        <UserCheck className="w-3.5 h-3.5" /> كود متطابق وموثق
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      الرصيد الحالي للنقاط: <strong className="text-amber-500 font-bold">{matchedTrainee?.totalPoints || matchedTrainee?.points || 0} ⭐</strong>
                      {matchedTrainee?.parentPhone && ` | هاتف ولي الأمر: ${matchedTrainee.parentPhone}`}
                    </p>
                  </div>
                </div>

                {/* Trainee Override Select if needed */}
                <div className="w-full md:w-auto">
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                    تغيير المتدرب المستهدف
                  </label>
                  <select
                    value={selectedTraineeId}
                    onChange={(e) => {
                      setSelectedTraineeId(e.target.value);
                      const tr = traineesList.find(t => t.id === e.target.value);
                      if (tr) setMatchedTrainee(tr);
                    }}
                    className="w-full md:w-56 px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {traineesList.map(t => (
                      <option key={t.id} value={t.id}>[{t.code}] {t.fullName}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Score & Evaluation Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                {/* Score Dial */}
                <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-xl">
                    {Math.round((customScore / maxScore) * 100)}%
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block font-bold">الدرجة المحققة</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <input
                        type="number"
                        value={customScore}
                        onChange={(e) => setCustomScore(Number(e.target.value) || 0)}
                        max={maxScore}
                        min={0}
                        className="w-16 px-2 py-0.5 text-base font-black text-emerald-600 dark:text-emerald-400 bg-slate-100 dark:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-600 focus:outline-none"
                      />
                      <span className="text-xs text-slate-400 font-bold">من {maxScore}</span>
                    </div>
                  </div>
                </div>

                {/* Rating Badge */}
                <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block font-bold">التقدير العام</span>
                    <span className="text-base font-black text-indigo-700 dark:text-indigo-300">
                      {analysisResult.rating || 'ممتاز'}
                    </span>
                  </div>
                </div>

                {/* Points Award */}
                <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold">
                    <Star className="w-6 h-6 fill-amber-400 text-amber-500" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block font-bold">نقاط التميز الممنوحة</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <input
                        type="number"
                        value={customPoints}
                        onChange={(e) => setCustomPoints(Number(e.target.value) || 0)}
                        min={0}
                        max={100}
                        className="w-14 px-2 py-0.5 text-base font-black text-amber-600 dark:text-amber-400 bg-slate-100 dark:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-600 focus:outline-none"
                      />
                      <span className="text-xs text-amber-500 font-bold">نقطة ⭐</span>
                    </div>
                  </div>
                </div>

                {/* Scanned Image Preview Button */}
                {imagePreview && (
                  <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src={imagePreview} alt="Thumbnail" className="w-10 h-10 rounded-lg object-cover border" />
                      <div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">صورة الورقة</span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400">تم المسح بنجاح</span>
                      </div>
                    </div>
                    <a
                      href={imagePreview}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      title="عرض بحجم كامل"
                    >
                      <Eye className="w-4 h-4" />
                    </a>
                  </div>
                )}

              </div>

              {/* General Feedback & Pedagogical Notes */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <h5 className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  ملاحظات وتوجيهات الذكاء الاصطناعي للطالب:
                </h5>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  {analysisResult.generalFeedback}
                </p>

                {analysisResult.strengths && analysisResult.strengths.length > 0 && (
                  <div className="pt-2">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
                      ✅ نقاط القوة والتميز في الإجابة:
                    </span>
                    <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-300 space-y-1">
                      {analysisResult.strengths.map((str: string, idx: number) => (
                        <li key={idx}>{str}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Question by Question Breakdown */}
              {analysisResult.mistakes && analysisResult.mistakes.length > 0 && (
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-teal-600" />
                    تفاصيل وتصحيح التمارين والأسئلة المفحوصة:
                  </h5>

                  <div className="space-y-2.5">
                    {analysisResult.mistakes.map((q: any, idx: number) => (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-2xl border text-sm transition-all ${
                          q.isCorrect
                            ? 'bg-emerald-500/5 border-emerald-500/20'
                            : 'bg-rose-500/5 border-rose-500/20'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            {q.isCorrect ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                            )}
                            <div>
                              <span className="font-bold text-slate-800 dark:text-slate-100">
                                {q.questionSummary}
                              </span>
                              <div className="mt-1 text-xs space-y-1">
                                <p className="text-slate-600 dark:text-slate-400">
                                  <strong className="text-slate-700 dark:text-slate-300">إجابة الطالب:</strong> {q.studentAnswer}
                                </p>
                                {!q.isCorrect && (
                                  <p className="text-emerald-700 dark:text-emerald-300">
                                    <strong>الإجابة النموذجية:</strong> {q.correctAnswer}
                                  </p>
                                )}
                                {q.explanation && (
                                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                                    💡 {q.explanation}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded-lg ${
                              q.isCorrect
                                ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                                : 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300'
                            }`}>
                              {q.scoreAwarded} / {q.maxScore}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleResetForNext}
                  className="w-full sm:w-auto px-4 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-bold transition-colors"
                >
                  مسح ورقة أخرى دون حفظ
                </button>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={handleConfirmSave}
                    className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Check className="w-5 h-5" />
                    )}
                    اعتماد وإضافة الدرجات فوراً لسجل الطالب ({matchedTrainee?.fullName || 'الطالب'}) 🌟
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* STEP 4: SUCCESS SAVED STATE */}
          {step === 'saved' && (
            <div className="py-12 text-center space-y-6 animate-in zoom-in-95 duration-200">
              <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-xl">
                <CheckCircle2 className="w-12 h-12 animate-bounce" />
              </div>

              <div className="space-y-2">
                <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                  تم رصد وتوثيق الدرجة في سجل المتدرب بنجاح! 🎉
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                  تم إضافة درجة <strong className="text-emerald-600 font-bold">{customScore}/{maxScore}</strong> ومنح الطالب <strong className="text-amber-500 font-bold">+{customPoints} نقطة تميز ⭐</strong> وتحديث سجله ونقاطه في لوحة التحكم فوراً.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-md flex items-center gap-2 transition-transform active:scale-95"
                >
                  <MessageCircle className="w-5 h-5" />
                  إرسال بطاقة التقرير لولي الأمر عبر واتساب 📲
                </button>

                <button
                  type="button"
                  onClick={handleResetForNext}
                  className="px-6 py-3 bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-md flex items-center gap-2 transition-transform active:scale-95"
                >
                  <Camera className="w-5 h-5" />
                  تصحيح ورقة طالب آخر 📸
                </button>

                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    onClose();
                  }}
                  className="px-5 py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-2xl hover:bg-slate-300 transition-colors"
                >
                  إغلاق
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
