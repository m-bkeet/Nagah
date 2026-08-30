const fs = require('fs');

let content = fs.readFileSync('src/features/trainers/TrainersDomainView.tsx', 'utf8');

// Add Button3D import
content = content.replace(
  "import { GraduationCap, Phone, MapPin, Calendar, Clock, DollarSign, Wallet, ArrowLeft, Search, Plus, FileText, CheckCircle2, TrendingUp, X } from 'lucide-react';",
  "import { GraduationCap, Phone, MapPin, Calendar, Clock, DollarSign, Wallet, ArrowLeft, Search, Plus, FileText, CheckCircle2, TrendingUp, X } from 'lucide-react';\nimport { Button3D } from '../../components/ui/Button3D';"
);

// Top Add Trainer Button
content = content.replace(
  /<button\s+onClick=\{\(\) => setShowAddModal\(true\)\}\s+className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-lg shadow-amber-500\/20"\s*>\s*<Plus className="w-4 h-4 stroke-\[3\]" \/>\s*إضافة مدرب جديد\s*<\/button>/g,
  '<Button3D variant="amber" onClick={() => setShowAddModal(true)}>\n            <Plus className="w-4 h-4 stroke-[3]" />إضافة مدرب جديد\n          </Button3D>'
);

// Inside Modal (Pay Salary Button)
content = content.replace(
  /<button className="px-5 py-2\.5 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-xl text-sm font-black flex items-center gap-2 transition-colors cursor-pointer shadow-lg shadow-amber-500\/20 active:scale-95">\s*<Wallet className="w-4 h-4" \/>\s*تسوية المستحقات \(صرف\)\s*<\/button>/g,
  '<Button3D variant="amber">\n                  <Wallet className="w-4 h-4" />تسوية المستحقات (صرف)\n                </Button3D>'
);

// Add Modal (Close)
content = content.replace(
  /<button onClick=\{\(\) => setShowAddModal\(false\)\} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer transition-colors">\s*<X className="w-5 h-5" \/>\s*<\/button>/g,
  '<Button3D variant="secondary" size="sm" onClick={() => setShowAddModal(false)} className="!px-2 !py-2"><X className="w-5 h-5" /></Button3D>'
);

// Detail Modal (Close)
content = content.replace(
  /<button onClick=\{\(\) => setViewTrainer\(null\)\} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer transition-colors">\s*<X className="w-5 h-5" \/>\s*<\/button>/g,
  '<Button3D variant="secondary" size="sm" onClick={() => setViewTrainer(null)} className="!px-2 !py-2"><X className="w-5 h-5" /></Button3D>'
);

// Fix card size in Detailed Trainer Modal
content = content.replace(
  /className="bg-\[#121b2f\] border border-slate-700 rounded-2xl w-full max-w-4xl max-h-\[90vh\] flex flex-col shadow-2xl"/g,
  'className="bg-[#121b2f] border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl"'
);

fs.writeFileSync('src/features/trainers/TrainersDomainView.tsx', content);
