import { AthleteModel } from '../adminPanel/athlete/athleteModel';
import { IWeeklyAverage } from './history.interface';
import { WeeklyAverageModel } from './history.model';

export const weeklyReportService = async (payload: IWeeklyAverage) => {
  const { userId, coachId } = payload;

  const athlete = await AthleteModel.findById(userId).select('checkInDay');
  if (!athlete) {
    throw new Error('Athlete not found');
  }

  const checkInDay = athlete.checkInDay;

  const currentDay = new Date().toLocaleString('en-US', {
    weekday: 'long',
  });

  const filter = { userId, coachId };

  const latestWeek = await WeeklyAverageModel.findOne(filter).sort({
    weekNumber: -1,
  });

  if (!latestWeek) {
    const result = await WeeklyAverageModel.create({
      ...payload,
      weekNumber: 1,
    });

    return result;
  }

  if (currentDay === checkInDay) {
    const alreadyCreatedToday = await WeeklyAverageModel.findOne({
      userId,
      coachId,
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    });

    if (alreadyCreatedToday) {
      return alreadyCreatedToday;
    }

    const nextWeekNumber = latestWeek.weekNumber + 1;

    const result = await WeeklyAverageModel.create({
      ...payload,
      weekNumber: nextWeekNumber,
    });

    return result;
  }

  const result = await WeeklyAverageModel.findOneAndUpdate(
    filter,
    { $set: payload },
    {
      sort: { weekNumber: -1 },
      new: true,
    }
  );

  return result;
};
