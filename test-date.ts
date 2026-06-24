import { getStartOfWeek, getWeekDates, getDayNameUTC } from './src/util/date.util';

const monday = getStartOfWeek();
console.log('Start of week for today:', monday);
console.log('Week dates:', getWeekDates(monday));
console.log('Day name of start:', getDayNameUTC(monday));

const monday2 = getStartOfWeek('2026-06-07'); // Today, which is a Sunday
console.log('Start of week for 2026-06-07:', monday2);
console.log('Week dates:', getWeekDates(monday2));
console.log('Day name of start:', getDayNameUTC(monday2));
