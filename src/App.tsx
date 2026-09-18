import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CenterProvider, useCenter } from './context/CenterContext';

// Navigation & Layout Components
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MobileAppNavigation } from './components/MobileAppNavigation';

// Global Overlays & Modals
import { ToastContainer } from './components/ToastContainer';
import { PrintModal } from './components/PrintModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { AiAssistantsModal } from './components/AiAssistantsModal';
import { FloatingChatButton } from './components/FloatingChatButton';
import { FloatingTeachingToolsOverlay } from './components/FloatingTeachingToolsOverlay';
import { AudioAutoplayUnlockBanner } from './components/AudioAutoplayUnlockBanner';
import { PwaUpdateToast } from './components/PwaUpdateToast';
import { ErrorBoundary } from './components/ErrorBoundary';

// Core Views
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { TrainersView } from './views/TrainersView';
import { TraineesView } from './views/TraineesView';
import { ProgramsView } from './views/ProgramsView';
import { CoursesView } from './views/CoursesView';
import { GroupsView } from './views/GroupsView';
import { LabScheduleView } from './views/LabScheduleView';
import { AttendanceView } from './views/AttendanceView';
import { FinanceView } from './views/FinanceView';
import { ExpensesView } from './views/ExpensesView';
import { PointsView } from './views/PointsView';
import { ExamsView } from './views/ExamsView';
import { HomeworksView } from './views/HomeworksView';
import { InteractiveSessionsView } from './views/InteractiveSessionsView';
import { MessagesView } from './views/MessagesView';
import { ReportsView } from './views/ReportsView';
import { CertificatesView } from './views/CertificatesView';
import { BranchesView } from './views/BranchesView';
import { NagahAiDeveloperView } from './views/NagahAiDeveloperView';
import { AuditLogsView } from './views/AuditLogsView';
import { SettingsView } from './views/SettingsView';

// Public Views & Portals
import { StudentKioskView } from './views/StudentKioskView';
import { ProjectorView } from './views/ProjectorView';
import { PublicHomeView } from './views/PublicHomeView';
import { PublicRegistrationView } from './views/PublicRegistrationView';
import { PublicTrainerRegistrationView } from './views/PublicTrainerRegistrationView';
import { PublicStudentPortalView } from './views/PublicStudentPortalView';
import { PublicParentPortalView } from './views/PublicParentPortalView';
import { PublicTrainerPortalView } from './views/PublicTrainerPortalView';
import { hasPermission } from './utils/permissions';
import { ShieldAlert, LayoutDashboard } from 'lucide-react';

const AccessDeniedView: React.FC<{ tabId: string; onGoHome: () => void }> = ({ tabId, onGoHome }) => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
      <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center mb-5 shadow-xl shadow-rose-950/20 animate-bounce">
        <ShieldAlert className="w-10 h-10" />
      </div>
      <h2 className="text-2xl font-black text-slate-100 mb-2">غير مصرح بالوصول لهذا القسم</h2>
      <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
        عذراً، حسابك لا يمتلك الصلاحية الكافية للوصول إلى هذا القسم (<span className="text-amber-400 font-bold">{tabId}</span>). يرجى التواصل مع المدير العام لتعديل صلاحيات دورك.
      </p>
      <button
        onClick={onGoHome}
        className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
      >
        <LayoutDashboard className="w-4 h-4" />
        العودة إلى لوحة التحكم
      </button>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { isAiModalOpen, setIsAiModalOpen, aiModalTab, settings } = useCenter();
  const { themeConfig } = useTheme();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar_collapsed');
      if (saved !== null) return saved === 'true';
    }
    return true; // Collapsed by default as requested
  });

  useEffect(() => {
    try {
      localStorage.setItem('sidebar_collapsed', String(isSidebarCollapsed));
    } catch (e) {}
  }, [isSidebarCollapsed]);

  // Robust URL Parser supporting both Search Params (?view=...&task=...) and Hash Params (#student-portal?task=...)
  const parseNavigationState = (): { tab: string; taskId: string | null } => {
    if (typeof window === 'undefined') return { tab: 'dashboard', taskId: null };

    const searchParams = new URLSearchParams(window.location.search);
    let view = searchParams.get('view');
    let taskId = searchParams.get('task');

    // Parse location.hash (e.g. #student-portal?task=assign-123 or #quiz-challenge?task=assign-123)
    const hash = window.location.hash || '';
    if (hash.startsWith('#')) {
      const raw = hash.slice(1);
      const [hashPath, hashQuery] = raw.split('?');
      if (hashPath) {
        if (!view) view = hashPath;
      }
      if (hashQuery) {
        const hp = new URLSearchParams(hashQuery);
        if (!taskId) taskId = hp.get('task');
        if (!view && hp.get('view')) view = hp.get('view');
      }
    }

    // Direct link to assignment or quiz challenge (e.g. from WhatsApp)
    if (taskId && (!view || view === 'dashboard' || view === 'public_home' || view === 'login')) {
      view = 'student-portal';
    }

    if (view) {
      if (['kiosk', 'lab', 'lab_kiosk', 'student_kiosk'].includes(view)) return { tab: 'kiosk', taskId };
      return { tab: view, taskId };
    }
    if (searchParams.get('role') === 'trainee_device' || searchParams.get('kiosk') === 'true' || searchParams.get('lab') === 'true') {
      return { tab: 'kiosk', taskId };
    }
    if (searchParams.get('projector') === 'true') return { tab: 'projector', taskId };
    if (searchParams.get('register') === 'true') return { tab: 'register', taskId };

    return { tab: 'dashboard', taskId };
  };

  const [navState, setNavState] = useState<{ tab: string; taskId: string | null }>(() => parseNavigationState());
  const activeTab = navState.tab;
  const directTaskId = navState.taskId;

  const setActiveTab = (tab: string) => {
    setNavState(prev => ({ ...prev, tab }));
  };

  // Sync tab with URL search parameter & hash if present
  useEffect(() => {
    const handleUrlChange = () => {
      setNavState(parseNavigationState());
    };
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  // Helper to render public/standalone views without duplicated wrappers
  const renderPublicView = () => {
    switch (activeTab) {
      case 'kiosk':
      case 'lab':
      case 'lab_kiosk':
      case 'student_kiosk':
        return <StudentKioskView />;
      case 'projector':
        return <ProjectorView onExit={() => setActiveTab('dashboard')} />;
      case 'public_home':
      case 'public-home':
      case 'public_landing':
        return <PublicHomeView onNavigate={(view) => setActiveTab(view)} />;
      case 'login':
        return <LoginView />;
      case 'register':
        return <PublicRegistrationView onBack={() => setActiveTab('public_home')} />;
      case 'register-trainer':
        return <PublicTrainerRegistrationView onBack={() => setActiveTab('public_home')} />;
      case 'quiz-challenge':
      case 'challenge':
      case 'student-portal':
      case 'student_portal':
        return <PublicStudentPortalView directTaskId={directTaskId} onBack={() => setActiveTab('public_home')} />;
      case 'parent-portal':
      case 'parent_portal':
        return <PublicParentPortalView onBack={() => setActiveTab('public_home')} />;
      case 'trainer-portal':
      case 'trainer_portal':
        return <PublicTrainerPortalView onBack={() => setActiveTab('public_home')} />;
      default:
        return null;
    }
  };

  const standaloneView = renderPublicView();
  if (standaloneView) {
    return (
      <>
        {standaloneView}
        {activeTab === 'trainer_portal' && <FloatingTeachingToolsOverlay />}
        <ToastContainer />
        <PwaUpdateToast />
      </>
    );
  }

  // Authentication check
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 text-slate-900 dark:text-white gap-4">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold tracking-wider text-amber-600 dark:text-amber-300">جاري تحميل نظام النجاح...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView />;
  }

  // Render Active Tab View Directly & Safely
  const renderActiveView = () => {
    // Helper to guard view rendering
    const guard = (permId: string, component: React.ReactNode) => {
      if (!hasPermission(user, settings, permId)) {
        return <AccessDeniedView tabId={permId} onGoHome={() => setActiveTab('dashboard')} />;
      }
      return component;
    };

    switch (activeTab) {
      case 'dashboard':
        return guard('dashboard', <DashboardView onNavigate={setActiveTab} />);
      case 'trainers':
        return guard('trainers', <TrainersView />);
      case 'trainees':
        return guard('trainees', <TraineesView />);
      case 'programs':
        return guard('programs', <ProgramsView />);
      case 'courses':
        return guard('courses', <CoursesView />);
      case 'groups':
        return guard('groups', <GroupsView onNavigate={setActiveTab} />);
      case 'lab_schedule':
        return guard('lab_schedule', <LabScheduleView />);
      case 'attendance':
        return guard('attendance', <AttendanceView />);
      case 'finance':
        return guard('finance', <FinanceView />);
      case 'expenses':
        return guard('finance', <FinanceView initialTab="expenses" />);
      case 'points':
        return guard('points', <PointsView />);
      case 'exams':
        return guard('exams', <ExamsView />);
      case 'homeworks':
        return guard('homeworks', <HomeworksView />);
      case 'interactive':
        return guard('interactive', <InteractiveSessionsView />);
      case 'messages':
        return guard('messages', <MessagesView />);
      case 'reports':
        return guard('reports', <ReportsView />);
      case 'certificates':
        return guard('certificates', <CertificatesView />);
      case 'branches':
        return guard('branches', <BranchesView />);
      case 'ai_developer':
        return guard('ai_developer', <NagahAiDeveloperView />);
      case 'audit':
      case 'audit_logs':
        return guard('audit', <AuditLogsView />);
      case 'settings':
        return guard('settings', <SettingsView />);
      case 'student_portal':
        return <PublicStudentPortalView onBack={() => setActiveTab('dashboard')} />;
      case 'parent_portal':
        return <PublicParentPortalView onBack={() => setActiveTab('dashboard')} />;
      case 'trainer_portal':
        return <PublicTrainerPortalView onBack={() => setActiveTab('dashboard')} />;
      default:
        return guard('dashboard', <DashboardView onNavigate={setActiveTab} />);
    }
  };

  return (
    <div 
      id="app-root-container"
      className="fixed inset-0 w-full h-[100dvh] max-h-[100dvh] flex flex-col overflow-hidden bg-white dark:bg-[#080a14] text-slate-900 dark:text-slate-100 antialiased selection:bg-blue-600 selection:text-white font-sans"
      style={{
        backgroundColor: themeConfig.colors.bgMain,
        color: themeConfig.colors.textPrimary
      }}
      dir="rtl"
    >
      {/* Top Header - Locked & Stationary */}
      <Header 
        toggleSidebar={() => setIsSidebarCollapsed(prev => !prev)} 
        onNavigate={setActiveTab} 
      />

      {/* Main Body with Sidebar and Content */}
      <div className="flex-1 min-h-0 min-w-0 flex overflow-hidden relative bg-white dark:bg-[#080a14]">
        {/* Right Sidebar (in RTL) */}
        <Sidebar 
          currentView={activeTab}
          activeTab={activeTab}
          onNavigate={setActiveTab}
          onTabChange={setActiveTab}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
        />

        {/* Dynamic Main View Area - Independent Touch & Momentum Scroll Container */}
        <main 
          id="main-content-scrollable"
          className={`flex-1 min-w-0 h-full overflow-y-auto overflow-x-hidden px-3 sm:px-6 py-4 pb-24 md:pb-8 custom-scrollbar overscroll-contain transition-all duration-300 bg-white dark:bg-[#080a14] ${
            isSidebarCollapsed ? 'md:pr-14 xl:pr-16' : 'md:pr-60 xl:pr-64'
          }`}
        >
          <ErrorBoundary key={activeTab} fallbackTitle={`حدث خطأ في تحميل هذا التبويب (${activeTab})`}>
            {renderActiveView()}
          </ErrorBoundary>
        </main>
      </div>

      {/* Mobile App Navigation (Bottom Bar on small screens) */}
      <MobileAppNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      {/* Global Overlays, Modals, and Widgets */}
      <ToastContainer />
      <PrintModal />
      <GlobalSearchModal onNavigate={(view) => setActiveTab(view)} />
      <AiAssistantsModal 
        isOpen={isAiModalOpen} 
        onClose={() => setIsAiModalOpen(false)} 
        initialTab={aiModalTab} 
      />
      {/* Conditional Floating Chat & Tools (Only on Main Dashboard and Trainer Portal) */}
      {(activeTab === 'dashboard' || activeTab === 'trainer_portal') && (
        <>
          <FloatingChatButton />
          <FloatingTeachingToolsOverlay />
        </>
      )}
      <AudioAutoplayUnlockBanner />
      <PwaUpdateToast />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CenterProvider>
          <AppContent />
        </CenterProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

