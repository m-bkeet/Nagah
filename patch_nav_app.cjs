const fs = require('fs');

// 1. Update navigation.ts
let nav = fs.readFileSync('src/core/constants/navigation.ts', 'utf8');
if (!nav.includes("'language-lab'")) {
  const languageLabItem = `
  {
    id: 'language-lab',
    titleArabic: 'معمل اللغات والمهارات',
    shortTitleArabic: 'معمل اللغات',
    titleEnglish: 'Language & Skills Lab',
    shortTitleEnglish: 'Lang Lab',
    iconName: 'Languages',
    allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'TRAINER', 'STUDENT', 'DEVELOPER'],
  },`;
  
  nav = nav.replace(
    /\{[\s\n]*id: 'gamification'/,
    languageLabItem.trim() + ',\n  {\n    id: \'gamification\''
  );
  fs.writeFileSync('src/core/constants/navigation.ts', nav);
}

// 2. Update App.tsx
let app = fs.readFileSync('src/App.tsx', 'utf8');

if (!app.includes('LanguageLabView')) {
  app = "import { LanguageLabView } from './features/language-lab/LanguageLabView';\n" + app;
  
  // Add routing
  app = app.replace(
    /case 'messaging':[\s\n]*return <MessagingView \/>;/,
    "case 'language-lab':\n      return <LanguageLabView />;\n    case 'messaging':\n      return <MessagingView />;"
  );
}

if (!app.includes('ExamsManagementView')) {
  app = "import { ExamsManagementView } from './features/academic/ExamsManagementView';\n" + app;
  
  app = app.replace(
    /case 'messaging':[\s\n]*return <MessagingView \/>;/,
    "case 'exams':\n      return <ExamsManagementView />;\n    case 'messaging':\n      return <MessagingView />;"
  );
}
fs.writeFileSync('src/App.tsx', app);
