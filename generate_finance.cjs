const fs = require('fs');

const code = `import React, { useState } from 'react';
import { 
  CreditCard, DollarSign, Search, Printer, 
  ShieldCheck, FileSpreadsheet, Lock, Bot, Wallet,
  Calendar, Building2, User, BookOpen, UserCircle, Hash, FileText, Scan, CheckCircle2, TrendingUp, ArrowDownToLine, Receipt
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button3D } from '../../components/ui/Button3D';

interface PaymentTransaction {
  id: string;
  receiptNumber: string;
  studentCode: string;
  studentName: string;
  courseName: string;
  amount: number;
  paymentMethod: string;
  transactionType: string;
  status: 'COMPLETED' | 'PENDING_AUDIT' | 'REJECTED';
  date: string;
  cashierName: string;
}

export const FinanceVaultView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'RECEIPTS' | 'PENDING' | 'TRAINER_PAYMENTS' | 'DISCOUNTS'>('RECEIPTS');

  const [transactions, setTransactions] = useState<PaymentTransaction[]>([
    {
      id: 'TX-001',
      receiptNumber: 'REC-4102800',
      studentCode: 'STU-10042',
      studentName: 'أحمد محمود العطار',
      courseName: 'دورة البرمجة المتقدمة',
      amount: 500,
      paymentMethod: 'نقداً',
      transactionType: 'دفع اشتراك',
      status: 'COMPLETED',
      date: '2026-08-26 14:30',
      cashierName: 'المدير العام (Super Admin)'
    },
    {
      id: 'TX-002',
      receiptNumber: 'REC-4102801',
      studentCode: 'STU-10085',
      studentName: 'نيروز محمد صلاح',
      courseName: 'دورة المحادثة الإنجليزية',
      amount: 350,
      paymentMethod: 'تحويل إلكتروني (فودافون كاش)',
      transactionType: 'تأكيد حجز',
      status: 'COMPLETED',
      date: '2026-08-27 10:15',
      cashierName: 'نظام الدفع الإلكتروني'
    }
  ]);

  const totalIncome = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const totalExpenses = 0;
  const centerShare = totalIncome; 
  const netVault = totalIncome - totalExpenses;

  return (
    <div className="space-y-6 max-w-7xl mx-auto" dir="rtl">
      
      {/* Header & Quick Actions */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-[#0b1329] p-5 rounded-3xl border border-slate-700/80 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Wallet className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white mb-1">إدارة الحسابات والخزينة الرئيسية</h1>
            <p className="text-xs text-slate-400">
              متابعة سندات القبض، العمولات التدريبية، وصافي الخزينة الفعلي
            </p>
          </div>
        </div>

        <div className="flex-1 w-full max-w-sm relative z-10">
          <input
            type="text"
            placeholder="بحث برقم الإيصال، اسم الطالب، أو كود الحركة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#121b2f] border border-slate-700 rounded-xl pl-4 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors shadow-inner"
          />
          <Search className="absolute right-3 top-3.5 w-5 h-5 text-slate-500" />
        </div>
      </div>

      {/* Top Secret / Quick Action Buttons (Matching Screenshot) */}
      <div className="flex flex-wrap gap-3">
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-xl text-xs font-bold transition-all shadow-lg">
          <ShieldCheck className="w-4 h-4" />
          السجل السري للمدير (الإحصائيات السابقة)
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold transition-all shadow-lg">
          <Lock className="w-4 h-4" />
          تصفير الحسابات الشامل (أرشيف سري)
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition-all shadow-lg">
          <Bot className="w-4 h-4" />
          مساعد الخزينة الذكي
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all shadow-lg">
          <FileSpreadsheet className="w-4 h-4" />
          Google Sheets
        </button>
      </div>

      {/* 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Income */}
        <div className="bg-[#0b1329] p-5 rounded-3xl border border-slate-700/80 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
          <div className="flex items-center justify-between mb-4">
             <div className="text-emerald-400 font-bold text-sm">إجمالي المقبوضات</div>
             <TrendingUp className="text-emerald-500 w-5 h-5 opacity-50" />
          </div>
          <div className="flex items-baseline gap-2">
             <span className="text-3xl font-black text-emerald-400">{totalIncome}</span>
             <span className="text-sm text-emerald-500/80 font-bold">ج.م</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-bold">سندات قبض محصلة</p>
        </div>

        {/* Expenses */}
        <div className="bg-[#0b1329] p-5 rounded-3xl border border-slate-700/80 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-rose-500" />
          <div className="flex items-center justify-between mb-4">
             <div className="text-rose-400 font-bold text-sm">المصروفات والمنصرف</div>
             <ArrowDownToLine className="text-rose-500 w-5 h-5 opacity-50" />
          </div>
          <div className="flex items-baseline gap-2">
             <span className="text-3xl font-black text-rose-400">{totalExpenses}</span>
             <span className="text-sm text-rose-500/80 font-bold">ج.م</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-bold">مصاريف تشغيلية</p>
        </div>

        {/* Center Share */}
        <div className="bg-[#0b1329] p-5 rounded-3xl border border-slate-700/80 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500" />
          <div className="flex items-center justify-between mb-4">
             <div className="text-cyan-400 font-bold text-sm">حصة المركز الصافية</div>
             <Building2 className="text-cyan-500 w-5 h-5 opacity-50" />
          </div>
          <div className="flex items-baseline gap-2">
             <span className="text-3xl font-black text-cyan-400">{centerShare}</span>
             <span className="text-sm text-cyan-500/80 font-bold">ج.م</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-bold">أرباح المكان</p>
        </div>

        {/* Net Vault */}
        <div className="bg-[#0b1329] p-5 rounded-3xl border border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)] relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-amber-500" />
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-4 relative z-10">
             <div className="text-amber-400 font-bold text-sm">صافي الخزينة الفعلي</div>
             <Wallet className="text-amber-500 w-5 h-5 opacity-50" />
          </div>
          <div className="flex items-baseline gap-2 relative z-10">
             <span className="text-3xl font-black text-amber-400">{netVault}</span>
             <span className="text-sm text-amber-500/80 font-bold">ج.م</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-bold relative z-10">النقدية المتاحة</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-[#0b1329] rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col min-h-[500px]">
        {/* Tabs */}
        <div className="flex overflow-x-auto hide-scrollbar border-b border-slate-800 p-2 gap-2 bg-[#080d1e]">
          <button 
            onClick={() => setActiveTab('RECEIPTS')}
            className={\`px-4 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap \${
              activeTab === 'RECEIPTS' 
              ? 'bg-amber-500 text-slate-900 shadow-[0_0_15px_rgba(245,158,11,0.4)]' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }\`}
          >
            سندات القبض وإيصالات التحصيل ({transactions.length})
          </button>
          <button 
            onClick={() => setActiveTab('PENDING')}
            className={\`px-4 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap \${
              activeTab === 'PENDING' 
              ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }\`}
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              طلبات السداد بانتظار التحقق (0)
            </span>
          </button>
          <button 
            onClick={() => setActiveTab('TRAINER_PAYMENTS')}
            className={\`px-4 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap \${
              activeTab === 'TRAINER_PAYMENTS' 
              ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }\`}
          >
            سندات صرف مستحقات المدربين (0)
          </button>
          <button 
            onClick={() => setActiveTab('DISCOUNTS')}
            className={\`px-4 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap \${
              activeTab === 'DISCOUNTS' 
              ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]' 
              : 'text-purple-400 hover:text-purple-300 hover:bg-purple-900/30 border border-purple-900/50 bg-purple-950/20'
            }\`}
          >
            <span className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              إحصائية الإعفاءات والخصومات السرية (6)
            </span>
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-x-auto">
          {activeTab === 'RECEIPTS' && (
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-[#121b2f]">
                  <th className="py-4 px-5 text-xs font-black text-slate-300">رقم الإيصال</th>
                  <th className="py-4 px-5 text-xs font-black text-slate-300">التاريخ والوقت</th>
                  <th className="py-4 px-5 text-xs font-black text-slate-300">بيانات الطالب (صاحب الحركة)</th>
                  <th className="py-4 px-5 text-xs font-black text-slate-300">تفاصيل الدورة والحركة</th>
                  <th className="py-4 px-5 text-xs font-black text-slate-300">المبلغ المدفوع</th>
                  <th className="py-4 px-5 text-xs font-black text-slate-300">طريقة الدفع</th>
                  <th className="py-4 px-5 text-xs font-black text-slate-300">المستلم (الخزينة)</th>
                  <th className="py-4 px-5 text-xs font-black text-slate-300 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors group">
                    <td className="py-4 px-5">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-sm font-bold text-amber-400">{tx.receiptNumber}</span>
                        <span className="text-[10px] text-slate-500 font-bold">{tx.id}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="text-slate-300 text-xs font-mono">{tx.date}</div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                           <User className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-100">{tx.studentName}</span>
                          <span className="text-[10px] text-indigo-400 font-mono">{tx.studentCode}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-slate-300">{tx.courseName}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 inline-block w-fit">
                          {tx.transactionType}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="font-black text-emerald-400 flex items-center gap-1">
                        <span>{tx.amount}</span>
                        <span className="text-xs">ج.م</span>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-800 border border-slate-700 text-slate-300">
                        {tx.paymentMethod}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <div className="text-slate-300 text-xs font-bold">{tx.cashierName}</div>
                    </td>
                    <td className="py-4 px-5 text-center">
                      <div className="flex items-center justify-center gap-2 opacity-100 sm:opacity-50 group-hover:opacity-100 transition-opacity">
                        <Tooltip content="عرض تفاصيل الحركة">
                          <button className="w-8 h-8 rounded-lg bg-emerald-900/30 text-emerald-400 border border-emerald-700/50 flex items-center justify-center hover:bg-emerald-900/50 transition-colors cursor-pointer">
                            <FileText className="w-4 h-4" />
                          </button>
                        </Tooltip>
                        <Tooltip content="طباعة الإيصال">
                          <button className="w-8 h-8 rounded-lg bg-amber-900/30 text-amber-500 border border-amber-700/50 flex items-center justify-center hover:bg-amber-900/50 transition-colors cursor-pointer">
                            <Printer className="w-4 h-4" />
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {activeTab !== 'RECEIPTS' && (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
               <Receipt className="w-16 h-16 opacity-20 mb-4" />
               <p className="font-bold">لا توجد سجلات في هذا القسم حالياً</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
`
fs.writeFileSync('src/features/finance-vault/FinanceVaultView.tsx', code);
console.log('Done');
