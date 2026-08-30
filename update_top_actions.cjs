const fs = require('fs');

let content = fs.readFileSync('src/features/students/StudentDomainView.tsx', 'utf8');

// We can replace the simple buttons with Button3D variants to match the overall design.
const oldExcelRegex = /<button\s+onClick=\{\(\) => setIsExcelModalOpen\(true\)\}\s+className="px-3 py-2 rounded-xl bg-\[#131b2f\] hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all"\s*>\s*<FileSpreadsheet className="w-4 h-4 text-emerald-500" \/>\s*<span>ملفات Excel<\/span>\s*<\/button>/s;

const newExcel = `<Button3D variant="success" size="sm" onClick={() => setIsExcelModalOpen(true)}>
              <FileSpreadsheet className="w-4 h-4" />
              <span>ملفات Excel</span>
            </Button3D>`;

content = content.replace(oldExcelRegex, newExcel);

const oldPortalsRegex = /<button\s+onClick=\{\(\) => setIsPortalsModalOpen\(true\)\}\s+className="px-3 py-2 rounded-xl bg-\[#131b2f\] hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all"\s*>\s*<ExternalLink className="w-4 h-4 text-cyan-400" \/>\s*<span>بوابات وروابط<\/span>\s*<\/button>/s;

const newPortals = `<Button3D variant="neutral" size="sm" onClick={() => setIsPortalsModalOpen(true)}>
              <ExternalLink className="w-4 h-4 text-cyan-400" />
              <span>بوابات وروابط</span>
            </Button3D>`;

content = content.replace(oldPortalsRegex, newPortals);

const oldToolsRegex = /<button\s+onClick=\{\(\) => setIsToolsModalOpen\(true\)\}\s+className="px-3 py-2 rounded-xl bg-\[#131b2f\] hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all"\s*>\s*<Zap className="w-4 h-4 text-indigo-400" \/>\s*<span>أدوات متقدمة<\/span>\s*<\/button>/s;

const newTools = `<Button3D variant="neutral" size="sm" onClick={() => setIsToolsModalOpen(true)}>
              <Zap className="w-4 h-4 text-indigo-400" />
              <span>أدوات متقدمة</span>
            </Button3D>`;

content = content.replace(oldToolsRegex, newTools);

const oldAddRegex = /<button\s+onClick=\{\(\) => setIsAddModalOpen\(true\)\}\s+className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500\/20 transition-all"\s*>\s*<UserPlus className="w-4 h-4" \/>\s*<span>إضافة متدرب جديد<\/span>\s*<\/button>/s;

const newAdd = `<Button3D variant="amber" size="sm" onClick={() => setIsAddModalOpen(true)}>
              <UserPlus className="w-4 h-4" />
              <span>إضافة متدرب جديد</span>
            </Button3D>`;

content = content.replace(oldAddRegex, newAdd);

fs.writeFileSync('src/features/students/StudentDomainView.tsx', content);

