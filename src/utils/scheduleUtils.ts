// scheduleUtils.ts - Utility for calculating next lecture time and live countdown

export interface NextLectureInfo {
  date: Date;
  formattedDate: string;
  dayName: string;
  time: string;
  startTime: string;
  endTime: string;
  diffMs: number;
  daysLeft: number;
  hoursLeft: number;
  minutesLeft: number;
  secondsLeft: number;
  isLessThanOneDay: boolean;
  isOngoing: boolean;
  badgeText: string;
  countdownFormatted: string;
}

function parseTimeString(timeStr?: string, defaultStart = '16:00', defaultEnd = '18:00') {
  let startH = 16;
  let startM = 0;
  let endH = 18;
  let endM = 0;

  const raw = (timeStr || defaultStart || '').trim();
  if (!raw) return { startH, startM, endH, endM };

  // Convert Arabic numerals to standard
  const str = raw.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());

  const parseSingle = (s: string) => {
    const isPM = /م|pm|مساء/i.test(s);
    const isAM = /ص|am|صباح/i.test(s);
    const match = s.match(/(\d{1,2})(?::(\d{1,2}))?/);
    if (!match) return null;
    let h = parseInt(match[1], 10);
    const m = match[2] ? parseInt(match[2], 10) : 0;
    if (isPM && h < 12) h += 12;
    if (isAM && h === 12) h = 0;
    return { h, m };
  };

  const parts = str.split(/[-–—إلى]/);
  if (parts.length >= 1) {
    const p1 = parseSingle(parts[0]);
    if (p1) {
      startH = p1.h;
      startM = p1.m;
    }
  }
  if (parts.length >= 2) {
    const p2 = parseSingle(parts[1]);
    if (p2) {
      endH = p2.h;
      endM = p2.m;
    }
  } else {
    endH = (startH + 2) % 24;
    endM = startM;
  }

  return { startH, startM, endH, endM };
}

export function getNextLectureInfo(groupDetails: any, currentDate = new Date()): NextLectureInfo | null {
  if (!groupDetails) return null;

  const daysList = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const dayAliases: Record<string, number> = {
    'الاحد': 0, 'الأحد': 0, 'sun': 0, 'sunday': 0,
    'الاثنين': 1, 'الإثنين': 1, 'mon': 1, 'monday': 1,
    'الثلاثاء': 2, 'tue': 2, 'tuesday': 2,
    'الاربعاء': 3, 'الأربعاء': 3, 'wed': 3, 'wednesday': 3,
    'الخميس': 4, 'thu': 4, 'thursday': 4,
    'الجمعه': 5, 'الجمعة': 5, 'fri': 5, 'friday': 5,
    'السبت': 6, 'sat': 6, 'saturday': 6
  };

  const groupDaysRaw = groupDetails.scheduleDays || groupDetails.days || [];
  const groupDayIndices = (Array.isArray(groupDaysRaw) ? groupDaysRaw : [groupDaysRaw])
    .map((d: any) => typeof d === 'string' ? dayAliases[d.trim()] : undefined)
    .filter((d: any) => d !== undefined) as number[];

  if (groupDayIndices.length === 0) return null;

  // Time parsing
  const timeSource = groupDetails.timeSlot || groupDetails.startTime || (groupDetails.scheduleTime) || '16:00 - 18:00';
  const { startH, startM, endH, endM } = parseTimeString(timeSource, groupDetails.startTime, groupDetails.endTime);

  const now = currentDate instanceof Date ? currentDate : new Date(currentDate);

  // Evaluate candidate upcoming lectures
  interface Candidate {
    lectureStart: Date;
    lectureEnd: Date;
    dayIndex: number;
  }

  const candidates: Candidate[] = [];

  groupDayIndices.forEach(targetDay => {
    let daysToAdd = (targetDay - now.getDay() + 7) % 7;

    let lectureStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysToAdd, startH, startM, 0, 0);
    let lectureEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysToAdd, endH, endM, 0, 0);

    // If lecture is today and already passed its end time, the next one is in 7 days
    if (daysToAdd === 0 && now.getTime() > lectureEnd.getTime()) {
      daysToAdd = 7;
      lectureStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysToAdd, startH, startM, 0, 0);
      lectureEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysToAdd, endH, endM, 0, 0);
    }

    candidates.push({ lectureStart, lectureEnd, dayIndex: targetDay });
  });

  // Pick the closest upcoming lecture in time
  candidates.sort((a, b) => a.lectureStart.getTime() - b.lectureStart.getTime());
  const selected = candidates[0];
  if (!selected) return null;

  const nextLectureDate = selected.lectureStart;
  const nextLectureEnd = selected.lectureEnd;

  const diffMs = nextLectureDate.getTime() - now.getTime();
  const isOngoing = now.getTime() >= nextLectureDate.getTime() && now.getTime() <= nextLectureEnd.getTime();
  const isLessThanOneDay = diffMs > 0 && diffMs < 24 * 60 * 60 * 1000;

  // Calculate units
  let daysLeft = 0;
  let hoursLeft = 0;
  let minutesLeft = 0;
  let secondsLeft = 0;

  if (isOngoing) {
    daysLeft = 0;
    hoursLeft = 0;
    minutesLeft = 0;
    secondsLeft = 0;
  } else if (isLessThanOneDay) {
    daysLeft = 0;
    hoursLeft = Math.floor(diffMs / (1000 * 60 * 60));
    minutesLeft = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    secondsLeft = Math.floor((diffMs % (1000 * 60)) / 1000);
  } else if (diffMs > 0) {
    daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    hoursLeft = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    minutesLeft = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    secondsLeft = Math.floor((diffMs % (1000 * 60)) / 1000);
  }

  // Format strings
  let badgeText = '';
  let countdownFormatted = '';

  if (isOngoing) {
    badgeText = 'الآن 🟢';
    countdownFormatted = 'المحاضرة جارية الآن';
  } else if (isLessThanOneDay) {
    if (hoursLeft > 0) {
      badgeText = `${hoursLeft}س : ${minutesLeft}د`;
      countdownFormatted = `${hoursLeft} ساعة و ${minutesLeft} دقيقة`;
    } else {
      badgeText = `${minutesLeft}د : ${secondsLeft}ث`;
      countdownFormatted = `${minutesLeft} دقيقة و ${secondsLeft} ثانية`;
    }
  } else {
    badgeText = `${daysLeft} ${daysLeft === 1 ? 'يوم' : daysLeft === 2 ? 'يومان' : daysLeft <= 10 ? 'أيام' : 'يوم'}`;
    countdownFormatted = `${daysLeft} ${daysLeft === 1 ? 'يوم' : daysLeft === 2 ? 'يومان' : daysLeft <= 10 ? 'أيام' : 'يوم'}`;
  }

  const dayName = daysList[nextLectureDate.getDay()];
  const formattedDate = nextLectureDate.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });

  // Format nice display time (e.g., 04:00 م - 06:00 م)
  const formatTimeSlot = () => {
    if (groupDetails.timeSlot) return groupDetails.timeSlot;
    const formatHour = (h: number, m: number) => {
      const period = h >= 12 ? 'م' : 'ص';
      const displayH = h % 12 || 12;
      return `${String(displayH).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
    };
    return `${formatHour(startH, startM)} - ${formatHour(endH, endM)}`;
  };

  return {
    date: nextLectureDate,
    formattedDate,
    dayName,
    time: formatTimeSlot(),
    startTime: `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`,
    endTime: `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`,
    diffMs,
    daysLeft,
    hoursLeft,
    minutesLeft,
    secondsLeft,
    isLessThanOneDay,
    isOngoing,
    badgeText,
    countdownFormatted
  };
}

