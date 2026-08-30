const fs = require('fs');
let content = fs.readFileSync('src/features/settings/SystemSettingsView.tsx', 'utf8');
console.log("Length:", content.length);
