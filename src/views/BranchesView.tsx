import React, { useState, useEffect } from 'react';
import { useCenter } from '../context/CenterContext';
import { api } from '../services/api';
import { Building, Plus, Phone, MapPin, Edit, Users, Wallet, X, Trash2, Copy, AlertTriangle } from 'lucide-react';
import { Branch } from '../types';

export const BranchesView: React.FC = () => {
  const { branches, showToast, refreshKey, refreshAll } = useCenter();
  const [branchList, setBranchList] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeBranch, setActiveBranch] = useState<Branch | null>(null);
  const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    phone: '',
    managerName: ''
  });

  const defaultBranchNames = ['فرع النجاح الرئيسي', 'فرع بدر', 'الفرع الرئيسي', 'فرع مدينة نصر', 'فرع المعادي', 'فرع الإسكندرية'];
  const defaultAddresses = ['المقر الرئيسي - مبنى النجاح للتدريب', 'فرع مدينة بدر - سنتر التدريب', 'شارع الهرم - الجيزة', 'شارع التحرير - الدقى'];

  const existingBranchNames = Array.from(new Set([...defaultBranchNames, ...branchList.map(b => b.name).filter(Boolean)]));
  const existingAddresses = Array.from(new Set([...defaultAddresses, ...branchList.map(b => b.address).filter(Boolean)]));

  useEffect(() => {
    loadBranches();
  }, [refreshKey]);

  const loadBranches = async () => {
    setIsLoading(true);
    try {
      const res = await api.getBranches();
      setBranchList(res);
    } catch (err: any) {
      showToast(err.message || 'فشل جلب الفروع', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      code: 'BR-' + (branchList.length + 1),
      address: '',
      phone: '',
      managerName: ''
    });
    setIsAddModalOpen(true);
  };

  const handleSaveBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('يرجى كتابة اسم الفرع', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.createBranch(formData);
      if (res.success) {
        showToast(`تمت إضافة الفرع (${res.branch.name}) بنجاح`, 'success');
        setIsAddModalOpen(false);
        loadBranches();
        refreshAll();
      }
    } catch (err: any) {
      showToast(err.message || 'فشل إضافة الفرع', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (b: Branch) => {
    setActiveBranch(b);
    setFormData({
      name: b.name,
      code: b.code,
      address: b.address || '',
      phone: b.phone || '',
      managerName: b.managerName || ''
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBranch) return;

    setIsSubmitting(true);
    try {
      const res = await api.updateBranch(activeBranch.id, formData);
      if (res.success) {
        showToast(`تم تعديل بيانات الفرع (${res.branch.name}) بنجاح`, 'success');
        setIsEditModalOpen(false);
        loadBranches();
        refreshAll();
      }
    } catch (err: any) {
      showToast(err.message || 'فشل التعديل', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBranch = async (b: Branch) => {
    try {
      const res = await api.deleteBranch(b.id);
      if (res.success) {
        showToast(`تم حذف الفرع (${b.name}) بنجاح`, 'success');
        setBranchToDelete(null);
        if (isEditModalOpen) setIsEditModalOpen(false);
        loadBranches();
        refreshAll();
      }
    } catch (err: any) {
      showToast(err.message || 'فشل حذف الفرع', 'error');
    }
  };

  const handleDuplicateBranch = async (b: Branch) => {
    try {
      const res = await api.duplicateBranch(b.id);
      if (res.success) {
        showToast(`تم استنساخ وتكرار الفرع بنجاح: ${res.branch.name}`, 'success');
        loadBranches();
        refreshAll();
      }
    } catch (err: any) {
      showToast(err.message || 'فشل تكرار الفرع', 'error');
    }
  };

  return (
    <div className="space-y-5">
      <datalist id="branch-name-suggestions">
        {existingBranchNames.map((n, i) => (
          <option key={i} value={n} />
        ))}
      </datalist>
      <datalist id="address-suggestions">
        {existingAddresses.map((a, i) => (
          <option key={i} value={a} />
        ))}
      </datalist>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-800/60 border border-slate-700/70 p-4 rounded-2xl backdrop-blur-md">
        <div>
          <h2 className="text-lg font-black text-slate-100 flex items-center gap-2">
            <Building className="w-5 h-5 text-amber-400" />
            إدارة الفروع والمقرات (Multi-Branch System)
            <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono font-bold">
              {branchList.length} فروع
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            تعديل بيانات المقرات، فصل الخزائن، القاعات، والمتدربين مع إمكانية التعديل والحذف والاستنساخ
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة فرع جديد</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-slate-400">جاري التحميل...</div>
        ) : (
          branchList.map((b) => (
            <div
              key={b.id}
              className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg backdrop-blur-md flex flex-col justify-between hover:border-amber-500/40 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {b.code}
                  </span>
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40 font-bold">
                    نشط وفعال
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-100 mt-1">{b.name}</h3>

                <div className="space-y-2 text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-700/60 my-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">{b.address || 'العنوان الرئيسي للفرع'}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{b.phone || '010XXXXXXXX'}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                    <span className="text-slate-400">مدير الفرع:</span>
                    <span className="font-bold text-slate-200">{b.managerName || 'الإدارة المركزية'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
                <span className="text-[11px] text-amber-400/90 font-medium">خزينة وحساب مستقل</span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleDuplicateBranch(b)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-400 border border-slate-700 transition-colors"
                    title="تكرار الفرع"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleOpenEdit(b)}
                    className="p-1.5 rounded-lg bg-blue-950/60 hover:bg-blue-900 text-blue-300 border border-blue-800 transition-colors"
                    title="تعديل الفرع"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setBranchToDelete(b)}
                    className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 transition-colors"
                    title="حذف الفرع"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full p-6 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">إضافة مقر / فرع جديد</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBranch} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">اسم الفرع *</label>
                <input
                  type="text"
                  required
                  list="branch-name-suggestions"
                  placeholder="مثال: فرع مدينة نصر"
                  value={formData.name ?? ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">كود الفرع</label>
                  <input
                    type="text"
                    value={formData.code ?? ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">هاتف الفرع</label>
                  <input
                    type="text"
                    value={formData.phone ?? ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="010XXXXXXXX"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">العنوان التفصيلي</label>
                <input
                  type="text"
                  list="address-suggestions"
                  value={formData.address ?? ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="الشارع، الحي، المحافظة"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">اسم مدير الفرع</label>
                <input
                  type="text"
                  value={formData.managerName ?? ''}
                  onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                  placeholder="اسم المسؤول عن الفرع"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/20"
                >
                  {isSubmitting ? 'جاري الحفظ...' : 'حفظ الفرع'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && activeBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full p-6 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm">تعديل بيانات الفرع: {activeBranch.name}</h3>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">اسم الفرع *</label>
                <input
                  type="text"
                  required
                  list="branch-name-suggestions"
                  value={formData.name ?? ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">كود الفرع</label>
                  <input
                    type="text"
                    value={formData.code ?? ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">هاتف الفرع</label>
                  <input
                    type="text"
                    value={formData.phone ?? ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">العنوان التفصيلي</label>
                <input
                  type="text"
                  list="address-suggestions"
                  value={formData.address ?? ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">اسم مدير الفرع</label>
                <input
                  type="text"
                  value={formData.managerName ?? ''}
                  onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setBranchToDelete(activeBranch)}
                  className="px-3 py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-xl inline-flex items-center gap-1.5 font-bold"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>حذف</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20"
                  >
                    {isSubmitting ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {branchToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-rose-900/50 rounded-2xl shadow-2xl max-w-md w-full p-6 text-slate-100">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-800 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base">تأكيد حذف الفرع</h3>
                <p className="text-xs text-slate-400">سيتم إزالة الفرع المحدد من النظام</p>
              </div>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 my-4 space-y-1">
              <p>
                <strong className="text-slate-200">الفرع:</strong> {branchToDelete.name} ({branchToDelete.code})
              </p>
              <p>
                <strong className="text-slate-200">العنوان:</strong> {branchToDelete.address || 'غير محدد'}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setBranchToDelete(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 text-xs font-bold"
              >
                تراجع
              </button>
              <button
                type="button"
                onClick={() => handleDeleteBranch(branchToDelete)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>تأكيد الحذف</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
