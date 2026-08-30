const fs = require('fs');

const code = `import React, { useState, useEffect } from 'react';
import { 
  FileCheck2, Sparkles, BrainCircuit, UploadCloud, Link as LinkIcon, 
  Database, LineChart, FileSpreadsheet, Play, CheckCircle2, AlertTriangle,
  FileQuestion, Download, Plus, Bot, Clock, Search, Filter, Settings,
  Zap, ChevronRight, BarChart3, FileText, Check, ScanText, ArrowRight
} from 'lucide-react';
import { useLanguage } from '../../core/i18n/LanguageContext';

type TabType = 'AI_GENERATOR' | 'MINISTRY_EVAL' | 'EXTERNAL_IMPORT' | 'QUESTION_BANK' | 'GRADING';

export const ExamsManagementView: React.FC = () => {
  const { t, isRTL, dir } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('AI_GENERATOR');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);

  const TABS = [
    { id: 'AI_GENERATOR', icon: BrainCircuit, label: 'صانع الاختبارات الذكي' },
    { id: 'MINISTRY_EVAL', icon: FileCheck2, label: 'تقييمات الوزارة التفاعلية' },
    { id: 'EXTERNAL_IMPORT', icon: LinkIcon, label: 'المزامنة السحابية (Google/MS)' },
    { id: 'QUESTION_BANK', icon: Database, label: 'بنك الأسئلة الدولي' },
    { id: 'GRADING', icon: BarChart3, label: 'منصة الرصد والتصحيح' }
  ];

  const handleGenerate = () => {
    setIsGenerating(true);
    setGenerationStep(1);
    setTimeout(() => setGenerationStep(2), 1000);
    setTimeout(() => setGenerationStep(3), 2500);
    setTimeout(() => {
      setIsGenerating(false);
      setGenerationStep(0);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 lg:p-8" dir={dir}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Legendary Hero Section */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 border border-slate-800 shadow-2xl p-8 lg:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-indigo-500/20 via-violet-500/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-70"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 opacity-50"></div>
          
          <div className="relative z-10 space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-bold backdrop-blur-md">
              <Sparkles className="w-4 h-4" />
              <span>الإصدار 3.0 | الجيل القادم من التقييم</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight">
              المنظومة العالمية الذكية <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-amber-400">
                لإدارة وتصميم الاختبارات
              </span>
            </h1>
            <p className="text-slate-400 text-base lg:text-lg max-w-xl leading-relaxed">
              محرك متطور يدمج الذكاء الاصطناعي مع تقنيات التعليم العالمية. تصميم، مزامنة، وتصحيح آلي فائق الدقة لدعم منظومتك التعليمية بالكامل.
            </p>
          </div>
          
          <div className="relative z-10 hidden md:flex items-center justify-center">
            <div className="relative w-64 h-64">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
              <div className="w-full h-full bg-[#0f172a]/80 backdrop-blur-xl border border-slate-700/50 rounded-full flex items-center justify-center shadow-2xl relative">
                <BrainCircuit className="w-24 h-24 text-indigo-400" />
                
                {/* Orbital Elements */}
                <div className="absolute top-4 right-10 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl animate-[bounce_4s_infinite]">
                  <FileCheck2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="absolute bottom-8 left-6 p-3 bg-blue-500/10 border border-blue-500/30 rounded-2xl animate-[bounce_5s_infinite_0.5s]">
                  <LinkIcon className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation (Glassmorphic) */}
        <div className="flex flex-wrap items-center gap-2 bg-white/60 backdrop-blur-md p-2 rounded-2xl border border-slate-200/60 shadow-sm sticky top-4 z-40">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={\`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 \${
                  isActive 
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-100' 
                    : 'bg-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 hover:scale-[1.02]'
                }\`}
              >
                <Icon className={\`w-4 h-4 \${isActive ? 'text-indigo-400' : ''}\`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Dynamic Content Area */}
        <div className="relative">
          
          {/* 1. AI GENERATOR (The Masterpiece) */}
          {activeTab === 'AI_GENERATOR' && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Main AI Workspace */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 p-6 lg:p-8 flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-amber-500"></div>
                  
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100">
                      <Sparkles className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900">مُصمم الاختبارات الذكي</h2>
                      <p className="text-sm text-slate-500">أعطني موضوعاً أو ارفع منهجاً، وسأبني لك اختباراً قياسياً متكاملاً.</p>
                    </div>
                  </div>

                  <div className="flex-1 space-y-6">
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-500"></div>
                      <textarea 
                        className="relative w-full h-40 p-6 bg-slate-50 border border-slate-200 rounded-2xl resize-none text-base focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                        placeholder="اكتب هنا... (مثال: قم بإنشاء اختبار شامل عن تصميم الشبكات ومبادئ الأمن السيبراني يتكون من 20 سؤال بمستويات متدرجة، مع إضافة قسم لأسئلة التفكير الناقد...)"
                      ></textarea>
                      <div className="absolute bottom-4 left-4 flex gap-2">
                         <button className="p-2 bg-white text-indigo-600 hover:bg-indigo-50 border border-indigo-100 rounded-xl shadow-sm transition-colors" title="إرفاق ملف PDF/Word">
                           <UploadCloud className="w-5 h-5" />
                         </button>
                      </div>
                    </div>

                    {isGenerating && (
                      <div className="p-6 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-4">
                        <div className="flex justify-between text-xs font-bold text-indigo-800 mb-2">
                          <span>جاري توليد الاختبار الاحترافي...</span>
                          <span>{generationStep === 1 ? '30%' : generationStep === 2 ? '70%' : '95%'}</span>
                        </div>
                        <div className="w-full h-2 bg-indigo-100 rounded-full overflow-hidden">
                          <div className={\`h-full bg-indigo-600 transition-all duration-1000 ease-out \${
                            generationStep === 1 ? 'w-1/3' : generationStep === 2 ? 'w-2/3' : 'w-[95%]'
                          }\`}></div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-indigo-600 font-medium">
                          <Zap className="w-4 h-4 animate-pulse" />
                          <span>
                            {generationStep === 1 && "تحليل المحتوى واستخراج الأهداف التعليمية..."}
                            {generationStep === 2 && "صياغة الأسئلة متعددة المستويات ومطابقة معايير CEFR..."}
                            {generationStep === 3 && "المراجعة النهائية وتنسيق الإخراج..."}
                          </span>
                        </div>
                      </div>
                    )}

                    {!isGenerating && (
                      <button 
                        onClick={handleGenerate}
                        className="w-full flex items-center justify-center gap-3 py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-lg transition-all shadow-[0_0_30px_rgba(15,23,42,0.2)] hover:shadow-[0_0_40px_rgba(15,23,42,0.3)] hover:-translate-y-1 group"
                      >
                        <Sparkles className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform" />
                        ابتكر الاختبار الآن
                        <ArrowRight className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity rotate-180" />
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Config Sidebar */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/20 p-6 flex flex-col">
                  <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2 text-lg">
                    <Settings className="w-5 h-5 text-slate-400" />
                    محرك الإعدادات
                  </h3>
                  
                  <div className="space-y-6 flex-1">
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-700 block">نمط الصعوبة (Difficulty Logic)</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['متدرج ذكي', 'سهل', 'متوسط', 'متقدم (تحدي)'].map((lvl, idx) => (
                          <button key={idx} className={\`p-3 rounded-xl text-xs font-bold transition-colors \${
                            idx === 0 ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                          }\`}>
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-700 block">أنماط الأسئلة المدعومة</label>
                      <div className="space-y-2">
                        {[
                          { id: 1, label: 'اختيار من متعدد (MCQ)', checked: true },
                          { id: 2, label: 'صح وخطأ مع التبرير', checked: true },
                          { id: 3, label: 'أسئلة مقالية (AI Grading)', checked: true },
                          { id: 4, label: 'أسئلة استماع ومحادثة', checked: false }
                        ].map((type) => (
                          <label key={type.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer group">
                            <div className={\`w-5 h-5 rounded border flex items-center justify-center transition-colors \${
                              type.checked ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 group-hover:border-indigo-400'
                            }\`}>
                              {type.checked && <Check className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <span className="text-sm font-semibold text-slate-700">{type.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-amber-50 border border-amber-200/50 rounded-2xl flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs font-medium text-amber-800 leading-relaxed">
                      يتم توليد الأسئلة المقالية لتدعم التصحيح الآلي، سيقوم النظام بمطابقة إجابة الطالب مع الكلمات المفتاحية الذكية.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. EXTERNAL IMPORT (Legendary Cards) */}
          {activeTab === 'EXTERNAL_IMPORT' && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8">
              <div className="text-center max-w-2xl mx-auto space-y-4">
                <h2 className="text-3xl font-black text-slate-900">وسيط التزامن الخارجي</h2>
                <p className="text-slate-500">منصة النجاح تعمل كطبقة ذكية فوق أدواتك المفضلة. الصق رابط الاختبار من منصات خارجية، وسنقوم بامتصاصه وتحويله لاختبار تفاعلي يحاكي منصتنا مع رصد تلقائي للدرجات.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { 
                    id: 'google', name: 'Google Forms', icon: FileSpreadsheet, 
                    color: 'from-emerald-400 to-emerald-600', shadow: 'shadow-emerald-500/20',
                    desc: 'استيراد نماذج جوجل واختباراتها وتحويلها لمنصة ذكية.'
                  },
                  { 
                    id: 'ms', name: 'Microsoft Forms', icon: FileCheck2, 
                    color: 'from-blue-500 to-blue-700', shadow: 'shadow-blue-500/20',
                    desc: 'مزامنة نماذج مايكروسوفت مع التوثيق المباشر للدرجات.'
                  },
                  { 
                    id: 'sheets', name: 'Google Sheets DB', icon: Database, 
                    color: 'from-green-500 to-teal-600', shadow: 'shadow-teal-500/20',
                    desc: 'جلب بنوك الأسئلة من شيت جوجل وتوليد اختبار ديناميكي منها.'
                  }
                ].map((platform) => (
                  <div key={platform.id} className={\`relative bg-white rounded-3xl p-8 border border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group overflow-hidden\`}>
                    <div className={\`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br \${platform.color} rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity -translate-y-1/2 translate-x-1/2\`}></div>
                    
                    <div className={\`w-16 h-16 rounded-2xl bg-gradient-to-br \${platform.color} shadow-lg \${platform.shadow} flex items-center justify-center text-white mb-6 transform group-hover:scale-110 transition-transform duration-500\`}>
                      <platform.icon className="w-8 h-8" />
                    </div>
                    
                    <h3 className="text-xl font-black text-slate-900 mb-3">{platform.name}</h3>
                    <p className="text-sm text-slate-500 mb-8 leading-relaxed h-12">{platform.desc}</p>
                    
                    <div className="space-y-3">
                      <div className="relative">
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <LinkIcon className="w-4 h-4 text-slate-400" />
                        </div>
                        <input 
                          type="text" 
                          placeholder="ألصق رابط النموذج هنا..." 
                          className="w-full p-3 pr-9 rounded-xl bg-slate-50 border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans" 
                          dir="ltr"
                        />
                      </div>
                      <button className={\`w-full py-3 bg-gradient-to-r \${platform.color} text-white rounded-xl font-bold shadow-md \${platform.shadow} hover:opacity-90 transition-opacity flex items-center justify-center gap-2\`}>
                        <Zap className="w-5 h-5" />
                        بدء السحب والتكوين
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. MINISTRY EVAL (OCR Magic) */}
          {activeTab === 'MINISTRY_EVAL' && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[3rem] p-8 lg:p-12 relative overflow-hidden shadow-2xl border border-indigo-900/50">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                  <div className="flex-1 space-y-6 text-center md:text-right">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm font-bold">
                      <ScanText className="w-4 h-4" />
                      OCR Vision Engine
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-black text-white leading-tight">
                      وداعاً للنسخ اليدوي.<br/>حول صور الوزارة لاختبارات تفاعلية!
                    </h2>
                    <p className="text-slate-400 text-base max-w-lg leading-relaxed">
                      ارفع ملف PDF أو صورة التقييم الأسبوعي للوزارة. محرك الرؤية الحاسوبية سيقوم باستخراج النصوص، الأسئلة، والخيارات، وبناء اختبار إلكتروني مصحح آلياً في ثوانٍ.
                    </p>
                    
                    <div className="flex flex-wrap gap-4 pt-4">
                      <div className="flex items-center gap-2 text-slate-300 text-sm font-medium">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        يدعم اللغة العربية بطلاقة
                      </div>
                      <div className="flex items-center gap-2 text-slate-300 text-sm font-medium">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        يتعرف على الجداول والمعادلات
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full md:w-[400px]">
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center hover:bg-white/15 transition-all cursor-pointer group border-dashed border-2">
                      <div className="w-20 h-20 mx-auto bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                        <UploadCloud className="w-10 h-10 text-emerald-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">اسحب وأفلت الملف هنا</h3>
                      <p className="text-slate-400 text-sm mb-8">يدعم PDF, JPG, PNG حتى 20 ميجابايت</p>
                      
                      <button className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-900 rounded-xl font-black shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center gap-2 mx-auto w-full justify-center">
                        <Plus className="w-5 h-5" />
                        استعراض الملفات
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. GRADING (The Control Room) */}
          {activeTab === 'GRADING' && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { title: 'إجمالي الأوراق المنجزة', val: '1,284', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                  { title: 'قيد المراجعة الآلية', val: '45', icon: BrainCircuit, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                  { title: 'بانتظار المدرب (يدوي)', val: '12', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
                  { title: 'متوسط الأداء العام', val: '86%', icon: BarChart3, color: 'text-blue-500', bg: 'bg-blue-50' }
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className={\`w-12 h-12 rounded-xl \${stat.bg} \${stat.color} flex items-center justify-center\`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500">{stat.title}</p>
                      <h4 className="text-2xl font-black text-slate-900">{stat.val}</h4>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <h3 className="text-lg font-bold text-slate-900">سجل التقييمات المباشر</h3>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 flex items-center gap-2 hover:bg-slate-50">
                      <Filter className="w-4 h-4" /> تصفية
                    </button>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-md hover:bg-indigo-700">
                      <Download className="w-4 h-4" /> تصدير كشف للوزارة
                    </button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-sm">
                    <thead className="bg-slate-50/80 text-slate-600">
                      <tr>
                        <th className="px-6 py-4 font-bold">المتدرب</th>
                        <th className="px-6 py-4 font-bold">اسم الاختبار / التقييم</th>
                        <th className="px-6 py-4 font-bold">الدرجة الآلية</th>
                        <th className="px-6 py-4 font-bold">حالة المقالي (AI)</th>
                        <th className="px-6 py-4 font-bold text-center">الاعتماد</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        { name: 'لينا محمد', test: 'تقييم الوزارة - الأسبوع الثالث', score: '20/20', aiStatus: 'مطابق بنسبة 98%', done: true },
                        { name: 'عمر خالد', test: 'اختبار تحديد المستوى (English)', score: '17/20', aiStatus: 'مقبول (مع ملاحظات)', done: true },
                        { name: 'سارة أحمد', test: 'اختبار برمجة بايثون', score: '--/20', aiStatus: 'قيد التحليل...', done: false },
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-indigo-50/30 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs">{row.name.charAt(0)}</div>
                            {row.name}
                          </td>
                          <td className="px-6 py-4 text-slate-600 font-medium">{row.test}</td>
                          <td className="px-6 py-4 font-black text-indigo-600 text-lg">{row.score}</td>
                          <td className="px-6 py-4">
                            <span className={\`px-3 py-1.5 rounded-lg text-xs font-bold \${
                              row.done ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                            }\`}>
                              {row.aiStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button className={\`px-4 py-2 rounded-xl text-xs font-bold transition-all \${
                              row.done 
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                                : 'bg-slate-900 hover:bg-slate-800 text-white shadow-md'
                            }\`}>
                              {row.done ? 'تم اعتماده' : 'مراجعة واعتماد'}
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

          {/* 5. QUESTION BANK */}
          {activeTab === 'QUESTION_BANK' && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                
                {/* Search & Filters */}
                <div className="w-full md:w-80 shrink-0 space-y-6">
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-4 text-lg">البحث الدقيق</h3>
                    <div className="relative mb-6">
                      <Search className="absolute right-3 top-3.5 w-5 h-5 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="ابحث عن سؤال، موضوع، أو كود..." 
                        className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500 mb-2 block">المادة / المجال</label>
                        <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none">
                          <option>لغة إنجليزية (CEFR)</option>
                          <option>برمجة وحاسب آلي</option>
                          <option>مهارات التحدث</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 mb-2 block">الاعتماد الدولي</label>
                        <div className="space-y-2">
                          {['أسئلة كامبريدج المعتمدة', 'نماذج TOEFL / IELTS', 'أسئلة مهارات عليا (وزارية)'].map((tag, i) => (
                            <label key={i} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                              <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                              {tag}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Results List */}
                <div className="flex-1 space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col sm:flex-row gap-4 items-start justify-between">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
                          <FileQuestion className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-base mb-2" dir="ltr">
                            What is the primary function of a Subnet Mask in IPv4 addressing?
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">Network+ (N10-008)</span>
                            <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> معتمد دولياً
                            </span>
                            <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold">متوسط</span>
                          </div>
                        </div>
                      </div>
                      
                      <button className="px-5 py-2.5 bg-slate-50 hover:bg-indigo-600 text-slate-700 hover:text-white border border-slate-200 hover:border-indigo-600 rounded-xl text-sm font-bold transition-all shrink-0">
                        إضافة للاختبار
                      </button>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
`;

fs.writeFileSync('src/features/academic/ExamsManagementView.tsx', code);
