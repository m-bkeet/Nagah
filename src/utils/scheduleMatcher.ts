import { Group, LabScheduleSlot } from '../types';

export interface ScheduleMatchResult {
  group: Group | null;
  reason: 'live_now' | 'upcoming_today' | 'recent_today' | 'fallback';
  matchedTimeRange?: string;
  matchedDay?: string;
  roomName?: string;
}

const ARABIC_WEEKDAYS = [
  'الاحد',     // 0: Sunday
  'الاثنين',   // 1: Monday
  'الثلاثاء',  // 2: Tuesday
  'الاربعاء',  // 3: Wednesday
  'الخميس',    // 4: Thursday
  'الجمعة',    // 5: Friday
  'السبت'      // 6: Saturday
];

const ARABIC_WEEKDAYS_DISPLAY = [
  'الأحد',
  'الإثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت'
];

export function normalizeArabicDay(dayStr?: string): string {
  if (!dayStr) return '';
  return String(dayStr)
    .trim()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, '');
}

/**
 * Parses time strings such as "16:00", "4:00 م", "04:30 PM", "16.00", "4" into minutes from midnight (0..1439).
 */
export function parseTimeToMinutes(timeStr?: string): number | null {
  if (!timeStr) return null;
  const raw = String(timeStr)
    .trim()
    // Convert Arabic-Indic digits if present
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));

  const isPM = /م|pm|مساء/i.test(raw);
  const isAM = /ص|am|صباح/i.test(raw);
  const m = raw.match(/(\d{1,2})(?::|\.)?(\d{2})?/);
  if (!m) return null;

  let hours = parseInt(m[1], 10);
  const minutes = m[2] ? parseInt(m[2], 10) : 0;

  if (isNaN(hours) || isNaN(minutes)) return null;
  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

export function findScheduledGroupForNow(
  groups: Group[],
  labSchedules: LabScheduleSlot[] = [],
  activeBranchId?: string,
  now: Date = new Date()
): ScheduleMatchResult {
  const safeGroups = Array.isArray(groups) ? groups : [];
  const branchGroups =
    activeBranchId && activeBranchId !== 'all'
      ? safeGroups.filter((g) => g.branchId === activeBranchId)
      : safeGroups;
  const pool = branchGroups.length > 0 ? branchGroups : safeGroups;

  if (pool.length === 0) {
    return { group: null, reason: 'fallback' };
  }

  const dayIndex = now.getDay();
  const todayNorm = ARABIC_WEEKDAYS[dayIndex];
  const todayDisplay = ARABIC_WEEKDAYS_DISPLAY[dayIndex];
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  interface Candidate {
    group: Group;
    startMin: number;
    endMin: number;
    rangeStr: string;
    roomName?: string;
  }

  const todayCandidates: Candidate[] = [];
  const seenGroupIds = new Set<string>();

  // 1. Collect from groups array
  for (const g of pool) {
    if (!g || g.status === 'completed') continue;
    const rawDays: string[] = Array.isArray(g.days)
      ? g.days
      : Array.isArray((g as any).scheduleDays)
      ? (g as any).scheduleDays
      : [];
    const matchesToday = rawDays.some((d) => {
      const norm = normalizeArabicDay(d);
      return norm === todayNorm || norm.includes(todayNorm) || todayNorm.includes(norm);
    });
    if (!matchesToday) continue;

    const startMin = parseTimeToMinutes(g.startTime);
    if (startMin === null) continue;
    const parsedEnd = parseTimeToMinutes(g.endTime);
    const endMin = parsedEnd !== null && parsedEnd > startMin ? parsedEnd : startMin + 60;

    seenGroupIds.add(g.id);
    todayCandidates.push({
      group: g,
      startMin,
      endMin,
      rangeStr: `${g.startTime} - ${g.endTime || ''}`.trim(),
      roomName: g.roomName
    });
  }

  // 2. Enrich with labSchedules slots for today if any group wasn't matched directly
  const relevantSchedules = (Array.isArray(labSchedules) ? labSchedules : []).filter((s) => {
    if (activeBranchId && activeBranchId !== 'all' && s.branchId && s.branchId !== activeBranchId) {
      return false;
    }
    const norm = normalizeArabicDay(s.dayOfWeek);
    return norm === todayNorm || norm.includes(todayNorm) || todayNorm.includes(norm);
  });

  for (const slot of relevantSchedules) {
    const matchedGroup =
      pool.find((g) => g.id === slot.groupId) ||
      pool.find((g) => g.name && slot.groupName && g.name.trim() === slot.groupName.trim());
    if (!matchedGroup || seenGroupIds.has(matchedGroup.id)) continue;

    const startMin = parseTimeToMinutes(slot.startTime);
    if (startMin === null) continue;
    const parsedEnd = parseTimeToMinutes(slot.endTime);
    const endMin = parsedEnd !== null && parsedEnd > startMin ? parsedEnd : startMin + 60;

    seenGroupIds.add(matchedGroup.id);
    todayCandidates.push({
      group: matchedGroup,
      startMin,
      endMin,
      rangeStr: `${slot.startTime} - ${slot.endTime || ''}`.trim(),
      roomName: slot.roomName || matchedGroup.roomName
    });
  }

  if (todayCandidates.length === 0) {
    return { group: pool[0], reason: 'fallback', matchedDay: todayDisplay };
  }

  // Priority A: Currently in-session (tolerance: 20 mins before start until 15 mins after end)
  const liveMatch = todayCandidates.find(
    (c) => nowMinutes >= c.startMin - 20 && nowMinutes <= c.endMin + 15
  );
  if (liveMatch) {
    return {
      group: liveMatch.group,
      reason: 'live_now',
      matchedDay: todayDisplay,
      matchedTimeRange: liveMatch.rangeStr,
      roomName: liveMatch.roomName
    };
  }

  // Priority B: Next upcoming group today
  const upcoming = todayCandidates
    .filter((c) => c.startMin > nowMinutes)
    .sort((a, b) => a.startMin - b.startMin);
  if (upcoming.length > 0) {
    return {
      group: upcoming[0].group,
      reason: 'upcoming_today',
      matchedDay: todayDisplay,
      matchedTimeRange: upcoming[0].rangeStr,
      roomName: upcoming[0].roomName
    };
  }

  // Priority C: Most recently concluded group today
  const recent = [...todayCandidates].sort((a, b) => b.endMin - a.endMin);
  return {
    group: recent[0].group,
    reason: 'recent_today',
    matchedDay: todayDisplay,
    matchedTimeRange: recent[0].rangeStr,
    roomName: recent[0].roomName
  };
}
