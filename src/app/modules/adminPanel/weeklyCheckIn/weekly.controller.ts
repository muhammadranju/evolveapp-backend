import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../../shared/catchAsync';
import sendResponse from '../../../../shared/sendResponse';
import { getAthletesWithCoachPromiseAll } from './weekly.service';

export class WeeklyCheckInController {
  /**
   * Add new food item
   * POST /api/v1/food-items
   */
  getWeeklyCheckIn = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await getAthletesWithCoachPromiseAll();
      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.CREATED,
        message: 'Fetch Data Successfully',
        data: result,
      });
    }
  );
}
