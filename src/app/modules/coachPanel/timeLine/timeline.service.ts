import mongoose from 'mongoose';
import { AthleteModel } from '../../adminPanel/athlete/athleteModel';
import { DailyTrackingModel } from '../../appAthlete/dailyTracking/daily.tracking.model';
import { TimelineHistoryModel } from './timeline.model';
import ApiError from '../../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';

const dayMap: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

// ------------------------------------
// Calculate averages for training/rest days
// ------------------------------------
const calculateConditionalAverages = (data: any[]) => {
  const trainingDays = data.filter(d => d.training?.trainingCompleted === true);
  const restDays = data.filter(d => d.training?.trainingCompleted === false);

  const calc = (arr: any[]) => {
    if (!arr.length) return null;

    const total = arr.reduce(
      (acc, item) => {
        acc.avgWeight += Number(item.weight) || 0;
        acc.avgProtein += Number(item.nutrition?.protein) || 0;
        acc.avgFats += Number(item.nutrition?.fats) || 0;
        acc.avgCarbs += Number(item.nutrition?.carbs) || 0;
        acc.avgCalories += Number(item.nutrition?.calories) || 0;
        acc.avgActivityStep += Number(item.activityStep) || 0;
        acc.avgCardioPerMin += Number(item.training?.duration) || 0;
        return acc;
      },
      {
        avgWeight: 0,
        avgProtein: 0,
        avgFats: 0,
        avgCarbs: 0,
        avgCalories: 0,
        avgActivityStep: 0,
        avgCardioPerMin: 0,
      },
    );

    const count = arr.length;

    return {
      avgWeight: +(total.avgWeight / count).toFixed(2),
      avgProtein: +(total.avgProtein / count).toFixed(2),
      avgFats: +(total.avgFats / count).toFixed(2),
      avgCarbs: +(total.avgCarbs / count).toFixed(2),
      avgCalories: +(total.avgCalories / count).toFixed(2),
      avgActivityStep: +(total.avgActivityStep / count).toFixed(0),
      avgCardioPerMin: +(total.avgCardioPerMin / count).toFixed(1),
    };
  };

  return {
    trainingDay: calc(trainingDays),
    restDay: calc(restDays),
  };
};

// ------------------------------------
// Main Builder
// ------------------------------------
export const buildTimelineHistory = async (
  userId: string,
  targetYear?: number,
) => {
  const athlete = await AthleteModel.findById(userId).lean();

  if (!athlete?.checkInDay) return [];

  const checkDayIndex = dayMap[athlete.checkInDay];
  const year = targetYear || new Date().getUTCFullYear();

  // Find the first check-in date of the target year
  let startDate = new Date(Date.UTC(year, 0, 1));
  while (startDate.getUTCDay() !== checkDayIndex) {
    startDate.setUTCDate(startDate.getUTCDate() + 1);
  }

  // 1. Fetch tracking data for the selected year
  const allTracking = await DailyTrackingModel.find({
    userId,
    date: { $regex: `^${year}` },
  })
    .select(
      'date weight nutrition activityStep training.trainingCompleted training.duration',
    )
    .sort({ date: 1 })
    .lean();

  // 2. Group data by weekly check-in
  const groupedByCheckIn = new Map<string, any[]>();
  for (const d of allTracking) {
    if (!d.date) continue;
    const [y, m, day] = d.date.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, day));
    const checkInDateStr = getPreviousOrSameCheckIn(dt, checkDayIndex)
      .toISOString()
      .slice(0, 10);

    if (!groupedByCheckIn.has(checkInDateStr)) {
      groupedByCheckIn.set(checkInDateStr, []);
    }
    groupedByCheckIn.get(checkInDateStr)!.push(d);
  }

  // 3. Sync history from tracking data (ensure all tracking data has history records)
  const bulkOps: any[] = [];
  for (const [checkInDate, windowData] of groupedByCheckIn.entries()) {
    const [y, m, day] = checkInDate.split('-').map(Number);
    const nextCheckInDate = new Date(Date.UTC(y, m - 1, day));
    nextCheckInDate.setUTCDate(nextCheckInDate.getUTCDate() + 7);

    const averages = calculateConditionalAverages(windowData);

    bulkOps.push({
      updateOne: {
        filter: { userId, checkInDate },
        update: {
          $setOnInsert: {
            userId,
            phase: athlete.phase,
            checkInDate,
            nextCheckInDate: nextCheckInDate.toISOString().slice(0, 10),
            dailyData: windowData,
            averages,
          },
        },
        upsert: true,
      },
    });
  }

  if (bulkOps.length) {
    await TimelineHistoryModel.bulkWrite(bulkOps);
  }

  // 4. Fetch history records for the selected year
  const allHistory = await TimelineHistoryModel.find({
    userId,
    checkInDate: { $regex: `^${year}` },
  }).lean();

  // 5. Generate exactly 52 weeks for the target year
  const results = [];
  for (let i = 0; i < 52; i++) {
    const currentCheckIn = new Date(startDate);
    currentCheckIn.setUTCDate(startDate.getUTCDate() + i * 7);
    const dateStr = currentCheckIn.toISOString().slice(0, 10);

    const match = allHistory.find((h: any) => h.checkInDate === dateStr);

    if (match) {
      results.push({
        ...match,
        week: i + 1,
        exists: true,
      });
    } else {
      const nextCheckIn = new Date(currentCheckIn);
      nextCheckIn.setUTCDate(currentCheckIn.getUTCDate() + 7);
      results.push({
        userId,
        checkInDate: dateStr,
        nextCheckInDate: nextCheckIn.toISOString().slice(0, 10),
        phase: 'Select phase',
        averages: { trainingDay: null, restDay: null },
        dailyData: [],
        isPlaceholder: true,
        week: i + 1,
        exists: false,
      });
    }
  }

  return results;
};

// ------------------------------------
// Bulk update timeline phase
// ------------------------------------
export const bulkUpdateTimelinePhaseService = async (
  userId: string,
  timelineIds: any[],
  newPhase: string,
  year?: number,
) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, `Invalid athleteId: ${userId}`);
  }

  // Fetch the full timeline to resolve 'empty-N' placeholders for the correct year
  const fullTimeline = await buildTimelineHistory(userId, year);

  const bulkOps = timelineIds
    .map(item => {
      let filter: any = { userId: new mongoose.Types.ObjectId(userId) };
      let update: any = { $set: { phase: newPhase } };
      let checkInDate: any = '';

      // Handle 'empty-N' format from frontend
      if (typeof item === 'string' && item.startsWith('empty-')) {
        const weekNum = parseInt(item.replace('empty-', ''));
        const index = weekNum - 1;
        if (fullTimeline[index]) {
          checkInDate = fullTimeline[index].checkInDate;
          filter.checkInDate = checkInDate;
        }
      } else if (typeof item === 'string') {
        if (mongoose.Types.ObjectId.isValid(item)) {
          filter._id = new mongoose.Types.ObjectId(item);
        } else if (/^\d{4}-\d{2}-\d{2}$/.test(item)) {
          checkInDate = item;
          filter.checkInDate = item;
        }
      } else if (typeof item === 'object' && item !== null) {
        if (item.id && mongoose.Types.ObjectId.isValid(item.id)) {
          filter._id = new mongoose.Types.ObjectId(item.id);
        }
        if (item.checkInDate) {
          checkInDate = item.checkInDate;
          filter.checkInDate = item.checkInDate;
        }
      }

      if (!filter._id && !filter.checkInDate) {
        return null;
      }

      if (checkInDate) {
        delete filter._id;
        filter.checkInDate = checkInDate;

        const [y, m, day] = checkInDate.split('-').map(Number);
        const nextDate = new Date(Date.UTC(y, m - 1, day));
        nextDate.setUTCDate(nextDate.getUTCDate() + 7);
        const nextCheckInDateStr = nextDate.toISOString().slice(0, 10);

        update.$setOnInsert = {
          userId: new mongoose.Types.ObjectId(userId),
          checkInDate: checkInDate,
          nextCheckInDate: nextCheckInDateStr,
          dailyData: [],
          averages: {
            trainingDay: null,
            restDay: null,
          },
        };
      }

      return {
        updateOne: {
          filter,
          update,
          upsert: true,
        },
      };
    })
    .filter(Boolean);

  if (bulkOps.length === 0) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'No valid timeline items provided',
    );
  }

  const result = await TimelineHistoryModel.bulkWrite(bulkOps as any);
  return result;
};

// ------------------------------------
// Helpers
// ------------------------------------
const getPreviousOrSameCheckIn = (date: Date, targetDay: number): Date => {
  const result = new Date(date);
  const diff = (result.getUTCDay() - targetDay + 7) % 7;
  result.setUTCDate(result.getUTCDate() - diff);
  return result;
};

export const getAvailableTimelineYearsService = async (userId: string) => {
  const historyDates = await TimelineHistoryModel.distinct('checkInDate', {
    userId: new mongoose.Types.ObjectId(userId),
  });
  const trackingDates = await DailyTrackingModel.distinct('date', { userId });

  const yearsSet = new Set<number>();
  yearsSet.add(new Date().getUTCFullYear());

  [...historyDates, ...trackingDates].forEach((dateStr: string) => {
    if (typeof dateStr === 'string' && dateStr.includes('-')) {
      const year = parseInt(dateStr.split('-')[0]);
      if (!isNaN(year)) yearsSet.add(year);
    }
  });

  return Array.from(yearsSet).sort((a, b) => b - a);
};
