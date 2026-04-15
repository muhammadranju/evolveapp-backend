import CheckInModel from '../../appAthlete/checkIn/checkin.model';
import { WeeklyAverageModel } from '../../athleteWeeklyReport/history.model';

import { TimelineHistoryModel } from '../../coachPanel/timeLine/timeline.model';

import { AthleteModel } from '../athlete/athleteModel';
import { CoachModel } from '../coach/coachModel';

export const getAthletesWithCoachPromiseAll = async () => {
  try {
    const [weeklyReports, athletes, coaches, checkIns, timelines] =
      await Promise.all([
        WeeklyAverageModel.find()
          .select('weekNumber weight userId coachId')
          .sort({ createdAt: -1 })
          .lean(),

        AthleteModel.find().select('name').lean(),
        CoachModel.find().select('name').lean(),
        CheckInModel.find().select('userId checkinCompleted').lean(),
        TimelineHistoryModel.find().select('userId nextCheckInDate').lean(),
      ]);

    const athleteMap = new Map(athletes.map(a => [String(a._id), a.name]));

    const coachMap = new Map(coaches.map(c => [String(c._id), c.name]));

    const checkInMap = new Map(
      checkIns.map(c => [String(c.userId), c.checkinCompleted])
    );

    const timelineMap = new Map(
      timelines.map(t => [String(t.userId), t.nextCheckInDate])
    );

    const result = weeklyReports.map(report => ({
      athleteName: athleteMap.get(String(report.userId)) || null,
      coachName: coachMap.get(String(report.coachId)) || null,
      weekNumber: report.weekNumber,
      weight: report.weight,
      nextCheckInDate: timelineMap.get(String(report.userId)) || null,
      checkinCompleted: checkInMap.get(String(report.userId)) ?? false,
    }));

    return result;
  } catch (error) {
    throw error;
  }
};
