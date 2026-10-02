import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCenter } from '../context/CenterContext';
import { hasPermission } from '../utils/permissions';
import {
  CheckSquare,
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Layers,
  Users2,
  CalendarCheck2,
  CalendarDays,
  Wallet,
  Receipt,
  Star,
  FileSpreadsheet,
  Link2,
  MessageSquare,
  BarChart3,
  Award,
  Building,
  History,
  Settings,
  ChevronLeft,
  Menu,
  Calendar,
  Brain,
  Zap,
  Activity,
  Gauge
} from 'lucide-react';

interface SidebarProps {
  currentView?: string;
  activeTab?: string;
  onNavigate?: (view: string) => void;
  onTabChange?: (view: string) => void;
  isCollapsed: boolean;
  setIsCollapsed?: (collapsed: boolean) => void;
  onToggleCollapse?: () => void;
  isMobile?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  activeTab,
  onNavigate,
  onTabChange,
  isCollapsed,
  setIsCollapsed,
  onToggleCollapse,
  isMobile = false
}) => {
  const { user } = useAuth();
  const { settings } = useCenter();
  const role = user?.role || 'super_admin';
  const current = currentView || activeTab || 'dashboard';

  const handleNav = (id: string) => {
    if (onNavigate) onNavigate(id);
    if (onTabChange) onTabChange(id);
    
    // Auto-close on mobile when navigation occurs
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      handleToggle();
    }
  };

  const handleToggle = () => {
    if (onToggleCollapse) onToggleCollapse();
    else if (setIsCollapsed) setIsCollapsed(!isCollapsed);
  };

  // Navigation Items matching the user request:
  // 🏠 لوحة التحكم
  // 👥 المتدربون
  // 👨‍🏫 المدربون
  // 📚 الدورات
  // 🎓 البرامج
  // 👥 المجموعات
  // 🗓️ الحضور
  // 💰 الحسابات
  // 💸 المصروفات
  // ⭐ النقاط
  // 📝 الاختبارات
  // 🖥️ الأجهزة
  // 💬 الرسائل
  // 📊 التقارير
  // 🎓 الشهادات
  // ⚙️ الإعدادات
  const allNavItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard, roles: ['super_admin', 'branch_manager', 'admin_staff', 'accountant', 'receptionist'] },
    { id: 'trainers', label: 'المدربون', icon: GraduationCap, roles: ['super_admin', 'branch_manager', 'admin_staff'] },
    { id: 'trainees', label: 'المتدربون', icon: Users, roles: ['super_admin', 'branch_manager', 'admin_staff', 'receptionist', 'trainer'] },
    { id: 'programs', label: 'البرامج التدريبية', icon: Layers, roles: ['super_admin', 'branch_manager', 'admin_staff', 'receptionist'] },
    { id: 'courses', label: 'الدورات التدريبية', icon: BookOpen, roles: ['super_admin', 'branch_manager', 'admin_staff', 'receptionist', 'trainer'] },
    { id: 'groups', label: 'المجموعات التدريبية', icon: Users2, roles: ['super_admin', 'branch_manager', 'admin_staff', 'receptionist', 'trainer'] },
    { id: 'interactive', label: 'الجلسات التفاعلية', icon: CalendarCheck2, roles: ['super_admin', 'branch_manager', 'admin_staff', 'trainer', 'general_manager'] },
    { id: 'finance', label: 'الخزنة والحسابات', icon: Wallet, roles: ['super_admin', 'branch_manager', 'admin_staff', 'accountant'] },
    { id: 'points', label: 'لوحة التميز', icon: Star, roles: ['super_admin', 'branch_manager', 'admin_staff', 'trainer'] },
    { id: 'exams', label: 'الاختبارات والواجبات', icon: FileSpreadsheet, roles: ['super_admin', 'branch_manager', 'admin_staff', 'trainer'] },
    { id: 'messages', label: 'الرسائل والتواصل', icon: MessageSquare, roles: ['super_admin', 'branch_manager', 'admin_staff', 'receptionist'] },
    { id: 'certificates', label: 'الشهادات', icon: Award, roles: ['super_admin', 'branch_manager', 'admin_staff', 'receptionist'] },
    { id: 'branches', label: 'الفروع', icon: Building, roles: ['super_admin'] },
    { id: 'settings', label: 'إعدادات النظام', icon: Settings, roles: ['super_admin'] }
  ];

  const visibleItems = allNavItems.filter(item => hasPermission(user, settings, item.id));

  return (
    <>
      {/* Mobile-only backdrop overlay when sidebar drawer is expanded on small screens */}
      {!isCollapsed && (
        <div
          onClick={handleToggle}
          className="md:hidden fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 transition-all duration-300 animate-fadeIn"
        />
      )}

      <aside
        className={`bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-l border-slate-200/90 dark:border-slate-800 transition-all duration-300 flex flex-col justify-between select-none no-print sidebar-container fixed top-0 bottom-0 right-0 h-screen max-h-screen overflow-hidden z-50 shrink-0 ${
          isCollapsed 
            ? 'w-12 xl:w-14 translate-x-full md:translate-x-0 shadow-lg' 
            : 'w-60 xl:w-64 translate-x-0 shadow-2xl'
        }`}
      >
      {/* Top Section: Toggle button and Navigation List */}
      <div className="flex-1 py-2 px-1.5 overflow-y-auto custom-scrollbar space-y-1">
        <div className="flex items-center justify-between px-2 mb-1.5">
          {!isCollapsed && (
            <span className="text-[10px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              القائمة الرئيسية
            </span>
          )}
          <button
            onClick={handleToggle}
            className="p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-purple-700 dark:hover:text-white hover:bg-purple-50 dark:hover:bg-slate-800 transition-colors mr-auto"
            title={isCollapsed ? 'توسيع القائمة' : 'تصغير القائمة'}
          >
            {isCollapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        <nav className="space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = current === item.id || (item.id === 'audit' && current === 'audit_logs');

            return (
              <button
                key={item.id}
                id={isMobile ? `nav-btn-mobile-${item.id}` : `nav-btn-${item.id}`}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold text-xs transition-all text-right group cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 border border-amber-400 font-black dark:bg-amber-500 dark:text-slate-950 dark:border-amber-400'
                    : 'text-slate-700 hover:text-amber-700 hover:bg-amber-50/80 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/80 border border-transparent font-bold'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-slate-950 dark:text-slate-950 stroke-[2.5]' : 'text-slate-500 group-hover:text-amber-600 dark:text-slate-400 dark:group-hover:text-amber-400 stroke-2'
                  }`}
                />
                {!isCollapsed && (
                  <span className="truncate leading-none tracking-wide text-current">{item.label}</span>
                )}
                {!isCollapsed && isActive && (
                  <div className="mr-auto w-1.5 h-1.5 rounded-full bg-slate-950 dark:bg-slate-950 animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
    </>
  );
};
