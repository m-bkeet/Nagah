const fs = require('fs');
let code = fs.readFileSync('src/features/finance-vault/FinanceVaultView.tsx', 'utf8');

const stateHookStr = `  const [activeTab, setActiveTab] = useState<'RECEIPTS' | 'PENDING' | 'TRAINER_PAYMENTS' | 'EXPENSES' | 'DISCOUNTS'>('RECEIPTS');`;
const newStates = `  const [activeTab, setActiveTab] = useState<'RECEIPTS' | 'PENDING' | 'TRAINER_PAYMENTS' | 'EXPENSES' | 'DISCOUNTS'>('RECEIPTS');
  const [isAddIncomeModalOpen, setIsAddIncomeModalOpen] = useState(false);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  
  const [expenses, setExpenses] = useState([
    { id: 'EXP-100', date: '2026-08-27', description: 'صيانة وأجهزة', beneficiary: 'شركة الكهرباء / فني الصيانة', amount: 150, paymentMethod: 'نقداً من الخزينة' },
    { id: 'EXP-101', date: '2026-08-25', description: 'ضيافة وبوفيه', beneficiary: 'بوفيه المركز', amount: 50, paymentMethod: 'نقداً من الخزينة' }
  ]);
`;
code = code.replace(stateHookStr, newStates);

const totalsStr = `  const totalExpenses = 0;`;
const newTotals = `  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);`;
code = code.replace(totalsStr, newTotals);

fs.writeFileSync('src/features/finance-vault/FinanceVaultView.tsx', code);
