const fs = require('fs');
let code = fs.readFileSync('src/features/finance-vault/FinanceVaultView.tsx', 'utf8');
console.log(code.length);
