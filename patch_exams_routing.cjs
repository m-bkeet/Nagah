const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes("import { ExamsManagementView } from './features/academic/ExamsManagementView';")) {
  code = "import { ExamsManagementView } from './features/academic/ExamsManagementView';\n" + code;
}

code = code.replace(
  /case 'exams': return \([\s\S]*?\);\n/g,
  "case 'exams': return <ExamsManagementView />;\n"
);

fs.writeFileSync('src/App.tsx', code);
