import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../../shared/catchAsync';
import sendResponse from '../../../../shared/sendResponse';
import { DailyTrackingService } from './track.meal.service';

const dailyTrackingService = new DailyTrackingService();

export class DailyTrackingController {
  /**
   * Create daily tracking / add TrackMeal
   * POST /api/v1/daily-tracking
   */
  createDailyTracking = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const payload = {
        userId: req.user.id,
        mealNumber: req.body.mealNumber,
        food: req.body.food,
        date: req.body.date,
      };

      const result = await dailyTrackingService.createDailyTracking(payload);

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.CREATED,
        message: 'Daily tracking created successfully',
        data: result,
      });
    },
  );

  addDailyTracking = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user.id;
      const mealId = req.params.id;
      const food = req.body;

      const result = await dailyTrackingService.addDailyTrackingService({
        userId,
        mealId,
        food,
      });

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.CREATED,
        message: 'Daily tracking updated successfully',
        data: result,
      });
    },
  );

  /**
   * Get daily tracking (search by date optional)
   * GET /api/v1/daily-tracking?date=YYYY-MM-DD
   */
  getDailyTracking = catchAsync(async (req: Request, res: Response) => {
    const { date } = req.query;

    const result = await dailyTrackingService.getDailyTracking(
      req.user.id,
      date as string,
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Daily tracking fetched successfully',
      data: result,
    });
  });

  /**
   * Update food items of a TrackMeal
   * PATCH /api/v1/daily-tracking/:date/:mealIndex
   */
  updateTrackMeal = catchAsync(async (req: Request, res: Response) => {
    const { date, id } = req.params;

    const result = await dailyTrackingService.updateTrackMeal(
      req.user.id,
      date,
      id,
      req.body.food,
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Track meal updated successfully',
      data: result,
    });
  });

  /**
   * Delete a TrackMeal
   * DELETE /api/v1/daily-tracking/:date/:mealIndex
   */
  deleteTrackMeal = catchAsync(async (req: Request, res: Response) => {
    const { date, mealId } = req.params;
    const foodId =
      typeof req.query.foodId === 'string' ? req.query.foodId : undefined;
    const userId = req.user.id;

    const result = await dailyTrackingService.deleteTrackMeal({
      userId,
      date,
      mealId,
      foodId,
    });

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Track meal deleted successfully',
      data: result,
    });
  });

  getFoodSuggestionsController = catchAsync(
    async (req: Request, res: Response) => {
      const { search } = req.query;

      const result = await dailyTrackingService.getFoodSuggestionsService(
        search as string,
      );
      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Food suggestions retrieved successfully',
        data: result,
      });
    },
  );
}
