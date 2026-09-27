import React, { useState } from 'react';
import {
  X,
  Search,
  RotateCcw,
  Trash2,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';
import { Trainee } from '../types';
import { api } from '../services/api';

interface ClearTraineeExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainees: Trainee[];
  onCleared: () => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export const ClearTraineeExamModal: React.FC<ClearTraineeExamModalProps> = ({
  isOpen,
  onClose,
  trainees,
  onCleared,
  showToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrainee, setSelectedTrainee] = useState<Trainee | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  if (!isOpen) return null;

  const filtered = trainees.filter(t =>
    t.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.phone?.includes(searchTerm)
  );

  const handleClearRecords = async () => {
    if (!selectedTrainee) return;
    const confirm = window.confirm(`هل أنت متأكد من تصفير ومسح كافة محاولات ونتائج الاختبارات للطالب (${selectedTrainee.fullName})؟ سيتم حذف أي محاولة راسب أو درجات تجريبية ليتسنى له خوض الاختبارات من جديد.`);
    if (!confirm) return;

    setIsClearing(true);
    try {
      const res = await api.clearTraineeExamResults({
        traineeId: selectedTrainee.id,
        traineeCode: selectedTrainee.code,
        traineeName: selectedTrainee.fullName
      });

      showToast(res.message || `تم تصفير ومسح سجلات الاختبارات للطالب ${selectedTrainee.fullName} بنجاح ✅`, 'success');
      onCleared();
      onClose();
    } catch (e: any) {
      showToast(e.message || 'حدث خطأ أثناء تصفير السجلات', 'error');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-red-100 dark:bg-red-950/50 text-red-600 rounded-2xl">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                تصفير وإعادة ضبط محاولات طالب 🔄
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                حذف محاولات الاختبارات التجريبية أو الخاطئة للطالب وتفريغ المحاولة
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Note */}
        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
          <p className="leading-relaxed">
            يُستخدم هذا الخيار عندما يختبر المعلم المنظومة بحساب طالب (مثل تجربة ولي الأمر أو الطالب)، ويرغب في حذف نتيجة الرسوب أو المحاولة التجريبية حتى لا تظهر في الكشوفات أو تصدر لها شهادات خاطئة.
          </p>
        </div>

        {/* Search Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            ابحث عن الطالب (بالاسم أو الكود):
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="اكتب اسم الطالب مثل: لين..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pr-9 pl-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Trainees List to Pick */}
        <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-1.5 border border-slate-100 dark:border-slate-800 p-1 rounded-2xl">
          {filtered.slice(0, 10).map(t => {
            const isSelected = selectedTrainee?.id === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTrainee(t)}
                className={`w-full p-2.5 rounded-xl text-right flex items-center justify-between text-xs transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white font-bold shadow'
                    : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div>
                  <p className="font-bold">{t.fullName}</p>
                  <p className={`text-[11px] ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                    كود: {t.code} • {t.grade || 'طالب بالمركز'}
                  </p>
                </div>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
          >
            إلغاء
          </button>

          <button
            onClick={handleClearRecords}
            disabled={!selectedTrainee || isClearing}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow transition-all ${
              !selectedTrainee || isClearing
                ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/20 active:scale-95 cursor-pointer'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>{isClearing ? 'جاري المسح...' : 'مسح المحاولات والنتائج الآن 🗑️'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
