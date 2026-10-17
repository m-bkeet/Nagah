/**
 * Payment Reminder & Subscription Helpers for Course Subscriptions.
 * Rule: Payment reminder window is active from Day 28 of each month until Day 5 of the next month (inclusive).
 */

export interface TraineePaymentInfo {
  isUnpaid: boolean;
  isExempt: boolean;
  remainingAmount: number;
  isReminderWindow: boolean;
  statusLabel: string;
  shortLabel: string;
  statusBadgeClass: string;
}

/**
 * Checks if current date falls within the monthly payment reminder window (from day 25 of current month to day 5 of next month).
 */
export function isPaymentReminderWindow(date = new Date()): boolean {
  const day = date.getDate();
  return day >= 25 || day <= 5;
}

export function getEffectiveFee(trainee: any, courses: any[] = [], groups: any[] = []): number {
  if (!trainee) return 0;
  const isSuspendedOrDropped = trainee.status === 'suspended' || trainee.status === 'dropped';
  const isUnassigned = !trainee.groupId || trainee.groupId.trim() === '' || trainee.groupId === 'unassigned';
  if (isSuspendedOrDropped || isUnassigned) {
    return 0;
  }
  if (trainee.feeAmount && Number(trainee.feeAmount) > 0) {
    return Number(trainee.feeAmount);
  }
  if (trainee.groupId && groups.length > 0) {
    const grp = groups.find(g => g.id === trainee.groupId);
    if (grp && grp.feeAmount !== undefined && grp.feeAmount !== null && Number(grp.feeAmount) > 0) {
      return Number(grp.feeAmount);
    }
  }
  if (trainee.courseId && courses.length > 0) {
    const crs = courses.find(c => c.id === trainee.courseId);
    if (crs && (crs.feeAmount || crs.price)) {
      return Number(crs.feeAmount || crs.price);
    }
  }
  return Number(trainee.feeAmount) || 0;
}

export function getEffectiveNetAmount(trainee: any, courses: any[] = [], groups: any[] = []): number {
  if (!trainee) return 0;
  
  // Rule: Suspended, dropped, or unassigned students have 0 dues/expected revenue
  const isSuspendedOrDropped = trainee.status === 'suspended' || trainee.status === 'dropped';
  const isUnassigned = !trainee.groupId || trainee.groupId.trim() === '' || trainee.groupId === 'unassigned';
  if (isSuspendedOrDropped || isUnassigned) {
    return 0;
  }

  const isExempt = Boolean(
    trainee.isExempt === true || 
    String(trainee.isExempt) === 'true' || 
    Boolean(trainee.exemptReason) || 
    /إعفاء|معفى|معفي|أبناء|منحة|مالك|إداري|مجاني/i.test(trainee.notes || '')
  );
  if (isExempt) return 0;
  const fee = getEffectiveFee(trainee, courses, groups);
  const discount = Number(trainee.discountAmount) || 0;
  return Math.max(0, fee - discount);
}

export function getEffectiveRemaining(trainee: any, courses: any[] = [], groups: any[] = []): number {
  if (!trainee) return 0;

  // Rule: Suspended, dropped, or unassigned students have 0 remaining debt
  const isSuspendedOrDropped = trainee.status === 'suspended' || trainee.status === 'dropped';
  const isUnassigned = !trainee.groupId || trainee.groupId.trim() === '' || trainee.groupId === 'unassigned';
  if (isSuspendedOrDropped || isUnassigned) {
    return 0;
  }

  const isExempt = Boolean(
    trainee.isExempt === true || 
    String(trainee.isExempt) === 'true' || 
    Boolean(trainee.exemptReason) || 
    /إعفاء|معفى|معفي|أبناء|منحة|مالك|إداري|مجاني/i.test(trainee.notes || '')
  );
  if (isExempt) return 0;
  const net = getEffectiveNetAmount(trainee, courses, groups);
  const paid = Number(trainee.paidAmount) || 0;
  return Math.max(0, net - paid);
}

/**
 * Checks if a trainee has an unpaid remaining amount for their subscription.
 */
export function isTraineeUnpaid(trainee: any, courses: any[] = [], groups: any[] = []): boolean {
  if (!trainee) return false;

  // Suspended, dropped, or unassigned trainees are not billed for dues
  const isSuspendedOrDropped = trainee.status === 'suspended' || trainee.status === 'dropped';
  const isUnassigned = !trainee.groupId || trainee.groupId.trim() === '' || trainee.groupId === 'unassigned';
  if (isSuspendedOrDropped || isUnassigned) {
    return false;
  }

  const isExempt = Boolean(
    trainee.isExempt === true || 
    String(trainee.isExempt) === 'true' || 
    Boolean(trainee.exemptReason) || 
    /إعفاء|معفى|معفي|أبناء|منحة|مالك|إداري|مجاني/i.test(trainee.notes || '')
  );
  if (isExempt) return false;
  const remaining = getEffectiveRemaining(trainee, courses, groups);
  return remaining > 0;
}

/**
 * Gets formatted payment status metadata for a trainee.
 */
export function getTraineePaymentStatusInfo(trainee: any, isStudentView = false, date = new Date()): TraineePaymentInfo {
  const inWindow = isPaymentReminderWindow(date);

  if (!trainee) {
    return {
      isUnpaid: false,
      isExempt: false,
      remainingAmount: 0,
      isReminderWindow: inWindow,
      statusLabel: 'غير محدد',
      shortLabel: 'غير محدد',
      statusBadgeClass: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
    };
  }

  // 1. Suspended Trainee (متوقف)
  if (trainee.status === 'suspended') {
    return {
      isUnpaid: false,
      isExempt: false,
      remainingAmount: 0,
      isReminderWindow: false,
      statusLabel: 'متوقف (بدون مستحقات مالية) ⏸️',
      shortLabel: 'متوقف ⏸️',
      statusBadgeClass: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 font-bold shadow-xs'
    };
  }

  // 2. Dropped Trainee (منسحب)
  if (trainee.status === 'dropped') {
    return {
      isUnpaid: false,
      isExempt: false,
      remainingAmount: 0,
      isReminderWindow: false,
      statusLabel: 'منسحب (بدون مستحقات) 🚫',
      shortLabel: 'منسحب 🚫',
      statusBadgeClass: 'bg-stone-100 text-stone-800 border-stone-300 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700 font-bold shadow-xs'
    };
  }

  // 3. Unassigned to Group (غير مسكن بمجموعة)
  if (!trainee.groupId || trainee.groupId.trim() === '' || trainee.groupId === 'unassigned') {
    return {
      isUnpaid: false,
      isExempt: false,
      remainingAmount: 0,
      isReminderWindow: false,
      statusLabel: 'غير مسكن بمجموعة (بدون مستحقات) ⏳',
      shortLabel: 'غير مسكن ⏳',
      statusBadgeClass: 'bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700 font-bold shadow-xs'
    };
  }

  const isExempt = Boolean(
    trainee.isExempt === true || 
    String(trainee.isExempt) === 'true' || 
    Boolean(trainee.exemptReason) || 
    /إعفاء|معفى|معفي|أبناء|منحة|مالك|إداري|مجاني/i.test(trainee.notes || '')
  );

  if (isExempt) {
    return {
      isUnpaid: false,
      isExempt: true,
      remainingAmount: 0,
      isReminderWindow: inWindow,
      statusLabel: 'معفى من المصروفات 🎓',
      shortLabel: 'معفى 🎓',
      statusBadgeClass: 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-500/40 shadow-xs'
    };
  }

  const unpaid = isTraineeUnpaid(trainee);
  const remaining = getEffectiveRemaining(trainee);

  if (unpaid && remaining > 0) {
    const isBeforeFirstCycle = date.getFullYear() === 2026 && (date.getMonth() < 8 || (date.getMonth() === 8 && date.getDate() < 28));

    // Hide arrears if not in window for EVERYONE or before the first cycle
    if (!inWindow || isBeforeFirstCycle) {
      return {
        isUnpaid: false, 
        isExempt: false,
        remainingAmount: remaining,
        isReminderWindow: false,
        statusLabel: 'اشتراك ساري ✅',
        shortLabel: 'ساري ✅',
        statusBadgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-500/40 shadow-xs'
      };
    }

    if (inWindow) {
      return {
        isUnpaid: true,
        isExempt: false,
        remainingAmount: remaining,
        isReminderWindow: true,
        statusLabel: `غير مسدد الاشتراك 🔴 (تنبيه متبقي ${remaining} ج.م)`,
        shortLabel: 'غير مسدد 🚨',
        statusBadgeClass: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-500/60 animate-pulse font-bold shadow-md shadow-rose-950/10'
      };
    }

    return {
      isUnpaid: true,
      isExempt: false,
      remainingAmount: remaining,
      isReminderWindow: false,
      statusLabel: `غير مسدد الاشتراك ⚠️ (متبقي ${remaining} ج.م)`,
      shortLabel: 'غير مسدد ⚠️',
      statusBadgeClass: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-500/40 font-bold shadow-xs'
    };
  }

  return {
    isUnpaid: false,
    isExempt: false,
    remainingAmount: 0,
    isReminderWindow: inWindow,
    statusLabel: 'مسدد الاشتراك بالكامل ✅',
    shortLabel: 'مسدد بالكامل ✅',
    statusBadgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-500/40 shadow-xs'
  };
}

/**
 * Cleans an Egyptian phone number to standard local format (e.g. 01001500686)
 */
export function cleanEgyptianPhoneNumber(phone: string): string {
  if (!phone) return '01001500686';
  let cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+20')) {
    cleaned = '0' + cleaned.substring(3);
  } else if (cleaned.startsWith('20')) {
    cleaned = '0' + cleaned.substring(2);
  }
  return cleaned;
}

/**
 * Generates the USSD code for Vodafone Cash transfer (*9*7*number*amount#)
 */
export function getVodafoneCashUssdCode(walletNumber: string, amount?: number): string {
  const cleanNumber = cleanEgyptianPhoneNumber(walletNumber);
  const amt = amount && amount > 0 ? Math.round(amount) : null;
  if (amt) {
    return `*9*7*${cleanNumber}*${amt}#`;
  }
  return `*9*7*${cleanNumber}#`;
}

/**
 * Generates the tel: URI scheme for Vodafone Cash USSD call
 */
export function getVodafoneCashTelUri(walletNumber: string, amount?: number): string {
  const cleanNumber = cleanEgyptianPhoneNumber(walletNumber);
  const amt = amount && amount > 0 ? Math.round(amount) : null;
  if (amt) {
    return `tel:*9*7*${cleanNumber}*${amt}%23`;
  }
  return `tel:*9*7*${cleanNumber}%23`;
}

/**
 * Executes Vodafone Cash transfer request via tel: URI
 */
export function executeVodafoneCashPayment(walletNumber: string, amount?: number): void {
  const telUri = getVodafoneCashTelUri(walletNumber, amount);
  window.location.href = telUri;
}

/**
 * Generates InstaPay deep link URIs
 */
export function getInstaPayDeepLinks(ipaAddress: string, amount?: number) {
  const cleanIpa = ipaAddress?.trim() || 'm_bkeet@instapay';
  const amt = amount && amount > 0 ? Math.round(amount) : undefined;
  
  return {
    ipa: cleanIpa,
    appUri: `instapay://pay?ipa=${encodeURIComponent(cleanIpa)}${amt ? `&amount=${amt}` : ''}`,
    webUri: `https://ipn.eg/pay?ipa=${encodeURIComponent(cleanIpa)}${amt ? `&amount=${amt}` : ''}`,
    directWebUri: `https://instapay.eg`,
    upiUri: `upi://pay?pa=${encodeURIComponent(cleanIpa)}&pn=ElNajahCenter${amt ? `&am=${amt}` : ''}`
  };
}

/**
 * Executes InstaPay payment launch: copies details to clipboard & opens InstaPay app
 */
export async function executeInstaPayPayment(
  ipaAddress: string,
  amount?: number,
  studentName?: string
): Promise<{ success: boolean; copiedText: string }> {
  const cleanIpa = ipaAddress?.trim() || 'm_bkeet@instapay';
  const amt = amount && amount > 0 ? Math.round(amount) : undefined;
  
  let copiedText = `عنوان انستا باي: ${cleanIpa}`;
  if (amt) {
    copiedText += `\nالمبلغ المطلوب: ${amt} ج.م`;
  }
  if (studentName) {
    copiedText += `\nاسم الطالب: ${studentName}`;
  }

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(cleanIpa);
    }
  } catch (err) {
    console.warn('Clipboard write failed:', err);
  }

  // Deep link attempt
  const deepLinks = getInstaPayDeepLinks(cleanIpa, amt);
  
  // Try opening deep link or web scheme
  setTimeout(() => {
    window.location.href = deepLinks.appUri;
  }, 100);

  // Fallback timer to web URI if app didn't capture deep link
  setTimeout(() => {
    window.open(deepLinks.webUri, '_blank');
  }, 1200);

  return { success: true, copiedText };
}

/**
 * Generates WhatsApp notification URL for sending transfer receipt to admin
 */
export function getPaymentReceiptWhatsAppUrl(
  adminPhone: string,
  studentName: string,
  amount: number,
  methodLabel: string
): string {
  const cleanPhone = cleanEgyptianPhoneNumber(adminPhone || '01001500686');
  let waNumber = cleanPhone;
  if (waNumber.startsWith('0')) {
    waNumber = '20' + waNumber.substring(1);
  }
  
  const text = `السلام عليكم إدارة المركز،
تم تحويل مبلغ (${amount || 0} ج.م) لصالح الطالب: (${studentName || 'الطالب'})
طريقة السداد: (${methodLabel})
مرفق إشعار/صورة التحويل لتأكيد واعتماد القيد في السجل المالي. وشكراً!`;

  return `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
}

/**
 * Extracts a normalized YYYY-MM key (e.g. "2026-09", "2026-10") from any ISO date or Arabic month text.
 */
export function parseYearMonthKey(val?: string | null): string | null {
  if (!val) return null;
  const str = String(val).trim();
  const isoMatch = str.match(/^(\d{4})-(\d{2})/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}`;

  const monthMap: Record<string, string> = {
    'يناير': '01', 'فبراير': '02', 'مارس': '03', 'أبريل': '04', 'ابريل': '04',
    'مايو': '05', 'يونيو': '06', 'يوليو': '07', 'أغسطس': '08', 'اغسطس': '08',
    'سبتمبر': '09', 'أكتوبر': '10', 'اكتوبر': '10', 'نوفمبر': '11', 'ديسمبر': '12'
  };

  const yearMatch = str.match(/202[4-9]/);
  const year = yearMatch ? yearMatch[0] : '2026';

  for (const [mName, mNum] of Object.entries(monthMap)) {
    if (str.includes(mName)) {
      return `${year}-${mNum}`;
    }
  }

  const numMatch = str.match(/شهر\s*(\d{1,2})/);
  if (numMatch) {
    return `${year}-${numMatch[1].padStart(2, '0')}`;
  }

  return null;
}

/**
 * Formats a YYYY-MM key (e.g. "2026-09") into a human-friendly Arabic month label.
 */
export function formatYearMonthName(key?: string | null): string {
  if (!key) return '';
  const [year, month] = key.split('-');
  const names: Record<string, string> = {
    '01': 'يناير', '02': 'فبراير', '03': 'مارس', '04': 'أبريل',
    '05': 'مايو', '06': 'يونيو', '07': 'يوليو', '08': 'أغسطس',
    '09': 'سبتمبر', '10': 'أكتوبر', '11': 'نوفمبر', '12': 'ديسمبر'
  };
  return `${names[month] || month} ${year || '2026'}`;
}

/**
 * Returns the effective start month key (e.g. "2026-09" or "2026-10") when a trainee started their subscription.
 */
export function getTraineeStartMonthKey(trainee: any): string {
  if (!trainee) return '2026-09';
  const raw = trainee.subscriptionStartDate || trainee.startBillingMonth || trainee.registrationDate || trainee.createdAt;
  const parsed = parseYearMonthKey(raw);
  return parsed || '2026-09';
}

/**
 * Determines whether a trainee was already enrolled and active during a given target month.
 * If trainee joined in 2026-10, they are NOT enrolled in 2026-09, so no dues apply for September.
 */
export function isTraineeEnrolledInMonth(trainee: any, targetMonth: string): boolean {
  if (!trainee || !targetMonth) return true;
  const targetKey = parseYearMonthKey(targetMonth);
  if (!targetKey) return true;
  const startKey = getTraineeStartMonthKey(trainee);
  return startKey <= targetKey;
}

