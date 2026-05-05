
/**
 * Converts a time string (HH:mm) or number to decimal hours.
 * Example: "08:30" -> 8.5
 */
export const timeToDecimal = (time: any | undefined | null): number => {
  if (time === undefined || time === null || time === '') return 0;
  if (typeof time === 'number') return time;
  
  if (typeof time === 'string' && time.includes(':')) {
    const [hours, minutes] = time.split(':').map(Number);
    return (hours || 0) + (minutes || 0) / 60;
  }
  
  const parsed = parseFloat(time);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Converts decimal hours to a time object {hours, minutes}.
 * Example: 8.5 -> {hours: 8, minutes: 30}
 */
export const decimalToTime = (decimal: number | undefined | null) => {
  if (decimal === undefined || decimal === null) return { hours: 0, minutes: 0 };
  
  const hours = Math.floor(decimal);
  const minutes = Math.round((decimal - hours) * 60);
  
  return { hours, minutes };
};

/**
 * Formats decimal hours to HH:mm string.
 * Example: 8.5 -> "08:30"
 */
export const formatDecimalToTimeStr = (decimal: number | undefined | null): string => {
  const { hours, minutes } = decimalToTime(decimal);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

/**
 * Converts water intake string or number to ml.
 */
export const waterToMl = (water: string | number | undefined | null): number => {
  if (water === undefined || water === null || water === '') return 0;
  if (typeof water === 'number') return water;
  
  const lower = water.toLowerCase().trim();
  if (lower.endsWith('l') && !lower.endsWith('ml')) {
    return parseFloat(lower.replace('l', '')) * 1000;
  }
  if (lower.endsWith('ml')) {
    return parseFloat(lower.replace('ml', ''));
  }
  
  const parsed = parseFloat(lower);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Converts ml to Liters.
 */
export const mlToL = (ml: number | undefined | null): number => {
  if (ml === undefined || ml === null) return 0;
  return parseFloat((ml / 1000).toFixed(3));
};
