import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { FoodItemService } from './food.service';
import catchAsync from '../../../../../shared/catchAsync';
import sendResponse from '../../../../../shared/sendResponse';

const foodService = new FoodItemService();

export class FoodItemController {
  /**
   * Add new food item
   * POST /api/v1/food-items
   */
  addFoodItem = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await foodService.createFoodItem(req.body);
      console.log(req.body);
      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.CREATED,
        message: 'Food item created successfully',
        data: result,
      });
    }
  );

  /**
   * Get all food items
   * GET /api/v1/food-items?search=&page=&limit=
   */
  getAllFoodItems = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { search, page, limit, filter } = req.query;
      const result = await foodService.getAllFoodItems(
        search as string,
        Number(page) || 1,
        Number(limit) || 10,
        filter as string
      );

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Food items retrieved successfully',
        data: result,
      });
    }
  );

  /**
   * Get food item by ID
   * GET /api/v1/food-items/:id
   */
  getFoodItemById = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await foodService.getFoodItemById(req.params.id);

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Food item retrieved successfully',
        data: result,
      });
    }
  );

  /**
   * Update food item by ID
   * PATCH /api/v1/food-items/:id
   */
  updateFoodItem = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await foodService.updateFoodItem(req.params.id, req.body);

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Food item updated successfully',
        data: result,
      });
    }
  );

  /**
   * Delete food item by ID
   * DELETE /api/v1/food-items/:id
   */
  deleteFoodItem = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await foodService.deleteFoodItem(req.params.id);

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Food item deleted successfully',
        data: result,
      });
    }
  );
}
