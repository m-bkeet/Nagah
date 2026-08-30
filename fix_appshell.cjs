const fs = require('fs');
let code = fs.readFileSync('src/features/shell/AppShell.tsx', 'utf8');

code = code.replace(
  /onOpenThemeSettings=\{\(\) => setIsThemeSettingsOpen\(true\)\}\n\s*onOpenGuide=\{\(\) => setIsGuideOpen\(true\)\}\n\s*onOpenThemeSettings=\{\(\) => setIsThemeSettingsOpen\(true\)\}/,
  "onOpenGuide={() => setIsGuideOpen(true)}\n            onOpenThemeSettings={() => setIsThemeSettingsOpen(true)}"
);

fs.writeFileSync('src/features/shell/AppShell.tsx', code);
