import { DailyTrackingModel } from './daily.tracking.model';
import { DailyTracking } from './daily.tracking.interface';
import { calculateNumericAverages } from '../../../../util/calculate.average';
import { weeklyReportService } from '../../athleteWeeklyReport/history.service';
import { DailyTrackingNotificationHistoryModel } from './dailytracking.notification.model';
import { formatDecimalToTimeStr, timeToDecimal } from '../../../../util/time.util';
import { getDayNameUTC, getStartOfWeek, getWeekDates, normalizeToUTCMidnight, getMonthDates, getYearDates } from '../../../../util/date.util';

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
    const monday = getStartOfWeek(query?.date);
    const weekDates = getWeekDates(monday);

    const data = await DailyTrackingModel.find({
      userId,
      date: { $in: weekDates },
    }).lean();

    const getDayName = (date: Date) => {
      return getDayNameUTC(date);
    };

    const dataMap = new Map(data.map(item => [item.date, item]));

    const weekData = weekDates.map(date => {
      const entry = dataMap.get(date);

      const dateObj = normalizeToUTCMidnight(date);

      return {
        ...(entry || { userId, coachId }),
        date,
        day: getDayName(dateObj),
      };
    });

    const averages = calculateNumericAverages(data);

    await weeklyReportService({
      userId,
      coachId,
      ...averages,
      sleepHour: formatDecimalToTimeStr(averages.sleepHour),
      sleepQuality: averages.sleepQuality.toString(),
    });

    return { weekData, averages };
  }

  /**
   * Get daily tracking graph data for charts
   */
  async getDailyTrackingGraphData(
    userId: string,
    dateQuery?: string,
    filter?: string,
  ): Promise<{
    sleepHours: { day: string; date: string; value: number }[];
    mood: { day: string; date: string; value: number }[];
    energy: { day: string; date: string; value: number }[];
    stress: { day: string; date: string; value: number }[];
    pmsSymptoms: { day: string; date: string; value: number }[];
    hungerLevel: { day: string; date: string; value: number }[];
    digestionLevel: { day: string; date: string; value: number }[];
  }> {
    const sleepHours: { day: string; date: string; value: number }[] = [];
    const mood: { day: string; date: string; value: number }[] = [];
    const energy: { day: string; date: string; value: number }[] = [];
    const stress: { day: string; date: string; value: number }[] = [];
    const pmsSymptoms: { day: string; date: string; value: number }[] = [];
    const hungerLevel: { day: string; date: string; value: number }[] = [];
    const digestionLevel: { day: string; date: string; value: number }[] = [];

    if (filter === 'alltime') {
      const data = await DailyTrackingModel.find({
        userId,
      })
        .sort({ date: 1 })
        .lean();

      data.forEach(entry => {
        if (!entry.date) return;
        const dateObj = normalizeToUTCMidnight(entry.date);
        const dayName = getDayNameUTC(dateObj);

        // sleepHours
        const sleepVal = timeToDecimal(entry.sleepHour);
        sleepHours.push({ day: dayName, date: entry.date, value: sleepVal });

        // mood
        mood.push({
          day: dayName,
          date: entry.date,
          value: entry.energyAndWellBeing?.mood ?? 0,
        });

        // energy
        energy.push({
          day: dayName,
          date: entry.date,
          value: entry.energyAndWellBeing?.energyLevel ?? 0,
        });

        // stress
        stress.push({
          day: dayName,
          date: entry.date,
          value: entry.energyAndWellBeing?.stressLevel ?? 0,
        });

        // pmsSymptoms
        pmsSymptoms.push({
          day: dayName,
          date: entry.date,
          value: entry.woman?.pmsSymptoms ?? 0,
        });

        // hungerLevel
        hungerLevel.push({
          day: dayName,
          date: entry.date,
          value: entry.nutrition?.hungerLevel ?? 0,
        });

        // digestionLevel
        digestionLevel.push({
          day: dayName,
          date: entry.date,
          value: entry.nutrition?.digestionLevel ?? 0,
        });
      });
    } else if (filter === 'year') {
      const year = normalizeToUTCMidnight(dateQuery).getUTCFullYear();
      const data = await DailyTrackingModel.find({
        userId,
        date: { $gte: `${year}-01-01`, $lte: `${year}-12-31` },
      }).lean();

      const monthShortNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      for (let m = 0; m < 12; m++) {
        const monthData = data.filter(entry => {
          if (!entry.date) return false;
          const parts = entry.date.split('-');
          const entryMonth = parseInt(parts[1], 10) - 1;
          return entryMonth === m;
        });

        let totalSleep = 0, countSleep = 0;
        let totalMood = 0, countMood = 0;
        let totalEnergy = 0, countEnergy = 0;
        let totalStress = 0, countStress = 0;
        let totalPms = 0, countPms = 0;
        let totalHunger = 0, countHunger = 0;
        let totalDigestion = 0, countDigestion = 0;

        monthData.forEach(entry => {
          if (entry.sleepHour) {
            const val = timeToDecimal(entry.sleepHour);
            totalSleep += val;
            countSleep++;
          }
          if (entry.energyAndWellBeing?.mood !== undefined) {
            totalMood += entry.energyAndWellBeing.mood;
            countMood++;
          }
          if (entry.energyAndWellBeing?.energyLevel !== undefined) {
            totalEnergy += entry.energyAndWellBeing.energyLevel;
            countEnergy++;
          }
          if (entry.energyAndWellBeing?.stressLevel !== undefined) {
            totalStress += entry.energyAndWellBeing.stressLevel;
            countStress++;
          }
          if (entry.woman?.pmsSymptoms !== undefined) {
            totalPms += entry.woman.pmsSymptoms;
            countPms++;
          }
          if (entry.nutrition?.hungerLevel !== undefined) {
            totalHunger += entry.nutrition.hungerLevel;
            countHunger++;
          }
          if (entry.nutrition?.digestionLevel !== undefined) {
            totalDigestion += entry.nutrition.digestionLevel;
            countDigestion++;
          }
        });

        const monthName = monthShortNames[m];
        const monthDateStr = `${year}-${(m + 1).toString().padStart(2, '0')}`;

        sleepHours.push({
          day: monthName,
          date: monthDateStr,
          value: countSleep > 0 ? Number((totalSleep / countSleep).toFixed(2)) : 0
        });
        mood.push({
          day: monthName,
          date: monthDateStr,
          value: countMood > 0 ? Number((totalMood / countMood).toFixed(2)) : 0
        });
        energy.push({
          day: monthName,
          date: monthDateStr,
          value: countEnergy > 0 ? Number((totalEnergy / countEnergy).toFixed(2)) : 0
        });
        stress.push({
          day: monthName,
          date: monthDateStr,
          value: countStress > 0 ? Number((totalStress / countStress).toFixed(2)) : 0
        });
        pmsSymptoms.push({
          day: monthName,
          date: monthDateStr,
          value: countPms > 0 ? Number((totalPms / countPms).toFixed(2)) : 0
        });
        hungerLevel.push({
          day: monthName,
          date: monthDateStr,
          value: countHunger > 0 ? Number((totalHunger / countHunger).toFixed(2)) : 0
        });
        digestionLevel.push({
          day: monthName,
          date: monthDateStr,
          value: countDigestion > 0 ? Number((totalDigestion / countDigestion).toFixed(2)) : 0
        });
      }
    } else {
      let dates: string[];
      if (filter === 'month') {
        dates = getMonthDates(dateQuery);
      } else {
        const monday = getStartOfWeek(dateQuery);
        dates = getWeekDates(monday);
      }

      const data = await DailyTrackingModel.find({
        userId,
        date: { $in: dates },
      }).lean();

      const dataMap = new Map(data.map(item => [item.date, item]));

      dates.forEach(date => {
        const entry = dataMap.get(date);
        const dayName = getDayNameUTC(normalizeToUTCMidnight(date));

        // sleepHours
        const sleepVal = timeToDecimal(entry?.sleepHour);
        sleepHours.push({ day: dayName, date, value: sleepVal });

        // mood
        mood.push({
          day: dayName,
          date,
          value: entry?.energyAndWellBeing?.mood ?? 0,
        });

        // energy
        energy.push({
          day: dayName,
          date,
          value: entry?.energyAndWellBeing?.energyLevel ?? 0,
        });

        // stress
        stress.push({
          day: dayName,
          date,
          value: entry?.energyAndWellBeing?.stressLevel ?? 0,
        });

        // pmsSymptoms
        pmsSymptoms.push({
          day: dayName,
          date,
          value: entry?.woman?.pmsSymptoms ?? 0,
        });

        // hungerLevel
        hungerLevel.push({
          day: dayName,
          date,
          value: entry?.nutrition?.hungerLevel ?? 0,
        });

        // digestionLevel
        digestionLevel.push({
          day: dayName,
          date,
          value: entry?.nutrition?.digestionLevel ?? 0,
        });
      });
    }

    return {
      sleepHours,
      mood,
      energy,
      stress,
      pmsSymptoms,
      hungerLevel,
      digestionLevel,
    };
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
