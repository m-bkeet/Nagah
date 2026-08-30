/**
 * Simple Arabic Number to Words converter (Tafqeet) for Currency Receipts
 */
export function numberToArabicWords(num: number): string {
  if (num <= 0 || isNaN(num)) return 'صفر جنيه مصري';

  const units = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
  const tens = ['', 'عشرة', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
  const teens = ['عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
  const hundreds = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسثمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];

  const convertGroup = (n: number): string => {
    let result = '';
    const h = Math.floor(n / 100);
    const remainder = n % 100;
    const t = Math.floor(remainder / 10);
    const u = remainder % 10;

    if (h > 0) {
      result += hundreds[h];
    }

    if (remainder > 0) {
      if (result) result += ' و';
      if (remainder >= 10 && remainder < 20) {
        result += teens[remainder - 10];
      } else {
        if (u > 0) {
          result += units[u];
          if (t > 0) result += ' و';
        }
        if (t > 0) {
          result += tens[t];
        }
      }
    }
    return result;
  };

  const integerPart = Math.floor(num);
  let words = '';

  if (integerPart >= 1000) {
    const thousands = Math.floor(integerPart / 1000);
    const rest = integerPart % 1000;

    if (thousands === 1) {
      words = 'ألف';
    } else if (thousands === 2) {
      words = 'ألفان';
    } else if (thousands >= 3 && thousands <= 10) {
      words = convertGroup(thousands) + ' آلاف';
    } else {
      words = convertGroup(thousands) + ' ألفاً';
    }

    if (rest > 0) {
      words += ' و' + convertGroup(rest);
    }
  } else {
    words = convertGroup(integerPart);
  }

  return `فقط ${words} جنيهاً مصرياً لا غير`;
}
