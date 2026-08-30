const fs = require('fs');
let code = fs.readFileSync('src/features/finance-vault/FinanceVaultView.tsx', 'utf8');

const discountsTab = `          <button 
            onClick={() => setActiveTab('DISCOUNTS')}`;
const expensesTab = `          <button 
            onClick={() => setActiveTab('EXPENSES')}
            className={\`px-4 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap \${
              activeTab === 'EXPENSES' 
               ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]' 
               : 'text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }\`}
          >
            سجلات المصروفات ({expenses.length})
          </button>
          <button 
            onClick={() => setActiveTab('DISCOUNTS')}`;

code = code.replace(discountsTab, expensesTab);

fs.writeFileSync('src/features/finance-vault/FinanceVaultView.tsx', code);
