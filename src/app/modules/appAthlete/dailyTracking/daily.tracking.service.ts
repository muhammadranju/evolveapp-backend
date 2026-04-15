import { DailyTrackingModel } from './daily.tracking.model';
import { DailyTracking } from './daily.tracking.interface';
import { calculateNumericAverages } from '../../../../util/calculate.average';
import { weeklyReportService } from '../../athleteWeeklyReport/history.service';
import { DailyTrackingNotificationHistoryModel } from './dailytracking.notification.model';

export class DailyTrackingService {
  /**
   * Create a daily tracking entry
   */
  async createDailyTracking(payload: DailyTracking): Promise<DailyTracking> {
    const result = await DailyTrackingModel.create(payload);
    return result;
  }

  /**
   * Get all daily tracking entries
   */
  async getAllDailyTracking(
    userId: string,
    coachId: string,
    query?: { date?: string },
  ): Promise<{
    weekData: (Partial<Omit<DailyTracking, keyof Document>> & {
      day: string;
      date: string;
    })[];
    averages: ReturnType<typeof calculateNumericAverages>;
  }> {
    let baseDate = new Date();
    if (query?.date) {
      const [y, m, d] = query.date.split('-').map(Number);
      baseDate = new Date(y, m - 1, d);
    }

    const monday = new Date(baseDate);
    monday.setDate(baseDate.getDate() - ((baseDate.getDay() + 6) % 7));

    const weekDates: string[] = [];
    for (let i = 1; i <= 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      weekDates.push(d.toISOString().split('T')[0]); // "YYYY-MM-DD"
    }

    const data = await DailyTrackingModel.find({
      userId,
      date: { $in: weekDates },
    }).lean();

    const dayNames = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];

    const getDayName = (date: Date) => {
      const jsDay = date.getDay();
      return dayNames[(jsDay + 6) % 7];
    };

    const dataMap = new Map(data.map(item => [item.date, item]));

    const weekData = weekDates.map(date => {
      const entry = dataMap.get(date);

      const [y, m, d] = date.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);

      return {
        ...(entry || { userId, coachId }),
        date,
        day: getDayName(dateObj),
      };
    });

    const averages = calculateNumericAverages(data);

    await weeklyReportService({ userId, coachId, ...averages });

    return { weekData, averages };
  }

  /**
   * Get single daily tracking by ID
   */
  async getDailyTrackingById(id: string): Promise<DailyTracking | null> {
    return DailyTrackingModel.findById(id);
  }

  /**
   * Update daily tracking by ID
   */
  async updateDailyTracking(
    date: string,
    userId: string, 
    payload: Partial<DailyTracking>,
  ): Promise<DailyTracking | null> {
    const result = await DailyTrackingModel.findOneAndUpdate({ date, userId } , payload, {
      new: true,
      runValidators: true,
    });
    return result;
  }

  /**
   * Delete daily tracking by ID
   */
  async deleteDailyTracking(id: string): Promise<DailyTracking | null> {
    return DailyTrackingModel.findByIdAndDelete(id);
  }

  /**
   * Get daily tracking push notifications
   */
  async getDailyTrackingPushNotification(userId: string, coachId: string) {
    return DailyTrackingNotificationHistoryModel.find({ userId, coachId }).sort(
      { createdAt: -1 },
    );
  }

  /**
   * Get single daily tracking push notification by ID
   */
  async getSingleDailyTrackingPushNotification(id: string) {
    return DailyTrackingNotificationHistoryModel.findById(id);
  }

  async getDailyTrackingBySearch(
    userId: string,
    date: string,
  ): Promise<DailyTracking | null> {
    return DailyTrackingModel.findOne({ userId, date });
  }
}
