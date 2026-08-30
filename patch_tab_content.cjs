const fs = require('fs');
let code = fs.readFileSync('src/features/finance-vault/FinanceVaultView.tsx', 'utf8');

const expensesContent = `          {activeTab === 'EXPENSES' && (
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-[#121b2f]">
                  <th className="py-4 px-5 text-xs font-black text-slate-300">كود المصروف</th>
                  <th className="py-4 px-5 text-xs font-black text-slate-300">التاريخ</th>
                  <th className="py-4 px-5 text-xs font-black text-slate-300">بند المصروف (البيان)</th>
                  <th className="py-4 px-5 text-xs font-black text-slate-300">الجهة المستفيدة</th>
                  <th className="py-4 px-5 text-xs font-black text-slate-300">المبلغ (ج.م)</th>
                  <th className="py-4 px-5 text-xs font-black text-slate-300">طريقة الدفع</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={exp.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors group">
                    <td className="py-4 px-5 font-mono text-sm font-bold text-rose-400">{exp.id}</td>
                    <td className="py-4 px-5 text-slate-300 text-xs font-mono">{exp.date}</td>
                    <td className="py-4 px-5 text-slate-100 font-bold text-sm">{exp.description}</td>
                    <td className="py-4 px-5 text-slate-400 text-xs">{exp.beneficiary}</td>
                    <td className="py-4 px-5 text-rose-400 font-black text-base">{exp.amount}</td>
                    <td className="py-4 px-5 text-slate-400 text-xs">
                       <span className="px-2 py-1 bg-slate-800 rounded-md text-slate-300 border border-slate-700">{exp.paymentMethod}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}`;

const emptyState = `          {activeTab !== 'RECEIPTS' && activeTab !== 'EXPENSES' && (`;

code = code.replace(/          \{activeTab !== 'RECEIPTS' && \(/, expensesContent + '\n' + emptyState);

fs.writeFileSync('src/features/finance-vault/FinanceVaultView.tsx', code);
