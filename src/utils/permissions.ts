import { User, CenterSettings } from '../types';

export interface PermissionItem {
  id: string;
  label: string;
  category?: string;
  description?: string;
}

export const ALL_PERMISSIONS: PermissionItem[] = [
  { id: 'dashboard', label: '🏠 لوحة التحكم الرئيسية', category: 'عام', description: 'عرض الشاشة الرئيسية والإحصائيات التجميعية' },
  { id: 'trainees', label: '👥 إدارة المتدربين والطلاب', category: 'الطلاب', description: 'إضافة، تعديل، وحذف بيانات المتدربين' },
  { id: 'trainers', label: '👨‍🏫 إدارة المدربين والمحاضرين', category: 'الكادر', description: 'إدارة أطقم التدريس والمستحقات المباشرة' },
  { id: 'courses', label: '📚 الدورات التدريبية والورش', category: 'الأكاديميا', description: 'إنشاء وتحديث الدورات التدريبية' },
  { id: 'programs', label: '🎓 البرامج والمسارات التدريبية', category: 'الأكاديميا', description: 'إدارة الدبلومات والبرامج الشاملة' },
  { id: 'groups', label: '👥 المجموعات والقاعات التدريبية', category: 'الأكاديميا', description: 'تقسيم الطلاب على المجموعات والمواعيد' },
  { id: 'lab_schedule', label: '🗓️ الجدول الزمني للمعامل', category: 'التشغيل', description: 'جدولة المعامل وحجز الأجهزة' },
  { id: 'attendance', label: '🗓️ الحضور والغياب وقارئ الباركود', category: 'التشغيل', description: 'تسجيل الحضور اليومي والطباعة' },
  { id: 'finance', label: '💰 الحسابات والخزينة وسندات القبض', category: 'المالية', description: 'تحصيل الرسوم وإظهار الإيرادات والخزينة' },
  { id: 'expenses', label: '💸 إدارة المصروفات والنفقات', category: 'المالية', description: 'تسجيل المصروفات التشغيلية والرواتب' },
  { id: 'points', label: '⭐ نظام النقاط والمكافآت والتحفيز', category: 'الأنشطة', description: 'منح وخصم النقاط ولوحة الأوائل' },
  { id: 'exams', label: '📝 الاختبارات والدرجات والنتائج', category: 'الأكاديميا', description: 'إنشاء بنوك الأسئلة ورصد التقييمات' },
  { id: 'homeworks', label: '✅ الواجبات والتقييمات المباشرة', category: 'الأكاديميا', description: 'متابعة الواجبات وتصحيحها' },
  { id: 'interactive', label: '🔗 الجلسات التفاعلية والسبورة', category: 'التشغيل', description: 'إدارة البث المباشر للشاشات المعملية' },
  { id: 'social_feed', label: '🌐 مجتمع التفاعل والنشر', category: 'التواصل', description: 'مشاركة المنشورات والإعلانات للمتدربين' },
  { id: 'devices', label: '🖥️ إدارة الأجهزة والتحكم عن بُعد', category: 'التشغيل', description: 'التحكم في أجهزة المعامل وسحب اللقطات' },
  { id: 'messages', label: '💬 مركز الرسائل والواتساب', category: 'التواصل', description: 'إرسال التنبيهات والرسائل الجماعية' },
  { id: 'reports', label: '📊 مركز التقارير والإحصائيات', category: 'التقارير', description: 'عرض وتصدير تقارير الأداء والمالية' },
  { id: 'certificates', label: '🎓 الشهادات المعتمدة وطباعتها', category: 'الشهادات', description: 'إصدار وتوثيق الشهادات للطلاب' },
  { id: 'branches', label: '🏢 إدارة الفروع والمقرات', category: 'الإدارة العليا', description: 'إضافة وتعديل فروع المؤسسة' },
  { id: 'ai_developer', label: '🧠 مطور الذكاء الاصطناعي (Nagah AI)', category: 'الإدارة العليا', description: 'الوصول لأدوات توليد المحتوى والتطوير' },
  { id: 'audit', label: '📜 سجل العمليات والأمان (Audit Logs)', category: 'الإدارة العليا', description: 'مراقبة جميع الأنشطة والتغييرات في النظام' },
  { id: 'settings', label: '⚙️ إعدادات النظام والنسخ الاحتياطي', category: 'الإدارة العليا', description: 'إدارة المستخدمين والأدوار والنسخ' }
];

export function hasPermission(
  user: User | null | undefined,
  settings: CenterSettings | null | undefined,
  permId: string
): boolean {
  if (!user) return false;

  // Super admin and admin role have master permission across all modules
  if (user.role === 'super_admin' || user.role === 'admin') {
    return true;
  }

  // 1. Check user-specific explicit permissions override if assigned directly to user
  if (Array.isArray(user.permissions) && user.permissions.length > 0) {
    if (user.permissions.includes('all') || user.permissions.includes(permId)) {
      return true;
    }
  }

  // 2. Check center settings role permissions config if available
  if (settings?.rolePermissions && Array.isArray(settings.rolePermissions)) {
    const roleConfig = settings.rolePermissions.find(r => r.id === user.role);
    if (roleConfig && Array.isArray(roleConfig.permissions)) {
      return roleConfig.permissions.includes('all') || roleConfig.permissions.includes(permId);
    }
  }

  // 3. Built-in Default Fallbacks by Role
  const defaultRolePermissions: Record<string, string[]> = {
    branch_manager: [
      'dashboard', 'trainees', 'trainers', 'courses', 'programs', 'groups', 
      'lab_schedule', 'attendance', 'finance', 'expenses', 'points', 'exams', 
      'homeworks', 'interactive', 'social_feed', 'devices', 'messages', 
      'reports', 'certificates'
    ],
    accountant: ['dashboard', 'finance', 'expenses', 'reports'],
    receptionist: ['dashboard', 'trainees', 'courses', 'programs', 'groups', 'attendance', 'messages', 'certificates'],
    trainer: ['dashboard', 'trainees', 'courses', 'groups', 'lab_schedule', 'attendance', 'points', 'exams', 'homeworks', 'interactive', 'social_feed', 'devices'],
    general_manager: ['dashboard', 'interactive', 'social_feed', 'reports', 'finance', 'expenses'],
    admin_staff: ['dashboard', 'trainees', 'trainers', 'courses', 'programs', 'groups', 'lab_schedule', 'attendance', 'finance', 'expenses', 'points', 'exams', 'homeworks', 'messages', 'reports', 'certificates'],
    student: ['dashboard'],
    parent: ['dashboard']
  };

  const allowedList = defaultRolePermissions[user.role];
  if (allowedList) {
    return allowedList.includes(permId);
  }

  return false;
}
