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
import { SocialFeedView } from './views/SocialFeedView';
import { DevicesView } from './views/DevicesView';
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

  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view');
      if (viewParam) {
        if (['kiosk', 'lab', 'lab_kiosk', 'student_kiosk'].includes(viewParam)) return 'kiosk';
        return viewParam;
      }
      if (params.get('role') === 'trainee_device' || params.get('kiosk') === 'true' || params.get('lab') === 'true') {
        return 'kiosk';
      }
      if (params.get('projector') === 'true') return 'projector';
      if (params.get('register') === 'true') return 'register';
    }
    return 'dashboard';
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(true);

  // Sync tab with URL search parameter if present
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view');
      if (viewParam) {
        if (['kiosk', 'lab', 'lab_kiosk', 'student_kiosk'].includes(viewParam)) {
          setActiveTab('kiosk');
        } else {
          setActiveTab(viewParam);
        }
      } else if (params.get('role') === 'trainee_device' || params.get('kiosk') === 'true' || params.get('lab') === 'true') {
        setActiveTab('kiosk');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handle Standalone / Direct Public Portals (accessible without login)
  if (activeTab === 'kiosk' || activeTab === 'lab' || activeTab === 'lab_kiosk' || activeTab === 'student_kiosk') {
    return <StudentKioskView />;
  }

  if (activeTab === 'projector') {
    return <ProjectorView onExit={() => setActiveTab('dashboard')} />;
  }

  if (activeTab === 'public_home' || activeTab === 'public-home' || activeTab === 'public_landing') {
    return <PublicHomeView onNavigate={(view) => setActiveTab(view)} />;
  }

  if (activeTab === 'login') {
    return <LoginView />;
  }

  if (activeTab === 'register') {
    return <PublicRegistrationView onBack={() => setActiveTab('public_home')} />;
  }

  if (activeTab === 'register-trainer') {
    return <PublicTrainerRegistrationView onBack={() => setActiveTab('public_home')} />;
  }

  if (activeTab === 'student-portal' || activeTab === 'student_portal') {
    return <PublicStudentPortalView onBack={() => setActiveTab('public_home')} />;
  }

  if (activeTab === 'parent-portal' || activeTab === 'parent_portal') {
    return <PublicParentPortalView onBack={() => setActiveTab('public_home')} />;
  }

  if (activeTab === 'trainer-portal' || activeTab === 'trainer_portal') {
    return <PublicTrainerPortalView onBack={() => setActiveTab('public_home')} />;
  }

  // Authentication check
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white gap-4">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold tracking-wider text-amber-300">جاري تحميل نظام النجاح...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView />;
  }

  // Render Active Tab View with Strict Permission Guarding
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
        return guard('expenses', <ExpensesView />);
      case 'points':
        return guard('points', <PointsView />);
      case 'exams':
        return guard('exams', <ExamsView />);
      case 'homeworks':
        return guard('homeworks', <HomeworksView />);
      case 'interactive':
        return guard('interactive', <InteractiveSessionsView />);
      case 'social_feed':
        return guard('social_feed', <SocialFeedView />);
      case 'devices':
        return guard('devices', <DevicesView />);
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
        return <DashboardView onNavigate={setActiveTab} />;
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col text-slate-100 antialiased selection:bg-amber-500 selection:text-black font-sans"
      style={{
        backgroundColor: themeConfig.colors.bgMain,
        color: themeConfig.colors.textPrimary
      }}
      dir="rtl"
    >
      {/* Top Header */}
      <Header 
        toggleSidebar={() => setIsSidebarCollapsed(prev => !prev)} 
        onNavigate={setActiveTab} 
      />

      {/* Main Body with Sidebar and Content */}
      <div className="flex-1 flex overflow-hidden">
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

        {/* Dynamic Main View Area */}
        <main className={`flex-1 min-w-0 overflow-y-auto px-3 sm:px-6 py-4 pb-24 md:pb-8 custom-scrollbar transition-all duration-300 ${
          isSidebarCollapsed ? 'md:pr-14 xl:pr-16' : 'md:pr-60 xl:pr-64'
        }`}>
          {renderActiveView()}
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
      <FloatingChatButton />
      <FloatingTeachingToolsOverlay />
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

