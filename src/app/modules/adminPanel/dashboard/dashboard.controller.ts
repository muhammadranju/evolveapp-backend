import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../../shared/catchAsync';
import sendResponse from '../../../../shared/sendResponse';
import { DashboardService } from './dashbord.service';

const dashboardService = new DashboardService();

export class adminDashboardController {
  /**
   * get Dashboard data
   * Total athlete, total coach, total enhanced athlete, total natural athlete,
   *  total active user, total In-Active user,
   * total daily tracking today,
   * total Check in this week,
   * GET api/v1/dashboard
   */
  dashboardInfo = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await dashboardService.getDashboardInfo();

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Dashboard Data fetch successfully',
        data: result,
      });
    }
  );

  /**
   * GET api/v1/dashboard
   */
  dashboardAlert = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await dashboardService.getDashboardAlert();
      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Dashboard data fetched successfully',
        data: result,
      });
    }
  );
}
