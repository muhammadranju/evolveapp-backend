import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../../shared/catchAsync';
import sendResponse from '../../../../shared/sendResponse';
import { TrainingPlanService } from './trainingplan.service';

const trainingPlanService = new TrainingPlanService();

export class TrainingPlanController {
  /**
   * Add a new training plan
   * POST /api/v1/training-plans
   */
  addTrainingPlan = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.params.userId;
      const coachId = req.user.id;
      const payload = {
        ...req.body,
        userId,
        coachId,
      };
      const result = await trainingPlanService.createTrainingPlan(payload);

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.CREATED,
        message: 'Training plan created successfully',
        data: result,
      });
    }
  );

  /**
   * Get training plans by name
   * GET /api/v1/training-plans?name=Chest
   */
  getTrainingPlansByName = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { name } = req.query;
      const userId = req.params.userId;

      const result = await trainingPlanService.getTrainingPlansByName(
        name as string,
        userId
      );

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Training plans retrieved successfully',
        data: result,
      });
    }
  );

  getTrainingPlansById = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const id = req.params.id;
      const userId = req.user.id;

      const result = await trainingPlanService.getTrainingPlansById(id, userId);

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Training plans retrieved by id successfully',
        data: result,
      });
    }
  );

  /**
   * Update training plan
   * PATCH /api/v1/training-plans/:id
   */
  updateTrainingPlan = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { userId, id } = req.params;

      const result = await trainingPlanService.updateTrainingPlan(
        userId,
        id,
        req.body
      );

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Training plan updated successfully',
        data: result,
      });
    }
  );

  /**
   * Delete training plan
   * DELETE /api/v1/training-plans/:id
   */
  deleteTrainingPlan = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { userId, id } = req.params;

      const result = await trainingPlanService.deleteTrainingPlan(userId, id);

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Training plan deleted successfully',
        data: result,
      });
    }
  );
}
