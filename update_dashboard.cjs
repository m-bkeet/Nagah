const fs = require('fs');

let content = fs.readFileSync('src/features/dashboard/DashboardOverview.tsx', 'utf8');

// Add Button3D import
content = content.replace(
  "import { BranchId } from '../../types/identity';",
  "import { BranchId } from '../../types/identity';\nimport { Button3D } from '../../components/ui/Button3D';"
);

// Top Action Bar button
content = content.replace(
  /<button\s+onClick=\{\(\) => setShowRegisterModal\(true\)\}\s+className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-full text-xs font-black flex items-center gap-1.5 transition-all shadow-md shadow-amber-500\/20 active:scale-95 cursor-pointer"\s*>\s*<Plus className="w-4 h-4 stroke-\[3\]" \/>\s*<span>تسجيل متدرب جديد<\/span>\s*<\/button>/g,
  '<Button3D variant="amber" onClick={() => setShowRegisterModal(true)}>\n            <Plus className="w-4 h-4 stroke-[3]" />\n            <span>تسجيل متدرب جديد</span>\n          </Button3D>'
);

// Refresh button
content = content.replace(
  /<button\s+onClick=\{handleRefresh\}\s+className="p-2 rounded-xl bg-slate-800\/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700\/80 transition-colors cursor-pointer"\s+title="تحديث البيانات"\s*>\s*<RotateCw className=\{`w-4 h-4 \$\{isRotating \? 'animate-spin' : ''\}`\} \/>\s*<\/button>/g,
  '<Button3D variant="secondary" onClick={handleRefresh} title="تحديث البيانات" className="!px-3 !py-2.5">\n            <RotateCw className={`w-4 h-4 ${isRotating ? \'animate-spin\' : \'\'}`} />\n          </Button3D>'
);

// Lab link small button
content = content.replace(
  /<button\s+onClick=\{\(e\) => \{\s+e\.stopPropagation\(\);\s+setShowLabLinkModal\(true\);\s+\}\}\s+className="px-2.5 py-1 bg-indigo-950\/60 hover:bg-indigo-950 text-indigo-100 hover:text-white border border-indigo-400\/30 rounded-lg text-\[10px\] font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"\s*>\s*<span>رابط الطلاب<\/span>\s*<Link className="w-3 h-3 text-indigo-300" \/>\s*<\/button>/g,
  '<Button3D variant="indigo" size="sm" onClick={(e: any) => { e.stopPropagation(); setShowLabLinkModal(true); }}>\n                <span>رابط الطلاب</span>\n                <Link className="w-3 h-3 text-indigo-300" />\n              </Button3D>'
);

// "عرض الكل" button
content = content.replace(
  /<button className="text-\[10px\] font-bold text-slate-400 hover:text-white transition-colors">\s*عرض الكل\s*<\/button>/g,
  '<Button3D variant="neutral" size="sm">عرض الكل</Button3D>'
);

// Student registration modal submit
content = content.replace(
  /<button\s+type="submit"\s+className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition-colors cursor-pointer shadow-md"\s*>\s*حفظ وتسجيل المتدرب\s*<\/button>/g,
  '<Button3D variant="amber" type="submit" fullWidth>حفظ وتسجيل المتدرب</Button3D>'
);

// Student registration modal cancel
content = content.replace(
  /<button\s+type="button"\s+onClick=\{\(\) => setShowRegisterModal\(false\)\}\s+className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"\s*>\s*إلغاء\s*<\/button>/g,
  '<Button3D variant="secondary" type="button" onClick={() => setShowRegisterModal(false)}>إلغاء</Button3D>'
);

// Close X button 1
content = content.replace(
  /<button\s+onClick=\{\(\) => setShowRegisterModal\(false\)\}\s+className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"\s*>\s*<X className="w-4 h-4" \/>\s*<\/button>/g,
  '<Button3D variant="secondary" size="sm" className="!px-2 !py-2" onClick={() => setShowRegisterModal(false)}><X className="w-4 h-4" /></Button3D>'
);

// Close X button 2
content = content.replace(
  /<button\s+onClick=\{\(\) => setShowLabLinkModal\(false\)\}\s+className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"\s*>\s*<X className="w-4 h-4" \/>\s*<\/button>/g,
  '<Button3D variant="secondary" size="sm" className="!px-2 !py-2" onClick={() => setShowLabLinkModal(false)}><X className="w-4 h-4" /></Button3D>'
);

// Copy link button
content = content.replace(
  /<button\s+onClick=\{handleCopyLabLink\}\s+className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-sans font-bold flex items-center gap-1 shrink-0 cursor-pointer ml-2"\s*>\s*\{copiedLink \? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" \/> : <Link className="w-3.5 h-3.5" \/>\}\s*<span>\{copiedLink \? 'تم النسخ' : 'نسخ الرابط'\}<\/span>\s*<\/button>/g,
  '<Button3D variant="indigo" size="sm" onClick={handleCopyLabLink} className="ml-2">\n                {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> : <Link className="w-3.5 h-3.5" />}\n                <span>{copiedLink ? \'تم النسخ\' : \'نسخ الرابط\'}</span>\n              </Button3D>'
);

// Go to lab devices
content = content.replace(
  /<button\s+onClick=\{\(\) => \{\s+setShowLabLinkModal\(false\);\s+onNavigateToModule\('devices'\);\s+\}\}\s+className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer"\s*>\s*الانتقال للتحكم في الأجهزة\s*<\/button>/g,
  '<Button3D variant="indigo" onClick={() => { setShowLabLinkModal(false); onNavigateToModule(\'devices\'); }}>الانتقال للتحكم في الأجهزة</Button3D>'
);

fs.writeFileSync('src/features/dashboard/DashboardOverview.tsx', content);
