export function getNextLectureInfo(groupDetails: any, currentDate = new Date()) {
  if (!groupDetails) return null;

  // The start date of the academic year is Sept 1, 2026.
  const academicStart = new Date(2026, 8, 1); // JS months are 0-indexed, so 8 = September
  const baseDate = currentDate < academicStart ? academicStart : currentDate;

  const daysList = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const dayAliases: Record<string, number> = {
    'الاحد': 0, 'الأحد': 0,
    'الاثنين': 1, 'الإثنين': 1,
    'الثلاثاء': 2,
    'الاربعاء': 3, 'الأربعاء': 3,
    'الخميس': 4,
    'الجمعه': 5, 'الجمعة': 5,
    'السبت': 6
  };

  const groupDaysRaw = groupDetails.scheduleDays || groupDetails.days || [];
  const groupDayIndices = groupDaysRaw.map((d: string) => dayAliases[d.trim()]).filter((d: number) => d !== undefined);

  if (groupDayIndices.length === 0) return null;

  // Find the next upcoming day from the baseDate
  const currentDayIndex = baseDate.getDay(); // 0 = Sunday, 1 = Monday ... 6 = Saturday

  // Calculate days to add for each scheduled day
  const daysToAddOptions = groupDayIndices.map((targetDay: number) => {
    let daysToAdd = targetDay - currentDayIndex;
    if (daysToAdd < 0) {
      daysToAdd += 7;
    }
    return daysToAdd;
  });

  // Find the minimum days to add
  const minDaysToAdd = Math.min(...daysToAddOptions);

  const nextLectureDate = new Date(baseDate);
  nextLectureDate.setDate(nextLectureDate.getDate() + minDaysToAdd);

  // Calculate the difference in calendar days from the actual currentDate
  // Reset times to midnight for accurate day difference
  const currentMidnight = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  const lectureMidnight = new Date(nextLectureDate.getFullYear(), nextLectureDate.getMonth(), nextLectureDate.getDate());
  
  const diffTime = Math.abs(lectureMidnight.getTime() - currentMidnight.getTime());
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const dayName = daysList[nextLectureDate.getDay()];
  const formattedDate = nextLectureDate.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });

  return {
    date: nextLectureDate,
    formattedDate,
    dayName,
    daysLeft,
    time: groupDetails.timeSlot || (groupDetails.startTime ? `${groupDetails.startTime} - ${groupDetails.endTime}` : null)
  };
}
