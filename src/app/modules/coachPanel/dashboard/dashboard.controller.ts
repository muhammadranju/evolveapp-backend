import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../../shared/catchAsync';
import sendResponse from '../../../../shared/sendResponse';
import { CoachDashboardService } from './dashboard.service';

const coachDashboardServiice = new CoachDashboardService();

export class CoachDashboardController {
  /**
   * Create a new Check-in
   * GET api/v1/
   */
  getCoachDashboardStats = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const coachId = req.user.id;
      const result = await coachDashboardServiice.getCoachDashboard(coachId);
      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.CREATED,
        message: 'Check-in created successfully',
        data: result,
      });
    },
  );
  getWeeklyCheckins = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const coachId = req.user.id;
      const result = await coachDashboardServiice.getWeeklyCheckins(coachId);
      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.CREATED,
        message: 'Weekly checkins retrieved successfully',
        data: result,
      });
    },
  );
}
