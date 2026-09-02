import React, { useState, useMemo } from 'react';
import { X, Search, ShieldAlert, Users, Trash2, CheckCircle2, UserCheck, RefreshCw, AlertTriangle } from 'lucide-react';
import { Trainee } from '../types';
import { api } from '../services/api';
import { useCenter } from '../context/CenterContext';

interface DuplicatesAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainees: Trainee[];
  onRefresh: () => Promise<void>;
}

export function normalizeArabicFull(str: string): string {
  if (!str) return '';
  let s = str.trim().toLowerCase();
  // Strip diacritics / tashkeel & tatweel
  s = s.replace(/[\u064B-\u065F\u0670\u0640]/g, '');
  // Normalize letters: أ, إ, آ, ٱ -> ا | ة -> ه | ى -> ي | ؤ, ئ -> ء
  s = s.replace(/[أإآٱ]/g, 'ا');
  s = s.replace(/ة/g, 'ه');
  s = s.replace(/ى/g, 'ي');
  s = s.replace(/[ؤئ]/g, 'ء');
  // Normalize 'عبد X' -> 'عبدX' (e.g. عبد الظاهر <-> عبدالظاهر)
  s = s.replace(/عبد\s+/g, 'عبد');
  // Normalize 'ابو X' -> 'ابوX'
  s = s.replace(/ابو\s+/g, 'ابو');
  // Replace punctuation/dashes with single space
  s = s.replace(/[\s\-_.]+/g, ' ');
  return s.trim();
}

function cleanPhone(phone?: string): string {
  if (!phone) return '';
  return phone.replace(/[^0-9]/g, '').slice(-10);
}

export const DuplicatesAuditModal: React.FC<DuplicatesAuditModalProps> = ({
  isOpen,
  onClose,
  trainees,
  onRefresh
}) => {
  const { showToast, branches, courses } = useCenter();
  const [activeTab, setActiveTab] = useState<'all' | 'duplicates' | 'siblings'>('duplicates');
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Group trainees by normalized name and detect duplicates vs siblings
  const auditGroups = useMemo(() => {
    const nameMap: Record<string, Trainee[]> = {};

    // 1. Group by exact normalized full name
    trainees.forEach(t => {
      const norm = normalizeArabicFull(t.fullName);
      if (!norm) return;
      if (!nameMap[norm]) nameMap[norm] = [];
      nameMap[norm].push(t);
    });

    const results: Array<{
      type: 'duplicate' | 'sibling';
      title: string;
      reason: string;
      records: Trainee[];
    }> = [];

    // Confirmed Duplicates (same normalized name)
    Object.entries(nameMap).forEach(([norm, list]) => {
      if (list.length > 1) {
        results.push({
          type: 'duplicate',
          title: `تكرار مؤكد: ${list[0].fullName}`,
          reason: 'مطابقة اسم كامل بعد معالجة الألف (أ/ا)، التاء المربوطة (ة/هـ)، الألف المقصورة (ى/ي) ومسافات (عبد X)',
          records: list
        });
      }
    });

    // Detect Siblings (different first names, but same parent phone & parent name)
    const parentPhoneMap: Record<string, Trainee[]> = {};
    trainees.forEach(t => {
      const pPhone = cleanPhone(t.parentPhone);
      if (pPhone && pPhone.length >= 8) {
        if (!parentPhoneMap[pPhone]) parentPhoneMap[pPhone] = [];
        // Only add if not already in a duplicate group
        const norm = normalizeArabicFull(t.fullName);
        if (!nameMap[norm] || nameMap[norm].length === 1) {
          parentPhoneMap[pPhone].push(t);
        }
      }
    });

    Object.entries(parentPhoneMap).forEach(([pPhone, list]) => {
      if (list.length > 1) {
        // Verify they are different students (e.g. different first names)
        results.push({
          type: 'sibling',
          title: `ربط إخوة: عائلة ${list[0].parentName || list[0].fullName.split(' ').slice(1).join(' ')}`,
          reason: `مشاركة نفس رقم ولي الأمر (${list[0].parentPhone || pPhone}) أسماء أطفال مختلفة`,
          records: list
        });
      }
    });

    return results;
  }, [trainees]);

  const duplicateGroups = useMemo(() => auditGroups.filter(g => g.type === 'duplicate'), [auditGroups]);
  const siblingGroups = useMemo(() => auditGroups.filter(g => g.type === 'sibling'), [auditGroups]);

  const filteredGroups = useMemo(() => {
    let list = activeTab === 'duplicates' 
      ? duplicateGroups 
      : activeTab === 'siblings' 
      ? siblingGroups 
      : auditGroups;

    if (searchQuery.trim()) {
      const q = normalizeArabicFull(searchQuery);
      list = list.filter(g => 
        normalizeArabicFull(g.title).includes(q) || 
        g.records.some(r => normalizeArabicFull(r.fullName).includes(q) || cleanPhone(r.phone).includes(q))
      );
    }
    return list;
  }, [auditGroups, duplicateGroups, siblingGroups, activeTab, searchQuery]);

  if (!isOpen) return null;

  const handleDeleteTrainee = async (trainee: Trainee) => {
    if (!window.confirm(`هل أنت أرجح في حذف السجل المكرر لـ (${trainee.fullName} - ${trainee.code})؟ لن يمكن التراجع.`)) return;

    setDeletingId(trainee.id);
    try {
      const res = await api.deleteTrainee(trainee.id);
      if (res && res.success) {
        showToast(`تم حذف السجل المكرر (${trainee.code}) بنجاح 🎉`, 'success');
        await onRefresh();
      } else {
        showToast('حدث خطأ أثناء الحذف', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'فشل حذف المتدرب المكرر', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn" dir="rtl">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-100 flex items-center gap-2">
                فحص وتدقيق المتدربين المكررين والتشابه العربي
              </h3>
              <p className="text-xs text-slate-400">
                تدقيق ذكي لمطابقة (أ/ا)، (ة/هـ)، (ى/ي)، (عبد X) والأرقام للوصول للطلاب المكررين
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Summary Bar */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 grid grid-cols-3 gap-3">
          <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-2xl text-center">
            <p className="text-xs text-slate-400 font-bold">إجمالي طلاب النظام</p>
            <p className="text-xl font-black text-slate-100 font-mono mt-1">{trainees.length}</p>
          </div>
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-center">
            <p className="text-xs text-rose-300 font-bold flex items-center justify-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>تكرارات مؤكدة</span>
            </p>
            <p className="text-xl font-black text-rose-400 font-mono mt-1">{duplicateGroups.length}</p>
          </div>
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-2xl text-center">
            <p className="text-xs text-blue-300 font-bold flex items-center justify-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>ربط إخوة عائلات</span>
            </p>
            <p className="text-xl font-black text-blue-400 font-mono mt-1">{siblingGroups.length}</p>
          </div>
        </div>

        {/* Controls & Tabs */}
        <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between bg-slate-900">
          <div className="flex bg-slate-800 p-1 rounded-2xl w-full md:w-auto">
            <button
              onClick={() => setActiveTab('duplicates')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'duplicates'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>تكرارات مؤكدة ({duplicateGroups.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('siblings')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'siblings'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>إخوة وعائلات ({siblingGroups.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>الكل ({auditGroups.length})</span>
            </button>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              placeholder="بحث باسم الطالب أو الهاتف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-4 flex-1">
          {filteredGroups.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-200">
                {activeTab === 'duplicates' 
                  ? 'رائع! لا يوجد أي طلاب مكررين مؤكدين بالنظام حالياً 🎉' 
                  : 'لا توجد نتائج مطابقة للبحث'}
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                النظام يعالج تلقائياً الفروق في الأحرف العربية (أ/ا)، (ة/هـ)، (ى/ي)، والمسافات لمنع التكرار أثناء التسجيل.
              </p>
            </div>
          ) : (
            filteredGroups.map((group, idx) => (
              <div
                key={idx}
                className={`border rounded-2xl p-4 transition-all ${
                  group.type === 'duplicate'
                    ? 'bg-rose-950/20 border-rose-500/40 shadow-lg shadow-rose-950/20'
                    : 'bg-blue-950/20 border-blue-500/40'
                }`}
              >
                <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-xl text-xs font-black ${
                      group.type === 'duplicate' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    }`}>
                      {group.type === 'duplicate' ? '🔴 تكرار مؤكد' : '👨‍👩‍👧‍👦 ربط إخوة'}
                    </span>
                    <h4 className="text-sm font-bold text-slate-100">{group.title}</h4>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">{group.records.length} سجلات متطابقة</span>
                </div>

                <p className="text-xs text-slate-300 mb-4 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  ℹ️ {group.reason}
                </p>

                {/* Sub Cards side-by-side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {group.records.map((trainee) => {
                    const branchName = branches.find(b => b.id === trainee.branchId)?.name || 'الفرع الرئيسي';
                    const courseName = courses.find(c => c.id === trainee.courseId)?.name || '-';

                    return (
                      <div
                        key={trainee.id}
                        className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-3.5 space-y-2 relative hover:border-slate-500 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold">
                            كود: {trainee.code}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            تاريخ: {trainee.registrationDate || '-'}
                          </span>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-slate-100">{trainee.fullName}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            هاتف الطالب: <strong className="font-mono text-slate-200">{trainee.phone || '-'}</strong>
                          </p>
                          <p className="text-[11px] text-slate-400">
                            ولي الأمر: {trainee.parentName || '-'} (<strong className="font-mono text-slate-200">{trainee.parentPhone || '-'}</strong>)
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-300">
                          <span>{trainee.grade || 'غير محدد'}</span>
                          <span className="text-emerald-400 font-bold font-mono">المسدد: {trainee.paidAmount || 0} ج.م</span>
                        </div>

                        {group.type === 'duplicate' && (
                          <div className="pt-2 flex gap-2">
                            <button
                              onClick={() => handleDeleteTrainee(trainee)}
                              disabled={deletingId === trainee.id}
                              className="w-full py-2 px-3 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>{deletingId === trainee.id ? 'جاري الحذف...' : 'حذف هذا السجل المكرر'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
