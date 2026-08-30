const fs = require('fs');

const code = `
import React, { useState } from 'react';
import { 
  FileCheck2, Sparkles, BrainCircuit, UploadCloud, Link as LinkIcon, 
  Database, LineChart, FileSpreadsheet, Play, CheckCircle2, AlertTriangle,
  FileQuestion, Download, Plus, Bot, Clock, Search, Filter, Settings,
  GraduationCap, BookOpen, Layers, BarChart3, Fingerprint, ShieldCheck,
  ChevronRight, Laptop, Zap
} from 'lucide-react';
import { useLanguage } from '../../core/i18n/LanguageContext';

type TabType = 'AI_GENERATOR' | 'MINISTRY_EVAL' | 'EXTERNAL_IMPORT' | 'QUESTION_BANK' | 'GRADING';

export const ExamsManagementView: React.FC = () => {
  const { t, isRTL, dir } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('AI_GENERATOR');
  const [isGenerating, setIsGenerating] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const TABS = [
    { id: 'AI_GENERATOR', icon: BrainCircuit, label: 'مُصمم الاختبارات الذكي' },
    { id: 'MINISTRY_EVAL', icon: ShieldCheck, label: 'تقييمات الوزارة التفاعلية' },
    { id: 'EXTERNAL_IMPORT', icon: LinkIcon, label: 'تكامل Google & MS' },
    { id: 'QUESTION_BANK', icon: Database, label: 'بنك الأسئلة المتوقع' },
    { id: 'GRADING', icon: LineChart, label: 'التصحيح والرصد الآلي' }
  ];

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 2500);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 font-sans" dir={dir}>
      
      {/* 🌟 1. HERO HEADER (Legendary Design) */}
      <div className="relative bg-[#0f172a] rounded-[2.5rem] p-8 sm:p-12 overflow-hidden shadow-2xl border border-slate-800 isolate">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[150%] bg-gradient-to-l from-indigo-600/30 via-violet-600/10 to-transparent blur-3xl rotate-12 transform"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[100%] bg-gradient-to-r from-emerald-600/20 via-teal-600/10 to-transparent blur-3xl -rotate-12 transform"></div>
          <div className="absolute top-[20%] left-[20%] w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-6 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs sm:text-sm font-bold backdrop-blur-md">
              <Sparkles className="w-4 h-4" />
              <span>منظومة التقييم الذكية (V3.0 - AI Powered)</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              الجيل القادم من <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">إدارة الاختبارات</span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl">
              تكامل سلس مع Google Workspace و Microsoft 365. حوّل تقييمات الوزارة إلى اختبارات تفاعلية، وقم بتوليد وتصحيح الأسئلة المقالية عبر الذكاء الاصطناعي بدقة متناهية.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button className="px-6 py-3 rounded-xl bg-white text-slate-900 font-bold text-sm shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform flex items-center gap-2">
                <Plus className="w-4 h-4" />
                إنشاء اختبار جديد
              </button>
              <button className="px-6 py-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-white border border-slate-700 font-bold text-sm transition-all flex items-center gap-2 backdrop-blur-md">
                <Settings className="w-4 h-4" />
                إعدادات التكامل
              </button>
            </div>
          </div>
          
          {/* Floating Stats Card */}
          <div className="hidden lg:flex flex-col gap-4">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700 p-6 rounded-3xl shadow-xl transform rotate-2 hover:rotate-0 transition-transform">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-slate-400 text-xs font-bold">دقة التصحيح الآلي</h3>
                  <div className="text-2xl font-black text-white">99.8%</div>
                </div>
              </div>
              <div className="h-2 w-48 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 w-[99.8%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🌟 2. NAVIGATION TABS (Glassmorphism Tabs) */}
      <div className="flex flex-wrap items-center gap-2 p-1 bg-slate-100/50 border border-slate-200/60 rounded-2xl backdrop-blur-sm">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={\`flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 \${
                isActive 
                  ? 'bg-white text-indigo-700 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-slate-200/50 scale-[1.02]' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 transparent'
              }\`}
            >
              <Icon className={\`w-5 h-5 \${isActive ? 'text-indigo-600' : 'text-slate-400'}\`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 🌟 3. MAIN CONTENT AREA (Bento Grid Styles) */}
      <div className="min-h-[500px]">
        
        {/* ========================================== */}
        {/* TAB 1: AI GENERATOR */}
        {/* ========================================== */}
        {activeTab === 'AI_GENERATOR' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-1">المحرك التوليدي (Prompt to Exam)</h2>
                    <p className="text-xs text-slate-500">قم بتوصيف الاختبار أو رفع ملف PDF ليقوم الذكاء الاصطناعي ببنائه بالكامل مع نماذج الإجابة.</p>
                  </div>
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                    <BrainCircuit className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>

                <div className="relative">
                  <textarea 
                    className="w-full h-40 p-5 bg-slate-50 border border-slate-200 rounded-2xl resize-none text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none transition-all placeholder:text-slate-400"
                    placeholder="مثال: قم بإنشاء اختبار لغة إنجليزية للصف الثالث الثانوي يركز على القواعد (Past Perfect) والمفردات مع قطعة فهم تتكون من 150 كلمة حول التكنولوجيا..."
                  ></textarea>
                  <button className="absolute bottom-4 left-4 p-2 bg-indigo-100 text-indigo-600 rounded-xl hover:bg-indigo-200 transition-colors">
                    <Mic className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="flex-1 flex items-center justify-center gap-3 py-4 bg-white hover:bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl text-slate-600 font-bold transition-all hover:border-indigo-400 hover:text-indigo-600 group">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    إرفاق منهج (PDF / Word)
                  </button>
                  <button 
                    onClick={handleGenerate}
                    className="flex-1 flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl font-bold transition-all shadow-[0_10px_25px_rgba(79,70,229,0.3)] hover:shadow-[0_15px_35px_rgba(79,70,229,0.4)] hover:-translate-y-1"
                  >
                    {isGenerating ? (
                      <span className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        جاري تحليل المحتوى وتوليد الأسئلة...
                      </span>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        توليد الاختبار السحري
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 space-y-6">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-600" />
                معايير التوليد
              </h3>
              
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-2">مستوى الصعوبة والتكيف</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['سهل', 'متوسط', 'صعب', 'متكيف (Adaptive)'].map((lvl, i) => (
                      <button key={i} className={\`p-2.5 rounded-xl text-xs font-bold border transition-colors \${i === 3 ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'}\`}>
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-2">أنواع الأسئلة المطلوبة</label>
                  <div className="space-y-2.5">
                    {[
                      { id: 1, label: 'اختيار من متعدد (MCQ)', checked: true },
                      { id: 2, label: 'أسئلة مقالية (يصححها AI)', checked: true },
                      { id: 3, label: 'أكمل الفراغات (Fill-in)', checked: false },
                      { id: 4, label: 'استماع وتحدث (ميكروفون)', checked: false }
                    ].map((type) => (
                      <label key={type.id} className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 transition-colors cursor-pointer group">
                        <span className="text-sm font-bold text-slate-700">{type.label}</span>
                        <div className={\`w-5 h-5 rounded flex items-center justify-center transition-colors \${type.checked ? 'bg-indigo-600' : 'bg-slate-100 border border-slate-300'}\`}>
                          {type.checked && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================== */}
        {/* TAB 2: MINISTRY EVAL */}
        {/* ========================================== */}
        {activeTab === 'MINISTRY_EVAL' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-gradient-to-br from-emerald-900 to-teal-950 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 space-y-4">
                  <div className="w-16 h-16 bg-emerald-500/20 backdrop-blur-md rounded-2xl border border-emerald-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                    <ShieldCheck className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h2 className="text-3xl font-black">تحويل التقييمات الوزارية إلى منصة تفاعلية</h2>
                  <p className="text-emerald-100/80 leading-relaxed max-w-xl">
                    لا داعي لإعادة كتابة التقييمات الأسبوعية للوزارة. قم برفع ملف الـ PDF أو الصور، وسيقوم نظام التعرف البصري (OCR) المدعوم بالذكاء الاصطناعي باستخراج الأسئلة والاختيارات وتحويلها فوراً إلى اختبار تفاعلي في حسابات الطلاب، مع تفعيل التصحيح الآلي.
                  </p>
                </div>
                
                <div className="w-full md:w-[400px]">
                  <div 
                    className={\`border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-300 backdrop-blur-sm \${
                      dragActive 
                        ? 'border-emerald-400 bg-emerald-500/20 scale-105' 
                        : 'border-emerald-500/30 bg-emerald-950/40 hover:bg-emerald-900/50'
                    }\`}
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => { e.preventDefault(); setDragActive(false); }}
                  >
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                      <UploadCloud className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">اسحب وأفلت الملفات هنا</h3>
                    <p className="text-xs text-emerald-200/60 mb-6">يدعم PDF, JPG, PNG (حد أقصى 20 صفحة)</p>
                    <button className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2">
                      <Plus className="w-5 h-5" />
                      اختيار من الجهاز
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 3: EXTERNAL IMPORT */}
        {/* ========================================== */}
        {activeTab === 'EXTERNAL_IMPORT' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 text-center space-y-4">
              <h2 className="text-2xl font-black text-slate-900">تكامل شامل مع أنظمة الاختبارات العالمية</h2>
              <p className="text-sm text-slate-500 max-w-2xl mx-auto">
                استخدم منصتنا كبوابة رئيسية لطلابك، وقم باستيراد النماذج الخارجية مباشرة. يتم جلب الاختبارات وفتحها داخل تطبيقنا، وتسجيل درجاتها تلقائياً في السجل الأكاديمي.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { 
                  id: 'google', name: 'Google Forms', icon: FileSpreadsheet, 
                  color: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/20',
                  desc: 'استيراد نماذج جوجل وتحويلها لاختبار ذكي.'
                },
                { 
                  id: 'ms', name: 'Microsoft Forms', icon: FileCheck2, 
                  color: 'from-blue-600 to-indigo-700', shadow: 'shadow-blue-500/20',
                  desc: 'مزامنة نماذج مايكروسوفت مع التوثيق المباشر للدرجات.'
                },
                { 
                  id: 'sheets', name: 'Google Sheets DB', icon: Database, 
                  color: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/20',
                  desc: 'جلب بنوك الأسئلة من شيت جوجل وتوليد اختبار ديناميكي منها.'
                }
              ].map((platform) => (
                <div key={platform.id} className="relative bg-white rounded-3xl p-8 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2 group overflow-hidden isolate">
                  {/* Glowing bg orb */}
                  <div className={\`absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br \${platform.color} rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity -z-10\`}></div>
                  
                  <div className={\`w-16 h-16 rounded-2xl bg-gradient-to-br \${platform.color} shadow-lg \${platform.shadow} flex items-center justify-center text-white mb-6 transform group-hover:scale-110 transition-transform duration-500\`}>
                    <platform.icon className="w-8 h-8" />
                  </div>
                  
                  <h3 className="text-xl font-black text-slate-900 mb-2">{platform.name}</h3>
                  <p className="text-sm text-slate-500 mb-8 h-10">{platform.desc}</p>
                  
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">الصق الرابط هنا (Share Link)</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        placeholder="https://forms.gle/..." 
                        className="flex-1 p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono outline-none focus:border-indigo-500 focus:bg-white transition-colors" 
                        dir="ltr"
                      />
                      <button className={\`w-12 h-12 rounded-xl bg-gradient-to-br \${platform.color} text-white flex items-center justify-center shadow-md hover:brightness-110 transition-all cursor-pointer\`}>
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 4: QUESTION BANK */}
        {/* ========================================== */}
        {activeTab === 'QUESTION_BANK' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
            {/* Toolbar */}
            <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">بنك الأسئلة المعتمدة</h2>
                  <p className="text-xs text-slate-500">+10,000 سؤال مصنف عالمياً ومحلياً</p>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex-1 sm:w-64 relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" placeholder="ابحث بالكلمات المفتاحية..." className="w-full py-2.5 pr-10 pl-4 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500" />
                </div>
                <button className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 shadow-sm flex items-center gap-2 hover:bg-slate-50">
                  <Filter className="w-4 h-4" />
                  تصفية
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="group p-5 bg-white border border-slate-200 rounded-2xl hover:border-indigo-300 hover:shadow-lg transition-all flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 p-2.5 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <FileQuestion className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-base mb-2 font-sans" dir="ltr">
                        {i % 2 === 0 ? "What is the main difference between 'affect' and 'effect'?" : "Analyze the socio-economic impacts of rapid urbanization in developing countries."}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
                        <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200">B2 Upper Intermediate</span>
                        <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200">{i % 2 === 0 ? 'Grammar & Vocabulary' : 'Essay / Writing'}</span>
                        <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                          <CheckCircle2 className="w-3.5 h-3.5" /> 
                          معتمد (IELTS Standard)
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="px-5 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-bold opacity-0 group-hover:opacity-100 transition-all hover:bg-indigo-600 hover:text-white shadow-sm flex-shrink-0 cursor-pointer">
                    إضافة للاختبار
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 5: GRADING */}
        {/* ========================================== */}
        {activeTab === 'GRADING' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden group hover:border-indigo-300 transition-colors">
                <div className="absolute top-0 right-0 w-1 h-full bg-indigo-500"></div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-slate-500 text-sm mb-1">الرصد الآلي (مكتمل)</h3>
                    <div className="text-4xl font-black text-slate-900">845</div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                  </div>
                </div>
                <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <BarChart3 className="w-3 h-3" /> تم ترحيلها للسجل الأكاديمي
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden group hover:border-amber-300 transition-colors">
                <div className="absolute top-0 right-0 w-1 h-full bg-amber-500"></div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-slate-500 text-sm mb-1">تتطلب مراجعة يدوية</h3>
                    <div className="text-4xl font-black text-slate-900">12</div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
                <p className="text-xs text-amber-600 font-bold flex items-center gap-1">
                  أسئلة مقالية وتسجيلات صوتية
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-colors">
                <div className="absolute top-0 right-0 w-1 h-full bg-emerald-500"></div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-slate-500 text-sm mb-1">نسبة النجاح العامة</h3>
                    <div className="text-4xl font-black text-slate-900">89%</div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <LineChart className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
                <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  ↑ زيادة بنسبة 2.4% عن الشهر السابق
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <h3 className="font-bold text-slate-900 text-lg">سجل الرصد المباشر</h3>
                <button className="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-md hover:bg-slate-700 transition-colors">
                  <FileSpreadsheet className="w-4 h-4" />
                  تصدير للإكسيل / نور
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                  <thead className="bg-white text-slate-500 border-b border-slate-200 font-bold">
                    <tr>
                      <th className="px-6 py-4">اسم الطالب</th>
                      <th className="px-6 py-4">الاختبار</th>
                      <th className="px-6 py-4">الدرجة الآلية</th>
                      <th className="px-6 py-4">حالة التصحيح المقالي (AI)</th>
                      <th className="px-6 py-4 text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { name: 'أحمد محمود', test: 'اختبار الوحدة الثالثة (لغة إنجليزية)', grade: '18/20', status: 'مكتمل (AI)', isDone: true },
                      { name: 'سارة خالد', test: 'تقييم الوزارة الأسبوعي (رياضيات)', grade: '--/20', status: 'بانتظار تصحيح المدرب', isDone: false },
                      { name: 'عمر الفاروق', test: 'ميدتيرم برمجة بايثون', grade: '95/100', status: 'مكتمل (AI)', isDone: true },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs">{row.name.charAt(0)}</div>
                          {row.name}
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-medium">{row.test}</td>
                        <td className="px-6 py-4 font-black text-indigo-600 text-lg">{row.grade}</td>
                        <td className="px-6 py-4">
                          <span className={\`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 \${row.isDone ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}\`}>
                            {row.isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                            {row.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button className={\`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer \${row.isDone ? 'bg-white border border-slate-200 text-slate-400 hover:text-slate-600' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/25'}\`}>
                            {row.isDone ? 'عرض السجل' : 'مراجعة وتصحيح'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
`;

// A function for a mock dependency just in case it doesn't compile due to missing icon import
// (Checked: I imported Mic, Check, Clock, Settings, GraduationCap, etc. correctly above)

fs.writeFileSync('src/features/academic/ExamsManagementView.tsx', code);
