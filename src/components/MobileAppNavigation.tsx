import React, { useState, useMemo } from 'react';
import { 
  Home, Users, BookOpen, CheckSquare, MessageSquare, 
  Menu, Sparkles, Award, Wallet, Shield, Settings,
  GraduationCap, UserCheck, X, FileText, Smartphone, Bell, 
  Share2, Search, HelpCircle, Bot, Calendar, QrCode,
  Layers, HardDrive, RefreshCw
} from 'lucide-react';
import { useCenter } from '../context/CenterContext';
import { useAuth } from '../context/AuthContext';

interface MobileAppNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const MobileAppNavigation: React.FC<MobileAppNavigationProps> = ({
  activeTab,
  onTabChange
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuSearch, setMenuSearch] = useState('');
  const { user } = useAuth();
  const { showToast, unreadNotifsCount, setIsSearchOpen, openAiModal } = useCenter();

  // Top Clean Icon Tabs (Facebook App Top Bar Style)
  const topIconTabs = [
    { id: 'dashboard', label: 'الرئيسية', icon: Home },
    { id: 'social_feed', label: 'المجتمع', icon: Sparkles, badge: 'جديد' },
    { id: 'trainees', label: 'الطلاب', icon: Users },
    { id: 'courses', label: 'الدورات', icon: BookOpen },
    { id: 'homeworks', label: 'الواجبات', icon: CheckSquare },
    { id: 'messages', label: 'المحادثات', icon: MessageSquare, hasDot: true },
    { id: 'student_portal', label: 'بوابة الطالب', icon: GraduationCap },
    { id: 'parent_portal', label: 'ولي الأمر', icon: UserCheck },
    { id: 'more_menu', label: 'القائمة', icon: Menu },
  ];

  // Primary 5 Bottom Tabs (WhatsApp / Facebook Mobile Native App Style)
  const bottomTabs = [
    { id: 'dashboard', label: 'الرئيسية', icon: Home },
    { id: 'social_feed', label: 'المجتمع', icon: Sparkles },
    { id: 'student_portal', label: 'الطالب', icon: GraduationCap },
    { id: 'messages', label: 'المحادثات', icon: MessageSquare, badge: 2 },
    { id: 'more_menu', label: 'القائمة', icon: Menu },
  ];

  // All Menu Items (Facebook Menu Grid / Shortcuts Style)
  const allSections = [
    { id: 'dashboard', label: 'الرئيسية', cat: 'أساسي', icon: Home, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { id: 'social_feed', label: 'مجتمع التفاعل', cat: 'تواصل', icon: Sparkles, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    { id: 'trainees', label: 'شؤون الطلاب', cat: 'أكاديمي', icon: Users, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    { id: 'trainers', label: 'المدربين والمعلمين', cat: 'أكاديمي', icon: GraduationCap, color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
    { id: 'courses', label: 'المواد والدورات', cat: 'أكاديمي', icon: BookOpen, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    { id: 'homeworks', label: 'الواجبات والتكاليف', cat: 'أكاديمي', icon: CheckSquare, color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
    { id: 'exams', label: 'الاختبارات والتقييم', cat: 'أكاديمي', icon: Award, color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    { id: 'attendance', label: 'الحضور والانصراف', cat: 'أكاديمي', icon: Calendar, color: 'bg-teal-500/20 text-teal-400 border-teal-500/30' },
    { id: 'student_portal', label: 'بوابة الطالب', cat: 'بوابات', icon: GraduationCap, color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
    { id: 'parent_portal', label: 'بوابة ولي الأمر', cat: 'بوابات', icon: UserCheck, color: 'bg-lime-500/20 text-lime-400 border-lime-500/30' },
    { id: 'messages', label: 'المحادثات المباشرة', cat: 'تواصل', icon: MessageSquare, color: 'bg-sky-500/20 text-sky-400 border-sky-500/30' },
    { id: 'finance', label: 'المالية والاشتراكات', cat: 'إدارة', icon: Wallet, color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    { id: 'devices', label: 'أجهزة المعمل والـ Kiosk', cat: 'نظام', icon: Smartphone, color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    { id: 'reports', label: 'التقارير والإحصائيات', cat: 'إدارة', icon: FileText, color: 'bg-violet-500/20 text-violet-400 border-violet-500/30' },
    { id: 'settings', label: 'إعدادات النظام', cat: 'نظام', icon: Settings, color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' }
  ];

  const filteredSections = useMemo(() => {
    if (!menuSearch.trim()) return allSections;
    return allSections.filter(s => 
      s.label.includes(menuSearch) || s.cat.includes(menuSearch)
    );
  }, [menuSearch]);

  const handleTabClick = (tabId: string) => {
    if (tabId === 'more_menu') {
      setIsMenuOpen(true);
    } else {
      onTabChange(tabId);
      setIsMenuOpen(false);
    }
  };

  return (
    <>
      {/* 1. Mobile Clean Icon Top Tab Bar (Facebook App Style) */}
      <div className="md:hidden bg-slate-900/95 border-b border-slate-800/90 sticky top-14 z-30 backdrop-blur-md px-1 select-none">
        <div className="flex items-center justify-between overflow-x-auto no-scrollbar py-1">
          {topIconTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id || (tab.id === 'more_menu' && isMenuOpen);
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`relative flex items-center justify-center p-2.5 min-w-[48px] rounded-xl transition-all duration-150 active:scale-90 ${
                  isActive
                    ? 'text-amber-400 bg-amber-500/15 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
                title={tab.label}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                
                {/* Active Indicator Underline Bar */}
                {isActive && (
                  <span className="absolute bottom-0 inset-x-2 h-0.5 bg-amber-400 rounded-full" />
                )}

                {/* Optional notification badge / dot */}
                {tab.hasDot && (
                  <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-slate-900" />
                )}
                {tab.badge && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full shadow-sm">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Mobile Clean Bottom Navigation Bar (WhatsApp / Facebook Mobile Style) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800/90 backdrop-blur-xl px-2 py-1 shadow-2xl flex items-center justify-around h-16 safe-bottom">
        {bottomTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id || (tab.id === 'more_menu' && isMenuOpen);
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all active:scale-95 ${
                isActive ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`relative p-1.5 rounded-2xl transition-all ${isActive ? 'bg-amber-500/15' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                
                {tab.badge && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-slate-950">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-sans">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Facebook-Style "Menu / القائمة" Sheet */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col justify-end animate-in fade-in duration-200">
          <div className="bg-slate-900 border-t border-slate-800 rounded-t-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Sheet Header: User Profile Card */}
            <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black text-base flex items-center justify-center shadow-md">
                  {user?.fullName?.slice(0, 2) || 'نجاح'}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-100 text-sm">{user?.fullName || 'مستخدم المنظومة'}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      {user?.role === 'admin' || user?.role === 'super_admin' ? 'مدير المنظومة' : 'مدرب معتمد'}
                    </span>
                    <span className="text-[11px] text-slate-400">مركز النجاح</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsMenuOpen(false)}
                className="w-9 h-9 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search within Menu (Facebook style search bar) */}
            <div className="p-3 bg-slate-950/40 border-b border-slate-800/80">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="بحث في القوائم والأدوات..."
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                />
                {menuSearch && (
                  <button 
                    onClick={() => setMenuSearch('')} 
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Shortcuts Grid: Clean rounded square cards like Facebook Menu */}
            <div className="p-4 overflow-y-auto custom-scrollbar flex-1 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-400 mb-2.5 px-1">الاختصارات السريعة</h4>
                <div className="grid grid-cols-3 gap-2.5">
                  {filteredSections.map(sec => {
                    const Icon = sec.icon;
                    const isSecActive = activeTab === sec.id;
                    return (
                      <button
                        key={sec.id}
                        onClick={() => {
                          onTabChange(sec.id);
                          setIsMenuOpen(false);
                        }}
                        className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center transition-all duration-150 active:scale-95 ${
                          isSecActive
                            ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md'
                            : 'bg-slate-950/80 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-950'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1.5 border ${sec.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-bold tracking-tight line-clamp-1 leading-tight">
                          {sec.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick AI & Support Actions */}
              <div className="pt-2 border-t border-slate-800/80">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      openAiModal('manager');
                    }}
                    className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-300 flex items-center gap-2 text-xs font-bold active:scale-95"
                  >
                    <Bot className="w-4 h-4 text-purple-400" />
                    <span>المساعد الذكي AI</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsSearchOpen(true);
                    }}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-2 text-xs font-bold active:scale-95"
                  >
                    <Search className="w-4 h-4 text-amber-400" />
                    <span>البحث الشامل</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Menu Footer */}
            <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-[11px] text-slate-500">Nagah Mobile App</span>
              <button
                onClick={() => {
                  showToast('تم نسخ رابط المنظومة بنجاح 📲', 'success');
                }}
                className="flex items-center gap-1.5 text-amber-400 font-bold active:scale-95"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>مشاركة الرابط</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
