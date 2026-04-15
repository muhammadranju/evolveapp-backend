import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { SupplementItemService } from './supplement.service';
import catchAsync from '../../../../../shared/catchAsync';
import sendResponse from '../../../../../shared/sendResponse';

const supplementService = new SupplementItemService();

export class SupplementItemController {
  /**
   * Add new supplement
   * POST /api/v1/supplements
   */
  addSupplement = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.params.userId;
      let coachId;
      if (req.user && req.user.role == 'COACH') {
        coachId = req.user.id;
      } else {
        coachId = '';
      }
      const data = {
        userId,
        coachId,
        ...req.body,
      };
      const result = await supplementService.createSupplement(data);
      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.CREATED,
        message: 'Supplement created successfully',
        data: result,
      });
    }
  );

  addSupplementByAdmin = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      let adminId;
      if (req.user && req.user.role == 'SUPER_ADMIN') {
        adminId = req.user.id;
      } else {
        adminId = '';
      }
      const data = {
        adminId,
        ...req.body,
      };
      const result = await supplementService.createSupplement(data);
      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.CREATED,
        message: 'Supplement created successfully',
        data: result,
      });
    }
  );

  /**
   * Get all supplements with optional search and pagination
   * GET /api/v1/supplements?search=&page=&limit=
   */
  getAllSupplements = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { search, page, limit } = req.query;
      let userId;
      let coachId;
      userId = req.params.userId;
      if (req.user && req.user.role == 'ATHLETE' && !userId) {
        userId = req.user.id;
      } else if (req.user && req.user.role == 'COACH') {
        coachId = req.user.id;
      }

      const result = await supplementService.getAllSupplements(
        userId,
        coachId,
        search as string,
        Number(page) || 1,
        Number(limit) || 10
      );

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Supplements retrieved successfully',
        data: result,
      });
    }
  );

  getAllSupplementsByAdmin = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { search, page, limit } = req.query;

      const result = await supplementService.getAllSupplementsByAdmin(
        search as string,
        Number(page) || 1,
        Number(limit) || 10
      );

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Supplements retrieved successfully',
        data: result,
      });
    }
  );

  /**
   * Get supplement by ID
   * GET /api/v1/supplements/:id
   */
  getSupplementById = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await supplementService.getSupplementById(req.params.id);

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Supplement retrieved successfully',
        data: result,
      });
    }
  );

  /**
   * Update supplement by ID
   * PATCH /api/v1/supplements/:id
   */
  updateSupplement = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await supplementService.updateSupplement(
        req.params.id,
        req.body
      );

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Supplement updated successfully',
        data: result,
      });
    }
  );

  updateSupplementByCoach = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const coachId=req.user.id;
      const userId= req.params.userId
      console.log('Coach ID:', coachId);
      console.log('User ID:', userId);
      console.log('Supplement ID:', req.params.id);
      const result = await supplementService.updateSupplementByCoach(
        req.params.id,
        req.body,coachId,userId
      );

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Supplement updated successfully',
        data: result,
      });
    }
  );

  /**
   * Delete supplement by ID
   * DELETE /api/v1/supplements/:id
   */
  deleteSupplement = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await supplementService.deleteSupplement(req.params.id);

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Supplement deleted successfully',
        data: result,
      });
    }
  );


    deleteSupplementByCoach = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const coachId=req.user.id;
      const userId= req.params.userId;
      const result = await supplementService.deleteSupplementByCoach(req.params.id, coachId, userId);

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Supplement deleted successfully',
        data: result,
      });
    }
  );

  
}
