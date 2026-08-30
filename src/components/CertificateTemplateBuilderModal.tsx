import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Move, Type, Droplet, AlignLeft, AlignCenter, AlignRight, Save, Sparkles, AlertCircle, CheckCircle2, RotateCcw, HelpCircle, Eye, Plus, Trash2 } from 'lucide-react';
import { CertificateTemplate, VisualTemplateField } from '../types';

interface CertificateTemplateBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: CertificateTemplate) => void;
  initialTemplate?: CertificateTemplate;
}

// 3 High-Quality Premium SVG-based Vector Certificate Presets
const PRESET_BACKGROUNDS = [
  {
    id: 'royal_gold',
    name: 'الذهبي الملكي الملكي (Royal Gold)',
    theme: 'classic_gold',
    primaryColor: '#b45309', // gold amber
    accentColor: '#d97706',
    dataUri: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="1000" height="707" viewBox="0 0 1000 707">
        <rect width="1000" height="707" fill="#fbfaf5"/>
        <rect x="25" y="25" width="950" height="657" fill="none" stroke="#d97706" stroke-width="4"/>
        <rect x="35" y="35" width="930" height="637" fill="none" stroke="#b45309" stroke-width="1.5"/>
        <rect x="40" y="40" width="920" height="627" fill="none" stroke="#d97706" stroke-width="0.75" stroke-dasharray="8,4"/>
        <!-- Luxury Ornate Corners -->
        <path d="M 35 85 L 85 35 M 35 95 L 95 35 M 35 105 L 105 35" stroke="#d97706" stroke-width="1.5" fill="none"/>
        <path d="M 965 85 L 915 35 M 965 95 L 905 35 M 965 105 L 895 35" stroke="#d97706" stroke-width="1.5" fill="none"/>
        <path d="M 35 622 L 85 672 M 35 612 L 95 672 M 35 602 L 105 672" stroke="#d97706" stroke-width="1.5" fill="none"/>
        <path d="M 965 622 L 915 672 M 965 612 L 905 672 M 965 602 L 895 672" stroke="#d97706" stroke-width="1.5" fill="none"/>
        <!-- Starburst Watermark -->
        <circle cx="500" cy="353" r="160" fill="none" stroke="#d97706" stroke-width="1" opacity="0.06"/>
        <circle cx="500" cy="353" r="130" fill="none" stroke="#d97706" stroke-width="0.5" stroke-dasharray="4,2" opacity="0.08"/>
        <!-- Elegant Frame Accents -->
        <circle cx="500" cy="25" r="5" fill="#b45309"/>
        <circle cx="500" cy="682" r="5" fill="#b45309"/>
        <circle cx="25" cy="353" r="5" fill="#b45309"/>
        <circle cx="975" cy="353" r="5" fill="#b45309"/>
      </svg>
    `)}`
  },
  {
    id: 'academic_emerald',
    name: 'الزمردي الأكاديمي (Academic Emerald)',
    theme: 'royal_emerald',
    primaryColor: '#064e3b', // deep emerald
    accentColor: '#10b981',
    dataUri: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="1000" height="707" viewBox="0 0 1000 707">
        <rect width="1000" height="707" fill="#f8fafc"/>
        <!-- Solid outer emerald border -->
        <rect x="25" y="25" width="950" height="657" fill="none" stroke="#064e3b" stroke-width="10"/>
        <!-- Gold divider -->
        <rect x="40" y="40" width="920" height="627" fill="none" stroke="#d97706" stroke-width="2"/>
        <!-- Inner thin emerald line -->
        <rect x="48" y="48" width="904" height="611" fill="none" stroke="#064e3b" stroke-width="1" opacity="0.6"/>
        <!-- Luxury corner shields -->
        <rect x="20" y="20" width="45" height="45" fill="#d97706"/>
        <rect x="935" y="20" width="45" height="45" fill="#d97706"/>
        <rect x="20" y="642" width="45" height="45" fill="#d97706"/>
        <rect x="935" y="642" width="45" height="45" fill="#d97706"/>
        <!-- Inner gold accents on corners -->
        <circle cx="425" cy="353" r="100" fill="none" stroke="#d97706" stroke-width="1" opacity="0.03"/>
        <circle cx="575" cy="353" r="100" fill="none" stroke="#d97706" stroke-width="1" opacity="0.03"/>
      </svg>
    `)}`
  },
  {
    id: 'modern_sapphire',
    name: 'الماسي الأزرق العصري (Modern Sapphire)',
    theme: 'diamond_blue',
    primaryColor: '#1e3a8a', // royal blue
    accentColor: '#0ea5e9',
    dataUri: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="1000" height="707" viewBox="0 0 1000 707">
        <rect width="1000" height="707" fill="#fcfdfe"/>
        <rect x="30" y="30" width="940" height="647" fill="none" stroke="#1e3a8a" stroke-width="3" opacity="0.8"/>
        <rect x="40" y="40" width="920" height="627" fill="none" stroke="#0ea5e9" stroke-width="1" opacity="0.5"/>
        <!-- Modern Abstract Geometric corners -->
        <polygon points="0,0 220,0 0,220" fill="#1e3a8a" opacity="0.08"/>
        <polygon points="0,0 130,0 0,130" fill="#0ea5e9" opacity="0.15"/>
        <polygon points="1000,0 780,0 1000,220" fill="#1e3a8a" opacity="0.08"/>
        <polygon points="1000,0 870,0 1000,130" fill="#0ea5e9" opacity="0.15"/>
        <polygon points="0,707 220,707 0,487" fill="#1e3a8a" opacity="0.08"/>
        <polygon points="0,707 130,707 0,577" fill="#0ea5e9" opacity="0.15"/>
        <polygon points="1000,707 780,707 1000,487" fill="#1e3a8a" opacity="0.08"/>
        <polygon points="1000,707 870,707 1000,577" fill="#0ea5e9" opacity="0.15"/>
        <!-- Subtle tech grid watermark -->
        <circle cx="500" cy="353" r="140" fill="none" stroke="#1e3a8a" stroke-width="1" opacity="0.04" stroke-dasharray="5,5"/>
      </svg>
    `)}`
  }
];

const DEFAULT_FIELDS: VisualTemplateField[] = [
  { id: 'traineeName', label: 'اسم المتدرب', x: 50, y: 42, fontSize: 36, color: '#0f172a', fontFamily: 'Amiri, serif', textAlign: 'center', visible: true, width: 600 },
  { id: 'courseName', label: 'اسم الدورة التدريبية', x: 50, y: 56, fontSize: 28, color: '#b45309', fontFamily: 'Amiri, serif', textAlign: 'center', visible: true, width: 600 },
  { id: 'issueDate', label: 'تاريخ الإصدار', x: 25, y: 76, fontSize: 16, color: '#475569', fontFamily: 'sans-serif', textAlign: 'center', visible: true, width: 200 },
  { id: 'grade', label: 'التقدير العام', x: 50, y: 65, fontSize: 22, color: '#0f172a', fontFamily: 'Amiri, serif', textAlign: 'center', visible: true, width: 200 },
  { id: 'serialNo', label: 'الرقم المسلسل للتوثيق', x: 75, y: 15, fontSize: 13, color: '#475569', fontFamily: 'sans-serif', textAlign: 'center', visible: true, width: 250 },
  { id: 'trainerName', label: 'اسم المدرب المعتمد', x: 25, y: 84, fontSize: 15, color: '#334155', fontFamily: 'Amiri, serif', textAlign: 'center', visible: true, width: 200 },
  { id: 'branchName', label: 'فرع المركز الصادر منه', x: 50, y: 15, fontSize: 14, color: '#475569', fontFamily: 'Amiri, serif', textAlign: 'center', visible: true, width: 300 },
  { id: 'groupName', label: 'مجموعة المتدرب', x: 50, y: 76, fontSize: 14, color: '#475569', fontFamily: 'sans-serif', textAlign: 'center', visible: false, width: 200 },
  { id: 'courseHours', label: 'عدد الساعات التدريبية', x: 50, y: 49, fontSize: 16, color: '#475569', fontFamily: 'Amiri, serif', textAlign: 'center', visible: true, width: 500 },
  { id: 'qrCode', label: 'رمز الاستجابة السريع QR Code للتحقق', x: 75, y: 80, fontSize: 90, color: '#000000', fontFamily: 'sans-serif', visible: true, width: 90 },
];

export const CertificateTemplateBuilderModal: React.FC<CertificateTemplateBuilderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTemplate
}) => {
  const [template, setTemplate] = useState<Partial<CertificateTemplate>>({});
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.85);

  // AI Assistant States
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialTemplate) {
        setTemplate({
          ...initialTemplate,
          visualFields: initialTemplate.visualFields && initialTemplate.visualFields.length > 0 
            ? initialTemplate.visualFields 
            : DEFAULT_FIELDS
        });
      } else {
        // Set Default Preset Background on opening to prevent blank canvas
        const defaultPreset = PRESET_BACKGROUNDS[0];
        setTemplate({
          id: 'custom-' + Date.now(),
          name: 'قالب التميز الملكي الذهبي',
          theme: 'classic_gold',
          bgImageUrl: defaultPreset.dataUri,
          primaryColor: defaultPreset.primaryColor,
          accentColor: defaultPreset.accentColor,
          titleArabic: 'شهادة حضور وتفوق للبرنامج التدريبي',
          titleEnglish: 'Certificate of Achievement',
          subTitleArabic: 'يشهد مركز النجاح للتدريب والاستشارات بأن المتدرب قد أتم بنجاح متطلبات الدورة',
          bodyTemplate: 'بأن المتدرب أتم الدورة بنجاح وتفوق باهر',
          showQrCode: true,
          isCustomVisual: true,
          visualFields: DEFAULT_FIELDS,
        });
      }
      setSelectedFieldId(null);
      setAiFeedback(null);
      setAiError(null);
      setAiPrompt('');
    }
  }, [initialTemplate, isOpen]);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTemplate(prev => ({
          ...prev,
          bgImageUrl: reader.result as string,
          theme: 'custom_uploaded'
        }));
        setAiFeedback('تم رفع صورة الخلفية الخاصة بك بنجاح! 📸');
      };
      reader.readAsDataURL(file);
    }
  };

  const selectPreset = (preset: typeof PRESET_BACKGROUNDS[0]) => {
    setTemplate(prev => {
      // Co-ordinate colors of standard fields to match the preset themes!
      const updatedFields = prev.visualFields?.map(f => {
        if (f.id === 'courseName' || f.id === 'grade') {
          return { ...f, color: preset.primaryColor };
        }
        return f;
      }) || DEFAULT_FIELDS;

      return {
        ...prev,
        theme: preset.theme as any,
        bgImageUrl: preset.dataUri,
        primaryColor: preset.primaryColor,
        accentColor: preset.accentColor,
        visualFields: updatedFields
      };
    });
    setAiFeedback(`تم تطبيق قالب "${preset.name}" بنجاح! 🎨`);
  };

  const updateField = (fieldId: string, updates: Partial<VisualTemplateField>) => {
    setTemplate(prev => ({
      ...prev,
      visualFields: prev.visualFields?.map(f => (f.id === fieldId ? { ...f, ...updates } : f))
    }));
  };

  const selectedField = template.visualFields?.find(f => f.id === selectedFieldId);

  const handlePointerDown = (e: React.PointerEvent, field: VisualTemplateField) => {
    if (!containerRef.current) return;
    e.stopPropagation();
    e.preventDefault();
    setSelectedFieldId(field.id);
    
    const rect = containerRef.current.getBoundingClientRect();
    const xPx = (field.x / 100) * rect.width;
    const yPx = (field.y / 100) * rect.height;

    setDragOffset({
      x: e.clientX - rect.left - xPx,
      y: e.clientY - rect.top - yPx
    });
    setIsDragging(true);
    
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !selectedFieldId || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    let newXPx = e.clientX - rect.left - dragOffset.x;
    let newYPx = e.clientY - rect.top - dragOffset.y;

    // Constrain within bounds of 0 - 100%
    newXPx = Math.max(0, Math.min(newXPx, rect.width));
    newYPx = Math.max(0, Math.min(newYPx, rect.height));

    const newX = (newXPx / rect.width) * 100;
    const newY = (newYPx / rect.height) * 100;

    updateField(selectedFieldId, { x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (err) {}
  };

  const handleSave = () => {
    if (!template.name) {
      alert('يرجى إدخال اسم القالب أولاً');
      return;
    }
    if (!template.bgImageUrl) {
      alert('يرجى رفع أو اختيار خلفية للشهادة');
      return;
    }
    onSave(template as CertificateTemplate);
  };

  const handleAiDesign = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    setAiFeedback(null);
    setAiError(null);

    try {
      const response = await fetch('/api/ai/design-certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visualFields: template.visualFields,
          userPrompt: aiPrompt,
          templateName: template.name
        })
      });

      const data = await response.json();
      if (data.success) {
        setTemplate(prev => {
          const updated: Partial<CertificateTemplate> = { ...prev };
          if (data.visualFields) updated.visualFields = data.visualFields;
          if (data.name) updated.name = data.name;
          if (data.primaryColor) updated.primaryColor = data.primaryColor;
          if (data.accentColor) updated.accentColor = data.accentColor;
          return updated;
        });
        setAiFeedback(data.feedback || 'تم تطبيق تعديلات التصميم الذكية بنجاح! 🚀✨');
        setAiPrompt('');
      } else {
        setAiError(data.error || 'عذراً، لم يتمكن الذكاء الاصطناعي من معالجة التصميم بشكل صحيح.');
      }
    } catch (err: any) {
      console.error(err);
      setAiError('فشل الاتصال بخادم الذكاء الاصطناعي، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const renderFieldMockup = (field: VisualTemplateField) => {
    if (field.id === 'qrCode') {
      return (
        <div 
          className="border-2 border-slate-900 bg-white flex flex-col items-center justify-center p-1 font-sans text-slate-800"
          style={{ width: `${field.fontSize}px`, height: `${field.fontSize}px`, fontSize: `${Math.max(8, field.fontSize / 7)}px` }}
        >
          <div className="w-full h-full border border-slate-800 flex flex-wrap p-0.5 opacity-85">
            <div className="w-1/3 h-1/3 border border-slate-800 bg-slate-900"></div>
            <div className="w-1/3 h-1/3"></div>
            <div className="w-1/3 h-1/3 border border-slate-800 bg-slate-900"></div>
            <div className="w-1/3 h-1/3"></div>
            <div className="w-1/3 h-1/3 border border-slate-800 bg-slate-900"></div>
            <div className="w-1/3 h-1/3"></div>
            <div className="w-1/3 h-1/3 border border-slate-800 bg-slate-900"></div>
            <div className="w-1/3 h-1/3"></div>
            <div className="w-1/3 h-1/3 bg-slate-900"></div>
          </div>
        </div>
      );
    }
    return <span className="px-1 py-0.5 whitespace-nowrap">{field.label}</span>;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 rtl">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-7xl h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 shrink-0 bg-slate-900/90">
          <div>
            <h2 className="text-md lg:text-lg font-black text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              أداة تصميم وتنسيق الشهادات بالذكاء الاصطناعي (AI Studio)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              قم باختيار قالب، تحريك العناصر بالسحب، أو اطلب من الذكاء الاصطناعي تعديل التصميم فوراً!
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-800 rounded-xl p-1 shadow-sm border border-slate-700">
              <button 
                onClick={() => setZoom(z => Math.max(0.4, z - 0.1))} 
                className="w-7 h-7 flex items-center justify-center hover:bg-slate-700 rounded-lg text-slate-300 transition-colors font-bold" 
                title="تصغير"
              >
                -
              </button>
              <span className="text-xs text-slate-300 font-bold w-12 text-center">{Math.round(zoom * 100)}%</span>
              <button 
                onClick={() => setZoom(z => Math.min(1.5, z + 0.1))} 
                className="w-7 h-7 flex items-center justify-center hover:bg-slate-700 rounded-lg text-slate-300 transition-colors font-bold" 
                title="تكبير"
              >
                +
              </button>
            </div>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2 rounded-xl font-black text-xs transition-all shadow-lg"
            >
              <Save className="w-4 h-4" />
              حفظ وتطبيق القالب
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Workspace Grid */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          
          {/* Properties Sidebar (Right) */}
          <div className="w-80 border-l border-slate-800 bg-slate-900/60 overflow-y-auto p-4 space-y-5 flex flex-col shrink-0">
            
            {/* AI Assistant Panel */}
            <div className="bg-slate-800/80 border border-indigo-500/20 rounded-xl p-4 space-y-3 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none"></div>
              <h3 className="font-bold text-xs text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                المصمم الذكي (AI Certificate Designer)
              </h3>
              
              <div className="space-y-2">
                <p className="text-[10px] text-slate-400">
                  اطلب أي تعديل وسيقوم الذكاء الاصطناعي بتنفيذه وتعديل الألوان والمواضع والخطوط:
                </p>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="مثال: اجعل اسم المتدرب باللون الأخضر وبخط Amiri وحجم 50، وضع رمز الـ QR بالأسفل على اليمين..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none outline-none"
                />
                
                <button
                  type="button"
                  disabled={isAiLoading || !aiPrompt.trim()}
                  onClick={handleAiDesign}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-lg text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  {isAiLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>جاري التنسيق والتصميم...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>تنسيق بالذكاء الاصطناعي ✨</span>
                    </>
                  )}
                </button>
              </div>

              {/* Feedback Message */}
              {aiFeedback && (
                <div className="flex gap-1.5 items-start bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-lg text-[11px] text-emerald-300 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p>{aiFeedback}</p>
                </div>
              )}

              {/* Error Message */}
              {aiError && (
                <div className="flex gap-1.5 items-start bg-rose-500/10 border border-rose-500/30 p-2.5 rounded-lg text-[11px] text-rose-300 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <p>{aiError}</p>
                </div>
              )}
            </div>

            {/* General Settings */}
            <div className="space-y-3.5">
              <h3 className="font-bold text-xs text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-1.5">
                <span className="w-1.5 h-3 bg-amber-500 rounded-full"></span>
                إعدادات القالب الأساسية
              </h3>
              
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">اسم قالب الشهادة *</label>
                <input
                  type="text"
                  value={template.name || ''}
                  onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  placeholder="مثال: نموذج تقدير وتفوق 2026"
                />
              </div>

              {/* Premium Preset backgrounds selection */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1.5">اختر خلفية مسبقة الصنع أو ارفع صورتك:</label>
                <div className="grid grid-cols-1 gap-2">
                  {PRESET_BACKGROUNDS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => selectPreset(preset)}
                      className={`flex items-center justify-between p-2 rounded-lg text-[11px] text-right font-semibold border transition-all ${
                        template.theme === preset.theme
                          ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                      }`}
                    >
                      <span>{preset.name}</span>
                      <div 
                        className="w-3.5 h-3.5 rounded-full border border-white/20"
                        style={{ backgroundColor: preset.primaryColor }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom background uploader */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">أو ارفع خلفية خاصة بمركزك (أبعاد A4 عرضية):</label>
                <label className="w-full flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-800 hover:border-amber-500 rounded-xl cursor-pointer bg-slate-950/20 hover:bg-slate-950/50 transition-all text-center">
                  <Upload className="w-5 h-5 text-slate-500 mb-1" />
                  <span className="text-[10px] text-slate-400">
                    {template.theme === 'custom_uploaded' ? 'تغيير صورة الخلفية الخاصة بك' : 'ارفع صورة القالب الخاصة بك'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Elements List / Selector */}
            <div className="space-y-2.5">
              <h3 className="font-bold text-xs text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-1.5">
                <span className="w-1.5 h-3 bg-blue-500 rounded-full"></span>
                عناصر الشهادة ومواضعها
              </h3>
              <div className="grid grid-cols-2 gap-1.5">
                {template.visualFields?.map(field => {
                  const isSelected = selectedFieldId === field.id;
                  return (
                    <button
                      key={field.id}
                      type="button"
                      onClick={() => {
                        updateField(field.id, { visible: !field.visible });
                        if (!field.visible) {
                          setSelectedFieldId(field.id);
                        }
                      }}
                      className={`flex items-center gap-1.5 text-right p-1.5 rounded-lg border text-[10px] transition-all justify-between ${
                        field.visible
                          ? isSelected
                            ? 'bg-blue-500/20 border-blue-500 text-blue-300 font-bold'
                            : 'bg-slate-800 border-slate-700 text-slate-200'
                          : 'bg-slate-950/30 border-slate-900 text-slate-500 opacity-60'
                      }`}
                    >
                      <span className="truncate">{field.label}</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${field.visible ? 'bg-emerald-500' : 'bg-slate-600'}`}></span>
                    </button>
                  );
                })}
              </div>
              
              <button
                type="button"
                onClick={() => {
                  const customId = 'customField_' + Date.now();
                  const newField: VisualTemplateField = {
                    id: customId,
                    label: 'نص مخصص جديد',
                    x: 50,
                    y: 50,
                    fontSize: 20,
                    color: '#0f172a',
                    fontFamily: 'Amiri, serif',
                    textAlign: 'center',
                    visible: true,
                    width: 300,
                  };
                  setTemplate(prev => ({
                    ...prev,
                    visualFields: [...(prev.visualFields || []), newField]
                  }));
                  setSelectedFieldId(customId);
                  setAiFeedback('تم إضافة عنصر مخصص جديد! يمكنك الآن تعديل نصه وتغيير مكانه بالسحب 🌟');
                }}
                className="w-full mt-2 py-2 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 hover:text-white rounded-lg border border-indigo-500/30 text-[10px] font-bold transition-all flex items-center justify-center gap-1 active:scale-95 duration-150"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة عنصر مخصص جديد +</span>
              </button>
            </div>

            {/* Selected Element Properties Editor */}
            {selectedField && (
              <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3.5 space-y-3 animate-fadeIn shrink-0">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <h4 className="font-bold text-xs text-amber-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    تعديل عنصر: {selectedField.label}
                  </h4>
                  <button 
                    onClick={() => setSelectedFieldId(null)}
                    className="text-slate-400 hover:text-white text-[10px]"
                  >
                    إغلاق
                  </button>
                </div>
                
                {selectedField.id !== 'qrCode' ? (
                  <div className="space-y-3 text-[11px]">
                    <div>
                      <span className="text-slate-400 block mb-1">محتوى النص / التسمية:</span>
                      <input
                        type="text"
                        value={selectedField.label || ''}
                        onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                        placeholder="أدخل النص المراد كتابته..."
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-400">حجم الخط:</span>
                        <span className="font-mono text-slate-200 font-bold">{selectedField.fontSize}px</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="80"
                        value={selectedField.fontSize}
                        onChange={(e) => updateField(selectedField.id, { fontSize: parseInt(e.target.value) })}
                        className="w-full accent-amber-500 h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-1">لون النص:</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={selectedField.color}
                          onChange={(e) => updateField(selectedField.id, { color: e.target.value })}
                          className="w-7 h-7 p-0.5 bg-slate-950 border border-slate-700 rounded cursor-pointer shrink-0"
                        />
                        <input
                          type="text"
                          value={selectedField.color}
                          onChange={(e) => updateField(selectedField.id, { color: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-center font-mono text-[10px] text-slate-300"
                        />
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-1">نوع ومظهر الخط:</span>
                      <select
                        value={selectedField.fontFamily}
                        onChange={(e) => updateField(selectedField.id, { fontFamily: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200"
                      >
                        <option value="Amiri, serif">Amiri (خط عربي كلاسيكي فاخر)</option>
                        <option value="Cairo, sans-serif">Cairo (خط عربي عصري مريح)</option>
                        <option value="Tajawal, sans-serif">Tajawal (خط عربي هندسي متناسق)</option>
                        <option value="sans-serif">Sans-Serif (خط إنجليزي بسيط)</option>
                        <option value="serif">Serif (خط إنجليزي كلاسيكي)</option>
                      </select>
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-1">محاذاة النص:</span>
                      <div className="flex bg-slate-950 rounded-lg p-0.5 border border-slate-800">
                        <button
                          type="button"
                          onClick={() => updateField(selectedField.id, { textAlign: 'right' })}
                          className={`flex-1 flex justify-center p-1 rounded transition-colors ${selectedField.textAlign === 'right' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                          <AlignRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => updateField(selectedField.id, { textAlign: 'center' })}
                          className={`flex-1 flex justify-center p-1 rounded transition-colors ${selectedField.textAlign === 'center' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                          <AlignCenter className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => updateField(selectedField.id, { textAlign: 'left' })}
                          className={`flex-1 flex justify-center p-1 rounded transition-colors ${selectedField.textAlign === 'left' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                          <AlignLeft className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 text-[11px]">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-400">حجم رمز الـ QR:</span>
                        <span className="font-mono text-slate-200 font-bold">{selectedField.fontSize}px</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="200"
                        value={selectedField.fontSize}
                        onChange={(e) => updateField(selectedField.id, { fontSize: parseInt(e.target.value), width: parseInt(e.target.value) })}
                        className="w-full accent-amber-500 h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {selectedField.id.startsWith('customField') && (
                  <div className="pt-2.5 border-t border-slate-850">
                    <button
                      type="button"
                      onClick={() => {
                        setTemplate(prev => ({
                          ...prev,
                          visualFields: prev.visualFields?.filter(f => f.id !== selectedField.id)
                        }));
                        setSelectedFieldId(null);
                        setAiFeedback('تم حذف العنصر المخصص بنجاح 🗑️');
                      }}
                      className="w-full py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-white border border-rose-500/30 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 active:scale-95 duration-150"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف هذا العنصر المخصص</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Canvas Area (Center) */}
          <div className="flex-1 bg-slate-950 relative overflow-hidden flex flex-col items-center p-4">
            
            {/* Legend / Tip */}
            <div className="w-full max-w-4xl flex items-center justify-between mb-4 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs">
              <span className="text-slate-400 flex items-center gap-1">
                <Move className="w-3.5 h-3.5 text-indigo-400" />
                <span>اسحب أي عنصر لتغيير مكانه، أو اضغط عليه لتعديل حجمه ولونه وخطه.</span>
              </span>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setTemplate(prev => ({ ...prev, visualFields: DEFAULT_FIELDS }));
                    setAiFeedback('تم إعادة تعيين الحقول والمواضع الافتراضية بنجاح 🔄');
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
                >
                  <RotateCcw className="w-3 h-3 text-slate-400" />
                  <span>إعادة تعيين</span>
                </button>
              </div>
            </div>

            {/* Design canvas wrap */}
            <div className="flex-1 w-full overflow-auto flex items-center justify-center min-h-0">
              <div 
                className="relative bg-slate-900 border border-slate-800 shadow-2xl transition-all duration-200" 
                style={{ 
                  width: `${1000 * zoom}px`, 
                  height: `${707 * zoom}px` 
                }}
              >
                {/* The Absolute Positioned Scaling Frame */}
                <div 
                  className="absolute top-0 left-0" 
                  style={{ 
                    transform: `scale(${zoom})`, 
                    transformOrigin: 'top left',
                    width: '1000px',
                    height: '707px'
                  }}
                >
                  {/* Visual Canvas Container */}
                  <div 
                    ref={containerRef}
                    className="relative bg-white select-none shadow-2xl overflow-hidden w-full h-full"
                    style={{ 
                      backgroundImage: template.bgImageUrl ? `url(${template.bgImageUrl})` : 'none',
                      backgroundSize: '100% 100%',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                    }}
                    onPointerMove={isDragging ? handlePointerMove : undefined}
                    onPointerUp={isDragging ? handlePointerUp : undefined}
                    onPointerLeave={isDragging ? handlePointerUp : undefined}
                  >
                    {template.visualFields?.filter(f => f.visible).map(field => {
                      const isSelected = selectedFieldId === field.id;
                      return (
                        <div
                          key={field.id}
                          onPointerDown={(e) => handlePointerDown(e, field)}
                          className={`absolute cursor-move select-none rounded p-1 group transition-shadow ${
                            isSelected 
                              ? 'ring-2 ring-indigo-500 ring-offset-2 z-50' 
                              : 'hover:ring-1 hover:ring-amber-500/70 hover:ring-offset-1 z-10'
                          }`}
                          style={{
                            left: `${field.x}%`,
                            top: `${field.y}%`,
                            transform: 'translate(-50%, -50%)',
                            width: field.width ? `${field.width}px` : 'auto',
                            color: field.color,
                            fontSize: `${field.fontSize}px`,
                            fontFamily: field.fontFamily,
                            textAlign: field.textAlign || 'center',
                            lineHeight: 1.2
                          }}
                        >
                          {/* Pointer handle indicator */}
                          <div className={`absolute -top-3.5 -right-3.5 w-6 h-6 bg-indigo-600 text-white rounded-full items-center justify-center shadow z-20 ${
                            isSelected ? 'flex' : 'hidden group-hover:flex'
                          }`}>
                            <Move className="w-3 h-3" />
                          </div>
                          
                          {/* Rendering field mockup content */}
                          {renderFieldMockup(field)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
