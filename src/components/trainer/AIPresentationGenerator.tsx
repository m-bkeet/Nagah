import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Presentation,
  Upload,
  Camera,
  Image as ImageIcon,
  Play,
  Maximize2,
  Minimize2,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Laptop,
  Smartphone,
  Copy,
  Check,
  Download,
  Flame,
  Award,
  RefreshCw,
  FileText,
  Lightbulb,
  HelpCircle
} from 'lucide-react';
import { Trainer, Group, Course } from '../../types';

interface AIPresentationGeneratorProps {
  trainer: Trainer;
  groups: Group[];
  courses: Course[];
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

interface Slide {
  slideNumber: number;
  title: string;
  bullets: string[];
  keyTakeaway?: string;
  visualHint?: string;
  speakerNotes?: string;
}

interface KahootQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  timeLimit: number;
  explanation: string;
}

interface PracticalActivity {
  id: string;
  title: string;
  targetDevice: string;
  toolsNeeded?: string;
  steps: string[];
  expectedOutput: string;
}

interface GeneratedPresentation {
  title: string;
  subtitle: string;
  grade: string;
  subject: string;
  estimatedDuration: string;
  slides: Slide[];
  kahootQuestions: KahootQuestion[];
  practicalActivities: PracticalActivity[];
}

export const AIPresentationGenerator: React.FC<AIPresentationGeneratorProps> = ({
  trainer,
  groups,
  courses,
  onShowToast
}) => {
  // Input State
  const [topic, setTopic] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('الصف الرابع الابتدائي');
  const [subject, setSubject] = useState('تكنولوجيا المعلومات والاتصالات والبرمجة');
  const [slideCount, setSlideCount] = useState(6);
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [uploadedImageBase64, setUploadedImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isPdfDoc, setIsPdfDoc] = useState(false);

  // Loading & Result State
  const [isGenerating, setIsGenerating] = useState(false);
  const [presentation, setPresentation] = useState<GeneratedPresentation | null>(null);
  const [activeTab, setActiveTab] = useState<'slides' | 'kahoot' | 'practical'>('slides');

  // Presenter Mode State
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreenPresenter, setIsFullscreenPresenter] = useState(false);

  // Kahoot Game Mode State
  const [kahootCurrentIndex, setKahootCurrentIndex] = useState(0);
  const [kahootSelectedOption, setKahootSelectedOption] = useState<number | null>(null);
  const [kahootShowAnswer, setKahootShowAnswer] = useState(false);
  const [kahootScore, setKahootScore] = useState(0);

  // Copy State
  const [isCopied, setIsCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const gradesList = [
    'الصف الرابع الابتدائي',
    'الصف الخامس الابتدائي',
    'الصف السادس الابتدائي',
    'الصف الأول الإعدادي',
    'الصف الثاني الإعدادي',
    'الصف الثالث الإعدادي',
    'الصف الأول الثانوي',
    'الصف الثاني الثانوي',
    'الصف الثالث الثانوي'
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
    setIsPdfDoc(isPdf);
    setUploadedFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const b64 = evt.target?.result as string;
      setUploadedImageBase64(b64);
      setImagePreview(isPdf ? null : b64);
      onShowToast(isPdf ? 'تم إرفاق كتاب / مستند PDF بنجاح! سيتم تحويله لعرض تقديمي تفاعلي ذكي.' : 'تم تحميل صورة صفحة الكتاب بنجاح!', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!topic.trim() && !uploadedImageBase64) {
      onShowToast('يرجى كتابة موضوع الدرس أو رفع صورة لصفحة الكتاب', 'error');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch('/api/trainer/generate-presentation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          grade: selectedGrade,
          subject,
          slideCount,
          language,
          image: uploadedImageBase64
        })
      });

      const data = await res.json();
      if (data.success && data.presentation) {
        setPresentation(data.presentation);
        setCurrentSlideIndex(0);
        setKahootCurrentIndex(0);
        setKahootSelectedOption(null);
        setKahootShowAnswer(false);
        setKahootScore(0);
        onShowToast('تم توليد العرض التقديمي والأسئلة التفاعلية والتطبيقات بنجاح!', 'success');
      } else {
        onShowToast(data.error || 'حدث خطأ أثناء توليد العرض التقديمي', 'error');
      }
    } catch (err: any) {
      onShowToast('تعذر الاتصال بالخادم، يرجى المحاولة لاحقاً', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyMarkdown = () => {
    if (!presentation) return;
    let md = `# ${presentation.title}\n## ${presentation.subtitle}\n\n`;
    md += `**المرحلة:** ${presentation.grade} | **المادة:** ${presentation.subject}\n\n---\n\n`;

    presentation.slides.forEach(s => {
      md += `### شريحة ${s.slideNumber}: ${s.title}\n`;
      s.bullets.forEach(b => { md += `- ${b}\n`; });
      if (s.keyTakeaway) md += `\n> **خلاصة:** ${s.keyTakeaway}\n`;
      if (s.speakerNotes) md += `\n*ملاحظات الشرح:* ${s.speakerNotes}\n`;
      md += `\n---\n\n`;
    });

    md += `## أسئلة كاهوت التفاعلية:\n`;
    presentation.kahootQuestions.forEach((q, idx) => {
      md += `### س${idx + 1}: ${q.question}\n`;
      q.options.forEach((opt, oIdx) => {
        md += `- [${oIdx === q.correctIndex ? 'X' : ' '}] ${opt}\n`;
      });
      md += `*التفسير:* ${q.explanation}\n\n`;
    });

    md += `## التطبيقات العملية للطلاب:\n`;
    presentation.practicalActivities.forEach((act, idx) => {
      md += `### تطبيق ${idx + 1}: ${act.title} (${act.targetDevice})\n`;
      act.steps.forEach(st => { md += `1. ${st}\n`; });
      md += `**الناتج المتوقع:** ${act.expectedOutput}\n\n`;
    });

    navigator.clipboard.writeText(md);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    onShowToast('تم نسخ محتوى العرض التقديمي والأسئلة والتطبيقات بالكامل!', 'success');
  };

  const kahootColors = [
    { bg: 'bg-red-500 hover:bg-red-600', text: 'text-white', icon: '🔺', name: 'أحمر' },
    { bg: 'bg-blue-500 hover:bg-blue-600', text: 'text-white', icon: '🔷', name: 'أزرق' },
    { bg: 'bg-amber-500 hover:bg-amber-600', text: 'text-slate-950 font-bold', icon: '🟡', name: 'أصفر' },
    { bg: 'bg-emerald-500 hover:bg-emerald-600', text: 'text-white', icon: '🟩', name: 'أخضر' }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Presentation className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                مولد العروض التقديمية التفاعلية بالذكاء الاصطناعي
                <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                  Gemini 3.7 Pro
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                ارفع صفحة الكتاب أو اكتب موضوع الدرس لتحصل على عرض شرائح احترافي + أسئلة كاهوت تفاعلية + تطبيقات عملية بالمعمل
              </p>
            </div>
          </div>

          {presentation && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFullscreenPresenter(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition-all shadow-lg active:scale-95"
              >
                <Maximize2 className="w-4 h-4" />
                <span>عرض على شاشة المعمل (Presenter)</span>
              </button>
              <button
                onClick={handleCopyMarkdown}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-bold text-xs hover:text-white hover:border-slate-600 transition-all"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{isCopied ? 'تم النسخ' : 'نسخ النص'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Generator Form Box */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Topic Input */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              موضوع الدرس أو عنوان الوحدة
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="مثال: الخوارزميات وهياكل البيانات في بايثون / أدوات التواصل الرقمي الآمن"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Grade Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">الصف الدراسي المستهدف</label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              {gradesList.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Options Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* Subject */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">المادة / المجال</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Slide Count */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">عدد الشرائح</label>
            <select
              value={slideCount}
              onChange={(e) => setSlideCount(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value={4}>4 شرائح (موجز سريع)</option>
              <option value={6}>6 شرائح (درس قياسي)</option>
              <option value={8}>8 شرائح (شرح مفصل)</option>
              <option value={10}>10 شرائح (شامل للوحدة)</option>
            </select>
          </div>

          {/* Language */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">لغة العرض</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLanguage('ar')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-colors ${
                  language === 'ar' ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-slate-400 border border-slate-700'
                }`}
              >
                عربي 🇪🇬
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-colors ${
                  language === 'en' ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-slate-400 border border-slate-700'
                }`}
              >
                English 🇬🇧
              </button>
            </div>
          </div>
        </div>

        {/* Image / PDF Upload Area */}
        <div className="pt-2 border-t border-slate-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf,.pdf"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all active:scale-95"
              >
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>رفع كتاب PDF أو صفحة درس 📚📸</span>
              </button>

              {uploadedImageBase64 && (
                <div className="flex items-center gap-2 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-300">
                  {isPdfDoc ? (
                    <BookOpen className="w-3.5 h-3.5 text-rose-400" />
                  ) : (
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  <span className="max-w-[140px] truncate text-slate-200 font-medium">
                    {uploadedFileName || (isPdfDoc ? 'كتاب PDF مرفق' : 'صورة مرفقة')}
                  </span>
                  <button
                    onClick={() => {
                      setUploadedImageBase64(null);
                      setImagePreview(null);
                      setUploadedFileName(null);
                      setIsPdfDoc(false);
                    }}
                    className="text-rose-400 hover:text-rose-300 text-xs font-bold mr-1 hover:underline"
                  >
                    إلغاء ✕
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري تحليل المحتوى وتوليد الشرائح والأنشطة...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>توليد العرض التقديمي والأنشطة بالذكاء الاصطناعي</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results View */}
      {presentation && (
        <div className="space-y-4">
          {/* Sub-tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
            <button
              onClick={() => setActiveTab('slides')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'slides'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <Presentation className="w-4 h-4" />
              <span>شرائح العرض التقديمي ({presentation.slides.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('kahoot')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'kahoot'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="w-4 h-4 text-red-400" />
              <span>مسابقة كاهوت التفاعلية ({presentation.kahootQuestions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('practical')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'practical'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <Laptop className="w-4 h-4 text-blue-400" />
              <span>تطبيقات المعمل العملية ({presentation.practicalActivities.length})</span>
            </button>
          </div>

          {/* Tab 1: Slides View */}
          {activeTab === 'slides' && (
            <div className="space-y-4">
              {/* Slide Presentation Card Preview */}
              {presentation.slides[currentSlideIndex] && (
                <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-700/80 rounded-3xl p-6 md:p-8 shadow-2xl relative min-h-[380px] flex flex-col justify-between">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                        شريحة {presentation.slides[currentSlideIndex].slideNumber} من {presentation.slides.length}
                      </span>
                      <h3 className="text-xl md:text-2xl font-black text-white mt-1">
                        {presentation.slides[currentSlideIndex].title}
                      </h3>
                    </div>
                    <div className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-full">
                      {presentation.grade}
                    </div>
                  </div>

                  {/* Bullet Points Body */}
                  <div className="py-6 space-y-3">
                    {presentation.slides[currentSlideIndex].bullets.map((b, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-slate-200 text-sm md:text-base leading-relaxed">
                        <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                          {idx + 1}
                        </div>
                        <p>{b}</p>
                      </div>
                    ))}

                    {presentation.slides[currentSlideIndex].keyTakeaway && (
                      <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-bold text-amber-300">الخلاصة الذهبية للدرس:</div>
                          <div className="text-xs text-slate-200 mt-0.5">
                            {presentation.slides[currentSlideIndex].keyTakeaway}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Speaker Notes & Bottom Navigation */}
                  <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    {presentation.slides[currentSlideIndex].speakerNotes ? (
                      <div className="text-xs text-slate-400 italic">
                        <span className="font-bold text-slate-300 not-italic">🗣️ توجيه الشرح للمدرب: </span>
                        {presentation.slides[currentSlideIndex].speakerNotes}
                      </div>
                    ) : <div />}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentSlideIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentSlideIndex === 0}
                        className="p-2 rounded-xl bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-40 transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <span className="text-xs font-mono text-slate-400 px-2">
                        {currentSlideIndex + 1} / {presentation.slides.length}
                      </span>
                      <button
                        onClick={() => setCurrentSlideIndex(prev => Math.min(presentation.slides.length - 1, prev + 1))}
                        disabled={currentSlideIndex === presentation.slides.length - 1}
                        className="p-2 rounded-xl bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-40 transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Slide Thumbnails Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {presentation.slides.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`p-3 rounded-2xl text-right border transition-all ${
                      currentSlideIndex === idx
                        ? 'bg-amber-500/20 border-amber-500 text-white shadow-lg'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-[10px] font-bold text-amber-400">شريحة {s.slideNumber}</div>
                    <div className="text-xs font-bold truncate mt-0.5">{s.title}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Kahoot Interactive Game Mode */}
          {activeTab === 'kahoot' && (
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
                {/* Header Info */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-red-500/20 text-red-400 border border-red-500/30">
                      سؤال {kahootCurrentIndex + 1} من {presentation.kahootQuestions.length}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      {presentation.kahootQuestions[kahootCurrentIndex]?.timeLimit || 20} ثانية
                    </span>
                  </div>

                  <div className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                    النقاط المحرزة: {kahootScore} ⭐
                  </div>
                </div>

                {/* Question Text */}
                <div className="text-center py-4">
                  <h3 className="text-xl md:text-2xl font-black text-white">
                    {presentation.kahootQuestions[kahootCurrentIndex]?.question}
                  </h3>
                </div>

                {/* Options 2x2 Grid with Kahoot Colors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {presentation.kahootQuestions[kahootCurrentIndex]?.options.map((opt, optIdx) => {
                    const color = kahootColors[optIdx % 4];
                    const isSelected = kahootSelectedOption === optIdx;
                    const isCorrect = optIdx === presentation.kahootQuestions[kahootCurrentIndex]?.correctIndex;

                    let btnClass = color.bg + ' ' + color.text;
                    if (kahootShowAnswer) {
                      if (isCorrect) {
                        btnClass = 'bg-emerald-500 text-white ring-4 ring-emerald-300';
                      } else if (isSelected) {
                        btnClass = 'bg-red-600 text-white opacity-80';
                      } else {
                        btnClass = 'bg-slate-800 text-slate-500 opacity-40';
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        disabled={kahootShowAnswer}
                        onClick={() => {
                          setKahootSelectedOption(optIdx);
                          setKahootShowAnswer(true);
                          if (isCorrect) {
                            setKahootScore(prev => prev + 100);
                            onShowToast('إجابة صحيحة رائعة! +100 نقطة ⭐', 'success');
                          } else {
                            onShowToast('إجابة خاطئة! راجع الشرح.', 'error');
                          }
                        }}
                        className={`p-5 rounded-2xl font-bold text-sm md:text-base flex items-center justify-between gap-3 shadow-lg transition-all active:scale-95 ${btnClass}`}
                      >
                        <span className="text-xl">{color.icon}</span>
                        <span className="flex-1 text-center">{opt}</span>
                        {kahootShowAnswer && isCorrect && <CheckCircle2 className="w-6 h-6 text-white" />}
                        {kahootShowAnswer && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-white" />}
                      </button>
                    );
                  })}
                </div>

                {/* Answer Explanation Box */}
                {kahootShowAnswer && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold text-amber-400">💡 تفسير الإجابة الصحيحة:</div>
                      <div className="text-xs text-slate-200 mt-1">
                        {presentation.kahootQuestions[kahootCurrentIndex]?.explanation}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (kahootCurrentIndex < presentation.kahootQuestions.length - 1) {
                          setKahootCurrentIndex(prev => prev + 1);
                          setKahootSelectedOption(null);
                          setKahootShowAnswer(false);
                        } else {
                          onShowToast(`انتهت المسابقة! مجموع النقاط: ${kahootScore} ⭐`, 'success');
                        }
                      }}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition-all shrink-0"
                    >
                      {kahootCurrentIndex < presentation.kahootQuestions.length - 1 ? 'السؤال التالي ➡️' : 'إعادة المسابقة 🔄'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Practical Lab Activities */}
          {activeTab === 'practical' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {presentation.practicalActivities.map((act, idx) => (
                <div key={act.id || idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-black">
                        #{idx + 1}
                      </span>
                      <h4 className="text-sm font-black text-white">{act.title}</h4>
                    </div>

                    <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center gap-1">
                      {act.targetDevice.includes('موبايل') ? <Smartphone className="w-3 h-3 text-amber-400" /> : <Laptop className="w-3 h-3 text-blue-400" />}
                      {act.targetDevice}
                    </span>
                  </div>

                  {act.toolsNeeded && (
                    <div className="text-xs text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <span className="font-bold text-slate-300">البرامج المطلوبة: </span>
                      {act.toolsNeeded}
                    </div>
                  )}

                  <div className="space-y-1.5 pt-1">
                    <div className="text-xs font-bold text-amber-300">خطوات التنفيذ بالمعمل:</div>
                    {act.steps.map((st, sIdx) => (
                      <div key={sIdx} className="flex items-start gap-2 text-xs text-slate-300">
                        <span className="w-4 h-4 rounded-full bg-slate-800 text-amber-400 text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {sIdx + 1}
                        </span>
                        <span>{st}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                    <span className="font-bold">🎯 الناتج المتوقع من الطالب: </span>
                    {act.expectedOutput}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Fullscreen Presenter Mode Modal */}
      {isFullscreenPresenter && presentation && (
        <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between p-6 md:p-12">
          {/* Top Bar */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <div className="text-xs font-bold text-amber-400">{presentation.subject} • {presentation.grade}</div>
              <h2 className="text-2xl md:text-3xl font-black">{presentation.title}</h2>
            </div>
            <button
              onClick={() => setIsFullscreenPresenter(false)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold"
            >
              <Minimize2 className="w-4 h-4" />
              <span>إنهاء العرض (Esc)</span>
            </button>
          </div>

          {/* Current Slide Big Canvas */}
          <div className="my-auto max-w-4xl mx-auto w-full space-y-6">
            <div className="text-center space-y-2">
              <span className="text-xs font-black uppercase text-amber-400 tracking-wider">
                شريحة {presentation.slides[currentSlideIndex].slideNumber} / {presentation.slides.length}
              </span>
              <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
                {presentation.slides[currentSlideIndex].title}
              </h1>
            </div>

            <div className="space-y-4 bg-slate-900/60 backdrop-blur-md p-8 rounded-3xl border border-slate-800 shadow-2xl">
              {presentation.slides[currentSlideIndex].bullets.map((b, idx) => (
                <div key={idx} className="flex items-start gap-4 text-lg md:text-2xl text-slate-100 font-medium">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-1 text-sm font-bold">
                    {idx + 1}
                  </div>
                  <p>{b}</p>
                </div>
              ))}

              {presentation.slides[currentSlideIndex].keyTakeaway && (
                <div className="mt-6 p-4 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-base">
                  <strong>💡 خلاصة الدرس: </strong>
                  {presentation.slides[currentSlideIndex].keyTakeaway}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="flex items-center justify-between border-t border-slate-800 pt-4">
            <div className="text-xs text-slate-400 font-mono">
              مركز النجاح للتدريب والاستشارات • وضع الشاشة التفاعلية
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentSlideIndex(prev => Math.max(0, prev - 1))}
                disabled={currentSlideIndex === 0}
                className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-xs hover:bg-slate-800 disabled:opacity-40"
              >
                الشريحة السابقة
              </button>
              <button
                onClick={() => setCurrentSlideIndex(prev => Math.min(presentation.slides.length - 1, prev + 1))}
                disabled={currentSlideIndex === presentation.slides.length - 1}
                className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 disabled:opacity-40"
              >
                الشريحة التالية
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
