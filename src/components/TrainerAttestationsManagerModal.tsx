import React, { useState, useEffect } from 'react';
import { X, Award, Plus, Printer, Share2, Calendar, Clock, FileText, CheckCircle2, Search, Trash2 } from 'lucide-react';
import { Trainer, TrainerAttestation, Branch } from '../types';
import { TrainerAttestationModal } from './TrainerAttestationModal';

interface TrainerAttestationsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainer: Trainer | null;
  allTrainers: Trainer[];
  branches: Branch[];
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
  centerSettings?: {
    name?: string;
    phone?: string;
    logoUrl?: string;
  };
}

export const TrainerAttestationsManagerModal: React.FC<TrainerAttestationsManagerModalProps> = ({
  isOpen,
  onClose,
  trainer,
  allTrainers,
  branches,
  onShowToast,
  centerSettings
}) => {
  const [attestations, setAttestations] = useState<TrainerAttestation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTrainerId, setSelectedTrainerId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');

  // Preview Printable Modal
  const [previewAttestation, setPreviewAttestation] = useState<TrainerAttestation | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // New Attestation Form
  const [formData, setFormData] = useState({
    title: '',
    type: 'course_execution' as 'course_execution' | 'single_day_lecture' | 'workshop',
    hoursCount: 8,
    executionDate: new Date().toISOString().split('T')[0],
    branchId: '',
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      const initialId = trainer?.id || (allTrainers.length > 0 ? allTrainers[0].id : '');
      setSelectedTrainerId(initialId);
      if (initialId) {
        fetchAttestations(initialId);
      }
    }
  }, [isOpen, trainer]);

  const fetchAttestations = async (trId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/trainers/attestations?trainerId=${encodeURIComponent(trId)}`);
      const data = await res.json();
      if (data.success) {
        setAttestations(data.attestations || []);
      }
    } catch (err) {
      console.error('Failed to fetch trainer attestations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrainerChange = (trId: string) => {
    setSelectedTrainerId(trId);
    fetchAttestations(trId);
  };

  const currentTrainer = allTrainers.find(t => t.id === selectedTrainerId) || trainer;

  const handleCreateAttestation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTrainer) {
      onShowToast('يرجى اختيار المدرب أولاً', 'error');
      return;
    }
    if (!formData.title.trim()) {
      onShowToast('عنوان الدورة / المحاضرة مطلوب', 'error');
      return;
    }

    const branchObj = branches.find(b => b.id === (formData.branchId || currentTrainer.branchId));
    const branchName = branchObj ? branchObj.name : 'الفرع الرئيسي';

    try {
      const res = await fetch('/api/trainers/attestations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trainerId: currentTrainer.id,
          trainerName: currentTrainer.name,
          trainerCode: currentTrainer.code,
          title: formData.title,
          type: formData.type,
          hoursCount: Number(formData.hoursCount),
          executionDate: formData.executionDate,
          branchId: formData.branchId || currentTrainer.branchId,
          branchName,
          notes: formData.notes
        })
      });

      const data = await res.json();
      if (data.success) {
        onShowToast('تم إصدار الإفادة الرسمية للمدرب بنجاح! 📜', 'success');
        fetchAttestations(currentTrainer.id);
        setActiveTab('list');
        setFormData({
          title: '',
          type: 'course_execution',
          hoursCount: 8,
          executionDate: new Date().toISOString().split('T')[0],
          branchId: '',
          notes: ''
        });
      } else {
        onShowToast(data.error || 'فشل إصدار الإفادة', 'error');
      }
    } catch (err) {
      onShowToast('تعذر الاتصال بالخادم لإصدار الإفادة', 'error');
    }
  };

  const handleDeleteAttestation = async (id: string) => {
    if (!window.confirm('هل أنت تأكد من إلغاء وحذف هذه الإفادة الرسمية؟')) return;
    try {
      const res = await fetch(`/api/trainers/attestations/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        onShowToast('تم حذف الإفادة بنجاح', 'info');
        if (currentTrainer) fetchAttestations(currentTrainer.id);
      }
    } catch (err) {
      onShowToast('فشل حذف الإفادة', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto dir-rtl">
        <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100">
          
          {/* Header */}
          <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-lg text-white">إفادات وشهادات تنفيذ الدورات والمحاضرات للمدربين</h3>
                <p className="text-xs text-slate-400">إصدار وطباعة إفادات رسمية معتمدة برقم تسلسلي وكود مدرب للتقديم للجهات</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Subheader Toolbar & Trainer Selector */}
          <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <span className="text-xs font-bold text-slate-400 whitespace-nowrap">المدرب / المحاضر:</span>
              <select
                value={selectedTrainerId}
                onChange={(e) => handleTrainerChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-500"
              >
                {allTrainers.map(tr => (
                  <option key={tr.id} value={tr.id}>
                    {tr.name} ({tr.code || 'بدون كود'}) - {tr.specialty || 'مدرب'}
                  </option>
                ))}
              </select>
            </div>

            {/* Tab Switcher */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 gap-1">
              <button
                onClick={() => setActiveTab('list')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'list' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                سجل الإفادات ({attestations.length})
              </button>
              <button
                onClick={() => setActiveTab('create')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  activeTab === 'create' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إصدار إفادة جديدة</span>
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-6">
            
            {activeTab === 'list' ? (
              <div className="space-y-4">
                {isLoading ? (
                  <div className="py-12 text-center text-slate-400 text-xs font-bold">
                    جاري تحميل سجل إفادات المدرب...
                  </div>
                ) : attestations.length === 0 ? (
                  <div className="py-12 text-center space-y-3 bg-slate-950/40 rounded-2xl border border-slate-800">
                    <FileText className="w-12 h-12 text-slate-600 mx-auto" />
                    <p className="text-sm font-bold text-slate-300">لا توجد إفادات صادرة لهذا المدرب بعد</p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      يمكنك إصدار إفادة رسمية بتنفيذ دورة تدريبية أو محاضرة اليوم الواحد بالضغط على "إصدار إفادة جديدة"
                    </p>
                    <button
                      onClick={() => setActiveTab('create')}
                      className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-lg"
                    >
                      إصدار أول إفادة الآن
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {attestations.map((att) => (
                      <div
                        key={att.id}
                        className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 transition-all space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-[10px] uppercase">
                              {att.type === 'single_day_lecture' ? 'محاضرة اليوم الواحد' : att.type === 'workshop' ? 'ورشة عمل' : 'دورة تدريبية'}
                            </span>
                            <h4 className="font-black text-sm text-white mt-1.5">{att.title}</h4>
                          </div>

                          <span className="font-mono text-[11px] font-bold text-slate-400 dir-ltr bg-slate-900 px-2 py-1 rounded-lg">
                            #{att.attestationNumber}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-2 border-t border-slate-900">
                          <div>
                            <span className="text-[10px] text-slate-500 block">عدد الساعات:</span>
                            <span className="font-bold text-amber-300">{att.hoursCount} ساعة</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block">تاريخ التنفيذ:</span>
                            <span className="font-bold text-slate-200">{att.executionDate}</span>
                          </div>
                        </div>

                        <div className="pt-2 flex items-center justify-between border-t border-slate-900/80">
                          <button
                            onClick={() => {
                              setPreviewAttestation(att);
                              setIsPreviewOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-all"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>معاينة وطباعة الشهادة 🖨️</span>
                          </button>

                          <button
                            onClick={() => handleDeleteAttestation(att.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition-all"
                            title="حذف الإفادة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Create Attestation Form */
              <form onSubmit={handleCreateAttestation} className="space-y-4 max-w-2xl mx-auto bg-slate-950 p-6 rounded-3xl border border-slate-800">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-amber-400">عنوان الدورة أو المحاضرة التدريبية *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: محاضرة الذكاء الاصطناعي والتطبيقات العملية الفعالة"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-300">نوع الفعالية التدريبية *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="course_execution">تنفيذ دورة تدريبية معتمدة</option>
                      <option value="single_day_lecture">محاضرة اليوم الواحد المكثفة</option>
                      <option value="workshop">ورشة عمل تدريبية متخصصة</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-300">عدد الساعات التدريبية *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={500}
                      value={formData.hoursCount}
                      onChange={(e) => setFormData({ ...formData, hoursCount: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-300">تاريخ التنفيذ *</label>
                    <input
                      type="date"
                      required
                      value={formData.executionDate}
                      onChange={(e) => setFormData({ ...formData, executionDate: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-300">مقر الفرع</label>
                    <select
                      value={formData.branchId}
                      onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="">الفرع الافتراضي للمدرب</option>
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-400">ملاحظات إضافية (اختياري)</label>
                  <input
                    type="text"
                    placeholder="أي توثيقات أو ملاحظات إضافية على الإفادة"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('list')}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-lg"
                  >
                    حفظ وإصدار الإفادة الرسمية 📜
                  </button>
                </div>
              </form>
            )}

          </div>

        </div>
      </div>

      {/* Printable Certificate Modal */}
      <TrainerAttestationModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        attestation={previewAttestation}
        centerSettings={centerSettings}
      />
    </>
  );
};
