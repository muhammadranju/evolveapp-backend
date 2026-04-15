import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AthleteService } from './athleteservice';
import catchAsync from '../../../../shared/catchAsync';
import sendResponse from '../../../../shared/sendResponse';
import {
  getSingleFilePath,
  normalizeAthleteInput,
} from '../../../../shared/getFilePath';
import calculateAgeFlexible from '../../../../helpers/calculateAgeFlexible';

const athleteService = new AthleteService();

export class AthleteController {
  create = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      let image = getSingleFilePath(req.files, 'image');

      const coachId = req.user.role === 'COACH' ? req.user.id : '';
      const reqData = req.body;
      const { dateOfBirth } = reqData;
      const age = calculateAgeFlexible(dateOfBirth);

      const password = '123456789';
      const data = {
        coachId,
        ...reqData,
        password,
        dateOfBirth,
        age,
        image,
      };
      console.log(data);
      const result = await athleteService.createAthlete(data);

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.CREATED,
        message: 'Athlete created successfully',
        data: result,
      });
    },
  );

  getAll = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await athleteService.getAllAthletes();
      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'All athletes fetched successfully',
        data: result,
      });
    },
  );
  getSingleProfile = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await athleteService.getSingleProfile(
        req.params.id as string,
      );
      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Profile data retrieved successfully',
        data: result,
      });
    },
  );

  getAllByCoach = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const coachId = req.user.id;
      const result = await athleteService.getAllAthletesByCoachId(coachId);
      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'All athletes fetched successfully',
        data: result,
      });
    },
  );

  getOne = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await athleteService.getAthleteById(req.params.id);

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Single athlete fetched successfully',
        data: result,
      });
    },
  );

  update = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      let image = getSingleFilePath(req.files, 'image');
      const data = {
        ...req.body,
        image,
      };

      const result = await athleteService.updateAthlete(req.params.id, data);
      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Athlete updated successfully',
        data: result,
      });
    },
  );
  // delete athlete
  delete = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await athleteService.deleteAthlete(req.params.id);

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Athlete deleted successfully',
        data: result,
      });
    },
  );

  //update check in date
  checkIn = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await athleteService.checkIn(req.params.id);

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Check-in updated successfully',
        data: result,
      });
    },
  );

  //Update the athlete status..
  updateStatus = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const id = req.user.id;
      const result = await athleteService.updateActiveStatus(id);
      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Athlete status updated successfully',
        data: result,
      });
    },
  );

  //get athlete profile from db...
  getAthleteProfile = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const result = await athleteService.getUserProfileFromDB(user);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Profile data retrieved successfully',
      data: result,
    });
  });

  //update profile of the athlete
  updateProfile = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const user = req.user;
      let image = getSingleFilePath(req.files, 'image');
      const data = {
        image,
        ...req.body,
      };
      const result = await athleteService.updateProfileToDB(user, data);

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Profile updated successfully',
        data: result,
      });
    },
  );
}
