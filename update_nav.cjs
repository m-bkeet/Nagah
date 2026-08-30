const fs = require('fs');
let code = fs.readFileSync('src/core/constants/navigation.ts', 'utf8');

code = code.replace(
  /  \{\s*id: 'expenses',[\s\S]*?allowedRoles: \['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT', 'BRANCH_MANAGER', 'DEVELOPER'\],\s*\},\n/g,
  ''
);

fs.writeFileSync('src/core/constants/navigation.ts', code);
console.log('Updated navigation');
