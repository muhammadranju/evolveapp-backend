import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../../shared/catchAsync';
import sendResponse from '../../../../shared/sendResponse';
import { PEDDatabaseService } from './ped.service';

const pedService = new PEDDatabaseService();

export class PEDDatabaseController {
  /**
   * Create weekly PED database
   * Automatically generates:
   * - week (Week 1, Week 2, ...)
   * - subCategory id
   * - empty dosage / frequency / days
   *
   * POST /api/v1/ped/:athleteId
   */
  createWeeklyPEDDatabase = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      // assuming coachId is attached by auth middleware
      const { category, subCategory } = req.body;
      const coachId = req.user.id;

      const result = await pedService.createOrUpdatePEDTemplate({
        category,
        subCategory,
      });

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.CREATED,
        message: 'Weekly PED database created successfully',
        data: result,
      });
    },
  );

  /**
   * Get all PED records for an athlete
   * GET /api/v1/ped/:athleteId
   */
  getPEDByAthlete = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await pedService.getAllPED();

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'PED database fetched successfully',
        data: result,
      });
    },
  );

  getPEDForAthleteInApp = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const athleteId = req.user.id;
      const week =
        typeof req.query.week === 'string' ? req.query.week : undefined;
      const result = await pedService.getAllPEDForApp(athleteId, week);

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'PED database fetched successfully',
        data: result,
      });
    },
  );

  /**
   * Get single week PED data
   * GET /api/v1/ped/:athleteId/:week
   * Example: /ped/123/Week 2
   */
  getPEDByWeek = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { week } = req.params;

      const result = await pedService.getPEDByWeek(week);

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Weekly PED data fetched successfully',
        data: result,
      });
    },
  );

  /**
   * Coach opens athlete PED page
   */
  getAthletePED = async (req: Request, res: Response) => {
    const { athleteId } = req.params;
    const coachId = req.user.id;

    const data = await pedService.getOrCreateForAthlete(athleteId, coachId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Weekly  Athlete PED data fetched successfully',
      data: data,
    });
  };

  /**
   * Coach updates athlete PED
   */
  updateAthletePED = async (req: Request, res: Response) => {
    const { athleteId } = req.params;
    const { week } = req.query;
    const coachId = req.user.id;
    const { categories } = req.body;
    const result = await pedService.updateForAthlete(
      athleteId,
      coachId,
      String(week),
      categories,
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Weekly PED data fetched successfully',
      data: result,
    });
  };

  updateAthletePEDById = catchAsync(async (req: Request, res: Response) => {
    const { pedId } = req.params;
    const result = await pedService.updateAthletePEDById(pedId, req.body);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Athlete PED data updated successfully',
      data: result,
    });
  });

  removeSubCategoryFromPED = catchAsync(async (req: Request, res: Response) => {
    const { pedId, categoryId, subCategoryId } = req.params;

    const result = await pedService.removeSubCategoryFromPED(
      pedId,
      categoryId,
      subCategoryId,
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'SubCategory removed successfully',
      data: result,
    });
  });

  removeCategoryFromPED = catchAsync(async (req: Request, res: Response) => {
    const { pedId, categoryId } = req.params;

    const result = await pedService.removeCategoryFromPED(pedId, categoryId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Category removed successfully',
      data: result,
    });
  });
}
