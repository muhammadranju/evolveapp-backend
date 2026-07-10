
/**
 * Utility for timezone-independent date calculations.
 * All operations are performed using UTC to ensure consistency across different server/client locations.
 */

/**
 * Gets the date of the Monday for the week containing the given date.
 * @param date Optional date string (YYYY-MM-DD) or Date object. Defaults to current UTC time.
 * @returns A Date object representing the Monday of that week at 00:00:00 UTC.
 */
export const getStartOfWeek = (date?: string | Date): Date => {
  let d: Date;
  if (typeof date === 'string') {
    const [y, m, d_part] = date.split('-').map(Number);
    d = new Date(Date.UTC(y, m - 1, d_part));
  } else if (date instanceof Date) {
    d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  } else {
    const now = new Date();
    d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  }

  const day = d.getUTCDay();
  // In JS, Sunday is 0, Monday is 1... Saturday is 6.
  // We want Monday (1) to be the start.
  // If it's Sunday (0), we need to go back 6 days.
  // If it's Monday (1), we go back 0 days.
  // If it's Tuesday (2), we go back 1 day.
  const diff = day === 0 ? 6 : day - 1;
  
  d.setUTCDate(d.getUTCDate() - diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

/**
 * Generates an array of 7 dates (YYYY-MM-DD) starting from the given start date.
 * @param startDate The start date of the week (usually a Monday).
 * @returns Array of 7 date strings.
 */
export const getWeekDates = (startDate: Date): string[] => {
  const dates: string[] = [];
  const d = new Date(startDate);
  
  for (let i = 0; i < 7; i++) {
    const tempDate = new Date(d);
    tempDate.setUTCDate(d.getUTCDate() + i);
    dates.push(tempDate.toISOString().split('T')[0]);
  }
  
  return dates;
};

/**
 * Gets the English name of the day for a given date.
 * @param date Date object.
 * @returns Day name (e.g., "Monday").
 */
export const getDayNameUTC = (date: Date): string => {
  const dayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  return dayNames[date.getUTCDay()];
};

/**
 * Normalizes a date to UTC midnight.
 */
export const normalizeToUTCMidnight = (date?: string | Date): Date => {
  if (typeof date === 'string') {
    const [y, m, d] = date.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d));
  }
  const d = date || new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

/**
 * Generates an array of date strings (YYYY-MM-DD) for the entire month containing the given date.
 */
export const getMonthDates = (date?: string | Date): string[] => {
  let d: Date;
  if (typeof date === 'string') {
    const [y, m, d_part] = date.split('-').map(Number);
    d = new Date(Date.UTC(y, m - 1, d_part));
  } else if (date instanceof Date) {
    d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  } else {
    const now = new Date();
    d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  }

  const year = d.getUTCFullYear();
  const month = d.getUTCMonth();

  const endDate = new Date(Date.UTC(year, month + 1, 0));
  const totalDays = endDate.getUTCDate();

  const dates: string[] = [];
  for (let i = 1; i <= totalDays; i++) {
    const tempDate = new Date(Date.UTC(year, month, i));
    dates.push(tempDate.toISOString().split('T')[0]);
  }
  
  return dates;
};

/**
 * Generates an array of date strings (YYYY-MM-DD) for the entire year containing the given date.
 */
export const getYearDates = (date?: string | Date): string[] => {
  let d: Date;
  if (typeof date === 'string') {
    const [y, m, d_part] = date.split('-').map(Number);
    d = new Date(Date.UTC(y, m - 1, d_part));
  } else if (date instanceof Date) {
    d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  } else {
    const now = new Date();
    d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  }

  const year = d.getUTCFullYear();
  const dates: string[] = [];

  for (let m = 0; m < 12; m++) {
    const endDate = new Date(Date.UTC(year, m + 1, 0));
    const totalDays = endDate.getUTCDate();
    for (let i = 1; i <= totalDays; i++) {
      const tempDate = new Date(Date.UTC(year, m, i));
      dates.push(tempDate.toISOString().split('T')[0]);
    }
  }
  
  return dates;
};


