/**
 * Centralized Arabic text normalization and phonetics utilities
 * for deduplication and consistent fuzzy matching across Center Management.
 */

export function normalizeArabicFull(str: string): string {
  if (!str) return '';
  let s = str.trim().toLowerCase();
  // Strip diacritics / tashkeel & tatweel
  s = s.replace(/[\u064B-\u065F\u0670\u0640]/g, '');
  // Normalize letters: أ, إ, آ, ٱ -> ا | ة -> ه | ى -> ي | ؤ, ئ -> ء
  s = s.replace(/[أإآٱ]/g, 'ا');
  s = s.replace(/ة/g, 'ه');
  s = s.replace(/ى/g, 'ي');
  s = s.replace(/[ؤئ]/g, 'ء');
  // Normalize 'عبد X' -> 'عبدX' (e.g. عبد الظاهر <-> عبدالظاهر)
  s = s.replace(/عبد\s+/g, 'عبد');
  // Normalize 'ابو X' -> 'ابوX'
  s = s.replace(/ابو\s+/g, 'ابو');
  // Replace punctuation/dashes with single space
  s = s.replace(/[\s\-_.]+/g, ' ');
  return s.trim();
}

export function cleanPhone(phone?: string): string {
  if (!phone) return '';
  return phone.replace(/[^0-9]/g, '').slice(-10);
}
