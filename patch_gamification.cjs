const fs = require('fs');
let code = fs.readFileSync('src/features/gamification/GamificationEngineView.tsx', 'utf8');

// Insert import
if (!code.includes('PodiumCeremonyModal')) {
  code = code.replace(
    "import { LiveLeaderboardEntry, Badge as BadgeType, ScoringStrategy } from '../../types';",
    "import { LiveLeaderboardEntry, Badge as BadgeType, ScoringStrategy } from '../../types';\nimport { PodiumCeremonyModal } from '../../components/PodiumCeremonyModal';"
  );
}

// Add state for modal
if (!code.includes('isCeremonyOpen')) {
  code = code.replace(
    "const [activeTab, setActiveTab] = useState('leaderboard-spec');",
    "const [activeTab, setActiveTab] = useState('leaderboard-spec');\n  const [isCeremonyOpen, setIsCeremonyOpen] = useState(false);"
  );
}

// Inject Ceremony Trigger Button in 'leaderboard-spec' view
const triggerButton = `
          {/* Podium Ceremony Trigger */}
          <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-transparent border border-amber-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center border border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                <Trophy className="w-8 h-8 text-amber-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">منصة تكريم الأبطال وحفل نجوم الجلسة الحماسي 🏆</h3>
                <p className="text-sm text-slate-400">اضغط لبدء حفل التتويج التفاعلي، إعلان الأبطال من الثالث للأول مع مؤثرات صوتية وتصفيق ونطق الأسماء!</p>
              </div>
            </div>
            <button 
              onClick={() => setIsCeremonyOpen(true)}
              className="flex-shrink-0 flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-black bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-900 transition-all shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:scale-105"
            >
              🎉 بدء حفل إظهار نجوم الجلسة
            </button>
          </div>
`;

code = code.replace(
  /\{activeTab === 'leaderboard-spec' && \(\n\s*<div className="space-y-6">/,
  `{activeTab === 'leaderboard-spec' && (\n        <div className="space-y-6">${triggerButton}`
);

// Inject modal at the bottom
code = code.replace(
  /<\/div>\n\s*<\/div>\n\s*\);\n\};\n/g,
  `      </div>\n      <PodiumCeremonyModal isOpen={isCeremonyOpen} onClose={() => setIsCeremonyOpen(false)} />\n    </div>\n  );\n};\n`
);

fs.writeFileSync('src/features/gamification/GamificationEngineView.tsx', code);
