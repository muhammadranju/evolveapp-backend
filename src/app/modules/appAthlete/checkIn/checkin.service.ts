import CheckInModel from './checkin.model';
import { Types } from 'mongoose';
import { ICheckInInfo } from './checkin.interface';
import { AthleteModel } from '../../adminPanel/athlete/athleteModel';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../../errors/ApiError';
import {
  getNextCheckInDateFormatted,
  humanReadableFormate,
} from '../../../../util/calculate.date';
import { DailyTrackingModel } from '../dailyTracking/daily.tracking.model';
import { CoachModel } from '../../adminPanel/coach/coachModel';
import { sendCheckingNotification } from '../../notification/notification.service';
import { NotificationModel } from '../../notification/notification.model';
import CheckInQuestionModel from './checkinQuestion.model';
import { QuestionAnswer } from './checkin.interface';

const DEFAULT_QUESTIONS: QuestionAnswer[] = [
  { question: 'What went well this week? ', status: false },
  {
    question:
      'What do we need to change, so you can achieve your goals EVEN better?',
    status: false,
  },
  { question: 'Challenges? ', status: false },
  { question: 'Something you want to tell me?', status: false },
];

export class CheckInService {
  /**
   * Create a new Check-in record
   * @param payload - Check-in data
   * @returns created CheckIn document
   */
  async createCheckIn(
    payload: Partial<ICheckInInfo>,
    coachId: string,
  ): Promise<ICheckInInfo> {
    // 1. Ensure questions are snapshotted
    if (!payload.questionAndAnswer || payload.questionAndAnswer.length === 0) {
      const activeQuestions = await this.getAthleteQuestions(
        payload.userId as string,
      );
      payload.questionAndAnswer = activeQuestions.map(q => ({
        question: q.question,
        answer: '',
        status: false,
      }));
    }

    console.log(payload);
    // 2. Create check-in
    const result = await CheckInModel.create(payload);

    // 3. Get coach notification data
    const coach = await CoachModel.findById(payload.coachId)
      .select('fcmToken name')
      .lean();

    if (!coach?.fcmToken) return result;

    // 4. Send notification
    const title = 'Check-in completed';
    const description = `${coach.name}, an athlete has completed his check-in.Please review it.`;
    // const coachId = payload.coachId;
    await sendCheckingNotification(title, description, coach.fcmToken, coachId);

    return result;
  }

  async getOldCheckInData(userId: string, value: number | 1) {
    const oldData = await CheckInModel.findOne({ userId })
      .sort({ createdAt: -1 })
      .skip(value)
      .lean();
    return oldData;
  }

  async getCoachOldCheckInData(athleteId: string, value: number | 1) {
    const oldData = await CheckInModel.findOne({ userId: athleteId })
      .sort({ createdAt: -1 })
      .skip(value)
      .lean();
    return oldData;
  }

  // async updateCoachOldCheckInDataService(athleteId: string, body: any | 1) {
  //   console.log('service', body);

  //   const data = await CheckInModel.findOne({ userId: athleteId }).sort({
  //     createdAt: -1,
  //   });

  //   body.currentWeight = data?.currentWeight ?? body.currentWeight;
  //   body.averageWeight = data?.averageWeight ?? body.averageWeight;
  //   body.trainingFeedback = data?.trainingFeedback ?? body.trainingFeedback;
  //   body.athleteNote = data?.athleteNote ?? body.athleteNote;
  //   body.checkinCompleted = data?.checkinCompleted ?? body.checkinCompleted;
  //   body.coachNote = data?.coachNote ?? body.coachNote;

  //   const updateDate=await data?.save()

  //   return updateDate;
  // }

  async updateCoachOldCheckInDataService(checkinId: string, body: any) {
    console.log('service', checkinId);

    const data = await CheckInModel.findOne({ _id: checkinId });

    if (!data) {
      throw new Error('Check-in data not found');
    }

    // 🔥 Helper function (deep merge)
    const mergeData = (oldData: any, newData: any) => {
      if (!newData) return oldData;

      const merged = { ...oldData };

      for (const key in newData) {
        if (
          typeof newData[key] === 'object' &&
          !Array.isArray(newData[key]) &&
          newData[key] !== null
        ) {
          merged[key] = mergeData(oldData[key] || {}, newData[key]);
        } else if (newData[key] !== undefined) {
          merged[key] = newData[key];
        }
      }

      return merged;
    };

    // 🔥 Merge everything
    const updatedData = mergeData(data.toObject(), body);

    // 🔥 Assign merged data back
    Object.assign(data, updatedData);

    const updateDate = await data.save();

    return updateDate;
  }

  /**
   * Get all Check-in records for a user
   * @param userId - User ID
   * @returns array of CheckIn documents
   */
  async getCheckInsByUser(userId: string) {
    const data = await CheckInModel.find({ userId }).sort({ createdAt: -1 });

    return data;
  }

  /**
   * Get all Check-in records for a user
   * @param userId - User ID
   * @returns array of CheckIn documents
   */
  async getLatestCheckInsByUser(
    coachId: string,
    userId: string,
    page: number,
    limit: number,
  ) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      CheckInModel.find({ userId, coachId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      CheckInModel.countDocuments({ userId }),
    ]);

    return {
      data,
    };
  }

  /**
   * Gets athlete check-in day and calculates next check-in date
   */
  async getNextCheckInInfo(userId: string) {
    const athlete = await AthleteModel.findById(userId);
    if (!athlete) {
      throw new Error('Athlete not found');
    }
    const checkInDay = athlete.checkInDay;
    const lastCheckIn = await DailyTrackingModel.findOne({ userId }).sort({
      createdAt: -1,
    });

    if (!lastCheckIn) {
      return {
        checkInDay,
        nextCheckInDate: getNextCheckInDateFormatted(checkInDay),
        averageWeight: null,
        message: 'No previous check-in data found',
      };
    }

    const lastCheckInDate = lastCheckIn.createdAt;
    const today = new Date();

    const trackingData = await DailyTrackingModel.find({
      userId,
      createdAt: {
        $gte: lastCheckInDate,
        $lte: today,
      },
    })
      .sort({ createdAt: -1 })
      .lean();

    const currentWeight =
      trackingData?.length > 0 ? trackingData[0].weight : null;

    const totalWeight = trackingData.reduce(
      (sum, item) => sum + (item?.weight || 0),
      0,
    );

    const averageWeight =
      trackingData.length > 0
        ? Number((totalWeight / trackingData.length).toFixed(2))
        : null;

    const nextCheckInDate = getNextCheckInDateFormatted(checkInDay);
    const lastDate = humanReadableFormate(lastCheckInDate);
    return {
      checkInDay,
      lastDate,
      nextCheckInDate,
      currentWeight,
      averageWeight,
    };
  }

  /**
   * Get a single Check-in by ID
   * @param id - Check-in ID
   * @returns CheckIn document or null
   */
  async getCheckInById(id: Types.ObjectId): Promise<ICheckInInfo | null> {
    const result = await CheckInModel.findById(id);
    return result;
  }

  async getCheckInsByUserIdService(userId: string) {
    const data = await CheckInModel.findOne({ userId }).sort({ createdAt: -1 });
    return data;
  }

  /**
   * Update a Check-in record by ID
   * @param id - Check-in ID
   * @param payload - Fields to update
   * @returns updated CheckIn document or null
   */
  async updateCheckIn(
    id: string,
    coachId: string,
    payload: Partial<ICheckInInfo>,
  ): Promise<ICheckInInfo | null> {
    const updateData = {
      coachId,
      ...payload,
    };

    const updatedCheckIn = await CheckInModel.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedCheckIn) return null;

    // Send notification
    await this.sendCheckInNotification(
      updatedCheckIn.userId as string,
      coachId,
      `Check-in Updated`,
      `Your coach has updated your check-in notes. Please check it.`,
    );

    return updatedCheckIn;
  }

  private async sendCheckInNotification(
    userId: string,
    coachId: string,
    title?: string,
    description?: string,
  ) {
    const [coach, notification] = await Promise.all([
      CoachModel.findById(coachId).select('name email').lean(),
      NotificationModel.findOne({ userId: userId })
        .sort({ createdAt: -1 })
        .select('fcmToken')
        .lean(),
    ]);

    if (notification?.fcmToken && coach) {
      const finalTitle = title || `Check-in update by ${coach.name}`;
      const finalDescription =
        description ||
        `Your check-in data was reviewed. If you want to know any information, please check: ${coach.email}`;
      await sendCheckingNotification(
        finalTitle,
        finalDescription,
        notification.fcmToken,
        coachId,
      );
    }
  }

  /**
   * Delete a Check-in record by ID
   * @param id - Check-in ID
   * @returns deleted CheckIn document or null
   */
  async deleteCheckIn(id: Types.ObjectId): Promise<ICheckInInfo | null> {
    const result = await CheckInModel.findByIdAndDelete(id);
    return result;
  }

  async updateCheckInStatus(athleteId: string, coachId: string) {
    const checkInData = await CheckInModel.findOne({
      userId: athleteId,
      coachId,
      checkinCompleted: 'Pending',
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!checkInData) {
      throw new Error('No pending check-in found for this athlete');
    }

    // 1. Update check-in status
    const result = await CheckInModel.findByIdAndUpdate(
      checkInData._id,
      { $set: { checkinCompleted: 'Completed' } },
      { new: true },
    );

    // 2. Capture FINAL question set from current check-in
    // 3. Save it as the official question set for future check-ins
    if (checkInData.questionAndAnswer) {
      await CheckInQuestionModel.findOneAndUpdate(
        { userId: athleteId },
        {
          $set: {
            coachId,
            questions: checkInData?.questionAndAnswer?.map(ea => ({
              question: ea.question,
              status: ea.status,
              answer: '', // Reset answer for the next check-in
            })),
          },
        },
        { upsert: true, new: true },
      );
    }

    // 4. Send notification
    await this.sendCheckInNotification(
      athleteId,
      coachId,
      `Check-in Completed`,
      `Your coach has completed your check-in review. All looks good!`,
    );

    return result;
  }

  async getAthleteQuestions(userId: string) {
    let activeQuestions = await CheckInQuestionModel.findOne({
      userId,
    }).lean();

    if (!activeQuestions) {
      // If no custom questions, check if we can get from last completed check-in
      const lastCheckIn = await CheckInModel.findOne({
        userId,
        checkinCompleted: 'Completed',
      })
        .sort({ createdAt: -1 })
        .lean();

      if (lastCheckIn && lastCheckIn.questionAndAnswer) {
        return lastCheckIn.questionAndAnswer.map(ea => ({
          question: ea.question,
          answer: '',
          status: ea.status,
        }));
      }

      // Fallback to default set
      return DEFAULT_QUESTIONS;
    }

    return activeQuestions.questions;
  }

  async updateAthleteQuestions(
    userId: string,
    coachId: string,
    slider: {
      energyLevel?: number;
      stressLevel?: number;
      moodLevel?: number;
      hungerLevel?: number;
      sleepQuality?: number;
      nutritionPlanadherence?: number;
    },
    questions: QuestionAnswer[] = [],
  ) {
    const updated = await CheckInQuestionModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          userId,
          coachId,
          questions: questions?.map(q => ({
            question: q.question,
            status: q.status ?? false, // Add default status for new questions
            answer: '', // Ensure answer is cleared for base set
          })),
          slider,
        },
      },
      { upsert: true, new: true },
    );
    return updated;
  }
}
