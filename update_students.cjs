const fs = require('fs');

let content = fs.readFileSync('src/features/students/StudentDomainView.tsx', 'utf8');

// Add Button3D import
content = content.replace(
  "import { FULL_STUDENTS_LIST } from './studentsData';",
  "import { FULL_STUDENTS_LIST } from './studentsData';\nimport { Button3D } from '../../components/ui/Button3D';"
);

// Update Modal card width and padding
content = content.replace(
  /max-w-4xl max-h-\[90vh\]/g,
  "max-w-3xl max-h-[85vh]"
);

// Replace Modal action buttons
// "كارت المتدرب الرقمي"
content = content.replace(
  /<button className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-lg shadow-amber-900\/20 active:scale-95">\s*<CreditCard className="w-4 h-4" \/>\s*كارت المتدرب الرقمي\s*<\/button>/g,
  '<Button3D variant="amber"><CreditCard className="w-4 h-4" />كارت المتدرب الرقمي</Button3D>'
);

// "طباعة"
content = content.replace(
  /<button onClick=\{\(\) => \{ setIdCardStudent\(viewStudent\); setViewStudent\(null\); \}\} className="bg-\[#1e293b\] hover:bg-slate-700 border border-slate-600 text-slate-300 px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer active:scale-95">\s*<Printer className="w-4 h-4" \/>\s*طباعة\s*<\/button>/g,
  '<Button3D variant="secondary" onClick={() => { setIdCardStudent(viewStudent); setViewStudent(null); }}><Printer className="w-4 h-4" />طباعة</Button3D>'
);

// "WhatsApp"
content = content.replace(
  /<button onClick=\{\(\) => handleSendWhatsAppDirect\(viewStudent\.parentPhone, viewStudent\.name\)\} className="bg-\[#064e3b\] hover:bg-\[#065f46\] border border-\[#047857\] text-\[#34d399\] px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer active:scale-95">\s*<MessageSquare className="w-4 h-4" \/>\s*WhatsApp\s*<\/button>/g,
  '<Button3D variant="success" onClick={() => handleSendWhatsAppDirect(viewStudent.parentPhone, viewStudent.name)}><MessageSquare className="w-4 h-4" />WhatsApp</Button3D>'
);

// Subscription status buttons
content = content.replace(
  /<button onClick=\{\(\) => setViewStudent\(st\)\} className="w-full bg-\[#1e293b\]\/60 border border-slate-700\/80 hover:bg-slate-700 text-emerald-500 text-\[11px\] font-bold py-1.5 rounded-lg text-center flex items-center justify-center gap-1.5 cursor-pointer transition-colors">/g,
  '<Button3D variant="neutral" fullWidth onClick={() => setViewStudent(st)} className="text-emerald-500 !py-1.5">'
);

content = content.replace(
  /<button onClick=\{\(\) => setViewStudent\(st\)\} className="w-full bg-emerald-900\/40 border border-emerald-800\/50 hover:bg-emerald-900\/60 text-emerald-400 text-\[11px\] font-bold py-1.5 rounded-lg text-center flex items-center justify-center gap-1.5 cursor-pointer transition-colors">/g,
  '<Button3D variant="success" fullWidth onClick={() => setViewStudent(st)} className="!py-1.5">'
);

// Replace closing button tags for the subscription buttons
// Need a clever way because I just replaced the opening tags. Let's just fix the closing tags that have specific content before them.
content = content.replace(/معفى من الاشتراك 🪄\s*<\/button>/g, "معفى من الاشتراك 🪄\n                    </Button3D>");
content = content.replace(/اشتراك ساري\s*<CheckCircle2 className="w-3.5 h-3.5" \/>\s*<\/button>/g, 'اشتراك ساري\n                      <CheckCircle2 className="w-3.5 h-3.5" />\n                    </Button3D>');

// Top Header Add Student
content = content.replace(
  /<button className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-md shadow-amber-500\/20">/g,
  '<Button3D variant="amber">'
);
content = content.replace(/إضافة متدرب جديد\s*<\/button>/g, "إضافة متدرب جديد\n            </Button3D>");

fs.writeFileSync('src/features/students/StudentDomainView.tsx', content);
