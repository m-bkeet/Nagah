export const formatTimeAMPM = (timeStr: string): string => {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  if (isNaN(hours)) return timeStr;
  const ampm = hours >= 12 ? 'م' : 'ص';
  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;
  const formattedHours = hours < 10 ? `0${hours}` : `${hours}`;
  return `${formattedHours}:${minutes} ${ampm}`;
};

export const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const str = timeStr.trim().toUpperCase();
  const isPM = str.includes('PM') || str.includes('مساءً') || str.includes('م');
  const isAM = str.includes('AM') || str.includes('صباحاً') || str.includes('ص');
  
  const clean = str.replace(/[^0-9:]/g, '');
  const parts = clean.split(':');
  let hours = parseInt(parts[0] || '0', 10);
  const minutes = parseInt(parts[1] || '0', 10);

  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  if (!isPM && !isAM && hours >= 1 && hours <= 7) {
    hours += 12;
  }

  return hours * 60 + minutes;
};
