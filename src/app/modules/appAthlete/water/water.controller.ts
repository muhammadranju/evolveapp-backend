import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { WaterService } from './water.service';
import catchAsync from '../../../../shared/catchAsync';
import sendResponse from '../../../../shared/sendResponse';

const createWater = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ...waterData } = req.body;
    const userId = req.user?.id;

    const result = await WaterService.createWaterToDB({
      ...waterData,
      userId,
      date: waterData.date,
    });

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Water record created successfully',
      data: result,
    });
  },
);

const getAllWater = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const date = req.query.date as string;
  const result = await WaterService.getAllWaterFromDB(userId, date);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Water records retrieved successfully',
    data: result,
  });
});

const getSingleWater = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await WaterService.getSingleWaterFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Water record retrieved successfully',
    data: result,
  });
});

const updateWater = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await WaterService.updateWaterInDB(id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Water record updated successfully',
    data: result,
  });
});

const deleteWater = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await WaterService.deleteWaterFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Water record deleted successfully',
    data: result,
  });
});

export const WaterController = {
  createWater,
  getAllWater,
  getSingleWater,
  updateWater,
  deleteWater,
};
