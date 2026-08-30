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
import { PublicRegistrationView } from './views/PublicRegistrationView';
import { PublicTrainerRegistrationView } from './views/PublicTrainerRegistrationView';
import { PublicStudentPortalView } from './views/PublicStudentPortalView';
import { PublicParentPortalView } from './views/PublicParentPortalView';
import { PublicTrainerPortalView } from './views/PublicTrainerPortalView';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { isAiModalOpen, setIsAiModalOpen, aiModalTab } = useCenter();
  const { themeConfig } = useTheme();

  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view');
      if (viewParam) return viewParam;
      if (params.get('kiosk') === 'true') return 'kiosk';
      if (params.get('projector') === 'true') return 'projector';
      if (params.get('register') === 'true') return 'register';
    }
    return 'dashboard';
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Sync tab with URL search parameter if present
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view');
      if (viewParam) {
        setActiveTab(viewParam);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handle Standalone / Direct Public Portals (accessible without login)
  if (activeTab === 'kiosk') {
    return <StudentKioskView />;
  }

  if (activeTab === 'projector') {
    return <ProjectorView onExit={() => setActiveTab('dashboard')} />;
  }

  if (activeTab === 'register') {
    return <PublicRegistrationView onBack={() => setActiveTab('dashboard')} />;
  }

  if (activeTab === 'register-trainer') {
    return <PublicTrainerRegistrationView onBack={() => setActiveTab('dashboard')} />;
  }

  if (activeTab === 'student-portal') {
    return <PublicStudentPortalView onBack={() => setActiveTab('dashboard')} />;
  }

  if (activeTab === 'parent-portal') {
    return <PublicParentPortalView onBack={() => setActiveTab('dashboard')} />;
  }

  if (activeTab === 'trainer-portal') {
    return <PublicTrainerPortalView onBack={() => setActiveTab('dashboard')} />;
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

  // Render Active Tab View
  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onNavigate={setActiveTab} />;
      case 'trainers':
        return <TrainersView />;
      case 'trainees':
        return <TraineesView />;
      case 'programs':
        return <ProgramsView />;
      case 'courses':
        return <CoursesView />;
      case 'groups':
        return <GroupsView onNavigate={setActiveTab} />;
      case 'lab_schedule':
        return <LabScheduleView />;
      case 'attendance':
        return <AttendanceView />;
      case 'finance':
        return <FinanceView />;
      case 'expenses':
        return <ExpensesView />;
      case 'points':
        return <PointsView />;
      case 'exams':
        return <ExamsView />;
      case 'homeworks':
        return <HomeworksView />;
      case 'interactive':
        return <InteractiveSessionsView />;
      case 'social_feed':
        return <SocialFeedView />;
      case 'devices':
        return <DevicesView />;
      case 'messages':
        return <MessagesView />;
      case 'reports':
        return <ReportsView />;
      case 'certificates':
        return <CertificatesView />;
      case 'branches':
        return <BranchesView />;
      case 'ai_developer':
        return <NagahAiDeveloperView />;
      case 'audit':
      case 'audit_logs':
        return <AuditLogsView />;
      case 'settings':
        return <SettingsView />;
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
          isSidebarCollapsed ? 'md:pr-14 xl:pr-16' : ''
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

