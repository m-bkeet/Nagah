import React, { useState, useEffect } from 'react';
import { useCenter } from '../context/CenterContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Receipt, Plus, Search, Filter, DollarSign, X, Calendar, UserCheck } from 'lucide-react';
import { Expense, ExpenseCategory } from '../types';

export const ExpensesView: React.FC = () => {
  const { branches, activeBranchId, showToast, refreshKey } = useCenter();
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [formData, setFormData] = useState<any>({
    title: '',
    category: 'maintenance',
    amount: 100,
    beneficiary: '',
    documentNumber: '',
    paymentMethod: 'cash',
    branchId: '',
    notes: ''
  });

  const categories: { id: ExpenseCategory; label: string }[] = [
    { id: 'rent', label: 'إيجار المقر' },
    { id: 'electricity', label: 'كهرباء ومرافق' },
    { id: 'internet', label: 'إنترنت واتصالات' },
    { id: 'maintenance', label: 'صيانة وأجهزة' },
    { id: 'tools', label: 'أدوات ومستلزمات مكتبية' },
    { id: 'hospitality', label: 'بوفيه وضيافة' },
    { id: 'salaries', label: 'رواتب موظفين' },
    { id: 'trainers', label: 'مستحقات ومدربين' },
    { id: 'marketing', label: 'تسويق وإعلانات' },
    { id: 'transport', label: 'انتقالات ومواصلات' },
    { id: 'other', label: 'مصروفات أخرى ونثريات' }
  ];

  useEffect(() => {
    loadExpenses();
  }, [activeBranchId, selectedCategory, refreshKey]);

  const loadExpenses = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {};
      if (activeBranchId !== 'all') params.branchId = activeBranchId;
      if (selectedCategory !== 'all') params.category = selectedCategory;

      const res = await api.getExpenses(params);
      setExpenses(res);
    } catch (err: any) {
      showToast(err.message || 'فشل تحميل المصروفات', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      category: 'maintenance',
      amount: 150,
      beneficiary: '',
      documentNumber: 'EXP-' + Math.floor(1000 + Math.random() * 9000),
      paymentMethod: 'cash',
      branchId: activeBranchId !== 'all' ? activeBranchId : branches?.[0]?.id || 'branch-1',
      notes: ''
    });
    setIsAddModalOpen(true);
  };

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || formData.amount <= 0) {
      showToast('يرجى كتابة عنوان المصروف والمبلغ', 'warning');
      return;
    }

    try {
      const res = await api.createExpense({
        ...formData,
        paidByUserId: user?.id,
        paidByUserName: user?.fullName
      });

      if (res.success) {
        showToast(`تم تسجيل سند صرف المصروف (${res.expense.title}) بنجاح`, 'success');
        setIsAddModalOpen(false);
        loadExpenses();
      }
    } catch (err: any) {
      showToast(err.message || 'فشل تسجيل المصروف', 'error');
    }
  };

  const totalExpenseAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-800/60 border border-slate-700/70 p-4 rounded-2xl backdrop-blur-md">
        <div>
          <h2 className="text-lg font-black text-slate-100 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-rose-400" />
            إدارة المصروفات والنفقات التشغيلية
            <span className="text-xs bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-mono font-bold">
              إجمالي: {totalExpenseAmount.toLocaleString()} ج.م
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            تسجيل فواتير الكهرباء، الإيجارات، الصيانة، البوفيه، ومستلزمات التدريب
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
          >
            <option value="all">جميع بنود المصروفات</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل سند صرف جديد</span>
          </button>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md">
        <table className="w-full text-right text-xs">
          <thead className="bg-slate-900/90 text-slate-300 font-bold border-b border-slate-700 select-none">
            <tr>
              <th className="p-3.5">رقم السند</th>
              <th className="p-3.5">التاريخ</th>
              <th className="p-3.5">بيان المصروف</th>
              <th className="p-3.5">البند والتصنيف</th>
              <th className="p-3.5">الجهة المستفيدة</th>
              <th className="p-3.5">المبلغ</th>
              <th className="p-3.5">طريقة الصرف</th>
              <th className="p-3.5">المسؤول</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/60 text-slate-200">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  جاري تحميل المصروفات...
                </td>
              </tr>
            ) : expenses.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  لا توجد مصروفات مسجلة ضمن هذا التصنيف.
                </td>
              </tr>
            ) : (
              expenses.map((exp) => {
                const catLabel = categories.find((c) => c.id === exp.category)?.label || exp.category;

                return (
                  <tr key={exp.id} className="hover:bg-slate-700/40 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-amber-400">{exp.documentNumber}</td>
                    <td className="p-3.5 font-mono text-slate-400">{exp.date}</td>
                    <td className="p-3.5 font-bold text-slate-100">{exp.title}</td>
                    <td className="p-3.5">
                      <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded border border-slate-700 text-slate-300">
                        {catLabel}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-300">{exp.beneficiary || '-'}</td>
                    <td className="p-3.5 font-mono font-black text-rose-400 text-sm">
                      {exp.amount} ج.م
                    </td>
                    <td className="p-3.5 text-slate-300">{exp.paymentMethod}</td>
                    <td className="p-3.5 text-slate-400">{exp.paidByUserName || 'مسؤول الخزينة'}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-lg w-full p-6 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-sm">تسجيل سند صرف مصروف</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">بيان المصروف *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: فاتورة كهرباء شهر أغسطس للقاعة 1"
                  value={formData.title ?? ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">بند المصروف *</label>
                  <select
                    value={formData.category ?? ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-rose-400 font-bold mb-1">المبلغ المصروف (ج.م) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.amount ?? ''}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-rose-500 rounded-xl px-3 py-2 text-rose-300 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">الجهة المستفيدة / المستلم</label>
                  <input
                    type="text"
                    placeholder="مثال: شركة الكهرباء / فني الصيانة"
                    value={formData.beneficiary ?? ''}
                    onChange={(e) => setFormData({ ...formData, beneficiary: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">طريقة الدفع</label>
                  <select
                    value={formData.paymentMethod ?? ''}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  >
                    <option value="cash">نقداً من الخزينة</option>
                    <option value="vodafone_cash">فودافون كاش</option>
                    <option value="instapay">انستاباي</option>
                    <option value="bank_transfer">تحويل بنكي</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg"
                >
                  حفظ سند الصرف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
