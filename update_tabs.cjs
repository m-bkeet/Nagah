const fs = require('fs');
let code = fs.readFileSync('src/features/finance-vault/FinanceVaultView.tsx', 'utf8');

code = code.replace(
  /setActiveTab\('RECEIPTS' \| 'PENDING' \| 'TRAINER_PAYMENTS' \| 'DISCOUNTS'\)/,
  "setActiveTab<'RECEIPTS' | 'PENDING' | 'TRAINER_PAYMENTS' | 'DISCOUNTS' | 'EXPENSES'>('RECEIPTS')"
);

fs.writeFileSync('src/features/finance-vault/FinanceVaultView.tsx', code);
