const fs = require('fs');
let code = fs.readFileSync('src/features/finance-vault/FinanceVaultView.tsx', 'utf8');

const quickActionStr = `      {/* Top Secret / Quick Action Buttons (Matching Screenshot) */}
      <div className="flex flex-wrap gap-3">`;
const newQuickActionStr = `      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#121b2f] p-3 rounded-2xl border border-slate-700/80">
        <div className="flex gap-2">
          <button onClick={() => setIsAddExpenseModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg">
            <ArrowDownToLine className="w-4 h-4" />
            تسجيل سند صرف مصروف
          </button>
          <button onClick={() => setIsAddIncomeModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg">
            <TrendingUp className="w-4 h-4" />
            إضافة سند قبض يدوي
          </button>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-xl text-xs font-bold transition-all shadow-lg">
            <ShieldCheck className="w-4 h-4" />
            السجل السري للمدير
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition-all shadow-lg">
            <Bot className="w-4 h-4" />
            مساعد الخزينة الذكي
          </button>
        </div>
      </div>`;
code = code.replace(/      \{\/\* Top Secret \/ Quick Action Buttons \(Matching Screenshot\) \*\/\}[\s\S]*?Google Sheets\n        <\/button>\n      <\/div>/, newQuickActionStr);

fs.writeFileSync('src/features/finance-vault/FinanceVaultView.tsx', code);
