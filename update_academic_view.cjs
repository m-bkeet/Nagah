const fs = require('fs');

const content = `import React, { useState } from 'react';
import { 
  BookOpen, Users, Calendar as CalendarIcon, Clock, Plus, Trash2, 
  Search, ChevronRight, Printer, GraduationCap, 
  Share2, FileText, CheckCircle2, TrendingUp, X, 
  Facebook, Monitor, MoreVertical, Edit, Copy,
  CalendarDays, CalendarRange, MapPin, Phone,
  AlertTriangle, PlayCircle, RefreshCw, UploadCloud, Grid
} from 'lucide-react';
import { BranchId } from '../../types/identity';
import { Button3D } from '../../components/ui/Button3D';

// Types
export interface CourseItem {
  id: string; code: string; name: string; category: string; gradeLevel: string;
  description: string; price: number; priceType: 'شهرياً' | 'للكورس';
  hours: number; lectures: number; centerPercentage: number; groupsCount: number; isActive: boolean;
}

export interface GroupItem {
  id: string; courseId: string; courseName: string; gradeLevel: string; name: string; branch: string;
  trainerName: string; capacity: number; enrolled: number;
  schedule: string; days: string[]; time: string; fees: number; period: string;
  status: 'نشطة' | 'مكتملة' | 'قريباً';
  progress: number;
}

// Dummy Data
const INITIAL_GROUPS: GroupItem[] = [
  { id: 'grp-1', courseId: 'crs-1', courseName: 'ICT-P1', gradeLevel: 'الصف الأول الإعدادي', name: 'ICT - p1 - 1', branch: 'النجاح', trainerName: 'د. محمد رمضان بخيت', capacity: 11, enrolled: 1, schedule: 'الأحد • الأربعاء', days: ['الأحد', 'الأربعاء'], time: '15:00 إلى 16:00', fees: 200, period: '2026-08-22', status: 'نشطة', progress: 9 },
  { id: 'grp-2', courseId: 'crs-1', courseName: 'ICT-P1', gradeLevel: 'الصف الأول الإعدادي', name: 'ICT - p1 - AB', branch: 'مدينة بدر', trainerName: 'د. عماد حامد أبو النيل', capacity: 12, enrolled: 0, schedule: 'الإثنين • الخميس', days: ['الإثنين', 'الخميس'], time: '17:00 إلى 18:00', fees: 250, period: '2026-08-24', status: 'نشطة', progress: 0 },
  { id: 'grp-3', courseId: 'crs-2', courseName: 'ICT-S2', gradeLevel: 'الصف الثاني الثانوي', name: 'ICT - S2 - AB', branch: 'مدينة بدر', trainerName: 'د. عماد حامد أبو النيل', capacity: 12, enrolled: 1, schedule: 'الإثنين • الخميس', days: ['الإثنين', 'الخميس'], time: '19:00 إلى 20:00', fees: 250, period: '2026-08-24', status: 'نشطة', progress: 8 },
];

export const CourseFirstAcademicView: React.FC<{ initialBranch?: BranchId | 'ALL', initialTab?: 'COURSES' | 'GROUPS' | 'SCHEDULES' }> = ({ initialBranch = 'ALL', initialTab = 'GROUPS' }) => {
  const [activeTab, setActiveTab] = useState<'COURSES' | 'GROUPS' | 'SCHEDULES'>(initialTab);
  const [groups] = useState<GroupItem[]>(INITIAL_GROUPS);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [selectedGroupForAttendance, setSelectedGroupForAttendance] = useState<GroupItem | null>(null);

  const openAttendance = (group: GroupItem) => {
    setSelectedGroupForAttendance(group);
    setIsAttendanceModalOpen(true);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Tabs Menu */}
      <div className="flex flex-wrap gap-2 mb-6 bg-[#0b1329] p-2 rounded-2xl border border-slate-800 shadow-lg">
        <button onClick={() => setActiveTab('GROUPS')} className={\`flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-bold text-sm transition-all \${activeTab === 'GROUPS' ? 'bg-amber-500 text-[#0b1329] shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}\`}>
          <div className="flex items-center justify-center gap-2"><Users className="w-4 h-4"/> المجموعات التدريبية</div>
        </button>
        <button onClick={() => setActiveTab('SCHEDULES')} className={\`flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-bold text-sm transition-all \${activeTab === 'SCHEDULES' ? 'bg-amber-500 text-[#0b1329] shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}\`}>
          <div className="flex items-center justify-center gap-2"><CalendarIcon className="w-4 h-4"/> الجدول الزمني</div>
        </button>
      </div>

      {/* ========================================================= */}
      {/* GROUPS TAB */}
      {/* ========================================================= */}
      {activeTab === 'GROUPS' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Top Header & Stats */}
          <div className="bg-[#121b2f] border border-slate-700/80 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
            <div className="absolute -left-10 -top-10 w-40 h-40 bg-amber-500/10 blur-[60px] rounded-full pointer-events-none"></div>
            
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-900 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
                  <Users className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-white mb-1 flex items-center gap-3">
                    إدارة المجموعات التدريبية والقاعات
                    <span className="text-xs font-bold px-3 py-1 bg-amber-900/40 text-amber-500 rounded-full border border-amber-700/50">30 مجموعة</span>
                  </h1>
                  <p className="text-sm text-slate-400">تعديل الأسماء، تعديل المواعيد والأيام، نسخ وتكرار المجموعات، متابعة القاعات، وكشوفات الحضور</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex bg-[#0b1329] border border-slate-700 rounded-xl p-1">
                   <button className="px-4 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5"><Grid className="w-4 h-4"/> بطاقات</button>
                   <button className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-slate-900 shadow-md flex items-center gap-1.5"><CalendarDays className="w-4 h-4"/> جدول</button>
                </div>
                <Button3D variant="purple" size="md"><Users className="w-4 h-4" /> إنشاء مجموعات بالجملة</Button3D>
                <Button3D variant="amber" size="md"><Plus className="w-4 h-4 stroke-[3]" /> إنشاء مجموعة جديدة</Button3D>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {[
                 { label: 'إجمالي المجموعات', value: '30', icon: <Users className="w-5 h-5 text-blue-400"/>, bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
                 { label: 'المجموعات الجارية', value: '30', icon: <CheckCircle2 className="w-5 h-5 text-emerald-400"/>, bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
                 { label: 'المتدربون المسجلون', value: '47', icon: <GraduationCap className="w-5 h-5 text-purple-400"/>, bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
                 { label: 'القاعات والمعامل', value: '3', icon: <MapPin className="w-5 h-5 text-amber-400"/>, bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
               ].map((stat, i) => (
                 <div key={i} className={\`\${stat.bg} \${stat.border} border rounded-2xl p-4 flex items-center justify-between\`}>
                    <div>
                      <div className="text-2xl font-black text-white">{stat.value}</div>
                      <div className="text-xs font-bold text-slate-400 mt-1">{stat.label}</div>
                    </div>
                    <div className="p-3 bg-[#0b1329]/50 rounded-xl">{stat.icon}</div>
                 </div>
               ))}
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 bg-[#121b2f] p-3 rounded-2xl border border-slate-800">
             <div className="relative flex-1">
                <Search className="absolute right-3 top-2.5 w-4 h-4 text-slate-500" />
                <input type="text" placeholder="بحث باسم المجموعة، الدورة، المدرب، القاعة..." className="w-full bg-[#0b1329] border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-200 focus:border-amber-500 outline-none" />
             </div>
             <select className="bg-[#0b1329] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none w-40"><option>كل الدورات التدريبية</option></select>
             <select className="bg-[#0b1329] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none w-40"><option>كل المدربين</option></select>
             <select className="bg-[#0b1329] border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-500 font-bold outline-none w-40"><option>ترتيب: تاريخ الإنشاء</option></select>
             <div className="flex gap-1 bg-[#0b1329] p-1 rounded-xl border border-slate-700">
               {['الكل', 'جارية', 'قادمة', 'مكتملة'].map((f, i) => (
                 <button key={i} className={\`px-4 py-1.5 text-xs font-bold rounded-lg \${i === 0 ? 'bg-amber-500 text-slate-900' : 'text-slate-400 hover:bg-slate-800'}\`}>{f}</button>
               ))}
             </div>
          </div>

          {/* Groups Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {groups.map((grp) => (
              <div key={grp.id} className="bg-[#121b2f] border border-slate-700 hover:border-amber-500/50 rounded-3xl overflow-hidden transition-all shadow-lg group flex flex-col">
                <div className="p-5 flex-1 relative">
                  {/* Decorative line */}
                  <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-amber-500 to-transparent opacity-50"></div>
                  
                  {/* Header Row */}
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-bold">جارية (نشطة)</span>
                    <span className="text-[10px] font-bold text-slate-400 bg-[#0b1329] px-3 py-1 rounded-full border border-slate-800 flex items-center gap-1.5"><MapPin className="w-3 h-3 text-amber-500"/> فرع {grp.branch}</span>
                  </div>

                  {/* Title & Grade */}
                  <div className="text-center mb-5">
                    <h2 className="text-xl font-black text-white mb-2 group-hover:text-amber-400 transition-colors flex items-center justify-center gap-2">
                       {grp.name} <Edit className="w-4 h-4 text-slate-500 hover:text-amber-500 cursor-pointer"/>
                    </h2>
                    <div className="inline-flex items-center justify-center gap-2 bg-emerald-950/30 border border-emerald-900/50 text-emerald-400 px-3 py-1 rounded-full text-xs">
                       <BookOpen className="w-3.5 h-3.5"/> {grp.gradeLevel}
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="space-y-3 bg-[#0b1329]/50 p-4 rounded-2xl border border-slate-800/80 mb-5">
                     <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5"/> المدرب:</span>
                        <span className="font-bold text-slate-200">{grp.trainerName}</span>
                     </div>
                     <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5"/> المعمل / القاعة:</span>
                        <span className="font-bold text-slate-200">قاعة 1</span>
                     </div>
                     <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5"/> أيام المحاضرات:</span>
                        <div className="flex gap-1">
                          {grp.days.map((d, i) => <span key={i} className="bg-amber-900/30 text-amber-500 border border-amber-700/30 px-2 py-0.5 rounded text-[10px] font-bold">{d}</span>)}
                        </div>
                     </div>
                     <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> التوقيت:</span>
                        <span className="font-bold text-slate-200 font-mono" dir="ltr">{grp.time}</span>
                     </div>
                     <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5"/> رسوم المجموعة:</span>
                        <span className="font-bold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-900/50">{grp.fees} ج.م</span>
                     </div>
                     <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">فترة الدورة:</span>
                        <span className="text-slate-500 font-mono">{grp.period}</span>
                     </div>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex justify-between items-end mb-2">
                       <span className="text-xs text-slate-300 font-bold flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-purple-400"/> المتدربون المسجلون:</span>
                       <span className="text-xs font-mono font-bold text-slate-400">{grp.enrolled} / {grp.capacity} متدرب ({grp.progress}%)</span>
                    </div>
                    <div className="w-full bg-[#0b1329] h-2 rounded-full overflow-hidden border border-slate-800">
                       <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full" style={{width: \`\${grp.progress}%\`}}></div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="bg-[#0b1329] p-4 border-t border-slate-800 flex items-center justify-between gap-2">
                   <div className="flex gap-2">
                     <Button3D variant="purple" size="sm" className="!px-3"><Users className="w-4 h-4"/> الطلاب ({grp.enrolled})</Button3D>
                     <Button3D variant="primary" size="sm" className="!px-3" onClick={() => openAttendance(grp)}><CheckCircle2 className="w-4 h-4"/> الحضور</Button3D>
                   </div>
                   <div className="flex gap-1.5">
                     <button className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"><Clock className="w-3.5 h-3.5"/></button>
                     <button className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"><Monitor className="w-3.5 h-3.5"/></button>
                     <button className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"><Printer className="w-3.5 h-3.5"/></button>
                     <button className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"><Share2 className="w-3.5 h-3.5"/></button>
                     <button className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"><Copy className="w-3.5 h-3.5"/></button>
                     <button className="w-8 h-8 rounded-full bg-rose-950/40 flex items-center justify-center text-rose-500 hover:bg-rose-900 transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SCHEDULES TAB */}
      {/* ========================================================= */}
      {activeTab === 'SCHEDULES' && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Top Header */}
          <div className="bg-[#121b2f] border border-slate-700/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/10 blur-[60px] rounded-full pointer-events-none"></div>
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
                <CalendarIcon className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white mb-1">الجدول الزمني والخريطة الزمنية للمعامل والفرع</h1>
                <p className="text-sm text-slate-400">نظام المحاضرات (ساعة واحدة لكل محاضرة، يومان أسبوعياً) مع إمكانية التوليد التلقائي والطباعة ومزامنة Google Drive.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap relative z-10">
               <Button3D variant="neutral" size="md"><UploadCloud className="w-4 h-4 text-emerald-400"/> نسخ Google Drive (محدث)</Button3D>
               <Button3D variant="neutral" size="md"><RefreshCw className="w-4 h-4 text-amber-400"/> تحديث</Button3D>
               <Button3D variant="indigo" size="md"><RefreshCw className="w-4 h-4"/> استعادة وتوليد المجموعات</Button3D>
               <Button3D variant="success" size="md"><Plus className="w-4 h-4 stroke-[3]"/> إضافة موعد جديد</Button3D>
               <Button3D variant="neutral" size="md"><Printer className="w-4 h-4 text-amber-500"/> طباعة الجدول</Button3D>
            </div>
          </div>

          {/* Sub Filters & Views */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[#121b2f] p-3 rounded-2xl border border-slate-800">
             <div className="flex items-center gap-3">
               <span className="text-sm text-slate-400 flex items-center gap-2"><MapPin className="w-4 h-4"/> تصفية حسب الفرع:</span>
               <select className="bg-[#0b1329] border border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-200 outline-none w-64"><option>جميع فروع مركز النجاح</option></select>
             </div>
             
             <div className="flex items-center gap-3 flex-wrap">
               <Button3D variant="neutral" size="sm" className="!text-amber-500"><TrendingUp className="w-4 h-4"/> تقرير تحليل المعامل والأوقات الشاغرة</Button3D>
               <Button3D variant="neutral" size="sm" className="!text-indigo-400"><Share2 className="w-4 h-4"/> بوستر النشر الاحترافي (فيس بوك وعرض)</Button3D>
               <div className="flex bg-[#0b1329] border border-slate-700 rounded-xl p-1">
                 <button className="px-4 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white shadow-md">عرض البطاقات (الأيام)</button>
                 <button className="px-4 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-white">جدول الحصص والتقويم (شبكة أسبوعية)</button>
               </div>
             </div>
          </div>

          {/* Conflict Warning Box */}
          <div className="bg-rose-950/20 border border-rose-900/50 rounded-2xl p-5 shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 w-2 h-full bg-rose-500"></div>
             <div className="flex items-start gap-4">
               <div className="bg-rose-900/30 p-2 rounded-xl text-rose-500 mt-1">
                 <AlertTriangle className="w-6 h-6" />
               </div>
               <div className="flex-1">
                 <div className="flex justify-between items-center mb-2">
                   <h3 className="text-lg font-black text-rose-500">تنبيه تعارضات الجدول الزمني (3):</h3>
                   <Button3D variant="amber" size="sm">عرض في الجدول</Button3D>
                 </div>
                 <p className="text-sm text-rose-200/70 mb-3">تم الفحص بناءً على التداخل الزمني، القاعة، الفرع، والمدرب. التواجد في أماكن مختلفة لا يعتبر تعارضاً.</p>
                 <ul className="space-y-1 text-xs font-bold text-rose-400">
                   <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> تعارض: المدرب (د. عماد حامد أبو النيل) محجوز في مكانين في نفس الوقت (14:00 - 15:00) يوم الثلاثاء</li>
                   <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> تعارض: المدرب (د. عماد حامد أبو النيل) محجوز في مكانين في نفس الوقت (18:00 - 19:00) يوم السبت</li>
                   <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> تعارض: المدرب (د. عماد حامد أبو النيل) محجوز في مكانين في نفس الوقت (18:00 - 19:00) يوم الثلاثاء</li>
                 </ul>
               </div>
             </div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
             {/* Example Day Card: Saturday */}
             <div className="bg-[#121b2f] border border-slate-800 rounded-3xl p-5 shadow-lg relative">
                <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-800">
                  <h2 className="text-xl font-black text-white">السبت</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-indigo-400 bg-indigo-950/50 px-3 py-1 rounded-full border border-indigo-900/50">12 محاضرة</span>
                    <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.6)]"></div>
                  </div>
                </div>

                <div className="space-y-3">
                   {/* Lecture Item */}
                   <div className="bg-[#0b1329] border border-slate-700/80 rounded-2xl p-4 hover:border-indigo-500/50 transition-colors group cursor-pointer relative overflow-hidden">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-mono font-bold text-amber-500 bg-amber-950/30 px-2 py-1 rounded-lg border border-amber-900/50" dir="ltr">02:00 م - 03:00 م</span>
                      </div>
                      <h3 className="text-lg font-black text-white mb-1">ICT - S1 - B1</h3>
                      <p className="text-xs text-slate-400 mb-4">ICT-P1</p>
                      
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-300 font-bold bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">قاعة 1</span>
                        <span className="text-slate-400 flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5 text-emerald-500"/> د. محمد رمضان بخيت</span>
                      </div>
                   </div>

                   {/* Lecture Item 2 */}
                   <div className="bg-[#0b1329] border border-slate-700/80 rounded-2xl p-4 hover:border-indigo-500/50 transition-colors group cursor-pointer relative overflow-hidden">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-mono font-bold text-amber-500 bg-amber-950/30 px-2 py-1 rounded-lg border border-amber-900/50" dir="ltr">03:00 م - 04:00 م</span>
                      </div>
                      <h3 className="text-lg font-black text-white mb-1">ICT6 - 1</h3>
                      <p className="text-xs text-slate-400 mb-4">ICT6</p>
                      
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-300 font-bold bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">قاعة 1</span>
                        <span className="text-slate-400 flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5 text-emerald-500"/> د. محمد رمضان بخيت</span>
                      </div>
                   </div>
                </div>
             </div>

             {/* Example Day Card: Sunday */}
             <div className="bg-[#121b2f] border border-slate-800 rounded-3xl p-5 shadow-lg relative">
                <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-800">
                  <h2 className="text-xl font-black text-white">الأحد</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-indigo-400 bg-indigo-950/50 px-3 py-1 rounded-full border border-indigo-900/50">7 محاضرات</span>
                    <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.6)]"></div>
                  </div>
                </div>

                <div className="space-y-3">
                   {/* Lecture Item */}
                   <div className="bg-[#0b1329] border border-slate-700/80 rounded-2xl p-4 hover:border-indigo-500/50 transition-colors group cursor-pointer relative overflow-hidden">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-mono font-bold text-amber-500 bg-amber-950/30 px-2 py-1 rounded-lg border border-amber-900/50" dir="ltr">02:00 م - 03:00 م</span>
                      </div>
                      <h3 className="text-lg font-black text-white mb-1">ICT6 - 1</h3>
                      <p className="text-xs text-slate-400 mb-4">ICT6</p>
                      
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-300 font-bold bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">قاعة 1</span>
                        <span className="text-slate-400 flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5 text-emerald-500"/> د. محمد رمضان بخيت</span>
                      </div>
                   </div>
                </div>
             </div>
             
             {/* Example Day Card: Monday */}
             <div className="bg-[#121b2f] border border-slate-800 rounded-3xl p-5 shadow-lg relative">
                <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-800">
                  <h2 className="text-xl font-black text-white">الإثنين</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-indigo-400 bg-indigo-950/50 px-3 py-1 rounded-full border border-indigo-900/50">9 محاضرات</span>
                    <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.6)]"></div>
                  </div>
                </div>

                <div className="space-y-3">
                   {/* Lecture Item */}
                   <div className="bg-[#0b1329] border border-slate-700/80 rounded-2xl p-4 hover:border-indigo-500/50 transition-colors group cursor-pointer relative overflow-hidden">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-mono font-bold text-amber-500 bg-amber-950/30 px-2 py-1 rounded-lg border border-amber-900/50" dir="ltr">02:00 م - 03:00 م</span>
                      </div>
                      <h3 className="text-lg font-black text-white mb-1">ICT5 - 1</h3>
                      <p className="text-xs text-slate-400 mb-4">ICT5</p>
                      
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-300 font-bold bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">قاعة 1</span>
                        <span className="text-slate-400 flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5 text-emerald-500"/> د. محمد رمضان بخيت</span>
                      </div>
                   </div>
                </div>
             </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MANUAL ATTENDANCE MODAL */}
      {/* ========================================================= */}
      {isAttendanceModalOpen && selectedGroupForAttendance && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4" dir="rtl">
          <div className="bg-[#0b1329] border border-slate-700/80 rounded-3xl w-full max-w-5xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-[#121b2f]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/20">
                   <CalendarDays className="w-6 h-6"/>
                </div>
                <div>
                   <h2 className="text-xl font-black text-white mb-1">تسجيل الحضور والغياب اليومي</h2>
                   <p className="text-xs text-slate-400">تسجيل حضور المجموعات، منح نقاط الحضور التلقائية، واحتساب نسبة الالتزام</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 <Button3D variant="neutral" size="sm"><Printer className="w-4 h-4"/> طباعة الكشف</Button3D>
                 <Button3D variant="amber" size="sm" onClick={() => setIsAttendanceModalOpen(false)}>حفظ كشف الحضور</Button3D>
                 <button onClick={() => setIsAttendanceModalOpen(false)} className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"><X className="w-5 h-5"/></button>
              </div>
            </div>

            {/* Attendance Filters Row */}
            <div className="p-6 bg-[#0b1329] border-b border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="flex flex-col gap-2">
                 <label className="text-xs font-bold text-slate-400">اختر المجموعة التدريبية:</label>
                 <select className="bg-[#121b2f] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-bold outline-none">
                    <option>{selectedGroupForAttendance.name} - (قاعة 1)</option>
                 </select>
               </div>
               <div className="flex flex-col gap-2">
                 <label className="text-xs font-bold text-slate-400">تاريخ المحاضرة:</label>
                 <input type="date" defaultValue="2026-08-26" className="bg-[#121b2f] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono outline-none" />
               </div>
               <div className="flex justify-between items-center bg-[#121b2f] border border-slate-700 rounded-xl p-4">
                  <div className="text-center">
                    <div className="text-[10px] text-slate-400 mb-1">إجمالي الطلاب</div>
                    <div className="text-lg font-black text-white">1</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] text-emerald-400 mb-1">حاضر</div>
                    <div className="text-lg font-black text-emerald-500">1</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] text-rose-400 mb-1">غائب</div>
                    <div className="text-lg font-black text-rose-500">0</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] text-amber-400 mb-1">متأخر</div>
                    <div className="text-lg font-black text-amber-500">0</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] text-blue-400 mb-1">معتذر</div>
                    <div className="text-lg font-black text-blue-500">0</div>
                  </div>
                  <div className="text-center pl-4 border-l border-slate-700">
                    <div className="text-[10px] text-slate-400 mb-1">نسبة الحضور</div>
                    <div className="text-lg font-black text-emerald-400">100%</div>
                  </div>
               </div>
            </div>

            {/* Attendance Table */}
            <div className="p-6 overflow-y-auto flex-1 bg-[#0b1329]">
               <div className="w-full flex justify-end mb-4">
                  <Button3D variant="neutral" size="sm" className="!bg-[#121b2f]"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> تحضير الكل كحاضر</Button3D>
               </div>
               <table className="w-full text-right">
                  <thead className="text-xs text-slate-500 font-bold border-b border-slate-800">
                    <tr>
                      <th className="pb-3 px-4">م</th>
                      <th className="pb-3 px-4">الكود</th>
                      <th className="pb-3 px-4">اسم المتدرب</th>
                      <th className="pb-3 px-4">الهاتف</th>
                      <th className="pb-3 px-4 text-center">حالة الحضور</th>
                      <th className="pb-3 px-4">ملاحظات / سبب الغياب</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-800/50 hover:bg-[#121b2f] transition-colors">
                       <td className="py-4 px-4 text-sm text-slate-400 font-mono">1</td>
                       <td className="py-4 px-4 text-sm font-bold text-amber-500 font-mono">A121</td>
                       <td className="py-4 px-4 text-sm font-black text-white">نيروز محمد صلاح عرابي</td>
                       <td className="py-4 px-4 text-xs text-slate-400 font-mono">01096932831</td>
                       <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-1 bg-[#0b1329] border border-slate-700 rounded-xl p-1 w-max mx-auto">
                            <button className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 text-slate-900 shadow-md">حاضر</button>
                            <button className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800">غائب</button>
                            <button className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800">متأخر</button>
                            <button className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800">معتذر</button>
                          </div>
                       </td>
                       <td className="py-4 px-4">
                         <input type="text" placeholder="ملاحظات..." className="w-full bg-[#121b2f] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-amber-500" />
                       </td>
                    </tr>
                  </tbody>
               </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
`
fs.writeFileSync('src/features/academic/CourseFirstAcademicView.tsx', content);
