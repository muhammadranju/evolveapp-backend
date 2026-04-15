import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../../shared/catchAsync';
import sendResponse from '../../../../shared/sendResponse';
import { TrainingPlanSpliteService } from './training.splite.service';

const trainingPlanSpliteService = new TrainingPlanSpliteService();

export class TrainingPlanSpliteController {
  /**
   * Add a new training plan split
   * POST /api/v1/training-plan-splites
   */
  addTrainingPlanSplite = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.params.userId;
      const coachId = req.user.id;
      const payload = {
        ...req.body,
        userId,
        coachId,
      };
      const result = await trainingPlanSpliteService.createTrainingPlanSplite(
        payload
      );

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.CREATED,
        message: 'Training plan split created successfully',
        data: result,
      });
    }
  );

  /**
   * Get all training plan splits
   * GET /api/v1/training-plan-splites
   */
  getTrainingPlanSplites = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.params.userId;
      const result = await trainingPlanSpliteService.getTrainingPlanSplites(
        userId
      );

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Training plan splits retrieved successfully',
        data: result,
      });
    }
  );

  /**
   * Update training plan split
   * PATCH /api/v1/training-plan-splites/:id
   */
  updateTrainingPlanSplite = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { userId, id } = req.params;

      const result = await trainingPlanSpliteService.updateTrainingPlanSplite(
        userId,
        id,
        req.body
      );

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Training plan split updated successfully',
        data: result,
      });
    }
  );

  /**
   * Delete training plan split
   * DELETE /api/v1/training-plan-splites/:id
   */
  deleteTrainingPlanSplite = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { userId, id } = req.params;

      const result = await trainingPlanSpliteService.deleteTrainingPlanSplite(
        userId,
        id
      );

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Training plan split deleted successfully',
        data: result,
      });
    }
  );
}
