const DAY_MAP: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

export const getNextCheckInDateFormatted = (
  checkInDay: string,
  today: Date = new Date()
): string => {
  const targetDay = DAY_MAP[checkInDay.toLowerCase()];

  if (targetDay === undefined) {
    throw new Error('Invalid check-in day');
  }

  const todayDay = today.getDay();
  let diff = targetDay - todayDay;

  if (diff < 0) {
    diff += 7;
  }

  const checkInDate = new Date(today);
  checkInDate.setDate(today.getDate() + diff);

  return checkInDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

export const humanReadableFormate = (
  date: string | Date | undefined
): string | null => {
  if (!date) return null;
  const d = new Date(date);

  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};
