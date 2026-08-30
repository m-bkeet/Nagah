const fs = require('fs');
let code = fs.readFileSync('src/features/finance-vault/FinanceVaultView.tsx', 'utf8');

const expenseModalStr = `      {/* Expense Modal */}
      {isAddExpenseModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0b1329] border border-rose-500/30 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-rose-500/5">
              <div className="flex items-center gap-2 text-rose-500 font-bold">
                <Receipt className="w-5 h-5" />
                <span>تسجيل سند صرف مصروف</span>
              </div>
              <button onClick={() => setIsAddExpenseModalOpen(false)} className="text-slate-500 hover:text-white cursor-pointer">
                <Search className="w-5 h-5 hidden" /> {/* To easily reuse icons, using an X icon from lucide-react if imported, else a placeholder */}
                <span className="text-xl leading-none">&times;</span>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">بيان المصروف *</label>
                <input type="text" placeholder="مثال: فاتورة كهرباء شهر أغسطس، للقاعة 1" className="w-full bg-[#121b2f] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-rose-400 mb-1.5">المبلغ المصروف (ج.م) *</label>
                  <input type="number" placeholder="150" className="w-full bg-[#121b2f] border border-rose-500/50 rounded-xl px-3 py-2 text-sm text-rose-400 font-bold focus:border-rose-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">بند المصروف *</label>
                  <select className="w-full bg-[#121b2f] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none">
                    <option>صيانة وأجهزة</option>
                    <option>إيجارات المرافق</option>
                    <option>ضيافة وبوفيه</option>
                    <option>مطبوعات وتسويق</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">طريقة الدفع</label>
                  <select className="w-full bg-[#121b2f] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none">
                    <option>نقداً من الخزينة</option>
                    <option>تحويل بنكي</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">الجهة المستفيدة / المستلم</label>
                  <input type="text" placeholder="مثال: شركة الكهرباء / فني الصيانة" className="w-full bg-[#121b2f] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none" />
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex gap-2">
              <button onClick={() => setIsAddExpenseModalOpen(false)} className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-lg">
                حفظ سند الصرف
              </button>
              <button onClick={() => setIsAddExpenseModalOpen(false)} className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Income Modal */}
      {isAddIncomeModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0b1329] border border-emerald-500/30 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-emerald-500/5">
              <div className="flex items-center gap-2 text-emerald-500 font-bold">
                <TrendingUp className="w-5 h-5" />
                <span>إضافة سند قبض يدوي</span>
              </div>
              <button onClick={() => setIsAddIncomeModalOpen(false)} className="text-slate-500 hover:text-white cursor-pointer">
                <span className="text-xl leading-none">&times;</span>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">اسم المتدرب / المشترك *</label>
                <input type="text" placeholder="ابحث أو أدخل اسم الطالب..." className="w-full bg-[#121b2f] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-emerald-400 mb-1.5">المبلغ المحصل (ج.م) *</label>
                  <input type="number" placeholder="500" className="w-full bg-[#121b2f] border border-emerald-500/50 rounded-xl px-3 py-2 text-sm text-emerald-400 font-bold focus:border-emerald-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">نوع الحركة</label>
                  <select className="w-full bg-[#121b2f] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none">
                    <option>دفع اشتراك دورة</option>
                    <option>تأكيد حجز مبدئي</option>
                    <option>بيع ملزمة / كتاب</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex gap-2">
              <button onClick={() => setIsAddIncomeModalOpen(false)} className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-lg">
                حفظ وإصدار إيصال
              </button>
              <button onClick={() => setIsAddIncomeModalOpen(false)} className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
`;

code = code.replace(/    <\/div>\n  \);\n\};\n?$/, expenseModalStr);

fs.writeFileSync('src/features/finance-vault/FinanceVaultView.tsx', code);
