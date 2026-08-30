const fs = require('fs');

const code = `import React, { useState, useRef } from 'react';
import { 
  Settings, Building2, Palette, Accessibility, RotateCcw, Database, 
  Shield, MapPin, Phone, Mail, Globe, QrCode, Award, ShieldCheck, 
  CheckCircle2, Edit3, Save, Download, Upload, Printer, Sparkles,
  Lock, Eye, Layers, FileSpreadsheet, Users, Key, Camera, UserCog, UserCheck
} from 'lucide-react';
import { useTheme } from '../../core/theme/ThemeContext';
import { NagahCircularLogo } from '../../components/brand/NagahLogo';
import { Tooltip } from '../../components/ui/Tooltip';
import confetti from 'canvas-confetti';
import { Button3D } from '../../components/ui/Button3D';

export const SystemSettingsView: React.FC = () => {
  const { settings, updateSettings, resetSettings } = useTheme();
  const [activeTab, setActiveTab] = useState<'CENTER_PROFILE' | 'ROLES' | 'APPEARANCE' | 'ACCESSIBILITY' | 'SECURITY' | 'BACKUP'>('CENTER_PROFILE');

  // Center Profile State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const stampInputRef = useRef<HTMLInputElement>(null);
  
  const [centerData, setCenterData] = useState({
    nameArabic: 'مركز النجاح للتدريب والاستشارات',
    nameEnglish: 'Nagah Training & Consulting',
    code: 'NGH-ACADEMY-2026',
    licenseNumber: 'CR-849204-EDU',
    taxNumber: 'TX-992-104-582',
    email: 'nagah.tcn@gmail.com',
    website: 'https://nagah.edu.eg',
    logoUrl: null as string | null,
    stampUrl: null as string | null,
    mainBranch: {
      name: 'فرع النجاح الرئيسي (المقر الإداري والمعامل)',
      address: 'المقر الإداري — المعمل المركزي 1 & 2 (16 جهاز طالب + جهاز مدرب)',
      phones: '01001500686 / 01012345678',
      manager: 'د. محمد رمضان بخيت'
    },
    badrBranch: {
      name: 'فرع مدينة بدر (مجمع الأمل التقني)',
      address: 'مجمع الأمل — المعمل التقني المتطور (15 جهاز طالب + معمل روبوتيكس)',
      phones: '01066264312 / 01234567890',
      manager: 'د. عماد حامد أبو النيل'
    }
  });

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [pinLock, setPinLock] = useState('1234');
  const [isPinRequired, setIsPinRequired] = useState(true);

  // Roles State
  const [roles, setRoles] = useState([
    { id: 'admin', name: 'مدير النظام (Super Admin)', permissions: ['ALL'] },
    { id: 'manager', name: 'مدير فرع (Branch Manager)', permissions: ['students_view', 'students_edit', 'finance_view', 'reports_view'] },
    { id: 'reception', name: 'استقبال (Receptionist)', permissions: ['students_view', 'attendance_edit', 'finance_add'] },
    { id: 'trainer', name: 'مدرب (Trainer)', permissions: ['courses_view', 'attendance_edit', 'homework_edit'] }
  ]);
  const availablePermissions = [
    { id: 'students_view', label: 'عرض المتدربين' },
    { id: 'students_edit', label: 'إضافة وتعديل المتدربين' },
    { id: 'finance_view', label: 'عرض الحسابات والخزينة' },
    { id: 'finance_add', label: 'إضافة إيصالات نقدية' },
    { id: 'attendance_edit', label: 'تسجيل الحضور' },
    { id: 'reports_view', label: 'استخراج التقارير' },
    { id: 'courses_view', label: 'إدارة الكورسات والمجموعات' },
    { id: 'homework_edit', label: 'إدارة الواجبات والملازم' },
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditingProfile(false);
    setSaveSuccess(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  const handleExportBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ centerData, timestamp: new Date().toISOString() }));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "nagah_backup.json");
    dlAnchorElem.click();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'stamp') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCenterData(prev => ({ ...prev, [type === 'logo' ? 'logoUrl' : 'stampUrl']: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTogglePermission = (roleId: string, permId: string) => {
    setRoles(prev => prev.map(r => {
      if (r.id === roleId) {
        if (r.permissions.includes('ALL')) return r;
        const newPerms = r.permissions.includes(permId) 
          ? r.permissions.filter(p => p !== permId)
          : [...r.permissions, permId];
        return { ...r, permissions: newPerms };
      }
      return r;
    }));
  };

  const TABS = [
    { id: 'CENTER_PROFILE', label: 'بيانات المركز', icon: Building2 },
    { id: 'ROLES', label: 'الصلاحيات والأدوار', icon: Users },
    { id: 'APPEARANCE', label: 'المظهر والألوان', icon: Palette },
    { id: 'ACCESSIBILITY', label: 'سهولة الوصول', icon: Accessibility },
    { id: 'SECURITY', label: 'الأمان والخزينة', icon: Shield },
    { id: 'BACKUP', label: 'النسخ الاحتياطي', icon: Database },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto" dir="rtl">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0b1329] p-6 rounded-3xl border border-slate-700/80 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <Settings className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white mb-1">إعدادات النظام والمركز</h1>
            <p className="text-xs text-slate-400">
              إدارة بيانات المركز، الشعار، الألوان، الصلاحيات، والنسخ الاحتياطي
            </p>
          </div>
        </div>
      </div>

      {/* TABS MENU */}
      <div className="flex overflow-x-auto hide-scrollbar border-b border-slate-700/80 pb-2 gap-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={\`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer \${
                isActive
                  ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-[#121b2f] border border-transparent hover:border-slate-700/50'
              }\`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <span>تم حفظ الإعدادات بنجاح! تم اعتماد التعديلات في النظام.</span>
        </div>
      )}

      {/* TAB 1: Center Profile */}
      {activeTab === 'CENTER_PROFILE' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="flex justify-end">
            {!isEditingProfile ? (
              <Button3D variant="secondary" onClick={() => setIsEditingProfile(true)}>
                <Edit3 className="w-4 h-4" />
                تعديل بيانات المركز
              </Button3D>
            ) : (
              <div className="flex gap-2">
                <button type="button" onClick={() => setIsEditingProfile(false)} className="px-4 py-2 rounded-xl text-slate-300 bg-slate-800 hover:bg-slate-700 font-bold transition-colors cursor-pointer">
                  إلغاء
                </button>
                <Button3D variant="primary" type="submit">
                  <Save className="w-4 h-4" />
                  حفظ التعديلات
                </Button3D>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="bg-[#0b1329] p-6 rounded-3xl border border-slate-700/80 shadow-xl space-y-4">
              <h3 className="font-bold text-white flex items-center gap-2 mb-6 text-lg">
                <Building2 className="text-indigo-400 w-5 h-5" />
                البيانات الأساسية للمركز
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">الاسم باللغة العربية</label>
                  <input
                    type="text"
                    disabled={!isEditingProfile}
                    value={centerData.nameArabic}
                    onChange={(e) => setCenterData({...centerData, nameArabic: e.target.value})}
                    className="w-full bg-[#121b2f] border border-slate-700 rounded-xl p-3 text-white disabled:opacity-70 focus:border-indigo-500 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">الاسم باللغة الإنجليزية</label>
                  <input
                    type="text"
                    disabled={!isEditingProfile}
                    value={centerData.nameEnglish}
                    onChange={(e) => setCenterData({...centerData, nameEnglish: e.target.value})}
                    className="w-full bg-[#121b2f] border border-slate-700 rounded-xl p-3 text-white disabled:opacity-70 focus:border-indigo-500 outline-none transition-colors"
                    dir="ltr"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">رقم السجل التجاري</label>
                    <input
                      type="text"
                      disabled={!isEditingProfile}
                      value={centerData.licenseNumber}
                      onChange={(e) => setCenterData({...centerData, licenseNumber: e.target.value})}
                      className="w-full bg-[#121b2f] border border-slate-700 rounded-xl p-3 text-white disabled:opacity-70 focus:border-indigo-500 outline-none transition-colors"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">الرقم الضريبي</label>
                    <input
                      type="text"
                      disabled={!isEditingProfile}
                      value={centerData.taxNumber}
                      onChange={(e) => setCenterData({...centerData, taxNumber: e.target.value})}
                      className="w-full bg-[#121b2f] border border-slate-700 rounded-xl p-3 text-white disabled:opacity-70 focus:border-indigo-500 outline-none transition-colors"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Identity */}
            <div className="bg-[#0b1329] p-6 rounded-3xl border border-slate-700/80 shadow-xl space-y-4">
              <h3 className="font-bold text-white flex items-center gap-2 mb-6 text-lg">
                <Palette className="text-amber-400 w-5 h-5" />
                الهوية البصرية والاعتماد
              </h3>
              
              <div className="grid grid-cols-2 gap-6">
                {/* Logo Upload */}
                <div className="flex flex-col items-center gap-3">
                  <div className="w-32 h-32 rounded-2xl bg-[#121b2f] border-2 border-dashed border-slate-600 flex items-center justify-center overflow-hidden relative group">
                    {centerData.logoUrl ? (
                      <img src={centerData.logoUrl} alt="Center Logo" className="w-full h-full object-contain p-2" />
                    ) : (
                      <NagahCircularLogo size={80} withShadow={true} />
                    )}
                    {isEditingProfile && (
                      <div 
                        onClick={() => logoInputRef.current?.click()}
                        className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm"
                      >
                        <Camera className="w-6 h-6 text-white mb-1" />
                        <span className="text-[10px] text-white font-bold">تغيير اللوجو</span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 font-bold">لوجو المركز (Logo)</span>
                  <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'logo')} />
                </div>

                {/* Stamp Upload */}
                <div className="flex flex-col items-center gap-3">
                  <div className="w-32 h-32 rounded-full bg-[#121b2f] border-2 border-dashed border-slate-600 flex items-center justify-center overflow-hidden relative group">
                    {centerData.stampUrl ? (
                      <img src={centerData.stampUrl} alt="Center Stamp" className="w-full h-full object-contain p-2" />
                    ) : (
                      <div className="text-center">
                         <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto opacity-50 mb-1" />
                         <span className="text-[10px] text-slate-500 font-bold block">لا يوجد ختم</span>
                      </div>
                    )}
                    {isEditingProfile && (
                      <div 
                        onClick={() => stampInputRef.current?.click()}
                        className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm rounded-full"
                      >
                        <Camera className="w-6 h-6 text-white mb-1" />
                        <span className="text-[10px] text-white font-bold">تغيير الختم</span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 font-bold">الختم الرسمي (Stamp)</span>
                  <input type="file" ref={stampInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'stamp')} />
                </div>
              </div>
              <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-2">
                 <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                 <p className="text-xs text-emerald-400 leading-relaxed">
                   عند إضافة الختم، سيتم تطبيقه تلقائياً على كافة الشهادات، الفواتير، والتقارير الرسمية المصدرة من النظام لزيادة الموثوقية.
                 </p>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: Roles */}
      {activeTab === 'ROLES' && (
        <div className="space-y-6">
          <div className="bg-[#0b1329] p-6 rounded-3xl border border-slate-700/80 shadow-xl space-y-6">
             <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <div>
                   <h3 className="font-bold text-white flex items-center gap-2 text-lg">
                     <UserCog className="text-indigo-400 w-5 h-5" />
                     إدارة الأدوار والصلاحيات
                   </h3>
                   <p className="text-xs text-slate-400 mt-1">تحديد ما يمكن لكل مستخدم رؤيته أو تعديله في النظام</p>
                </div>
                <Button3D variant="primary">
                   <Users className="w-4 h-4" />
                   إضافة دور جديد
                </Button3D>
             </div>

             <div className="space-y-4">
                {roles.map(role => (
                   <div key={role.id} className="bg-[#121b2f] p-4 rounded-2xl border border-slate-700/50">
                      <div className="flex items-center gap-3 mb-4">
                         <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                            <UserCheck className="w-5 h-5 text-indigo-400" />
                         </div>
                         <h4 className="text-white font-bold text-lg">{role.name}</h4>
                         {role.permissions.includes('ALL') && (
                            <span className="bg-rose-500/10 text-rose-400 text-[10px] px-2 py-1 rounded-md border border-rose-500/20 font-bold ml-auto">
                               صلاحيات كاملة مطلقة
                            </span>
                         )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                         {availablePermissions.map(perm => {
                            const isGranted = role.permissions.includes('ALL') || role.permissions.includes(perm.id);
                            return (
                               <div 
                                  key={perm.id} 
                                  onClick={() => {
                                     if (!role.permissions.includes('ALL')) {
                                        handleTogglePermission(role.id, perm.id);
                                     }
                                  }}
                                  className={\`flex items-center gap-2 p-2.5 rounded-xl border transition-colors \${role.permissions.includes('ALL') ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-800'} \${isGranted ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-slate-900/50 border-slate-700'}\`}
                               >
                                  <div className={\`w-4 h-4 rounded flex items-center justify-center shrink-0 \${isGranted ? 'bg-indigo-500 text-white' : 'bg-slate-700'}\`}>
                                     {isGranted && <CheckCircle2 className="w-3 h-3" />}
                                  </div>
                                  <span className={\`text-xs \${isGranted ? 'text-indigo-300 font-bold' : 'text-slate-400'}\`}>{perm.label}</span>
                               </div>
                            );
                         })}
                      </div>
                   </div>
                ))}
             </div>
          </div>
        </div>
      )}

      {/* TAB 3: Appearance */}
      {activeTab === 'APPEARANCE' && (
        <div className="bg-[#0b1329] p-6 rounded-3xl border border-slate-700/80 shadow-xl space-y-6 max-w-3xl">
          <h3 className="font-bold text-white flex items-center gap-2 text-lg pb-4 border-b border-slate-800">
             <Palette className="text-amber-400 w-5 h-5" />
             تخصيص المظهر والألوان
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-bold text-slate-100 block mb-3">النمط الرئيسي (Theme)</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => updateSettings({ theme: 'dark' })}
                  className={\`p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all \${settings.theme === 'dark' ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.3)]' : 'bg-[#121b2f] text-slate-400 border-slate-700 hover:bg-slate-800'}\`}
                >
                  الداكن اللامع
                </button>
                <button
                  onClick={() => updateSettings({ theme: 'light' })}
                  className={\`p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all \${settings.theme === 'light' ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.3)]' : 'bg-[#121b2f] text-slate-400 border-slate-700 hover:bg-slate-800'}\`}
                >
                  الفاتح الساطع
                </button>
                <button
                  onClick={() => updateSettings({ theme: 'system' })}
                  className={\`p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all \${settings.theme === 'system' ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.3)]' : 'bg-[#121b2f] text-slate-400 border-slate-700 hover:bg-slate-800'}\`}
                >
                  حسب النظام
                </button>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-bold text-slate-100 block mb-3">كثافة الواجهة (Density)</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => updateSettings({ density: 'compact' })}
                  className={\`p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all \${settings.density === 'compact' ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.3)]' : 'bg-[#121b2f] text-slate-400 border-slate-700 hover:bg-slate-800'}\`}
                >
                  مضغوطة
                </button>
                <button
                  onClick={() => updateSettings({ density: 'normal' })}
                  className={\`p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all \${settings.density === 'normal' ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.3)]' : 'bg-[#121b2f] text-slate-400 border-slate-700 hover:bg-slate-800'}\`}
                >
                  قياسية
                </button>
                <button
                  onClick={() => updateSettings({ density: 'spacious' })}
                  className={\`p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all \${settings.density === 'spacious' ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.3)]' : 'bg-[#121b2f] text-slate-400 border-slate-700 hover:bg-slate-800'}\`}
                >
                  متباعدة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Accessibility */}
      {activeTab === 'ACCESSIBILITY' && (
        <div className="bg-[#0b1329] p-6 rounded-3xl border border-slate-700/80 shadow-xl space-y-6 max-w-2xl">
          <h3 className="font-bold text-white flex items-center gap-2 text-lg pb-4 border-b border-slate-800">
             <Accessibility className="text-emerald-400 w-5 h-5" />
             سهولة الوصول
          </h3>
          <div>
            <label className="text-sm font-bold text-slate-100 block mb-3">حجم الخط</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => updateSettings({ fontScale: 'normal' })}
                className={\`p-3 rounded-xl border text-xs font-bold cursor-pointer \${settings.fontScale === 'normal' ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.3)]' : 'bg-[#121b2f] text-slate-400 border-slate-700'}\`}
              >
                قياسي (100%)
              </button>
              <button
                onClick={() => updateSettings({ fontScale: 'large' })}
                className={\`p-3 rounded-xl border text-xs font-bold cursor-pointer \${settings.fontScale === 'large' ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.3)]' : 'bg-[#121b2f] text-slate-400 border-slate-700'}\`}
              >
                كبير (115%)
              </button>
              <button
                onClick={() => updateSettings({ fontScale: 'xlarge' })}
                className={\`p-3 rounded-xl border text-xs font-bold cursor-pointer \${settings.fontScale === 'xlarge' ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.3)]' : 'bg-[#121b2f] text-slate-400 border-slate-700'}\`}
              >
                كبير جداً (130%)
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-[#121b2f] rounded-2xl border border-slate-700">
            <div>
              <span className="text-sm font-bold text-white block">وضع التباين العالي (High Contrast)</span>
              <span className="text-xs text-slate-400">وضوح عالي للنصوص والحدود لتسهيل القراءة لمن يعانون من ضعف البصر</span>
            </div>
            <input
              type="checkbox"
              checked={settings.highContrast}
              onChange={(e) => updateSettings({ highContrast: e.target.checked })}
              className="w-5 h-5 accent-indigo-600 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* TAB 5: Security & PIN */}
      {activeTab === 'SECURITY' && (
        <div className="bg-[#0b1329] p-6 rounded-3xl border border-slate-700/80 shadow-xl space-y-6 max-w-2xl">
          <div className="pb-4 border-b border-slate-800">
            <h3 className="text-lg font-black text-white flex items-center gap-2 mb-1">
               <Shield className="text-rose-400 w-5 h-5" />
               أمان الخزينة والمستندات الحساسة
            </h3>
            <p className="text-xs text-slate-400">قفل الخزينة وطلب رمز المرور عند إصدار سندات الصرف أو تعديل الحسابات</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#121b2f] rounded-2xl border border-slate-700">
              <div>
                <span className="text-sm font-bold text-white block">طلب رمز PIN لعمليات الخزينة</span>
                <span className="text-xs text-slate-400">حماية الصرف المالي وسندات الخزينة برمز أمان إضافي</span>
              </div>
              <input
                type="checkbox"
                checked={isPinRequired}
                onChange={(e) => setIsPinRequired(e.target.checked)}
                className="w-5 h-5 accent-indigo-600 cursor-pointer"
              />
            </div>
            <div className="bg-[#121b2f] p-4 rounded-2xl border border-slate-700">
              <label className="block text-sm font-bold text-white mb-2">رمز PIN الحالي للخزينة:</label>
              <div className="relative w-48">
                 <input
                   type="password"
                   value={pinLock}
                   onChange={(e) => setPinLock(e.target.value)}
                   maxLength={6}
                   className="w-full p-3 pl-10 bg-[#0b1329] border border-slate-600 rounded-xl text-center font-mono font-black text-lg text-white focus:outline-none focus:border-indigo-500 transition-colors tracking-widest"
                 />
                 <Key className="w-5 h-5 text-slate-500 absolute left-3 top-3.5" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: Backup & Sync */}
      {activeTab === 'BACKUP' && (
        <div className="bg-[#0b1329] p-6 rounded-3xl border border-slate-700/80 shadow-xl space-y-6 max-w-3xl">
          <div className="pb-4 border-b border-slate-800">
            <h3 className="text-lg font-black text-white flex items-center gap-2 mb-1">
               <Database className="text-emerald-400 w-5 h-5" />
               النسخ الاحتياطي ومزامنة البيانات
            </h3>
            <p className="text-xs text-slate-400">تصدير واسترجاع سجلات الطلاب، الدورات، الحسابات، والخزينة محلياً لتأمين البيانات</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Download className="w-5 h-5 text-indigo-400" />
                تصدير نسخة احتياطية كاملة
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed h-10">
                تنزيل ملف بصيغة JSON محمي يحتوي على كافة قواعد البيانات محلياً.
              </p>
              <Button3D variant="primary" onClick={handleExportBackup} className="w-full justify-center">
                <Download className="w-4 h-4" />
                تصدير البيانات الآن
              </Button3D>
            </div>
            <div className="p-5 rounded-2xl border border-slate-700 bg-[#121b2f] space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-400" />
                استرجاع بيانات سابقة
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed h-10">
                استيراد ملف نسخة سابقة واستعادة جميع الجداول والبيانات المسجلة.
              </p>
              <button
                onClick={() => alert('نافذة استيراد واسترجاع النسخة الاحتياطية')}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Upload className="w-4 h-4" />
                استيراد ملف النسخة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
`

fs.writeFileSync('src/features/settings/SystemSettingsView.tsx', code);
console.log('SystemSettingsView.tsx replaced.');
