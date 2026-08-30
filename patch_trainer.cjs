const fs = require('fs');
let code = fs.readFileSync('src/features/trainer-portal/TrainerPortalView.tsx', 'utf8');

// Insert import
if (!code.includes('PodiumCeremonyModal')) {
  code = code.replace(
    "import { ThemeSettingsModal } from '../../components/ThemeSettingsModal';",
    "import { ThemeSettingsModal } from '../../components/ThemeSettingsModal';\nimport { PodiumCeremonyModal } from '../../components/PodiumCeremonyModal';\nimport { Trophy } from 'lucide-react';"
  );
}

// Add state for modal
if (!code.includes('isCeremonyOpen')) {
  code = code.replace(
    "const [isThemeOpen, setIsThemeOpen] = useState(false);",
    "const [isThemeOpen, setIsThemeOpen] = useState(false);\n  const [isCeremonyOpen, setIsCeremonyOpen] = useState(false);"
  );
}

const triggerButton = `
              {/* Podium Ceremony Trigger */}
              <div className="bg-gradient-to-l from-amber-500/10 via-indigo-600/5 to-white border border-amber-500/30 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-200 shadow-sm">
                    <Trophy className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm mb-0.5">منصة تتويج نجوم الجلسة 🏆</h3>
                    <p className="text-[11px] text-slate-500">أطلق حفل التكريم للمتميزين في نهاية المحاضرة بضغطة زر</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsCeremonyOpen(true)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-bold bg-amber-500 hover:bg-amber-600 text-white transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  🎉 بدء التتويج
                </button>
              </div>
`;

code = code.replace(
  /\{activeTab === 'MY_DASHBOARD' && \(\n\s*<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">\n\s*<div className="lg:col-span-2 space-y-4">/,
  `{activeTab === 'MY_DASHBOARD' && (\n          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">\n            <div className="lg:col-span-2 space-y-4">${triggerButton}`
);

// Inject modal at the bottom before last closing div
code = code.replace(
  /<\/div>\n\s*<ThemeSettingsModal\s+isOpen=\{isThemeOpen\}\s+onClose=\{\(\) => setIsThemeOpen\(false\)\}\s+\/>\n\s*<\/div>\n\s*\);\n\};\n/g,
  `      </div>\n      <ThemeSettingsModal isOpen={isThemeOpen} onClose={() => setIsThemeOpen(false)} />\n      <PodiumCeremonyModal isOpen={isCeremonyOpen} onClose={() => setIsCeremonyOpen(false)} />\n    </div>\n  );\n};\n`
);

fs.writeFileSync('src/features/trainer-portal/TrainerPortalView.tsx', code);
