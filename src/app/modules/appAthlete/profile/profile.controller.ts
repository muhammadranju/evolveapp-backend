import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ProfileService } from './profile.service';
import catchAsync from '../../../../shared/catchAsync';
import sendResponse from '../../../../shared/sendResponse';
import { AthleteService } from '../../adminPanel/athlete/athleteservice';
import ApiError from '../../../../errors/ApiError';
import { Types } from 'mongoose';

const athleteService = new AthleteService();

export class ProfileController {
  async getProfileDetails(req: Request, res: Response) {
    try {
      const athleteId = req.user.id;
      console.log(athleteId);
      if (!athleteId)
        return res.status(400).json({ message: 'athleteId is required' });

      const data = await ProfileService.getAthleteDetails(athleteId);
      res.json({ success: true, data });
    } catch (error) {
      console.error('Error in getAthleteDetails:', error);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  }

  removeShow = catchAsync(async (req: Request, res: Response) => {
    const { athleteId, showId } = req.body;

    if (!athleteId || !showId) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'athleteId and showId are required',
      );
    }
    if (
      !Types.ObjectId.isValid(athleteId) ||
      !Types.ObjectId.isValid(showId)
    ) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid ObjectId format');
    }

    await athleteService.removeShow(athleteId, showId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Show removed successfully',
      data: null,
    });
  });
}

