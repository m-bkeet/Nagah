const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "case 'finance-vault':            case 'gamification': return <GamificationEngineView />;",
  "case 'finance-vault': return <DashboardOverview onNavigateToModule={setActiveModuleId} currentBranch={currentBranch} />; // TODO: FinanceView\n      case 'gamification': return <GamificationEngineView />;"
);

fs.writeFileSync('src/App.tsx', code);
