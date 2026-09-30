import React, { useState } from 'react';
import { X, DollarSign, CreditCard, User, FileText, CheckCircle2, ShieldCheck, Printer } from 'lucide-react';
import { Trainer, TrainerSettlement } from '../types';
import { api } from '../services/api';

interface TrainerPayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainer: Trainer | null;
  suggestedAmount: number;
  totalCollected: number;
  trainerPercentage: number;
  onSuccess: (settlement: TrainerSettlement) => void;
}

export const TrainerPayoutModal: React.FC<TrainerPayoutModalProps> = ({
  isOpen,
  onClose,
  trainer,
  suggestedAmount,
  totalCollected,
  trainerPercentage,
  onSuccess
}) => {
  const [amount, setAmount] = useState<number>(suggestedAmount || 0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'vodafone_cash' | 'instapay' | 'bank_transfer'>('cash');
  const [periodDescription, setPeriodDescription] = useState<string>('تسوية مستحقات ونسبة المحاضر للشهر الحالي');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [issuedSettlement, setIssuedSettlement] = useState<TrainerSettlement | null>(null);

  if (!isOpen || !trainer) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      alert('يرجى إدخال مبلغ صحيح للصرف');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.createTrainerSettlement({
        trainerId: trainer.id,
        amount: Number(amount),
        paymentMethod,
        periodDescription,
        notes,
        branchId: trainer.branchId || 'branch-1'
      });

      if (res.success && res.settlement) {
        try {
          new BroadcastChannel('nagah_finance_channel').postMessage({ type: 'FINANCE_MUTATED' });
          localStorage.setItem('nagah_last_financial_mutation', Date.now().toString());
        } catch {}
        setIssuedSettlement(res.settlement);
        onSuccess(res.settlement);
      }
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء صرف المستحقات');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto print-modal-overlay" dir="rtl">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-xl w-full my-auto flex flex-col overflow-hidden print-modal-box">
        
        {/* Header */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-black text-sm text-slate-900 dark:text-white">
              صرف وتسوية مستحقات المحاضر ({trainer.name})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form or Receipt View */}
        {!issuedSettlement ? (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
            
            {/* Quick Trainer Stats Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">إجمالي المحصل من طلاب المدرب:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{totalCollected.toLocaleString()} ج.م</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">نسبة المدرب المتفق عليها:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{trainerPercentage}%</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-emerald-200/60 dark:border-emerald-500/20">
                <span className="text-xs font-black text-emerald-950 dark:text-emerald-200">الصافي المستحق للمدرب حالياً:</span>
                <span className="font-mono font-black text-lg text-emerald-700 dark:text-emerald-300">
                  {suggestedAmount.toLocaleString()} ج.م
                </span>
              </div>
            </div>

            {/* Payout Amount Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                المبلغ المراد صرفه الآن (ج.م):
              </label>
              <input
                type="number"
                min="1"
                step="1"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-emerald-500/50 focus:border-emerald-500 rounded-2xl p-3 text-lg font-black font-mono text-center text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                طريقة الصرف:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'cash', label: 'نقداً كاش' },
                  { id: 'vodafone_cash', label: 'فودافون كاش' },
                  { id: 'instapay', label: 'انستا باي' },
                  { id: 'bank_transfer', label: 'تحويل بنكي' }
                ].map(m => (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                      paymentMethod === m.id
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Period / Reason */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                بيان الفترة / المستحقات:
              </label>
              <input
                type="text"
                value={periodDescription}
                onChange={(e) => setPeriodDescription(e.target.value)}
                placeholder="مثال: تسوية مستحقات شهر سبتمبر كاملة"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                ملاحظات إضافية (اختياري):
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أي ملاحظات تخص التسوية المالية..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
              >
                إلغاء
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'جاري الاعتماد والصرف...' : 'اعتماد الصرف وتسجيل التسوية في الخزنة 💰'}</span>
              </button>
            </div>

          </form>
        ) : (
          /* Settlement Voucher Print View */
          <div className="p-6 space-y-6">
            <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-500/50 text-slate-900 space-y-4">
              <div className="text-center space-y-1">
                <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full inline-block">
                  سند صرف مستحقات ونسبة محاضر معتمد
                </span>
                <h4 className="font-mono text-sm font-black text-slate-900 mt-1">
                  رقم السند: {issuedSettlement.receiptNumber || issuedSettlement.id}
                </h4>
                <p className="text-xs text-slate-500">{issuedSettlement.date}</p>
              </div>

              <div className="space-y-2 text-xs border-y border-emerald-200 py-3">
                <div className="flex justify-between">
                  <span className="font-bold text-slate-600">المحاضر المستفيد:</span>
                  <span className="font-black text-slate-900">{trainer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-slate-600">المبلغ المصروف:</span>
                  <span className="font-mono font-black text-emerald-700 text-base">{issuedSettlement.amount} ج.م</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-slate-600">طريقة الصرف:</span>
                  <span className="font-bold text-slate-800">{issuedSettlement.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-slate-600">البيان:</span>
                  <span className="text-slate-800">{issuedSettlement.periodDescription}</span>
                </div>
              </div>

              <div className="pt-2 grid grid-cols-2 gap-4 text-center text-xs">
                <div>
                  <span className="font-bold text-slate-600 block">توقيع المستلم:</span>
                  <span className="text-slate-400 block mt-4">............................</span>
                </div>
                <div>
                  <span className="font-bold text-slate-600 block">أمين الخزينة:</span>
                  <span className="text-slate-400 block mt-4">............................</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 print:hidden">
              <button
                type="button"
                onClick={handlePrint}
                className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة السند 🖨️</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-all cursor-pointer"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
