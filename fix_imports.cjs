const fs = require('fs');
let code = fs.readFileSync('src/features/language-lab/LanguageLabView.tsx', 'utf8');

if (!code.includes('Youtube')) {
  code = code.replace(
    "import {", 
    "import { Youtube, GraduationCap,"
  );
  fs.writeFileSync('src/features/language-lab/LanguageLabView.tsx', code);
}
