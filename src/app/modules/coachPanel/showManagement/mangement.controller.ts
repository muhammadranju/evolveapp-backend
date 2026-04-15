import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../../shared/catchAsync';
import sendResponse from '../../../../shared/sendResponse';
import { ShowManagementService } from './management.service';
import ApiError from '../../../../errors/ApiError';

const showService = new ShowManagementService();

export class ShowManagementController {
  /**
   * Add a new show
   * POST /api/v1/shows
   */
  addShow = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await showService.createShow(req.body);

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.CREATED,
        message: 'Show created successfully',
        data: result,
      });
    },
  );

  /**
   * Get all shows (latest first)
   * GET /api/v1/shows
   */
  getAllShows = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await showService.getAllShows();

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Shows retrieved successfully',
        data: result,
      });
    },
  );

  /**
   * Get a single show by ID
   * GET /api/v1/shows/:id
   */
  getShowById = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await showService.getShowById(req.params.id);

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Show retrieved successfully',
        data: result,
      });
    },
  );

  /**
   * Update a show
   * PATCH /api/v1/shows/:id
   */
  updateShow = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await showService.updateShow(req.params.id, req.body);

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Show updated successfully',
        data: result,
      });
    },
  );

  /**
   * Delete a show
   * DELETE /api/v1/shows/:id
   */
  deleteShow = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await showService.deleteShow(req.params.id);

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Show deleted successfully',
        data: result,
      });
    },
  );

  assignShow = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { showId, userIds } = req.body;

      if (!showId || !userIds) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'showId and userIds are required');
      }

      const result = await showService.assignShow({ showId, userIds });

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Show assigned successfully',
        data: result,
      });
    },
  );
}
