import React, { useState, useEffect, useMemo } from 'react';
import { useCenter } from '../context/CenterContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Receipt, Plus, Search, Filter, DollarSign, X, Calendar, 
  Printer, Edit3, Trash2, Building, Building2, Download, 
  CheckCircle2, ArrowUpDown, FileText, Wallet, Clock, User, Share2, Copy
} from 'lucide-react';
import { Expense, ExpenseCategory } from '../types';

export function tafqeetArabic(num: number): string {
  if (!num || isNaN(num) || num <= 0) return '';
  const ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة',
    'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
  const tens = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
  const hundreds = ['', 'مائة', 'مئتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];

  const convertLessThanThousand = (n: number): string => {
    if (n === 0) return '';
    let res = '';
    const h = Math.floor(n / 100);
    const rem = n % 100;
    if (h > 0) res += hundreds[h];
    if (rem > 0) {
      if (res) res += ' و';
      if (rem < 20) {
        res += ones[rem];
      } else {
        const o = rem % 10;
        const t = Math.floor(rem / 10);
        if (o > 0) res += ones[o] + ' و';
        res += tens[t];
      }
    }
    return res;
  };

  const thousands = Math.floor(num / 1000);
  const remainder = num % 1000;
  let result = '';

  if (thousands > 0) {
    if (thousands === 1) result += 'ألف';
    else if (thousands === 2) result += 'ألفان';
    else if (thousands >= 3 && thousands <= 10) result += convertLessThanThousand(thousands) + ' آلاف';
    else result += convertLessThanThousand(thousands) + ' ألف';
  }

  if (remainder > 0) {
    if (result) result += ' و';
    result += convertLessThanThousand(remainder);
  }

  return (result ? result : String(num)) + ' جنيه مصري فقط لا غير';
}

export const ExpensesView: React.FC = () => {
  const { branches, activeBranchId, showToast, refreshKey, settings } = useCenter();
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [printingExpense, setPrintingExpense] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [isDeletingExpense, setIsDeletingExpense] = useState(false);

  // Filters
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>(activeBranchId || 'all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [formData, setFormData] = useState<{
    title: string;
    category: ExpenseCategory;
    amount: number;
    beneficiary: string;
    documentNumber: string;
    paymentMethod: string;
    branchId: string;
    date: string;
    notes: string;
  }>({
    title: '',
    category: 'rent',
    amount: 1000,
    beneficiary: '',
    documentNumber: '',
    paymentMethod: 'cash',
    branchId: activeBranchId !== 'all' ? activeBranchId : 'branch-2',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const categories: { id: ExpenseCategory; label: string; icon: string }[] = [
    { id: 'rent', label: 'إيجار المقر والمنشأة', icon: '🏢' },
    { id: 'electricity', label: 'كهرباء ومرافق عامة', icon: '⚡' },
    { id: 'internet', label: 'إنترنت واتصالات', icon: '🌐' },
    { id: 'maintenance', label: 'صيانة وأجهزة وحواسب', icon: '🛠️' },
    { id: 'tools', label: 'مستلزمات مكتبية وطباعة', icon: '📦' },
    { id: 'hospitality', label: 'بوفيه وضيافة', icon: '☕' },
    { id: 'salaries', label: 'رواتب موظفين وإداريين', icon: '👥' },
    { id: 'owner_drawings', label: 'صرف حصة المالك / أرباح صاحب المركز', icon: '👑' },
    { id: 'trainers', label: 'مستحقات وسلف مدربين', icon: '👨‍🏫' },
    { id: 'marketing', label: 'تسويق وإعلانات ودعاية', icon: '📢' },
    { id: 'transport', label: 'انتقالات ومواصلات', icon: '🚗' },
    { id: 'other', label: 'مصروفات أخرى ونثريات', icon: '📋' }
  ];

  // Sync selected branch filter when parent activeBranchId changes
  useEffect(() => {
    if (activeBranchId) {
      setSelectedBranchFilter(activeBranchId);
    }
  }, [activeBranchId]);

  useEffect(() => {
    loadExpenses();
  }, [selectedBranchFilter, selectedCategory, refreshKey]);

  const loadExpenses = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {};
      if (selectedBranchFilter !== 'all') params.branchId = selectedBranchFilter;
      if (selectedCategory !== 'all') params.category = selectedCategory;

      const res = await api.getExpenses(params);
      setExpenses(Array.isArray(res) ? res : []);
    } catch (err: any) {
      showToast(err.message || 'فشل تحميل المصروفات', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingExpenseId(null);
    const defaultBranch = selectedBranchFilter !== 'all' 
      ? selectedBranchFilter 
      : (activeBranchId !== 'all' ? activeBranchId : (branches?.[1]?.id || branches?.[0]?.id || 'branch-2'));

    setFormData({
      title: '',
      category: 'rent',
      amount: 1000,
      beneficiary: '',
      documentNumber: 'EXP-' + Math.floor(1000 + Math.random() * 9000),
      paymentMethod: 'cash',
      branchId: defaultBranch,
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exp: Expense) => {
    setEditingExpenseId(exp.id);
    setFormData({
      title: exp.title || exp.description || '',
      category: exp.category || 'other',
      amount: exp.amount || 0,
      beneficiary: exp.beneficiary || '',
      documentNumber: exp.documentNumber || '',
      paymentMethod: exp.paymentMethod || 'cash',
      branchId: exp.branchId || (branches?.[0]?.id || 'branch-2'),
      date: exp.date || new Date().toISOString().split('T')[0],
      notes: exp.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || formData.amount <= 0 || !formData.branchId) {
      showToast('يرجى كتابة بيان المصروف والمبلغ وتحديد الفرع', 'warning');
      return;
    }

    try {
      if (editingExpenseId) {
        // Update existing expense
        const res = await api.updateExpense(editingExpenseId, {
          ...formData,
          paidByUserId: user?.id,
          paidByUserName: user?.fullName
        });
        if (res.success) {
          showToast(`تم تعديل سند الصرف (${res.expense?.documentNumber || ''}) بنجاح`, 'success');
          setIsModalOpen(false);
          await loadExpenses();
          try {
            const ch = new BroadcastChannel('nagah_finance_channel');
            ch.postMessage({ type: 'FINANCE_MUTATED' });
            ch.close();
          } catch {}
          localStorage.setItem('nagah_last_financial_mutation', String(Date.now()));
        }
      } else {
        // Create new expense
        const res = await api.createExpense({
          ...formData,
          paidByUserId: user?.id,
          paidByUserName: user?.fullName
        });
        if (res.success) {
          showToast(`تم تسجيل سند صرف المصروف (${res.expense?.title || formData.title}) بنجاح على الفرع المحدد`, 'success');
          setIsModalOpen(false);
          await loadExpenses();
          try {
            const ch = new BroadcastChannel('nagah_finance_channel');
            ch.postMessage({ type: 'FINANCE_MUTATED' });
            ch.close();
          } catch {}
          localStorage.setItem('nagah_last_financial_mutation', String(Date.now()));
        }
      }
    } catch (err: any) {
      showToast(err.message || 'فشل حفظ المصروف', 'error');
    }
  };

  const handlePromptDelete = (exp: Expense) => {
    setExpenseToDelete(exp);
  };

  const handleConfirmDelete = async () => {
    if (!expenseToDelete) return;
    setIsDeletingExpense(true);
    try {
      const res = await api.deleteExpense(expenseToDelete.id);
      if (res && res.success !== false) {
        showToast(`تم حذف سند الصرف (${expenseToDelete.documentNumber || ''}) بنجاح`, 'success');
        setExpenseToDelete(null);
        await loadExpenses();
        try {
          const ch = new BroadcastChannel('nagah_finance_channel');
          ch.postMessage({ type: 'FINANCE_MUTATED' });
          ch.close();
        } catch {}
        localStorage.setItem('nagah_last_financial_mutation', String(Date.now()));
      } else {
        showToast((res && res.error) || 'فشل حذف سند الصرف', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'فشل حذف سند الصرف', 'error');
    } finally {
      setIsDeletingExpense(false);
    }
  };

  // Quick Date Helpers
  const setQuickDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    setFormData(prev => ({ ...prev, date: d.toISOString().split('T')[0] }));
  };

  // Filtered expenses based on search query
  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchTitle = (exp.title || '').toLowerCase().includes(q);
      const matchBen = (exp.beneficiary || '').toLowerCase().includes(q);
      const matchDoc = (exp.documentNumber || '').toLowerCase().includes(q);
      const matchNotes = (exp.notes || '').toLowerCase().includes(q);
      return matchTitle || matchBen || matchDoc || matchNotes;
    });
  }, [expenses, searchQuery]);

  // Statistics
  const totalExpenseAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
  }, [filteredExpenses]);

  const rentExpensesAmount = useMemo(() => {
    return filteredExpenses
      .filter(e => e.category === 'rent')
      .reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
  }, [filteredExpenses]);

  const badrExpensesAmount = useMemo(() => {
    return expenses
      .filter(e => e.branchId === 'branch-2')
      .reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
  }, [expenses]);

  const nagahExpensesAmount = useMemo(() => {
    return expenses
      .filter(e => e.branchId === 'branch-1')
      .reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
  }, [expenses]);

  const getBranchName = (bId?: string) => {
    if (!bId) return 'فرع غير محدد';
    const found = branches.find(b => b.id === bId);
    if (found) return found.name;
    if (bId === 'branch-2') return 'فرع بدر';
    if (bId === 'branch-1') return 'فرع النجاح';
    return bId;
  };

  const getCategoryDetails = (catId?: string) => {
    const found = categories.find(c => c.id === catId);
    return found || { id: 'other' as ExpenseCategory, label: catId || 'نثريات', icon: '📋' };
  };

  const handleShareVoucherWhatsApp = (exp: Expense) => {
    const text = `🏛️ *${settings?.centerName || 'مركز النجاح للتدريب والاستشارات'}*\n` +
      `🧾 *سند صرف نقدي رسمي معتمد*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📌 *رقم السند:* ${exp.documentNumber}\n` +
      `📅 *التاريخ:* ${exp.date}\n` +
      `🏢 *الفرع والخزينة المحمل عليها:* ${getBranchName(exp.branchId)}\n` +
      `👤 *يصرف إلى السيد/الجهة:* ${exp.beneficiary || 'المستفيد المعتمد'}\n` +
      `💰 *المبلغ المصروف:* ${exp.amount} ج.م (${tafqeetArabic(Number(exp.amount) || 0)})\n` +
      `📋 *بيان المصروف (الغرض):* ${exp.title}\n` +
      `🏷️ *البند والتصنيف:* ${getCategoryDetails(exp.category).label}\n` +
      `💳 *طريقة الصرف:* ${exp.paymentMethod === 'cash' ? 'نقداً من الخزينة' : exp.paymentMethod}\n` +
      (exp.notes ? `📝 *ملاحظات:* ${exp.notes}\n` : '') +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `✍️ *أمين الخزينة:* ${exp.paidByUserName || 'مسؤول الحسابات'}\n` +
      `✅ *اعتماد الإدارة:* د. محمد رمضان بخيت\n` +
      `مؤرشف وموثق بالسجلات المالية الرسمية.`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleCopyVoucherText = async (exp: Expense) => {
    const text = `🏛️ *${settings?.centerName || 'مركز النجاح للتدريب والاستشارات'}*\n` +
      `🧾 *سند صرف نقدي رسمي معتمد*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📌 *رقم السند:* ${exp.documentNumber}\n` +
      `📅 *التاريخ:* ${exp.date}\n` +
      `🏢 *الفرع والخزينة المحمل عليها:* ${getBranchName(exp.branchId)}\n` +
      `👤 *يصرف إلى:* ${exp.beneficiary || 'المستفيد المعتمد'}\n` +
      `💰 *المبلغ المصروف:* ${exp.amount} ج.م (${tafqeetArabic(Number(exp.amount) || 0)})\n` +
      `📋 *بيان المصروف:* ${exp.title}\n` +
      `🏷️ *البند:* ${getCategoryDetails(exp.category).label}\n` +
      (exp.notes ? `📝 *ملاحظات:* ${exp.notes}\n` : '') +
      `اعتماد الإدارة: د. محمد رمضان بخيت`;

    try {
      await navigator.clipboard.writeText(text);
      showToast('تم نسخ بيانات سند الصرف بنجاح! يمكنك لصقه ومشاركته في واتساب', 'success');
    } catch {
      showToast('فشل النسخ تلقائياً', 'error');
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredExpenses.length === 0) {
      showToast('لا توجد بيانات مصروفات لتصديرها', 'warning');
      return;
    }

    const headers = ['رقم السند', 'التاريخ', 'الفرع', 'البند والتصنيف', 'بيان المصروف', 'المبلغ (ج.م)', 'الجهة المستفيدة', 'طريقة الصرف', 'المسؤول', 'الملاحظات'];
    const rows = filteredExpenses.map(e => [
      e.documentNumber || '',
      e.date || '',
      getBranchName(e.branchId),
      getCategoryDetails(e.category).label,
      `"${(e.title || '').replace(/"/g, '""')}"`,
      e.amount || 0,
      `"${(e.beneficiary || '').replace(/"/g, '""')}"`,
      e.paymentMethod === 'cash' ? 'نقداً من الخزينة' : e.paymentMethod === 'vodafone_cash' ? 'فودافون كاش' : e.paymentMethod === 'instapay' ? 'انستاباي' : 'تحويل بنكي',
      `"${(e.paidByUserName || '').replace(/"/g, '""')}"`,
      `"${(e.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `كشف_المصروفات_${selectedBranchFilter}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('تم تصدير كشف المصروفات بنجاح', 'success');
  };

  return (
    <div className="space-y-4">

      {/* 1. TOP SUMMARY CARDS (Modern daylight-crisp cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        {/* Total Expenses */}
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5">إجمالي المصروفات</span>
            <span className="text-lg font-black text-rose-600 dark:text-rose-400 font-mono">
              {totalExpenseAmount.toLocaleString()} <span className="text-xs font-normal">ج.م</span>
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{filteredExpenses.length} سند صرف</span>
          </div>
          <div className="p-2.5 bg-rose-50 dark:bg-rose-500/15 rounded-xl text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-500/30">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        {/* Rent & Facilities */}
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5">بند الإيجارات والمقرات</span>
            <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 font-mono">
              {rentExpensesAmount.toLocaleString()} <span className="text-xs font-normal">ج.م</span>
            </span>
            <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-bold block mt-0.5">إيجار المراكز والفروع</span>
          </div>
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/15 rounded-xl text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/30">
            <Building className="w-5 h-5" />
          </div>
        </div>

        {/* Badr Branch Expenses */}
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">مصروفات فرع بدر</span>
            </div>
            <span className="text-lg font-black text-blue-600 dark:text-blue-400 font-mono">
              {badrExpensesAmount.toLocaleString()} <span className="text-xs font-normal">ج.م</span>
            </span>
            <span className="text-[10px] text-blue-500 dark:text-blue-400 font-bold block mt-0.5">مخصومة من خزينة بدر</span>
          </div>
          <div className="p-2.5 bg-blue-50 dark:bg-blue-500/15 rounded-xl text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/30">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        {/* Nagah Branch Expenses */}
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">مصروفات فرع النجاح</span>
            </div>
            <span className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono">
              {nagahExpensesAmount.toLocaleString()} <span className="text-xs font-normal">ج.م</span>
            </span>
            <span className="text-[10px] text-amber-500 dark:text-amber-400 font-bold block mt-0.5">المقر الرئيسي</span>
          </div>
          <div className="p-2.5 bg-amber-50 dark:bg-amber-500/15 rounded-xl text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/30">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* 2. CONTROL BAR & FILTERS (Pristine Light Theme) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs space-y-3">
        
        {/* Row 1: Title & Main Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-rose-500" />
              <span>إدارة المصروفات والنفقات التشغيلية</span>
              <span className="text-xs font-black bg-rose-50 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-500/30">
                {totalExpenseAmount.toLocaleString()} ج.م
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              تسجيل الإيجارات وفواتير المرافق، مع تحديد الفرع المحمل عليه الصرف والتاريخ وطباعة السندات
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
              title="تصدير كشف المصروفات بصيغة CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">تصدير كشف</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>تسجيل سند صرف جديد</span>
            </button>
          </div>
        </div>

        {/* Row 2: Branch Tabs & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Branch Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setSelectedBranchFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                selectedBranchFilter === 'all'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              جميع الفروع
            </button>
            <button
              type="button"
              onClick={() => setSelectedBranchFilter('branch-2')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                selectedBranchFilter === 'branch-2'
                  ? 'bg-blue-600 text-white shadow-xs font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'
              }`}
            >
              <span>🏛️ فرع بدر</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedBranchFilter('branch-1')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                selectedBranchFilter === 'branch-1'
                  ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-amber-600'
              }`}
            >
              <span>⭐ فرع النجاح</span>
            </button>
          </div>

          {/* Search & Category Filter */}
          <div className="flex items-center gap-2 flex-1 sm:max-w-md">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث في البيان أو المستفيد أو السند..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pr-9 pl-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
            >
              <option value="all">جميع البنود</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.label}
                </option>
              ))}
            </select>
          </div>

        </div>

      </div>

      {/* 3. EXPENSES LIST (Clean Daylight Responsive Table + Mobile Cards) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800 select-none">
              <tr>
                <th className="p-3.5">رقم السند</th>
                <th className="p-3.5">التاريخ</th>
                <th className="p-3.5">الفرع المحمل عليه</th>
                <th className="p-3.5">البند والتصنيف</th>
                <th className="p-3.5">بيان المصروف</th>
                <th className="p-3.5">الجهة المستفيدة</th>
                <th className="p-3.5">المبلغ</th>
                <th className="p-3.5">طريقة الصرف</th>
                <th className="p-3.5 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    جاري تحميل المصروفات...
                  </td>
                </tr>
              ) : filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 dark:text-slate-400 space-y-2">
                    <Receipt className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-1" />
                    <p className="font-bold text-sm text-slate-700 dark:text-slate-300">لا توجد سندات صرف مسجلة ضمن هذه المعايير</p>
                    <p className="text-xs text-slate-400">يمكنك تسجيل سند صرف جديد لأي فرع وتحديد تاريخه ومبلغه الآن.</p>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => {
                  const cat = getCategoryDetails(exp.category);
                  const isBadr = exp.branchId === 'branch-2';

                  return (
                    <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-amber-600 dark:text-amber-400">
                        {exp.documentNumber}
                      </td>
                      <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {exp.date}
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                          isBadr
                            ? 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/40'
                            : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40'
                        }`}>
                          <Building className="w-3 h-3" />
                          <span>{getBranchName(exp.branchId)}</span>
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                          <span>{cat.icon}</span>
                          <span>{cat.label}</span>
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white max-w-xs truncate" title={exp.title}>
                        {exp.title}
                        {exp.notes && (
                          <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-normal truncate">
                            {exp.notes}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-700 dark:text-slate-300">
                        {exp.beneficiary ? (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            <span>{exp.beneficiary}</span>
                          </span>
                        ) : '—'}
                      </td>
                      <td className="p-3.5 font-mono font-black text-rose-600 dark:text-rose-400 text-sm whitespace-nowrap">
                        {(Number(exp.amount) || 0).toLocaleString()} ج.م
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-400 text-[11px]">
                        {exp.paymentMethod === 'vodafone_cash' ? '📱 فودافون كاش' :
                         exp.paymentMethod === 'instapay' ? '⚡ انستاباي' :
                         exp.paymentMethod === 'bank_transfer' ? '🏛️ تحويل بنكي' : '💵 نقداً'}
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* Print Button */}
                          <button
                            type="button"
                            onClick={() => setPrintingExpense(exp)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-400 dark:hover:text-indigo-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="طباعة إيصال وسند الصرف"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(exp)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-amber-600 hover:bg-amber-50 dark:text-slate-400 dark:hover:text-amber-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="تعديل سند الصرف"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handlePromptDelete(exp)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="حذف سند الصرف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View: High-Quality Crisp Cards */}
        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
          {isLoading ? (
            <div className="py-10 text-center text-slate-500 text-xs">جاري تحميل المصروفات...</div>
          ) : filteredExpenses.length === 0 ? (
            <div className="py-10 text-center text-slate-500 text-xs space-y-1">
              <Receipt className="w-8 h-8 mx-auto text-slate-300 mb-1" />
              <p className="font-bold text-slate-700 dark:text-slate-300">لا توجد مصروفات مسجلة</p>
            </div>
          ) : (
            filteredExpenses.map((exp) => {
              const cat = getCategoryDetails(exp.category);
              const isBadr = exp.branchId === 'branch-2';

              return (
                <div key={exp.id} className="p-3.5 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-amber-600 dark:text-amber-400 text-xs">
                          {exp.documentNumber}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">• {exp.date}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs mt-0.5">
                        {exp.title}
                      </h4>
                    </div>
                    <div className="text-left shrink-0">
                      <span className="font-mono font-black text-rose-600 dark:text-rose-400 text-sm block">
                        {(Number(exp.amount) || 0).toLocaleString()} ج.م
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                    <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md border ${
                      isBadr
                        ? 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300'
                        : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300'
                    }`}>
                      <Building className="w-3 h-3" />
                      <span>{getBranchName(exp.branchId)}</span>
                    </span>

                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {cat.icon} {cat.label}
                    </span>

                    {exp.beneficiary && (
                      <span className="bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                        المستفيد: {exp.beneficiary}
                      </span>
                    )}
                  </div>

                  {exp.notes && (
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                      {exp.notes}
                    </p>
                  )}

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <span className="text-[10px] text-slate-400">
                      {exp.paymentMethod === 'vodafone_cash' ? '📱 فودافون كاش' :
                       exp.paymentMethod === 'instapay' ? '⚡ انستاباي' :
                       exp.paymentMethod === 'bank_transfer' ? '🏛️ تحويل بنكي' : '💵 نقداً'}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setPrintingExpense(exp)}
                        className="px-2.5 py-1 rounded-lg text-indigo-700 bg-indigo-50 dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/40 text-[11px] font-bold flex items-center gap-1"
                      >
                        <Printer className="w-3 h-3" />
                        <span>طباعة</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEdit(exp)}
                        className="px-2.5 py-1 rounded-lg text-amber-800 bg-amber-50 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-200 dark:border-amber-500/40 text-[11px] font-bold flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>تعديل</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePromptDelete(exp)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="حذف سند الصرف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* 4. ADD / EDIT EXPENSE MODAL (Full Daylight & Dark Contrast) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full p-5 sm:p-6 text-slate-800 dark:text-slate-100 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">
                    {editingExpenseId ? 'تعديل سند صرف مصروف' : 'تسجيل سند صرف مصروف جديد'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    رقم السند: <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{formData.documentNumber}</span>
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)} 
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-3.5 text-xs">
              
              {/* Branch Selector (High Priority) */}
              <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 space-y-1.5">
                <label className="block text-amber-900 dark:text-amber-300 font-black">
                  الفرع المحمّل عليه المصروف (يخصم من خزينته) *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, branchId: 'branch-2' })}
                    className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer flex flex-col gap-0.5 ${
                      formData.branchId === 'branch-2'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-bold'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs">🏛️ فرع مركز بدر</span>
                      {formData.branchId === 'branch-2' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-[10px] opacity-80">يخصم من خزينة مركز بدر</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, branchId: 'branch-1' })}
                    className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer flex flex-col gap-0.5 ${
                      formData.branchId === 'branch-1'
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm font-bold'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs">⭐ فرع النجاح</span>
                      {formData.branchId === 'branch-1' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-[10px] opacity-80">المقر الرئيسي</span>
                  </button>
                </div>
              </div>

              {/* Date with Quick Pickers */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 dark:text-slate-300 font-bold">
                    تاريخ صرف المبلغ *
                  </label>
                  <div className="flex items-center gap-1 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setQuickDate(0)}
                      className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold"
                    >
                      اليوم
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDate(1)}
                      className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold"
                    >
                      أمس
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDate(2)}
                      className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold"
                    >
                      أول أمس
                    </button>
                  </div>
                </div>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-mono font-bold focus:ring-2 focus:ring-amber-400"
                />
              </div>

              {/* Title / Description */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  بيان المصروف (الغرض من الصرف) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: إيجار مقر مركز بدر - استكمال مبلغ 1,000 ج.م من أصل 4,000 ج.م"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-amber-400 font-bold"
                />
              </div>

              {/* Category & Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">بند المصروف *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-bold cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-rose-600 dark:text-rose-400 font-black mb-1">المبلغ المصروف (ج.م) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full bg-rose-50/50 dark:bg-slate-950 border border-rose-300 dark:border-rose-500/50 rounded-xl px-3 py-2 text-rose-700 dark:text-rose-300 font-mono font-black text-sm focus:ring-2 focus:ring-rose-400"
                  />
                </div>
              </div>

              {/* Tafqeet Preview */}
              {formData.amount > 0 && (
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300 font-bold">
                  <span>المبلغ كتابة: </span>
                  <span className="text-rose-600 dark:text-rose-400 font-black">{tafqeetArabic(formData.amount)}</span>
                </div>
              )}

              {/* Beneficiary & Payment Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">الجهة المستفيدة / اسم المستلم</label>
                  <input
                    type="text"
                    placeholder="مثال: الحاج عبد الناصر (صاحب المقر)"
                    value={formData.beneficiary}
                    onChange={(e) => setFormData({ ...formData, beneficiary: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">طريقة الصرف</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-bold cursor-pointer"
                  >
                    <option value="cash">💵 نقداً من الخزينة</option>
                    <option value="vodafone_cash">📱 فودافون كاش</option>
                    <option value="instapay">⚡ انستاباي</option>
                    <option value="bank_transfer">🏛️ تحويل بنكي</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">ملاحظات وتفاصيل إضافية</label>
                <textarea
                  rows={2}
                  placeholder="مثال: كان هناك مبلغ سابق مدفوع 3000 وتم استكمال 1000 ج.م إيجار شهر 9"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-amber-400"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold cursor-pointer transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl shadow-md shadow-amber-500/20 cursor-pointer transition-all"
                >
                  {editingExpenseId ? 'حفظ التعديلات' : 'تسجيل سند الصرف'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 5. PRINTABLE VOUCHER MODAL (سند صرف نقدية رسمي معتمد) */}
      {printingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-sm print:p-0">
          <div className="bg-white text-slate-950 rounded-3xl max-w-xl w-full shadow-2xl relative border border-slate-300 max-h-[92vh] flex flex-col overflow-hidden print:border-none print:shadow-none print:m-0 print:p-0 print:max-h-none">
            
            {/* Fixed Top Header (Hidden on Print) */}
            <div className="shrink-0 p-3 sm:p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-rose-600" />
                <span className="font-black text-xs text-slate-900">سند صرف نقدي معتمد ({printingExpense.documentNumber})</span>
              </div>
              <button
                type="button"
                onClick={() => setPrintingExpense(null)}
                className="p-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
                title="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Voucher Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 text-xs">
              
              {/* Header with Center Info */}
              <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900 mb-2">
                <div>
                  <h2 className="text-base font-black tracking-tight">{settings?.centerName || 'مركز النجاح للتطوير والتدريب والاستشارات'}</h2>
                  <p className="text-xs text-slate-600 font-bold mt-0.5">
                    {getBranchName(printingExpense.branchId)} • سند صرف نقدي رسمي
                  </p>
                </div>
                <div className="text-left font-mono">
                  <span className="text-xs font-black text-rose-600 block">{printingExpense.documentNumber}</span>
                  <span className="text-[11px] text-slate-600 block">{printingExpense.date}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-600 font-bold">المبلغ المصروف:</span>
                <span className="text-lg font-black font-mono text-rose-600">
                  {(Number(printingExpense.amount) || 0).toLocaleString()} ج.م
                </span>
              </div>

              <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-200 text-slate-900">
                <span className="font-bold text-slate-600">فقط وقدره: </span>
                <span className="font-black text-slate-950">{tafqeetArabic(Number(printingExpense.amount) || 0)}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">يصرف إلى السيد / الجهة:</span>
                  <span className="font-black text-slate-900 text-sm mt-0.5 block">{printingExpense.beneficiary || 'المستفيد المعتمد'}</span>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">الفرع والخزينة المحمل عليها:</span>
                  <span className="font-black text-blue-700 text-sm mt-0.5 block">{getBranchName(printingExpense.branchId)}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px]">وذلك مقابل (بيان المصروف):</span>
                <span className="font-black text-slate-900 text-xs mt-0.5 block">{printingExpense.title}</span>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  بند: {getCategoryDetails(printingExpense.category).label} • طريقة الدفع: {printingExpense.paymentMethod === 'cash' ? 'نقداً من الخزينة' : printingExpense.paymentMethod}
                </span>
              </div>

              {printingExpense.notes && (
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                  ملاحظات: {printingExpense.notes}
                </div>
              )}

              {/* Signatures */}
              <div className="pt-4 grid grid-cols-3 gap-2 text-center text-[11px] border-t border-slate-200 mt-4">
                <div>
                  <span className="text-slate-500 block mb-6">توقيع المستلم</span>
                  <span className="border-t border-slate-400 block pt-1 font-bold">....................</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-6">أمين الخزينة</span>
                  <span className="border-t border-slate-400 block pt-1 font-bold">{printingExpense.paidByUserName || 'مسؤول الحسابات'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-6">اعتماد الإدارة</span>
                  <span className="border-t border-slate-400 block pt-1 font-bold">د. محمد رمضان بخيت</span>
                </div>
              </div>

            </div>

            {/* Sticky Action Footer Bar (Hidden on Print) */}
            <div className="shrink-0 p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 flex-wrap print:hidden">
              <button
                type="button"
                onClick={() => setPrintingExpense(null)}
                className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs cursor-pointer transition-colors"
              >
                إغلاق ✕
              </button>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyVoucherText(printingExpense)}
                  className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer shadow-xs transition-colors"
                  title="نسخ نص السند بالكامل"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">نسخ السند</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleShareVoucherWhatsApp(printingExpense)}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer shadow-xs transition-colors"
                  title="مشاركة عبر واتساب"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>واتساب 📲</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة السند 🖨️</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 6. DELETE CONFIRMATION MODAL (In-app, reliably works on mobile & webview) */}
      {expenseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 text-right">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-500/20 border border-rose-200 dark:border-rose-500/40 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">تأكيد حذف سند الصرف</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  رقم السند: <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{expenseToDelete.documentNumber}</span>
                </p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">بيان المصروف:</span>
                <span className="font-bold text-slate-900 dark:text-white max-w-[200px] truncate">{expenseToDelete.title}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">المبلغ المصروف:</span>
                <span className="font-black font-mono text-rose-600 dark:text-rose-400 text-sm">{(Number(expenseToDelete.amount) || 0).toLocaleString()} ج.م</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">الفرع المحمل عليه:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{getBranchName(expenseToDelete.branchId)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">تاريخ الصرف:</span>
                <span className="font-mono text-slate-600 dark:text-slate-400">{expenseToDelete.date}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-[11px] text-rose-700 dark:text-rose-300 font-bold leading-relaxed">
              ⚠️ هل أنت متأكد من حذف هذا السند نهائياً؟ سيتم إلغاؤه فوراً وتحديث رصيد الخزينة مباشرة دون أي تأخير.
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                disabled={isDeletingExpense}
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-md shadow-rose-600/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeletingExpense ? 'جاري الحذف...' : 'نعم، حذف السند الآن'}</span>
              </button>
              <button
                type="button"
                disabled={isDeletingExpense}
                onClick={() => setExpenseToDelete(null)}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
