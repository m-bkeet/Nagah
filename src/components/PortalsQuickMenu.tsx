import React, { useState, useRef, useEffect } from 'react';
import {
  Monitor,
  GraduationCap,
  UserCheck,
  FileSpreadsheet,
  BookmarkCheck,
  Sparkles,
  Laptop,
  Copy,
  Check,
  ExternalLink,
  Share2,
  Globe,
  Zap,
  Layers,
  X,
  Send
} from 'lucide-react';
import { useCenter } from '../context/CenterContext';
import { getPublicBaseUrl } from '../utils/urlHelper';

interface PortalsQuickMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PortalItem {
  id: string;
  title: string;
  subtitle: string;
  queryPath: string;
  icon: React.ElementType;
  lightBadgeColor: string;
  darkBadgeColor: string;
  accentColor: string;
}

export const PortalsQuickMenu: React.FC<PortalsQuickMenuProps> = ({ isOpen, onClose }) => {
  const { showToast, settings } = useCenter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [domainMode, setDomainMode] = useState<'platform' | 'vercel'>('platform');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Origins
  const [platformOrigin, setPlatformOrigin] = useState<string>('');
  const [vercelDomain, setVercelDomain] = useState<string>(() => {
    return (
      localStorage.getItem('nagah_custom_vercel_url') ||
      settings?.customDomain ||
      'https://nagah-ms.vercel.app'
    );
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const origin = getPublicBaseUrl() || window.location.origin;
      setPlatformOrigin(origin);
      if (origin.includes('vercel.app')) {
        setVercelDomain(origin);
      }
    }
  }, []);

  // Close on outside click or Escape key
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const portals: PortalItem[] = [
    {
      id: 'lab_device',
      title: 'بوابة أجهزة المعمل (المتدربين)',
      subtitle: 'تسجيل حضور شاشات المعمل والتمارين',
      queryPath: '/?role=trainee_device',
      icon: Monitor,
      lightBadgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      darkBadgeColor: 'dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800',
      accentColor: 'text-indigo-600 dark:text-indigo-400'
    },
    {
      id: 'student_portal',
      title: 'بوابة المتدربين والطلاب',
      subtitle: 'الدرجات، الشهادات الرسمية والواجبات',
      queryPath: '/?view=student_portal',
      icon: GraduationCap,
      lightBadgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      darkBadgeColor: 'dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
      accentColor: 'text-emerald-600 dark:text-emerald-400'
    },
    {
      id: 'trainer_portal',
      title: 'بوابة المدربين والمعلمين',
      subtitle: 'التحضير الذاتي وإدارة المجموعات والتقييمات',
      queryPath: '/?view=trainer_portal',
      icon: UserCheck,
      lightBadgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      darkBadgeColor: 'dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
      accentColor: 'text-amber-600 dark:text-amber-400'
    },
    {
      id: 'student_registration',
      title: 'استمارة تسجيل متدرب جديد',
      subtitle: 'الرابط المباشر لتقديم وتسجيل المتدربين',
      queryPath: '/?view=register',
      icon: FileSpreadsheet,
      lightBadgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      darkBadgeColor: 'dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800',
      accentColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      id: 'trainer_registration',
      title: 'استمارة انضمام وتوظيف المدربين',
      subtitle: 'رابط تقديم السيرة الذاتية للمدربين الجدد',
      queryPath: '/?trainer_register=true',
      icon: BookmarkCheck,
      lightBadgeColor: 'bg-pink-50 text-pink-700 border-pink-200',
      darkBadgeColor: 'dark:bg-pink-950/50 dark:text-pink-300 dark:border-pink-800',
      accentColor: 'text-pink-600 dark:text-pink-400'
    },
    {
      id: 'interactive_exam',
      title: 'بوابة الاختبارات الأونلاين',
      subtitle: 'منصة أداء الامتحانات والمسابقات الحية',
      queryPath: '/?view=interactive-exam',
      icon: Sparkles,
      lightBadgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      darkBadgeColor: 'dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-800',
      accentColor: 'text-cyan-600 dark:text-cyan-400'
    },
    {
      id: 'admin_login',
      title: 'بوابة الإدارة وتسجيل الدخول',
      subtitle: 'الدخول للوحة التحكم والموظفين',
      queryPath: '/?view=login',
      icon: Laptop,
      lightBadgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
      darkBadgeColor: 'dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
      accentColor: 'text-rose-600 dark:text-rose-400'
    }
  ];

  const getFullUrl = (portal: PortalItem, mode: 'platform' | 'vercel') => {
    const base = mode === 'vercel' ? vercelDomain.replace(/\/+$/, '') : platformOrigin;
    return `${base}${portal.queryPath}`;
  };

  const handleCopyUrl = async (portal: PortalItem, specificMode?: 'platform' | 'vercel') => {
    const targetMode = specificMode || domainMode;
    const url = getFullUrl(portal, targetMode);
    const modeLabel = targetMode === 'vercel' ? 'Vercel' : 'المنصة';

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }

      setCopiedId(`${portal.id}-${targetMode}`);
      showToast(`تم نسخ رابط "${portal.title}" (${modeLabel}) بنجاح! ⚡`, 'success');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      showToast('تعذر النسخ التلقائي', 'error');
    }
  };

  const handleOpenUrl = (portal: PortalItem) => {
    const url = getFullUrl(portal, domainMode);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShareWhatsApp = (portal: PortalItem) => {
    const url = getFullUrl(portal, domainMode);
    const centerName = settings?.centerName || 'مركز النجاح للتدريب والاستشارات';
    const message = encodeURIComponent(
      `🌟 *${centerName}*\n\n` +
      `📌 *${portal.title}*\n` +
      `${portal.subtitle}\n\n` +
      `🔗 *رابط الدخول المباشر:*\n${url}`
    );
    window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank');
  };

  const handleCopyAllLinks = async () => {
    const centerName = settings?.centerName || 'مركز النجاح للتدريب والاستشارات';
    let text = `🌟 *دليل روابط وبوابات ${centerName}* 🌟\n\n`;
    portals.forEach((p, index) => {
      text += `${index + 1}️⃣ *${p.title}*\n`;
      text += `🔗 ${getFullUrl(p, domainMode)}\n\n`;
    });
    text += `✨ تم إعداد هذه الروابط لتسهيل الوصول المباشر لكافة بوابات المركز.`;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopiedId('all-links');
      showToast('تم نسخ دليل جميع الروابط بالكامل بنجاح! 📋✨', 'success');
      setTimeout(() => setCopiedId(null), 2500);
    } catch (err) {
      showToast('تعذر النسخ التلقائي', 'error');
    }
  };

  return (
    <div
      ref={menuRef}
      className="absolute top-full right-0 mt-2 w-[340px] sm:w-[420px] max-h-[85vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl shadow-slate-500/10 dark:shadow-black/60 z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-150 font-sans text-right"
      dir="rtl"
    >
      {/* Header Bar */}
      <div className="p-3 sm:p-3.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 leading-none">
              روابط وبوابات المركز
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              انسخ وشارك أي رابط بنقرة واحدة
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
          title="إغلاق"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Domain Switcher Pill Selector */}
      <div className="px-3 pt-2.5 pb-2 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
        <div className="flex items-center justify-between gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 px-0.5">
          <span>مصدر الروابط المستهدفة:</span>
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
            {domainMode === 'platform' ? 'رابط المنصة الفوري' : 'رابط Vercel السحابي'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/90 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
          <button
            type="button"
            onClick={() => setDomainMode('platform')}
            className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              domainMode === 'platform'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm border border-slate-200/60 dark:border-slate-600'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>رابط المنصة (هنا)</span>
          </button>

          <button
            type="button"
            onClick={() => setDomainMode('vercel')}
            className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              domainMode === 'vercel'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm border border-slate-200/60 dark:border-slate-600'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>رابط Vercel</span>
          </button>
        </div>
      </div>

      {/* Portals List */}
      <div className="p-2 space-y-1.5 overflow-y-auto flex-1 custom-scrollbar">
        {portals.map((portal) => {
          const Icon = portal.icon;
          const isCopied = copiedId === `${portal.id}-${domainMode}`;
          const currentUrl = getFullUrl(portal, domainMode);

          return (
            <div
              key={portal.id}
              className="p-2 sm:p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 hover:bg-slate-100/70 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 transition-all flex items-center justify-between gap-2 group"
            >
              {/* Info */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${portal.lightBadgeColor} ${portal.darkBadgeColor}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                    {portal.title}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {portal.subtitle}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                {/* 1-Click Copy Button */}
                <button
                  type="button"
                  onClick={() => handleCopyUrl(portal)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                    isCopied
                      ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                      : 'bg-white hover:bg-indigo-50 text-indigo-600 border-slate-200 hover:border-indigo-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-indigo-300 dark:border-slate-700'
                  }`}
                  title="نسخ الرابط بنقرة واحدة"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3 h-3 text-white" />
                      <span>تم النسخ!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>نسخ</span>
                    </>
                  )}
                </button>

                {/* Open in new tab */}
                <button
                  type="button"
                  onClick={() => handleOpenUrl(portal)}
                  className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:text-indigo-300 dark:hover:bg-slate-700 border border-transparent hover:border-indigo-200 dark:hover:border-slate-600 transition-all cursor-pointer"
                  title="فتح في تبويب جديد"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                {/* WhatsApp Share */}
                <button
                  type="button"
                  onClick={() => handleShareWhatsApp(portal)}
                  className="p-1 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:text-emerald-300 dark:hover:bg-slate-700 border border-transparent hover:border-emerald-200 dark:hover:border-slate-600 transition-all cursor-pointer"
                  title="مشاركة عبر واتساب"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Actions */}
      <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 shrink-0 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={handleCopyAllLinks}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
            copiedId === 'all-links'
              ? 'bg-emerald-500 text-white border-emerald-600'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-700 shadow-sm'
          }`}
        >
          {copiedId === 'all-links' ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>تم نسخ جميع الروابط!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>نسخ جميع الروابط كرسالة جاهزة</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
