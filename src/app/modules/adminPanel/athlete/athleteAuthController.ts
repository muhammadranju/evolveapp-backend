import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../../shared/catchAsync';
import sendResponse from '../../../../shared/sendResponse';
import { AthleteAuthService } from './athleteAuthService';
import { getSingleFilePath } from '../../../../shared/getFilePath';

const authService = new AthleteAuthService();

export class AuthleteController {
  /**
   * Login athlete
   * POST /api/v1/auth/login
   */
  login = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await authService.loginAthleteFromDB(req.body);

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Athlete logged in successfully',
        data: result,
      });
    }
  );

  /**
   * Request password reset OTP
   * POST /api/v1/auth/forgot-password
   */
  forgotPassword = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { email } = req.body;
      const result = await authService.forgetPasswordToDB(email);

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message:
          'Please check your email. We have sent you a one-time passcode (OTP).',
        data: result,
      });
    }
  );

  /**
   * Verify email with OTP
   * POST /api/v1/auth/verify-email
   */
  verifyEmail = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await authService.verifyEmailToDB(req.body);

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: result.message,
        data: result.data,
      });
    }
  );

  /**
   * Reset password with token
   * POST /api/v1/auth/reset-password/:token
   */
  resetPassword = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const token = req.headers.authorization;
      const { ...resetData } = req.body;
      const result = await authService.resetPasswordToDB(token!, req.body);

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Your password has been successfully reset.',
        data: result,
      });
    }
  );

  /**
   * Change password (authenticated)
   * PATCH /api/v1/auth/change-password
   */
  changePassword = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await authService.changePasswordToDB(req.user, req.body);

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: result.message,
        data: null,
      });
    }
  );

  /**
   * Get athlete profile
   * GET /api/v1/auth/profile
   */
  getProfile = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await authService.getProfile(req.user);

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Profile retrieved successfully',
        data: result,
      });
    }
  );

  /**
   * Update athlete profile
   * PATCH /api/v1/auth/profile
   */
  updateProfile = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const athleteId = req.user.id;

      const image = getSingleFilePath(req.files, 'image');
      const data = {
        image,
        ...req.body,
      };

      const result = await authService.updateProfile(athleteId, data);

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Profile updated successfully',
        data: result,
      });
    }
  );

  /**
   * Logout athlete
   * POST /api/v1/auth/logout
   */
  logout = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await authService.logoutAthlete(req.user);

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: result.message,
        data: null,
      });
    }
  );

  /**
   * Request email verification OTP
   * POST /api/v1/auth/request-verification
   */
  requestVerification = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { email } = req.body;
      const result = await authService.requestEmailVerification(email);

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: result.message,
        data: {
          otp: result.otp, // Only in development
        },
      });
    }
  );
}
