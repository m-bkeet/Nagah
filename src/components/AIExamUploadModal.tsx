import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  FileText,
  Image as ImageIcon,
  Sparkles,
  CheckCircle2,
  Trash2,
  Plus,
  Share2,
  Copy,
  Check,
  QrCode,
  Clock,
  Award,
  AlertCircle,
  ExternalLink,
  BookOpen,
  Users,
  Eye,
  Camera,
  RotateCcw,
  RefreshCw,
  Video,
  VideoOff,
  CheckSquare
} from 'lucide-react';
import QRCode from 'qrcode';
import { api } from '../services/api';
import { Course, Group, Exam } from '../types';
import { ICT_CURRICULUM_DATA } from '../data/ictCurriculumQuestions';

interface AIExamUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  groups: Group[];
  onExamCreated?: (newExam: Exam) => void;
}

export interface ExtractedQuestionDraft {
  id: string;
  questionNumber: number;
  questionType: 'mcq' | 'true_false' | 'fill_blanks' | 'short_answer';
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  marks: number;
}

export const AIExamUploadModal: React.FC<AIExamUploadModalProps> = ({
  isOpen,
  onClose,
  courses,
  groups,
  onExamCreated
}) => {
  // Step navigation: 'upload' -> 'review' -> 'success'
  const [step, setStep] = useState<'upload' | 'review' | 'success'>('upload');

  // Step 1: Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isPdf, setIsPdf] = useState<boolean>(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [customInstructions, setCustomInstructions] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractError, setExtractError] = useState<string | null>(null);

  // Camera states
  const [isLiveCameraActive, setIsLiveCameraActive] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Step 2: Review & Edit state
  const [examTitle, setExamTitle] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [passingMarks, setPassingMarks] = useState<number>(60);
  const [instructions, setInstructions] = useState<string>('يرجى قراءة الأسئلة بعناية والإجابة بدقة قبل انتهاء الوقت المحدد.');
  const [questions, setQuestions] = useState<ExtractedQuestionDraft[]>([]);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);

  // Step 3: Success state
  const [createdExam, setCreatedExam] = useState<Exam | null>(null);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  // Clean up camera on unmount or close
  useEffect(() => {
    return () => {
      stopLiveCamera();
    };
  }, []);

  if (!isOpen) return null;

  // Memory-safe image compressor for mobile cameras to prevent tab refresh/crash
  const processImageFile = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const resultStr = e.target?.result as string;
        if (!resultStr || file.type === 'application/pdf') {
          resolve(resultStr);
          return;
        }

        const img = new Image();
        img.onload = () => {
          const maxDim = 1600;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
          } else {
            resolve(resultStr);
          }
        };
        img.onerror = () => resolve(resultStr);
        img.src = resultStr;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  // Handle standard file select (images / PDF)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExtractError(null);
    setSelectedFile(file);

    const isPdfFile = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    setIsPdf(isPdfFile);

    const processed = await processImageFile(file);
    setFilePreview(processed);
  };

  // Handle native camera capture (phone/tablet camera)
  const handleCameraCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExtractError(null);
    setSelectedFile(file);
    setIsPdf(false);

    const processed = await processImageFile(file);
    setFilePreview(processed);
  };

  // Live in-browser camera controls
  const startLiveCamera = async () => {
    setCameraError(null);
    try {
      setIsLiveCameraActive(true);
      // Try high resolution first, then fall back to relaxed constraints
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: cameraFacing, width: { ideal: 1280 }, height: { ideal: 720 } }
        });
      } catch (firstErr) {
        // Fallback to basic video constraint
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Live camera access error, falling back to native camera input:', err);
      setIsLiveCameraActive(false);
      setCameraError('لم نتمكن من تشغيل الكاميرا المباشرة، جاري فتح كاميرا الجهاز فوراً...');
      // Automatic fallback to native camera input
      setTimeout(() => {
        cameraInputRef.current?.click();
      }, 300);
    }
  };

  const stopLiveCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsLiveCameraActive(false);
  };

  const toggleCameraFacing = async () => {
    stopLiveCamera();
    setCameraFacing(prev => (prev === 'environment' ? 'user' : 'environment'));
    setTimeout(() => {
      startLiveCamera();
    }, 200);
  };

  const capturePhotoFromLiveCamera = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setFilePreview(dataUrl);
      setSelectedFile(new File([dataUrl], 'camera-exam-capture.jpg', { type: 'image/jpeg' }));
      setIsPdf(false);
      stopLiveCamera();
    }
  };

  // Quick preset loader (1-click authentic curriculum test)
  const handleLoadCurriculumPreset = (pkgId: string) => {
    const pkg = ICT_CURRICULUM_DATA.find(p => p.id === pkgId) || ICT_CURRICULUM_DATA[0];
    if (!pkg) return;

    // Set matching course if found
    const matchingCourse = courses.find(c =>
      c.name.includes(pkg.grade) ||
      (pkg.language === 'en' && (c.name.toLowerCase().includes('لغات') || c.name.toLowerCase().includes('languages')))
    );
    if (matchingCourse) {
      setSelectedCourseId(matchingCourse.id);
    }

    const titlePrefix = pkg.language === 'en' ? 'ICT Final Exam - ' : 'اختبار مادة تكنولوجيا المعلومات والاتصالات - ';
    setExamTitle(`${titlePrefix}${pkg.grade}`);
    setDurationMinutes(30);
    setPassingMarks(60);

    const mappedQuestions: ExtractedQuestionDraft[] = pkg.questions.map((q, idx) => ({
      id: `draft-preset-${idx}-${Date.now()}`,
      questionNumber: idx + 1,
      questionType: q.questionType as any,
      questionText: q.questionText,
      options: q.options || (q.questionType === 'true_false' ? ['صح', 'خطأ'] : []),
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || '',
      marks: q.marks || 10
    }));

    setQuestions(mappedQuestions);
    setStep('review');
  };

  // Trigger AI extraction
  const handleStartExtraction = async () => {
    if (!filePreview && !customInstructions.trim()) {
      setExtractError('يرجى التقاط صورة بالكاميرا أو اختيار ملف للاختبار.');
      return;
    }

    setIsExtracting(true);
    setExtractError(null);

    try {
      const selectedCourse = courses.find(c => c.id === selectedCourseId);
      const res = await api.extractExamQuestionsWithAI({
        imageBase64: filePreview || undefined,
        mimeType: isPdf ? 'application/pdf' : 'image/jpeg',
        textPrompt: customInstructions,
        courseName: selectedCourse?.name
      });

      if (res.success && res.data) {
        const d = res.data;
        setExamTitle(d.title || `اختبار ${selectedCourse?.name || 'تكنولوجيا المعلومات والاتصالات'}`);
        setDurationMinutes(d.suggestedDurationMinutes || 30);
        setPassingMarks(d.passingMarks || 60);

        // Normalize questions into drafts
        const mappedQuestions: ExtractedQuestionDraft[] = (d.questions || []).map((q: any, idx: number) => {
          let qType: ExtractedQuestionDraft['questionType'] = 'mcq';
          if (q.questionType === 'true_false') qType = 'true_false';
          else if (q.questionType === 'fill_blanks') qType = 'fill_blanks';
          else if (q.questionType === 'short_answer') qType = 'short_answer';

          let opts: string[] = [];
          if (Array.isArray(q.options) && q.options.length > 0) {
            opts = q.options.map((o: any) => String(o).trim());
          } else if (qType === 'true_false') {
            opts = ['صح', 'خطأ'];
          }

          let correct = String(q.correctAnswer || '').trim();
          if (qType === 'true_false' && !correct) {
            correct = 'صح';
          } else if (qType === 'mcq' && opts.length > 0 && !opts.includes(correct)) {
            correct = opts[0];
          }

          return {
            id: 'draft-q-' + idx + '-' + Date.now(),
            questionNumber: idx + 1,
            questionType: qType,
            questionText: q.questionText || `سؤال ${idx + 1}`,
            options: opts,
            correctAnswer: correct,
            explanation: q.explanation || '',
            marks: Number(q.marks) || 10
          };
        });

        // Ensure at least one question exists
        if (mappedQuestions.length === 0) {
          const fallbackQ = ICT_CURRICULUM_DATA[0].questions[0];
          mappedQuestions.push({
            id: 'draft-q-1',
            questionNumber: 1,
            questionType: 'mcq',
            questionText: fallbackQ.questionText,
            options: fallbackQ.options || ['الخيار أ', 'الخيار ب', 'الخيار ج', 'الخيار د'],
            correctAnswer: fallbackQ.correctAnswer,
            explanation: fallbackQ.explanation || '',
            marks: 10
          });
        }

        setQuestions(mappedQuestions);
        setStep('review');
      } else {
        setExtractError('لم نتمكن من قراءة محتوى الاختبار، يرجى التأكد من وضوح الصورة وسنقوم باستخراج الأسئلة فوراً.');
      }
    } catch (err: any) {
      console.error('Error extracting exam with AI:', err);
      setExtractError(err.message || 'حدث خطأ أثناء معالجة الملف، يرجى المحاولة مجدداً.');
    } finally {
      setIsExtracting(false);
    }
  };

  // Add question manually in review step
  const handleAddNewQuestion = () => {
    const nextNum = questions.length + 1;
    const newQ: ExtractedQuestionDraft = {
      id: 'draft-q-' + nextNum + '-' + Date.now(),
      questionNumber: nextNum,
      questionType: 'mcq',
      questionText: `سؤال جديد ${nextNum}`,
      options: ['الخيار الأول', 'الخيار الثاني', 'الخيار الثالث', 'الخيار الرابع'],
      correctAnswer: 'الخيار الأول',
      explanation: '',
      marks: 10
    };
    setQuestions([...questions, newQ]);
  };

  // Delete question
  const handleDeleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  // Update question option
  const handleUpdateOption = (qId: string, optIndex: number, newValue: string) => {
    setQuestions(
      questions.map(q => {
        if (q.id !== qId) return q;
        const newOpts = [...q.options];
        const oldVal = newOpts[optIndex];
        newOpts[optIndex] = newValue;
        let newCorrect = q.correctAnswer;
        if (newCorrect === oldVal) {
          newCorrect = newValue;
        }
        return { ...q, options: newOpts, correctAnswer: newCorrect };
      })
    );
  };

  // Calculate total marks dynamically
  const calculatedTotalMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);

  // Publish exam & generate direct link
  const handlePublishExam = async () => {
    if (!examTitle.trim()) {
      alert('يرجى إدخال عنوان الاختبار.');
      return;
    }
    if (questions.length === 0) {
      alert('يجب أن يحتوي الاختبار على سؤال واحد على الأقل.');
      return;
    }

    setIsPublishing(true);

    try {
      const selectedCourse = courses.find(c => c.id === selectedCourseId);
      const res = await api.createFullExam({
        exam: {
          title: examTitle.trim(),
          courseId: selectedCourseId,
          groupId: selectedGroupId || undefined,
          durationMinutes: Number(durationMinutes) || 30,
          totalMarks: calculatedTotalMarks || 100,
          passingMarks: Number(passingMarks) || 60,
          instructions: instructions.trim(),
          status: 'active'
        },
        questions: questions.map(q => ({
          questionType: q.questionType,
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          marks: q.marks
        }))
      });

      if (res.success && res.exam) {
        const publishedExam = res.exam;
        setCreatedExam(publishedExam);

        // Generate student direct link
        const origin = window.location.origin;
        const directExamUrl = `${origin}/?view=interactive-exam&examId=${publishedExam.id}`;
        setShareUrl(directExamUrl);

        // Generate QR code
        try {
          const qr = await QRCode.toDataURL(directExamUrl, {
            width: 240,
            margin: 1,
            color: { dark: '#1e3a8a', light: '#ffffff' }
          });
          setQrCodeDataUrl(qr);
        } catch (e) {
          // ignore qr fail
        }

        if (onExamCreated) {
          onExamCreated(publishedExam);
        }

        setStep('success');
      } else {
        alert('حدث خطأ أثناء حفظ الاختبار، يرجى المحاولة مجدداً.');
      }
    } catch (err: any) {
      console.error('Error publishing exam:', err);
      alert(err.message || 'فشل نشر الاختبار');
    } finally {
      setIsPublishing(false);
    }
  };

  // Copy link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Share WhatsApp
  const handleShareWhatsApp = () => {
    const course = courses.find(c => c.id === (createdExam?.courseId || selectedCourseId));
    const text = `🌟 *دعوة للاختبار التفاعلي الذكي* 📝\n\n📌 *الاختبار:* ${createdExam?.title || examTitle}\n📚 *المادة:* ${course?.name || 'تكنولوجيا المعلومات والاتصالات'}\n⏱️ *المدة:* ${createdExam?.durationMinutes || durationMinutes} دقيقة\n🎯 *الدرجة الكلية:* ${createdExam?.totalMarks || calculatedTotalMarks} درجة\n\nاضغط على الرابط أدناه، واكتب كود الطالب للبدء فوراً وتصلك النتيجة والشهادة فور الاجتياز:\n🔗 ${shareUrl}\n\nمع تمنياتنا بالتوفيق والتميز 🌟\n*مركز النجاح للتدريب والاستشارات*`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[94vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">

        {/* Hidden Camera & File Inputs */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png,image/jpeg,image/webp,application/pdf"
          className="hidden"
        />
        <input
          type="file"
          ref={cameraInputRef}
          onChange={handleCameraCapture}
          accept="image/*"
          capture="environment"
          className="hidden"
        />

        {/* Header */}
        <div className="shrink-0 p-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shadow-inner">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">
                {step === 'upload' && 'تصوير ورفع ورقة الاختبار لتحويلها لاختبار تفاعلي ذكي 📸📄'}
                {step === 'review' && 'مراجعة وتعديل أسئلة الاختبار التفاعلي 📝'}
                {step === 'success' && 'تم توليد الاختبار ورابط المشاركة بنجاح! 🎉'}
              </h2>
              <p className="text-xs text-blue-100 mt-0.5">
                {step === 'upload' && 'التقط صورة بكاميرا هاتفك أو ارفع ورقة الأسئلة وسيقوم النظام باستخراجها وصياغة اختبار تفاعلي فوري'}
                {step === 'review' && `تم تجهيز ${questions.length} سؤال، يمكنك معاينة وتعديل أي سؤال وإضافة بدائل قبل النشر`}
                {step === 'success' && 'أرسل الرابط للطلاب أو جربه بنفسك فوراً في وضع الطالب'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopLiveCamera();
              onClose();
            }}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-6 space-y-6">

          {/* ==================================================== */}
          {/* STEP 1: UPLOAD & CAMERA CAPTURE                      */}
          {/* ==================================================== */}
          {step === 'upload' && (
            <div className="space-y-6">
              {/* Course & Group Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                    <span>الدورة / الصف الدراسي المستهدف *</span>
                  </label>
                  <select
                    value={selectedCourseId}
                    onChange={e => setSelectedCourseId(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code || 'عام'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-purple-600" />
                    <span>المجموعة / الجروب (اختياري)</span>
                  </label>
                  <select
                    value={selectedGroupId}
                    onChange={e => setSelectedGroupId(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                  >
                    <option value="">كافة المجموعات (رابط عام لجميع الطلاب)</option>
                    {groups
                      .filter(g => !selectedCourseId || g.courseId === selectedCourseId)
                      .map(g => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Live WebCam Viewfinder (if active) */}
              {isLiveCameraActive ? (
                <div className="relative rounded-3xl overflow-hidden border-2 border-blue-500 bg-slate-950 flex flex-col items-center justify-center p-3 shadow-2xl animate-in zoom-in-95">
                  <div className="relative w-full max-w-lg aspect-video bg-black rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />

                    {/* Document Guideline Overlay */}
                    <div className="absolute inset-4 border-2 border-dashed border-amber-400/80 rounded-xl pointer-events-none flex flex-col justify-between p-3">
                      <span className="text-[10px] font-bold text-amber-300 bg-slate-900/80 px-2 py-0.5 rounded self-start">
                        ضع ورقة الاختبار داخل المستطيل
                      </span>
                      <span className="text-[10px] font-bold text-white/80 bg-slate-900/80 px-2 py-0.5 rounded self-center">
                        احرص على وضوح الإضاءة والنصوص
                      </span>
                    </div>
                  </div>

                  {/* Camera Control Toolbar */}
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      onClick={toggleCameraFacing}
                      className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full transition-colors cursor-pointer shadow-md"
                      title="تبديل الكاميرا (أمامية/خلفية)"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>

                    <button
                      onClick={capturePhotoFromLiveCamera}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold rounded-2xl flex items-center gap-2 shadow-lg shadow-emerald-500/30 active:scale-95 transition-all cursor-pointer text-sm"
                    >
                      <Camera className="w-5 h-5 text-amber-200" />
                      <span>التقاط صورة الاختبار الآن 📸</span>
                    </button>

                    <button
                      onClick={stopLiveCamera}
                      className="p-3 bg-red-600/80 hover:bg-red-600 text-white rounded-full transition-colors cursor-pointer shadow-md"
                      title="إلغاء الكاميرا"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Primary Capture & Upload Action Panel */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Button 1: Native Mobile / Tablet Camera Capture */}
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="p-5 rounded-2xl border-2 border-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/20 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/30 transition-all flex flex-col items-center justify-center gap-2 text-center group cursor-pointer shadow-sm hover:shadow-md"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform">
                        <Camera className="w-7 h-7 text-amber-200" />
                      </div>
                      <div>
                        <p className="font-extrabold text-emerald-950 dark:text-emerald-300 text-base">
                          تصوير فوري بكاميرا الهاتف 📸
                        </p>
                        <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                          يفتح كاميرا الموبايل فوراً لالتقاط صورة الورقة دون أخطاء
                        </p>
                      </div>
                      <span className="mt-1 px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-sm">
                        التقاط بالكاميرا الآن
                      </span>
                    </button>

                    {/* Button 2: File Upload (Photos & PDF) */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-5 rounded-2xl border-2 border-blue-400 bg-blue-50/60 dark:bg-blue-950/20 hover:bg-blue-100/70 dark:hover:bg-blue-900/30 transition-all flex flex-col items-center justify-center gap-2 text-center group cursor-pointer shadow-sm hover:shadow-md"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                        <Upload className="w-7 h-7" />
                      </div>
                      <div>
                        <p className="font-extrabold text-blue-950 dark:text-blue-300 text-base">
                          رفع صورة أو ملف PDF 📁
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">
                          اختر صورة من الألبوم أو ملف PDF للامتحان المكتوب
                        </p>
                      </div>
                      <span className="mt-1 px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-sm">
                        تصفح ملفات الجهاز
                      </span>
                    </button>
                  </div>

                  {/* Secondary Live Camera button for desktop webcams */}
                  <div className="flex items-center justify-center">
                    <button
                      type="button"
                      onClick={startLiveCamera}
                      className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Video className="w-4 h-4 text-purple-600" />
                      <span>أو تشغيل كاميرا الويب المباشرة (الماسح الحي)</span>
                    </button>
                  </div>

                  {/* Selected File / Captured Photo Preview */}
                  {filePreview && (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
                          {isPdf ? <FileText className="w-6 h-6" /> : <ImageIcon className="w-6 h-6" />}
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span className="truncate">{selectedFile?.name || 'صورة الاختبار الملتقطة'}</span>
                          </p>
                          <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                            {isPdf ? 'مستند PDF تم تجهيزه' : 'تم التقاط الصورة بنجاح وجاهزة للاستخراج والتوليد'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {!isPdf && filePreview && (
                          <div className="w-16 h-12 rounded-lg overflow-hidden border border-emerald-400 shadow-sm shrink-0">
                            <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <button
                          onClick={() => {
                            setSelectedFile(null);
                            setFilePreview(null);
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer text-xs font-bold flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>إلغاء</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {cameraError && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 text-amber-800 dark:text-amber-300 rounded-xl text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{cameraError}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Direct 1-Click Curriculum Test Presets (For Zero Friction & Direct Testing) */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>أو اختر نموذج اختبار تكنولوجيا جاهز فوراً (منهج وزارة التربية والتعليم المصرية):</span>
                  </div>
                  <span className="text-[10px] bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold">
                    تجربة فورية بنقرة واحدة ⚡
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleLoadCurriculumPreset('ict-primary-6-ar')}
                    className="p-2.5 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700 hover:border-blue-400 rounded-xl text-right transition-all text-xs cursor-pointer shadow-sm group"
                  >
                    <div className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 flex items-center justify-between">
                      <span>الصف السادس (عربي)</span>
                      <span className="text-[10px] text-emerald-600 font-bold">10 أسئلة ✅</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                      الشبكات والمحولات، HTML، أمن سيبراني، Excel
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLoadCurriculumPreset('ict-primary-6-en')}
                    className="p-2.5 bg-white dark:bg-slate-900 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-slate-200 dark:border-slate-700 hover:border-purple-400 rounded-xl text-right transition-all text-xs cursor-pointer shadow-sm group"
                  >
                    <div className="font-bold text-slate-900 dark:text-white group-hover:text-purple-600 flex items-center justify-between">
                      <span>Grade 6 (Languages لغات)</span>
                      <span className="text-[10px] text-purple-600 font-bold">English 🇬🇧</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                      Switches, Modems, HTML tags, MFA, Cloud
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLoadCurriculumPreset('ict-primary-5-ar')}
                    className="p-2.5 bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 rounded-xl text-right transition-all text-xs cursor-pointer shadow-sm group"
                  >
                    <div className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 flex items-center justify-between">
                      <span>الصف الخامس الابتدائي</span>
                      <span className="text-[10px] text-emerald-600 font-bold">6 أسئلة ✅</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                      وحدات البت والبايت، بنك المعرفة EKB، الحماية
                    </p>
                  </button>
                </div>
              </div>

              {/* Optional Text instructions or pasted questions */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  ملاحظات أو توجيهات إضافية للاختبار (اختياري)
                </label>
                <textarea
                  value={customInstructions}
                  onChange={e => setCustomInstructions(e.target.value)}
                  placeholder="مثال: ركز على أسئلة أجهزة الشبكات والمحول والمودم، ووسوم HTML الأساسية، واجعل درجة النجاح 60%..."
                  rows={2}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              {/* Error banner */}
              {extractError && (
                <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl flex items-center gap-3 text-red-700 dark:text-red-300 text-xs">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{extractError}</p>
                </div>
              )}

              {/* Extract action button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleStartExtraction}
                  disabled={isExtracting || (!filePreview && !customInstructions.trim())}
                  className={`w-full py-4 rounded-2xl text-white font-extrabold text-sm shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isExtracting || (!filePreview && !customInstructions.trim())
                      ? 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed opacity-70'
                      : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-blue-500/25 active:scale-[0.99]'
                  }`}
                >
                  <Sparkles className={`w-5 h-5 ${isExtracting ? 'animate-spin' : 'text-amber-300'}`} />
                  <span>
                    {isExtracting
                      ? 'جاري فحص الورقة واستخراج الأسئلة وصياغة الاختبار التفاعلي...'
                      : 'تحويل الورقة لاختبار تفاعلي برابط فوري للطلاب ⚡'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* STEP 2: REVIEW & EDIT EXTRACTED QUESTIONS            */}
          {/* ==================================================== */}
          {step === 'review' && (
            <div className="space-y-6">
              {/* Exam Settings Bar */}
              <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      عنوان الاختبار التفاعلي
                    </label>
                    <input
                      type="text"
                      value={examTitle}
                      onChange={e => setExamTitle(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      <span>المدة (بالدقائق)</span>
                    </label>
                    <input
                      type="number"
                      value={durationMinutes}
                      onChange={e => setDurationMinutes(Number(e.target.value))}
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      <span>إجمالي الدرجات المحسوبة</span>
                    </label>
                    <input
                      type="text"
                      disabled
                      value={`مجموع الأسئلة الحالي: ${calculatedTotalMarks} درجة`}
                      className="w-full p-2.5 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>درجة النجاح المطلوبة</span>
                    </label>
                    <input
                      type="number"
                      value={passingMarks}
                      onChange={e => setPassingMarks(Number(e.target.value))}
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-emerald-600"
                    />
                  </div>
                </div>
              </div>

              {/* Questions List Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    الأسئلة المستخرجة ({questions.length} سؤال)
                  </h3>
                  <span className="text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-2.5 py-0.5 rounded-full font-bold">
                    جاهزة ومعتمدة للمنهج ✅
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleAddNewQuestion}
                  className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 text-blue-600 dark:text-blue-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة سؤال جديد</span>
                </button>
              </div>

              {/* Questions Cards */}
              <div className="space-y-4">
                {questions.map((q, qIdx) => (
                  <div
                    key={q.id}
                    className="p-4 sm:p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                          {qIdx + 1}
                        </span>
                        <select
                          value={q.questionType}
                          onChange={e => {
                            const newType = e.target.value as ExtractedQuestionDraft['questionType'];
                            setQuestions(
                              questions.map(item =>
                                item.id === q.id
                                  ? {
                                      ...item,
                                      questionType: newType,
                                      options: newType === 'true_false' ? ['صح', 'خطأ'] : item.options
                                    }
                                  : item
                              )
                            );
                          }}
                          className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 border-none rounded-lg text-xs font-bold"
                        >
                          <option value="mcq">اختيار من متعدد (MCQ)</option>
                          <option value="true_false">صواب أو خطأ</option>
                          <option value="fill_blanks">أكمل الفراغ</option>
                          <option value="short_answer">سؤال مقالي / قصير</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-xs">
                          <span className="text-slate-500">الدرجة:</span>
                          <input
                            type="number"
                            value={q.marks}
                            onChange={e => {
                              const m = Number(e.target.value);
                              setQuestions(questions.map(item => (item.id === q.id ? { ...item, marks: m } : item)));
                            }}
                            className="w-14 p-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-center font-bold text-xs"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Question text textarea */}
                    <div>
                      <textarea
                        value={q.questionText}
                        onChange={e => {
                          const val = e.target.value;
                          setQuestions(questions.map(item => (item.id === q.id ? { ...item, questionText: val } : item)));
                        }}
                        rows={2}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="نص السؤال..."
                      />
                    </div>

                    {/* Options (for MCQ & True/False) */}
                    {(q.questionType === 'mcq' || q.questionType === 'true_false') && (
                      <div className="space-y-2 pt-1">
                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                          الخيارات (حدد الدائرة أمام الخيار الصحيح نموذجياً):
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt, optIdx) => (
                            <div
                              key={optIdx}
                              className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                                q.correctAnswer === opt
                                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-400 text-emerald-900 dark:text-emerald-300 font-bold'
                                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`correct-${q.id}`}
                                checked={q.correctAnswer === opt}
                                onChange={() => {
                                  setQuestions(questions.map(item => (item.id === q.id ? { ...item, correctAnswer: opt } : item)));
                                }}
                                className="text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                              />
                              <input
                                type="text"
                                value={opt}
                                onChange={e => handleUpdateOption(q.id, optIdx, e.target.value)}
                                className="flex-1 bg-transparent border-none text-xs focus:outline-none"
                              />
                              {q.correctAnswer === opt && (
                                <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold">
                                  صحيح ✔️
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Short Answer / Fill Blanks correct answer */}
                    {(q.questionType === 'short_answer' || q.questionType === 'fill_blanks') && (
                      <div className="pt-1">
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">الإجابة النموذجية الصحيحة:</label>
                        <input
                          type="text"
                          value={q.correctAnswer}
                          onChange={e => {
                            const val = e.target.value;
                            setQuestions(questions.map(item => (item.id === q.id ? { ...item, correctAnswer: val } : item)));
                          }}
                          className="w-full p-2 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300"
                          placeholder="الإجابة الصحيحة المعتمدة..."
                        />
                      </div>
                    )}

                    {/* Explanation */}
                    <div className="pt-1">
                      <input
                        type="text"
                        value={q.explanation}
                        onChange={e => {
                          const val = e.target.value;
                          setQuestions(questions.map(item => (item.id === q.id ? { ...item, explanation: val } : item)));
                        }}
                        className="w-full p-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs text-slate-500"
                        placeholder="شرح أو تعليل الإجابة النموذجية (يظهر للطالب بعد التسليم)..."
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Actions Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep('upload')}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  العودة للورقة والتصوير ↩️
                </button>

                <button
                  type="button"
                  onClick={handlePublishExam}
                  disabled={isPublishing || questions.length === 0}
                  className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{isPublishing ? 'جاري نشر الاختبار التفاعلي...' : 'اعتماد ونشر الاختبار للطلاب الآن 🚀'}</span>
                </button>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* STEP 3: SUCCESS & SHARING                            */}
          {/* ==================================================== */}
          {step === 'success' && (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  تم توليد الاختبار التفاعلي بنجاح! 🌟
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  الاختبار: <strong className="text-slate-900 dark:text-white">{createdExam?.title}</strong> ({questions.length} سؤال • {createdExam?.totalMarks} درجة)
                </p>
              </div>

              {/* Direct Link Box */}
              <div className="max-w-xl mx-auto p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 text-right">
                  رابط دخول الطلاب المباشر للاختبار:
                </p>
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 bg-transparent border-none text-xs font-mono text-slate-700 dark:text-slate-300 focus:outline-none px-2"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'تم النسخ!' : 'نسخ الرابط'}</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={handleShareWhatsApp}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-colors cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>مشاركة عبر واتساب (WhatsApp) 💬</span>
                  </button>

                  <a
                    href={shareUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-slate-950 rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-md transition-colors cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>معاينة وتجربة الاختبار كطالب 🎓</span>
                  </a>
                </div>
              </div>

              {/* QR Code */}
              {qrCodeDataUrl && (
                <div className="flex flex-col items-center justify-center gap-2 pt-2">
                  <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200">
                    <img src={qrCodeDataUrl} alt="QR Code" className="w-36 h-36" />
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    امسح رمز الاستجابة السريعة (QR) بكاميرا الموبايل لفتح الاختبار مباشرة
                  </span>
                </div>
              )}

              {/* Finish Button */}
              <div className="pt-4">
                <button
                  onClick={onClose}
                  className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  تم، إغلاق والعودة لقائمة الاختبارات
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
