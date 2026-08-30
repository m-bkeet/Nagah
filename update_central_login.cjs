const fs = require('fs');

if (fs.existsSync('src/features/auth/CentralLoginView.tsx')) {
  let content = fs.readFileSync('src/features/auth/CentralLoginView.tsx', 'utf8');

  // Add Button3D import
  if (!content.includes('Button3D')) {
    content = content.replace(
      "import { Shield, Users, GraduationCap, Monitor, ArrowRight, Activity, BookOpen, Key, BrainCircuit, Globe, Sparkles } from 'lucide-react';",
      "import { Shield, Users, GraduationCap, Monitor, ArrowRight, Activity, BookOpen, Key, BrainCircuit, Globe, Sparkles } from 'lucide-react';\nimport { Button3D } from '../../components/ui/Button3D';"
    );

    // Make login buttons 3D
    content = content.replace(
      /<button\s+onClick=\{\(\) => onLoginAsAdmin\('SUPER_ADMIN', 'ALL'\)\}\s+className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500\/20 active:scale-95"\s*>\s*<Key className="w-5 h-5" \/>\s*دخول الإدارة العليا\s*<\/button>/g,
      '<Button3D variant="amber" fullWidth size="lg" onClick={() => onLoginAsAdmin(\'SUPER_ADMIN\', \'ALL\')} className="mb-2">\n                <Key className="w-5 h-5" />دخول الإدارة العليا\n              </Button3D>'
    );
    
    fs.writeFileSync('src/features/auth/CentralLoginView.tsx', content);
  }
}
