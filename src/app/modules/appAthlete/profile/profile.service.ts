import { AthleteModel } from '../../adminPanel/athlete/athleteModel';
import { CoachModel } from '../../adminPanel/coach/coachModel';
import { ShowManagementModel } from '../../coachPanel/showManagement/management.model';
import { TimelineHistoryModel } from '../../coachPanel/timeLine/timeline.model';
import { User } from '../../user/user.model';

export class ProfileService {
  static async getAthleteDetails(athleteId: string) {
    //Fetch athlete first (must exist)
    const athlete = await AthleteModel.findById(athleteId)
      .populate('shows')
      .lean();
    if (!athlete) throw new Error('Athlete not found');

    //Run independent queries in parallel
    const [coachName, timeline, show] = await Promise.all([
      getCoachName(athlete),
      TimelineHistoryModel.find({ userId: athleteId })
        .select('nextCheckInDate phase')
        .lean(),
      ShowManagementModel.findOne().sort({ createdAt: -1 }).lean(),
    ]);

    // 3️⃣ Countdown calculation (no DB cost)
    const countDown = show?.date ? calculateCountdown(show.date) : 0;

    const allShows = athlete?.shows?.map((show: any) => {
      return {
        ...show,
        countDown: calculateCountdown(show.date),
      };
    });

    return {
      athlete,
      shows: allShows,
      coachName,
      timeline,
      countDown,
    };
  }
}

const getCoachName = async (athlete: any): Promise<string> => {
  if (athlete.coachId) {
    const coach = await CoachModel.findById(athlete.coachId)
      .select('name')
      .lean();
    return coach?.name || '';
  }

  const user = await User.findById(athlete._id).select('name').lean();
  return user?.name || '';
};

const calculateCountdown = (dateStr: string): number => {
  const showDate = new Date(dateStr).getTime();
  const now = Date.now();

  const diffMs = showDate - now;
  if (diffMs <= 0) return 0;

  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};
