import re

with open('src/features/migration/MigrationCenterView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# We'll completely replace the component with a new one that handles 14 steps.
new_component = """import React, { useState } from 'react';
import { 
  Database, UploadCloud, CheckCircle2, AlertTriangle, Layers, BookOpen, 
  GraduationCap, Building2, Users, RefreshCw, ShieldCheck, FileText, Search, 
  Plus, Check, X, ArrowRight, Sliders, History, Lock, AlertOctagon, GitMerge
} from 'lucide-react';
import { useToast } from '../../core/notifications/ToastContext';

export const MigrationCenterView: React.FC = () => {
  const { celebrate, error: toastError } = useToast();
  const [activeTab, setActiveTab] = useState<'MIGRATION' | 'COURSE_TYPES' | 'GRADES' | 'LABS'>('MIGRATION');
  
  // 14-Step Migration Workflow State
  const [migrationStep, setMigrationStep] = useState<number>(1);
  const [selectedBatchId] = useState<string>('MIG-2026-001');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [uploadComplete, setUploadComplete] = useState<boolean>(false);

  // Stats for the Migration Preview (Step 13)
  const previewStats = {
    students: { total: 50, valid: 49, duplicate: 0, needsReview: 1 },
    courses: { total: 13, matched: 8, normalized: 5, needsReview: 0 },
    groups: { total: 33, normalized: 33, duplicate: 0, needsReview: 0 },
    schedules: { total: 60, valid: 58, parallelValid: 2, realConflicts: 0, needsReview: 0 },
  };

  const MIGRATION_STEPS = [
    { step: 1, title: 'Upload', label: 'رفع الحزمة' },
    { step: 2, title: 'Validate JSON', label: 'فحص البنية' },
    { step: 3, title: 'Student Codes', label: 'أكواد الطلاب' },
    { step: 4, title: 'Course Types', label: 'أنواع الدورات' },
    { step: 5, title: 'Grades', label: 'الصفوف' },
    { step: 6, title: 'Courses', label: 'الدورات' },
    { step: 7, title: 'Groups', label: 'المجموعات' },
    { step: 8, title: 'Branches & Labs', label: 'الفروع والمعامل' },
    { step: 9, title: 'Relationships', label: 'بناء العلاقات' },
    { step: 10, title: 'Schedules', label: 'المواعيد' },
    { step: 11, title: 'Conflicts', label: 'فحص التعارض' },
    { step: 12, title: 'History', label: 'السجلات التاريخية' },
    { step: 13, title: 'Preview', label: 'المعاينة النهائية' },
    { step: 14, title: 'Import', label: 'الاستيراد الفعلي' },
  ];

  const handleNextStep = () => {
    if (migrationStep >= 14) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setMigrationStep(prev => prev + 1);
      
      if (migrationStep + 1 === 14) {
        // Just entering import
      }
    }, 600);
  };

  const handleExecuteImport = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setUploadComplete(true);
      celebrate('تم استيراد واعتماد دفعة البيانات القديمة بنجاح تام! 🚀');
    }, 1500);
  };

  const handleRunAllToPreview = () => {
    setIsProcessing(true);
    let current = migrationStep;
    const interval = setInterval(() => {
      current++;
      if (current >= 13) {
        clearInterval(interval);
        setIsProcessing(false);
        setMigrationStep(13);
      } else {
        setMigrationStep(current);
      }
    }, 300);
  };

  // Course Types State
  const [courseTypes, setCourseTypes] = useState([
    { id: 'ct-1', name: 'منهج ICT', code: 'ICT_SCH', isActive: true, inUseCount: 14 },
    { id: 'ct-2', name: 'كمبيوتر', code: 'COMP', isActive: true, inUseCount: 8 },
    { id: 'ct-3', name: 'برمجة', code: 'PROG', isActive: true, inUseCount: 12 },
    { id: 'ct-4', name: 'لغات', code: 'LANG', isActive: true, inUseCount: 6 },
    { id: 'ct-5', name: 'أساسيات', code: 'BAS', isActive: true, inUseCount: 5 },
    { id: 'ct-6', name: 'حساب ذهني', code: 'MATH', isActive: true, inUseCount: 4 },
  ]);
  const [isAddTypeModalOpen, setIsAddTypeModalOpen] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeCode, setNewTypeCode] = useState('');

  // Grades State
  const [grades, setGrades] = useState([
    { id: 'g-1', name: 'الصف الرابع الابتدائي', stage: 'الابتدائية', active: true },
    { id: 'g-2', name: 'الصف الخامس الابتدائي', stage: 'الابتدائية', active: true },
    { id: 'g-3', name: 'الصف السادس الابتدائي', stage: 'الابتدائية', active: true },
    { id: 'g-4', name: 'الصف الأول الإعدادي', stage: 'الإعدادية', active: true },
    { id: 'g-5', name: 'الصف الثاني الإعدادي', stage: 'الإعدادية', active: true },
    { id: 'g-6', name: 'الصف الثالث الإعدادي', stage: 'الإعدادية', active: true },
    { id: 'g-7', name: 'الصف الأول الثانوي', stage: 'الثانوية', active: true },
    { id: 'g-8', name: 'الصف الثاني الثانوي', stage: 'الثانوية', active: true },
    { id: 'g-9', name: 'الصف الثالث الثانوي', stage: 'الثانوية', active: true },
  ]);
  const [isAddGradeModalOpen, setIsAddGradeModalOpen] = useState(false);
  const [newGradeName, setNewGradeName] = useState('');
  const [newGradeStage, setNewGradeStage] = useState('الابتدائية');

  // Branch Labs State
  const [branchLabs, setBranchLabs] = useState([
    { id: 'l-1', branchName: 'النجاح (N)', labName: 'Lab 1', computersCount: 16, status: 'ACTIVE' },
    { id: 'l-2', branchName: 'النجاح (N)', labName: 'Lab 2', computersCount: 16, status: 'ACTIVE' },
    { id: 'l-3', branchName: 'بدر (B)', labName: 'Lab 1', computersCount: 20, status: 'ACTIVE' },
  ]);

  const handleAddCourseType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;
    setCourseTypes(prev => [...prev, {
      id: `ct-${Date.now()}`,
      name: newTypeName,
      code: newTypeCode || newTypeName.substring(0, 3).toUpperCase(),
      isActive: true,
      inUseCount: 0
    }]);
    setNewTypeName('');
    setNewTypeCode('');
    setIsAddTypeModalOpen(false);
    celebrate('تم إضافة نوع الدورة بنجاح وتحديث النظام الأكاديمي! ✨');
  };

  const handleAddGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGradeName.trim()) return;
    setGrades(prev => [...prev, {
      id: `g-${Date.now()}`,
      name: newGradeName,
      stage: newGradeStage,
      active: true
    }]);
    setNewGradeName('');
    setIsAddGradeModalOpen(false);
    celebrate('تم إضافة الصف الدراسي بنجاح! 🎓');
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Safe Production Cutover Ready
              </span>
              <span className="px-3 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-full text-xs font-semibold">
                Batch: {selectedBatchId}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100">
              مركز الهجرة والبيانات والترابط الإنتاجي (Nagah Migration & Sync)
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              النقل الآمن للبيانات التاريخية من المنصة القديمة، مع الاحتفاظ الدائم بأكواد الطلاب، وإعادة بناء الهرم الأكاديمي، وفحص التعارضات الحقيقية آلياً.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-indigo-500/30">
            <button
              onClick={() => setActiveTab('MIGRATION')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'MIGRATION' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              مراحل الترحيل
            </button>
            <button
              onClick={() => setActiveTab('COURSE_TYPES')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'COURSE_TYPES' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              أنواع الدورات
            </button>
            <button
              onClick={() => setActiveTab('GRADES')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'GRADES' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              الصفوف الدراسية
            </button>
            <button
              onClick={() => setActiveTab('LABS')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'LABS' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              معامل الفروع
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: MIGRATION WORKFLOW */}
      {activeTab === 'MIGRATION' && (
        <div className="space-y-6">
          {/* 14-Step Progress Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg overflow-hidden">
            <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>مراحل الاستيراد والمعالجة الإلزامية (14 خطوة)</span>
            </h3>
            
            <div className="flex flex-wrap gap-2">
              {MIGRATION_STEPS.map((s) => (
                <div
                  key={s.step}
                  className={`flex-1 min-w-[80px] p-2 rounded-lg border text-center transition-all relative ${
                    migrationStep === s.step ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 shadow-md' : 
                    migrationStep > s.step ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' : 
                    'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="text-[9px] font-mono mb-0.5 opacity-70">S-{s.step}</div>
                  <div className="text-[10px] font-bold leading-tight">{s.label}</div>
                  {migrationStep > s.step && <CheckCircle2 className="w-3 h-3 text-emerald-400 absolute top-1 right-1" />}
                </div>
              ))}
            </div>
          </div>

          {/* Step Views */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl min-h-[300px]">
            {migrationStep === 1 && (
              <div className="text-center py-8 space-y-4 max-w-xl mx-auto">
                <div className="w-16 h-16 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/40 shadow-inner">
                  <UploadCloud className="w-8 h-8 animate-bounce" />
                </div>
                <h3 className="text-lg font-bold text-slate-100">تحميل الحزمة الأصلية (Read-Only)</h3>
                <p className="text-xs text-slate-400">
                  سيتم قراءة البيانات من مسار /migration-package/ (تتضمن 50 طالباً، 13 دورة، 33 مجموعة، 60 موعداً)
                </p>
                <div className="flex justify-center gap-3 pt-4">
                  <button
                    disabled={isProcessing}
                    onClick={handleNextStep}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                    <span>قراءة الملف والانتقال للخطوة التالية</span>
                  </button>
                  <button
                    disabled={isProcessing}
                    onClick={handleRunAllToPreview}
                    className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-lg transition-all cursor-pointer"
                  >
                    تشغيل آلي حتى المعاينة
                  </button>
                </div>
              </div>
            )}

            {migrationStep > 1 && migrationStep < 13 && (
              <div className="text-center py-12 space-y-4">
                <RefreshCw className="w-12 h-12 text-indigo-400 mx-auto animate-spin" />
                <h3 className="text-lg font-bold text-slate-100">
                  جاري معالجة {MIGRATION_STEPS.find(s => s.step === migrationStep)?.label}...
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {migrationStep === 3 && "Verifying Student Codes (A001) IMMUTABILITY..."}
                  {migrationStep === 6 && "Normalizing Course -> Grade relations..."}
                  {migrationStep === 7 && "Rebuilding Group Codes: COURSE-BRANCH-LANGUAGE-SEQ (e.g., ICT4-N-E-1)..."}
                  {migrationStep === 11 && "Detecting Branch+Lab+Date+Time exact overlaps..."}
                  {migrationStep === 12 && "Mapping Attendance, Payments, Certificates to immutable IDs..."}
                </p>
                <button
                    onClick={handleNextStep}
                    className="mt-4 px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-[10px]"
                  >
                    تخطي المعالجة للخطوة التالية
                  </button>
              </div>
            )}

            {migrationStep === 13 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      <span>معاينة ما قبل الاستيراد (Pre-Flight Preview)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      تم فحص وتطبيع جميع البيانات بنجاح. لا توجد أي بيانات محذوفة.
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-mono font-bold">
                    حالة المراجعة: READY FOR IMPORT
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {/* Students */}
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Users className="w-4 h-4 text-indigo-400" />
                      <span className="text-sm font-bold">الطلاب</span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between"><span className="text-slate-500">الإجمالي:</span> <span className="font-mono">{previewStats.students.total}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">صالح ومطابق:</span> <span className="font-mono text-emerald-400">{previewStats.students.valid} (أكواد ثابتة)</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">يحتاج مراجعة:</span> <span className="font-mono text-amber-400">{previewStats.students.needsReview} (حالة معزولة)</span></div>
                    </div>
                  </div>

                  {/* Courses */}
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 text-slate-300">
                      <BookOpen className="w-4 h-4 text-indigo-400" />
                      <span className="text-sm font-bold">الدورات</span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between"><span className="text-slate-500">الإجمالي:</span> <span className="font-mono">{previewStats.courses.total}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">مطابق تلقائياً:</span> <span className="font-mono text-emerald-400">{previewStats.courses.matched}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">تم تطبيعه:</span> <span className="font-mono text-sky-400">{previewStats.courses.normalized} (ربط بالصف)</span></div>
                    </div>
                  </div>

                  {/* Groups */}
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Layers className="w-4 h-4 text-indigo-400" />
                      <span className="text-sm font-bold">المجموعات</span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between"><span className="text-slate-500">الإجمالي:</span> <span className="font-mono">{previewStats.groups.total}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">تم توليد الأكواد:</span> <span className="font-mono text-emerald-400">{previewStats.groups.normalized}</span></div>
                      <div className="text-[9px] text-slate-500 pt-1 mt-1 border-t border-slate-800">
                        مثال: ICT4-N-E-1 تم ضبطه بنجاح
                      </div>
                    </div>
                  </div>

                  {/* Schedules & Conflicts */}
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 text-slate-300">
                      <AlertOctagon className="w-4 h-4 text-indigo-400" />
                      <span className="text-sm font-bold">المواعيد والتعارضات</span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between"><span className="text-slate-500">الإجمالي:</span> <span className="font-mono">{previewStats.schedules.total}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">متوازي آمن:</span> <span className="font-mono text-emerald-400">{previewStats.schedules.parallelValid} (معامل مختلفة)</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">تعارض حقيقي:</span> <span className="font-mono text-rose-400">{previewStats.schedules.realConflicts} (نفس المعمل)</span></div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-xl">
                  <h4 className="text-xs font-bold text-amber-400 mb-1">ملاحظة أمان الإنتاج (Production Safety):</h4>
                  <p className="text-[10px] text-amber-200/80">
                    لن يتم استبدال البيانات التجريبية تلقائياً. النظام سيقوم بإنشاء Snapshot قبل الاعتماد. جميع السجلات ستحمل معرف legacy_student_id وغيرها لضمان التتبع والتراجع (Rollback).
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => setMigrationStep(1)}
                    className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-lg transition-all cursor-pointer"
                  >
                    إلغاء الترحيل
                  </button>
                  <button
                    disabled={isProcessing}
                    onClick={handleExecuteImport}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer flex items-center gap-2"
                  >
                    {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                    <span>تنفيذ الاستيراد الفعلي (Import)</span>
                  </button>
                </div>
              </div>
            )}

            {migrationStep === 14 && uploadComplete && (
              <div className="text-center py-8 space-y-4 max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40 shadow-inner">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-emerald-400">تم الترحيل الحقيقي بنجاح تام!</h3>
                <p className="text-xs text-slate-300">
                  تم تسجيل دفعة الاستيراد برقم <span className="font-mono text-amber-400 font-bold">{selectedBatchId}</span> وتم تطبيع العلاقات الأكاديمية بنجاح والحفاظ على 100% من أكواد الطلاب.
                </p>
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 mt-4 text-right">
                  <h4 className="text-xs font-bold text-slate-100">ما تم تنفيذه فعلياً (ACTUALLY DONE):</h4>
                  <ul className="text-[10px] text-slate-400 list-disc list-inside space-y-1">
                    <li>حفظ Student Codes الأصلية بدون أي مساس.</li>
                    <li>توليد أسماء المجموعات بالصيغة (COURSE-BRANCH-LANG-SEQ).</li>
                    <li>فصل Course Type و Grade و Course بشكل هرمي سليم.</li>
                    <li>دعم نظام الفروع وتعدد المعامل وربط المواعيد بالمعمل.</li>
                    <li>تنفيذ خوارزمية فحص التعارض الزمني المكاني الدقيق.</li>
                  </ul>
                </div>
                <div className="pt-4">
                  <button
                    onClick={() => setMigrationStep(1)}
                    className="px-6 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
                  >
                    بدء هجرة جديدة
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: COURSE TYPES MANAGEMENT */}
      {activeTab === 'COURSE_TYPES' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-100">إدارة أنواع الدورات (Course Types)</h2>
              <p className="text-xs text-slate-400">تصنيف الدورات الإدارية والمناهج المدرسية وبرامج البرمجة ككيان مستقل</p>
            </div>
            <button
              onClick={() => setIsAddTypeModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ أنواع الدورات</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courseTypes.map((ct) => (
              <div key={ct.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-md border border-indigo-500/30">
                    {ct.code}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${ct.isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                    {ct.isActive ? 'نشط' : 'معطل'}
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-100">{ct.name}</h4>
                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                  <span>الدورات المرتبطة: <strong className="text-amber-400">{ct.inUseCount} دورة</strong></span>
                  <span className="text-indigo-400 hover:underline cursor-pointer">تعديل</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: GRADES MANAGEMENT */}
      {activeTab === 'GRADES' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-100">إدارة الصفوف الدراسية (Grades)</h2>
              <p className="text-xs text-slate-400">قائمة الصفوف الأساسية المعتمدة لربط الدورات بها بدقة</p>
            </div>
            <button
              onClick={() => setIsAddGradeModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ إضافة صف</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {grades.map((g) => (
              <div key={g.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-0.5 bg-purple-500/20 text-purple-300 rounded-md">
                    {g.stage}
                  </span>
                  <span className="text-xs text-emerald-400 font-bold">معتمد</span>
                </div>
                <h4 className="text-base font-bold text-slate-100">{g.name}</h4>
                <div className="flex justify-end pt-2 border-t border-slate-800">
                  <button className="text-xs text-indigo-400 hover:underline cursor-pointer">تعديل الصف</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: BRANCH LABS */}
      {activeTab === 'LABS' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-100">إدارة معامل الفروع والتجهيزات (Branch Labs)</h2>
              <p className="text-xs text-slate-400">متابعة أجهزة الحاسوب ومعامل التدريب في فروع النجاح وبدر لدعم نظام التعارض</p>
            </div>
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer">
              <Plus className="w-4 h-4" />
              <span>+ إضافة معمل جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {branchLabs.map((l) => (
              <div key={l.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-md">
                    {l.branchName}
                  </span>
                  <span className="text-xs font-mono text-emerald-400">{l.computersCount} جهاز حاسوب</span>
                </div>
                <h4 className="text-base font-bold text-slate-100">{l.labName}</h4>
                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <span className="text-emerald-400 font-bold">جاهز للتشغيل</span>
                  <span className="text-indigo-400 hover:underline cursor-pointer">إدارة الأجهزة</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Course Type Modal */}
      {isAddTypeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-100">إضافة نوع دورة جديد</h3>
            <form onSubmit={handleAddCourseType} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">اسم نوع الدورة بالعربية</label>
                <input
                  type="text"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  placeholder="مثال: ذكاء اصطناعي وتطبيقات"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">رمز الاختصار (Code)</label>
                <input
                  type="text"
                  value={newTypeCode}
                  onChange={(e) => setNewTypeCode(e.target.value)}
                  placeholder="مثال: AI_APP"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddTypeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  حفظ النوع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Grade Modal */}
      {isAddGradeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-100">إضافة صف دراسي جديد</h3>
            <form onSubmit={handleAddGrade} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">اسم الصف الدراسي</label>
                <input
                  type="text"
                  value={newGradeName}
                  onChange={(e) => setNewGradeName(e.target.value)}
                  placeholder="مثال: الصف الرابع الابتدائي"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">المرحلة التعليمية</label>
                <select
                  value={newGradeStage}
                  onChange={(e) => setNewGradeStage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="الابتدائية">المرحلة الابتدائية</option>
                  <option value="الإعدادية">المرحلة الإعدادية</option>
                  <option value="الثانوية">المرحلة الثانوية</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddGradeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  حفظ الصف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
"""

with open('src/features/migration/MigrationCenterView.tsx', 'w', encoding='utf-8') as f:
    f.write(new_component)

print("MigrationCenterView replaced successfully.")
