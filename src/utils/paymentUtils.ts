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

/**
 * Checks if a trainee has an unpaid remaining amount for their subscription.
 */
export function isTraineeUnpaid(trainee: any): boolean {
  if (!trainee) return false;
  if (trainee.isExempt) return false;
  const remaining =
    trainee.remainingAmount ??
    Math.max(0, (trainee.feeAmount || 0) - (trainee.discountAmount || 0) - (trainee.paidAmount || 0));
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
      statusBadgeClass: 'bg-slate-800 text-slate-400 border-slate-700'
    };
  }

  if (trainee.isExempt) {
    return {
      isUnpaid: false,
      isExempt: true,
      remainingAmount: 0,
      isReminderWindow: inWindow,
      statusLabel: 'معفي من الاشتراك 🎓',
      shortLabel: 'معفي 🎓',
      statusBadgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
    };
  }

  const unpaid = isTraineeUnpaid(trainee);
  const remaining =
    trainee.remainingAmount ??
    Math.max(0, (trainee.feeAmount || 0) - (trainee.discountAmount || 0) - (trainee.paidAmount || 0));

  if (unpaid) {
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
        statusBadgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
      };
    }

    if (inWindow) {
      return {
        isUnpaid: true,
        isExempt: false,
        remainingAmount: remaining,
        isReminderWindow: true,
        statusLabel: `غير مسدد الاشتراك 🔴 (تنبيه متبقي ${remaining} ج.م)`,
        shortLabel: 'غير مسدد الاشتراك 🚨',
        statusBadgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/60 animate-pulse font-bold shadow-lg shadow-rose-950/40'
      };
    }

    return {
      isUnpaid: true,
      isExempt: false,
      remainingAmount: remaining,
      isReminderWindow: false,
      statusLabel: `غير مسدد الاشتراك ⚠️ (متبقي ${remaining} ج.م)`,
      shortLabel: 'غير مسدد الاشتراك ⚠️',
      statusBadgeClass: 'bg-rose-500/20 text-rose-400 border-rose-500/40 font-bold'
    };
  }

  return {
    isUnpaid: false,
    isExempt: false,
    remainingAmount: 0,
    isReminderWindow: inWindow,
    statusLabel: 'مسدد الاشتراك بالكامل ✅',
    shortLabel: 'مسدد بالكامل ✅',
    statusBadgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
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

