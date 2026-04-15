import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../../shared/catchAsync';
import sendResponse from '../../../../shared/sendResponse';
import { DailyTrackingService } from './daily.tracking.service';
import { AthleteModel } from '../../adminPanel/athlete/athleteModel';
import { sendCheckingNotificationForDailyTracking } from '../../notification/notification.service';

const dailyTrackingService = new DailyTrackingService();

export class DailyTrackingController {
  /**
   * Create daily tracking
   * POST /api/v1/daily-tracking
   */
  createDailyTracking = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const athlete = await AthleteModel.findById(req.user.id).select(
        'coachId'
      );

      if (!athlete || !athlete.coachId) {
        throw new Error('Coach not assigned to this athlete');
      }
      console.log(athlete.coachId);

      const payload = {
        ...req.body,
        userId: req.user.id,
        coachId: athlete.coachId,
      };
      const result = await dailyTrackingService.createDailyTracking(payload);

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.CREATED,
        message: 'Daily tracking created successfully',
        data: result,
      });
    }
  );

  /**
   * Get all daily tracking records
   * GET /api/v1/daily-tracking
   */
  getAllDailyTracking = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.params.userId;
      const coachId = req.user.id;
      const date = req.query.date as string | undefined;
      const result = await dailyTrackingService.getAllDailyTracking(
        userId,
        coachId,
        { date }
      );

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Daily tracking fetched successfully',
        data: result,
      });
    }
  );

  /**
   * Get single daily tracking by ID
   * GET /api/v1/daily-tracking/:id
   */
  getSingleDailyTracking = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;

      const result = await dailyTrackingService.getDailyTrackingById(id);

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Daily tracking fetched successfully',
        data: result,
      });
    }
  );

  /**
   * Update daily tracking by ID
   * PATCH /api/v1/daily-tracking/:id
   */
  updateDailyTracking = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { date } = req.query as { date: string };
      const userId = req.user.id;
      
      const result = await dailyTrackingService.updateDailyTracking(
        date,
        userId,
        req.body
      );

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Daily tracking updated successfully',
        data: result,
      });
    }
  );

  /**
   * Delete daily tracking by ID
   * DELETE /api/v1/daily-tracking/:id
   */
  deleteDailyTracking = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;

      const result = await dailyTrackingService.deleteDailyTracking(id);

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Daily tracking deleted successfully',
        data: result,
      });
    }
  );

  createDailyTrackingCommentNotification = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const coachId = req.user.id;
      const userId = req.params.userId;
      const title=`Daily Tracking note by coach: ${req.user.name}`;
      const athlete = await AthleteModel.findById(userId).select(
        'fcmToken'
      );
      if (!athlete || !athlete.fcmToken) {
        throw new Error('Athlete FCM token not found');
      }
      const result = await sendCheckingNotificationForDailyTracking(
        title,
        req.body.comments,
        athlete.fcmToken,
        userId,
        coachId
      );

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.CREATED,
        message: 'Daily tracking comments notification created successfully',
        data: result,
      });
    }
  );

  /**
   * Get single daily tracking by ID
   * GET /api/v1/daily-tracking/:id
   */
  getDailyTrackingAllNotification = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user.id;
      const athlete = await AthleteModel.findById(userId).select(
        'coachId'
      );
      if (!athlete || !athlete.coachId) {
        throw new Error('Coach not assigned to this athlete');
      }
      const result = await dailyTrackingService.getDailyTrackingPushNotification(userId, athlete.coachId);

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Daily tracking notifications fetched successfully',
        data: result,
      });
    }
  );


    /**
   * Get single daily tracking by ID
   * GET /api/v1/daily-tracking/:id
   */
  getSingleDailyTrackingPushNotification = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const result = await dailyTrackingService.getSingleDailyTrackingPushNotification(id);

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Daily tracking notification fetched successfully',
        data: result,
      });
    }
  );

    /**
   * Get all daily tracking records
   * GET /api/v1/daily-tracking
   */
  getAllDailyTrackingByDate = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user.id;
      const date = req.query.date 
      const result = await dailyTrackingService.getDailyTrackingBySearch(
        userId,
        date as string
      );

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Daily tracking fetched successfully',
        data: result,
      });
    }
  );

}
