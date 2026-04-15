import { differenceInYears, isValid, parse } from 'date-fns';

function calculateAgeFlexible(dateOfBirth: string | Date): number {
  let birthDate: Date;

  if (dateOfBirth instanceof Date) {
    birthDate = dateOfBirth;
  } else {
    // date-fns parse multiple formats
    const formats = ['dd/MM/yyyy', 'MM/dd/yyyy', 'yyyy-MM-dd', 'MMM dd, yyyy'];
    birthDate = formats
      .map(fmt => parse(dateOfBirth, fmt, new Date()))
      .find(d => isValid(d)) as Date;

    if (!birthDate || !isValid(birthDate)) {
      throw new Error('Invalid date format');
    }
  }

  return differenceInYears(new Date(), birthDate);
}

export default calculateAgeFlexible;
