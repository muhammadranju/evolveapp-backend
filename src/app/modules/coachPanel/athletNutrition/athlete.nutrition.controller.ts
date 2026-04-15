import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../../shared/catchAsync';
import sendResponse from '../../../../shared/sendResponse';
import { AthleteNutritionPlanService } from './athlete.nutrition.service';

const nutritionService = new AthleteNutritionPlanService();

export class AthleteNutritionPlanController {
  /**
   * Add a new nutrition plan
   * POST /api/v1/nutrition-plans
   */
  addNutritionPlan = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const athleteId = req.params.id;
      const coachId = req.user.id;
      const payload = {
        ...req.body,
        athleteId,
        coachId,
      };
      console.log(payload);
      const result = await nutritionService.createNutritionPlan(payload);

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.CREATED,
        message: 'Nutrition plan created successfully',
        data: result,
      });
    }
  );

  /**
   * Get all nutrition plans with optional search & filter
   * GET /api/v1/nutrition-plans?mealName=&trainingDay=
   */
  getNutritionPlans = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const filters = {
        mealName: req.query.mealName as string,
        trainingDay: req.query.trainingDay as string,
      };
      const athleteId = req.params.id;

      const result = await nutritionService.getNutritionPlans(
        filters,
        athleteId
      );

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Nutrition plans fetched successfully',
        data: result,
      });
    }
  );

  /**
   * Get single nutrition plan by ID
   * GET /api/v1/nutrition-plans/:id
   */
  getNutritionPlanById = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await nutritionService.getNutritionPlanById(req.params.id);

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Nutrition plan fetched successfully',
        data: result,
      });
    }
  );

  /**
   * Update nutrition plan by ID
   * PATCH /api/v1/nutrition-plans/:id
   */
  updateNutritionPlan = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await nutritionService.updateNutritionPlan(
        req.params.userId,
        req.params.id,
        req.body
      );

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Nutrition plan updated successfully',
        data: result,
      });
    }
  );

  /**
   * Delete nutrition plan by ID
   * DELETE /api/v1/nutrition-plans/:id
   */
  deleteNutritionPlan = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await nutritionService.deleteNutritionPlan(
        req.params.userId,
        req.params.id
      );

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Nutrition plan deleted successfully',
        data: result,
      });
    }
  );
}
