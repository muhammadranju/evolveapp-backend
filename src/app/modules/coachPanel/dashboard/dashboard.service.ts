import { AthleteModel } from '../../adminPanel/athlete/athleteModel';
import CheckInModel from '../../appAthlete/checkIn/checkin.model';
import { DailyTrackingModel } from '../../appAthlete/dailyTracking/daily.tracking.model';

export class CoachDashboardService {
  /**
   * get Dashboard data from datavbase..
   */
  async getCoachDashboard(coachId: string) {
    // 📅 Start & End of today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // 🚀 Run queries using aggregation pipelines to minimize database roundtrips
    const [athleteStats, checkInStats, totalDailyTrackingToday] =
      await Promise.all([
        // 🔹 Aggregation for Athlete stats
        AthleteModel.aggregate([
          { $match: { coachId } },
          {
            $facet: {
              totalAthletes: [{ $count: 'count' }],
              totalActiveUsers: [
                { $match: { isActive: 'Active' } },
                { $count: 'count' },
              ],
            },
          },
        ]),

        // 🔹 Aggregation for Check-in stats
        CheckInModel.aggregate([
          { $match: { coachId } },
          {
            $facet: {
              completed: [
                { $match: { checkinCompleted: 'Completed' } },
                { $count: 'count' },
              ],
              pending: [
                { $match: { checkinCompleted: 'Pending' } },
                { $count: 'count' },
              ],
            },
          },
        ]),

        // 🔹 Daily tracking submitted today
        DailyTrackingModel.countDocuments({
          coachId,
          createdAt: { $gte: startOfDay, $lte: endOfDay },
        }),
      ]);

    // Extracting results from aggregation facets
    const totalAthletes = athleteStats[0]?.totalAthletes[0]?.count || 0;
    const totalActiveUsers = athleteStats[0]?.totalActiveUsers[0]?.count || 0;
    const totalCompletedCheckin = checkInStats[0]?.completed[0]?.count || 0;
    const totalPendingCheckin = checkInStats[0]?.pending[0]?.count || 0;

    return {
      totalAthletes,
      totalActiveUsers,
      checkins: {
        completed: totalCompletedCheckin,
        pending: totalPendingCheckin,
      },
      dailyTracking: {
        submittedToday: totalDailyTrackingToday,
      },
    };
  }

  async getWeeklyCheckins(coachId: string) {
    // 📅 Start & End of week
    const startOfWeek = new Date();
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date();
    endOfWeek.setHours(23, 59, 59, 999);

    // 🚀 Run all queries in parallel
    const [totalCompletedCheckin, totalPendingCheckin] = await Promise.all([
      // Completed checkins
      CheckInModel.countDocuments({
        coachId,
        checkinCompleted: 'Completed',
      }),

      // Pending checkins
      CheckInModel.countDocuments({
        coachId,
        checkinCompleted: 'Pending',
      }),
    ]);

    return {
      weeklyCheckins: {
        completed: totalCompletedCheckin,
        pending: totalPendingCheckin,
      },
    };
  }
}
