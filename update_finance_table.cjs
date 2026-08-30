const fs = require('fs');
let code = fs.readFileSync('src/features/finance-vault/FinanceVaultView.tsx', 'utf8');

code = code.replace(
  /<th className="py-4 px-5 text-xs font-black text-slate-300">بيانات الطالب \(صاحب الحركة\)<\/th>/g,
  '<th className="py-4 px-5 text-xs font-black text-slate-300">الاسم (صاحب الحركة)</th>'
);
code = code.replace(
  /<th className="py-4 px-5 text-xs font-black text-slate-300">التاريخ والوقت<\/th>/g,
  '<th className="py-4 px-5 text-xs font-black text-slate-300">تاريخ الاستلام والوقت</th>'
);
code = code.replace(
  /<th className="py-4 px-5 text-xs font-black text-slate-300">تفاصيل الدورة والحركة<\/th>/g,
  '<th className="py-4 px-5 text-xs font-black text-slate-300">نوع الحركة والدورة</th>'
);

fs.writeFileSync('src/features/finance-vault/FinanceVaultView.tsx', code);
console.log('Updated FinanceVaultView headers');
