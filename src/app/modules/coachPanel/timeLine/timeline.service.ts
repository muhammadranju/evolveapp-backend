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
export const buildTimelineHistory = async (userId: string) => {
  const athlete = await AthleteModel.findById(userId)
    .select('checkInDay phase')
    .lean();

  if (!athlete?.checkInDay) return [];

  const checkDayIndex = dayMap[athlete.checkInDay];

  // ✅ Fetch only required fields (PERF)
  const allTracking = await DailyTrackingModel.find({ userId })
    .select(
      'date weight nutrition activityStep training.trainingCompleted training.duration',
    )
    .sort({ date: 1 })
    .lean();

  if (!allTracking.length) return [];

  // ------------------------------------
  // Group data by weekly check-in
  // ------------------------------------
  const groupedByCheckIn = new Map<string, any[]>();

  for (const d of allTracking) {
    if (!d.date) continue;
    const dt = new Date(d.date);
    const checkInDateStr = getPreviousOrSameCheckIn(dt, checkDayIndex)
      .toISOString()
      .slice(0, 10);

    if (!groupedByCheckIn.has(checkInDateStr)) {
      groupedByCheckIn.set(checkInDateStr, []);
    }

    groupedByCheckIn.get(checkInDateStr)!.push(d);
  }

  // ------------------------------------
  // Prepare bulk DB operations
  // ------------------------------------
  const bulkOps: any[] = [];
  const results: any[] = [];

  for (const [checkInDate, windowData] of groupedByCheckIn.entries()) {
    const nextCheckInDate = new Date(checkInDate);
    nextCheckInDate.setDate(nextCheckInDate.getDate() + 7);

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

    // Response stays unchanged
    results.push({
      userId,
      phase: athlete.phase,
      checkInDate,
      nextCheckInDate: nextCheckInDate.toISOString().slice(0, 10),
      averages,
    });
  }

  // ✅ Single DB call
  if (bulkOps.length) {
    await TimelineHistoryModel.bulkWrite(bulkOps);
  }

  // ✅ Fetch with IDs after bulk write to return them
  const finalResults = await TimelineHistoryModel.find({ userId })
    .select('_id userId phase checkInDate nextCheckInDate averages')
    .sort({ checkInDate: 1 })
    .lean();

  return finalResults;
};

// ------------------------------------
// Bulk update timeline phase
// ------------------------------------
export const bulkUpdateTimelinePhaseService = async (
  userId: string,
  timelineIds: string[],
  newPhase: string,
) => {
  // Validate if userId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    // throw new Error(`Invalid athleteId: ${userId}`);
    throw new ApiError(StatusCodes.BAD_REQUEST, `Invalid athleteId: ${userId}`);
  }

  const bulkOps = timelineIds
    .filter(id => mongoose.Types.ObjectId.isValid(id)) // Filter out invalid IDs
    .map((id: string) => ({
      updateOne: {
        filter: {
          _id: new mongoose.Types.ObjectId(id),
          userId: new mongoose.Types.ObjectId(userId),
        },
        update: { $set: { phase: newPhase } },
      },
    }));

  if (bulkOps.length === 0) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'No valid timelineIds provided',
    );
    // throw new Error('No valid timelineIds provided');
  }

  const result = await TimelineHistoryModel.bulkWrite(bulkOps);
  return result;
};

// ------------------------------------
// Helpers
// ------------------------------------
const getPreviousOrSameCheckIn = (date: Date, targetDay: number): Date => {
  const result = new Date(date);
  const diff = (result.getDay() - targetDay + 7) % 7;
  result.setDate(result.getDate() - diff);
  return result;
};
