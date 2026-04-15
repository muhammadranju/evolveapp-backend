import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../../shared/catchAsync';
import sendResponse from '../../../../shared/sendResponse';
import { getSingleFilePath } from '../../../../shared/getFilePath';
import { ExerciseService } from './exercise.service';

const exerciseService = new ExerciseService();

export class ExerciseController {
  /**
   * Add new exercise
   * POST /api/v1/exercises
   */
  addExercise = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const image = getSingleFilePath(req.files, 'image');
      const vedio = getSingleFilePath(req.files, 'vedio');

      const data = {
        ...req.body,
        image,
        vedio,
      };

      const result = await exerciseService.createExercise(data);

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.CREATED,
        message: 'Exercise created successfully',
        data: result,
      });
    }
  );

  /**
   * Get all exercises with pagination, search, filter by musalCategory
   * GET /api/v1/exercises
   */
  getAllExercises = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { page = '1', limit = '10', search, musalCategory } = req.query;

      const result = await exerciseService.getAllExercises(
        Number(page),
        Number(limit),
        search as string,
        musalCategory as string
      );

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Exercises fetched successfully',
        data: result,
      });
    }
  );

  /**
   * Get exercise by ID
   * GET /api/v1/exercises/:id
   */
  getExerciseById = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await exerciseService.getExerciseById(req.params.id);

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Exercise fetched successfully',
        data: result,
      });
    }
  );

  /**
   * Update exercise by ID
   * PUT /api/v1/exercises/:id
   */
  updateExercise = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const image = getSingleFilePath(req.files, 'image');
      const vedio = getSingleFilePath(req.files, 'vedio');

      const data = {
        ...req.body,
        ...(image && { image }),
        ...(vedio && { vedio }),
      };

      const result = await exerciseService.updateExercise(req.params.id, data);

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Exercise updated successfully',
        data: result,
      });
    }
  );

  /**
   * Delete exercise by ID
   * DELETE /api/v1/exercises/:id
   */
  deleteExercise = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await exerciseService.deleteExercise(req.params.id);

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Exercise deleted successfully',
        data: result,
      });
    }
  );
}
