const fs = require('fs');

let file = fs.readFileSync('src/features/finance-vault/FinanceVaultView.tsx', 'utf8');

file = file.replace(
  `[
    {
      id: 'TX-901',
      receiptNumber: 'REC-4102800',
      studentCode: 'A001',
      studentName: 'متدرب',
      courseName: '-',
      amount: 500,
      paymentMethod: 'نقداً',
      status: 'COMPLETED',
      date: '2026-08-26',
      cashierName: 'المدير العام (Super Admin)',
    }
  ]`,
  `[
    {
      id: 'TX-901',
      receiptNumber: 'REC-4102800',
      studentCode: 'A001',
      studentName: 'متدرب (مريم أحمد)',
      courseName: 'دورة برمجة بايثون',
      amount: 500,
      paymentMethod: 'نقداً',
      status: 'COMPLETED',
      date: '2026-08-26 14:30',
      cashierName: 'المدير العام (Super Admin)',
    },
    {
      id: 'TX-902',
      receiptNumber: 'REC-4102801',
      studentCode: 'A002',
      studentName: 'طالب (خالد محمد)',
      courseName: 'كورس الذكاء الاصطناعي',
      amount: 1200,
      paymentMethod: 'تحويل بنكي',
      status: 'COMPLETED',
      date: '2026-08-26 15:45',
      cashierName: 'محاسب (أحمد)',
    },
    {
      id: 'TX-903',
      receiptNumber: 'REC-4102802',
      studentCode: 'A003',
      studentName: 'متدربة (سارة محمود)',
      courseName: 'تصميم جرافيك',
      amount: 800,
      paymentMethod: 'فيزا',
      status: 'COMPLETED',
      date: '2026-08-26 16:20',
      cashierName: 'المدير العام (Super Admin)',
    }
  ]`
);

fs.writeFileSync('src/features/finance-vault/FinanceVaultView.tsx', file);
