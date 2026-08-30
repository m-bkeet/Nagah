const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const certsPlaceholder = `      case 'certificates': return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-amber-500 mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-white">إصدار الشهادات المعتمدة</h2>
          <p className="text-slate-400 max-w-md">مساحة عمل لتصميم وإصدار وتوثيق الشهادات المعتمدة للمتدربين بشكل إلكتروني ومطبوع.</p>
        </div>
      );`;

code = code.replace(/case 'report-factory':\n\s*case 'certificates': return <ReportFactoryView \/>;/, "case 'report-factory': return <ReportFactoryView />;\n" + certsPlaceholder);

fs.writeFileSync('src/App.tsx', code);
