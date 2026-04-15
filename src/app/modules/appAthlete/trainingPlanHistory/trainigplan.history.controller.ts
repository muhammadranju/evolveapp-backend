import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../../shared/catchAsync';
import sendResponse from '../../../../shared/sendResponse';
import { TrainingPushDayHistoryService } from './trainigplan.history.service';

const trainingPushDayHistoryService = new TrainingPushDayHistoryService();

export class TrainingPushDayHistoryController {
  /**
   * Add a new Training Push Day History
   * POST /api/v1/users/:userId/training-push-day-history
   */
  addTrainingPushDayHistory = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user.id;
      const payload = { ...req.body, userId };

      const result =
        await trainingPushDayHistoryService.createTrainingPushDayHistory(
          payload,
        );

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.CREATED,
        message: 'Training push day history created successfully',
        data: result,
      });
    },
  );

  /**
   * Get Training Push Day History for a user
   * GET /api/v1/users/:userId/training-push-day-history?trainingName=Bench
   */
  getTrainingPushDayHistory = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user.id;
      const { trainingName } = req.query;

      const result =
        await trainingPushDayHistoryService.getTrainingPushDayHistory(
          userId,
          trainingName as string,
        );

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Training push day history retrieved successfully',
        data: result,
      });
    },
  );

  getTrainingPushDayHistoryById = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      // const userId = req.user.id;
      const userId = req.params.userId;

      const result =
        await trainingPushDayHistoryService.getTrainingPushDayHistoryById(
          userId,
          // id,
        );

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Training push day history retrieved successfully',
        data: result,
      });
    },
  );

  /**
   * Update Training Push Day History
   * PATCH /api/v1/users/:userId/training-push-day-history/:id
   */
  updateTrainingPushDayHistory = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user.id;
      const id = req.params.id;
      const result =
        await trainingPushDayHistoryService.updateTrainingPushDayHistory(
          userId,
          id,
          req.body,
        );

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Training push day history updated successfully',
        data: result,
      });
    },
  );

  /**
   * Delete Training Push Day History
   * DELETE /api/v1/users/:userId/training-push-day-history/:id
   */
  deleteTrainingPushDayHistory = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user.id;
      const id = req.params.id;

      const result =
        await trainingPushDayHistoryService.deleteTrainingPushDayHistory(
          userId,
          id,
        );

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Training push day history deleted successfully',
        data: result,
      });
    },
  );
}
