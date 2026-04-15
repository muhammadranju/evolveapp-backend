import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../../shared/catchAsync';
import sendResponse from '../../../../shared/sendResponse';
import { getSingleFilePath } from '../../../../shared/getFilePath';
import { CoachService } from './coachService';

const coachService = new CoachService();

export class CoachController {
  /**
   * Create a new coach
   * POST /api/v1/coaches
   */
  create = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      // Get image file path if uploaded
      let image = getSingleFilePath(req.files, 'image');
      const password = '123456789';
      // Prepare data for creation
      const data = {
        ...req.body,
        password,
        image,
      };

      // Create coach using service
      const result = await coachService.createCoach(data);

      // Send success response
      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.CREATED,
        message: 'Coach created successfully',
        data: result,
      });
    }
  );

  /**
   * Get all coaches with pagination
   * GET /api/v1/coaches
   */
  getAll = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      // Extract query parameters
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const { isActive, search, verified, ...otherFilters } = req.query;

      // Build filter object
      const filter: Record<string, any> = { ...otherFilters };

      if (isActive) filter.isActive = isActive;
      if (verified !== undefined) filter.verified = verified === 'true';
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }

      // Get coaches using service
      const result = await coachService.getAllCoaches(page, limit, filter);

      // Send success response
      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Coaches retrieved successfully',
        data: result.coaches,
      });
    }
  );

  /**
   * Get single coach by ID
   * GET /api/v1/coaches/:id
   */
  getById = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;

      // Get coach by ID using service
      const result = await coachService.getCoachById(id);

      // Check if coach exists
      if (!result) {
        return sendResponse(res, {
          success: false,
          statusCode: StatusCodes.NOT_FOUND,
          message: 'Coach not found',
          data: null,
        });
      }

      // Send success response
      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Coach retrieved successfully',
        data: result,
      });
    }
  );

  /**
   * Update coach by ID
   * PATCH /api/v1/coaches/:id
   */
  update = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;

      // Get image file path if uploaded
      let image = getSingleFilePath(req.files, 'image');

      // Prepare update data
      const updateData = {
        ...req.body,
        ...(image && { image }),
      };

      // Update coach using service
      const result = await coachService.updateCoach(id, updateData);

      // Check if coach exists
      if (!result) {
        return sendResponse(res, {
          success: false,
          statusCode: StatusCodes.NOT_FOUND,
          message: 'Coach not found',
          data: null,
        });
      }

      // Send success response
      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Coach updated successfully',
        data: result,
      });
    }
  );

  /**
   * Delete coach (soft delete)
   * DELETE /api/v1/coaches/:id
   */
  delete = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;

      // Delete coach using service
      const result = await coachService.deleteCoach(id);

      // Check if coach exists
      if (!result) {
        return sendResponse(res, {
          success: false,
          statusCode: StatusCodes.NOT_FOUND,
          message: 'Coach not found',
          data: null,
        });
      }

      // Send success response
      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Coach deleted successfully',
        data: result,
      });
    }
  );

  /**
   * Verify coach account
   * PATCH /api/v1/coaches/:id/verify
   */
  verifyCoach = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const { verified } = req.body;

      // Update verification status using service
      const result = await coachService.updateVerificationStatus(id, verified);

      // Check if coach exists
      if (!result) {
        return sendResponse(res, {
          success: false,
          statusCode: StatusCodes.NOT_FOUND,
          message: 'Coach not found',
          data: null,
        });
      }

      const message = verified
        ? 'Coach verified successfully'
        : 'Coach unverified successfully';

      // Send success response
      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message,
        data: result,
      });
    }
  );

  /**
   * Update coach last active timestamp
   * PATCH /api/v1/coaches/:id/last-active
   */
  updateLastActive = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;

      // Update last active timestamp using service
      const result = await coachService.updateLastActive(id);

      // Check if coach exists
      if (!result) {
        return sendResponse(res, {
          success: false,
          statusCode: StatusCodes.NOT_FOUND,
          message: 'Coach not found',
          data: null,
        });
      }

      // Send success response
      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Last active timestamp updated successfully',
        data: result,
      });
    }
  );

  /**
   * Change coach password
   * PATCH /api/v1/coaches/:id/change-password
   */
  changePassword = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const { currentPassword, newPassword } = req.body;

      // Change password using service
      const result = await coachService.changePassword(
        id,
        currentPassword,
        newPassword
      );

      // Send success response
      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Password changed successfully',
        data: result,
      });
    }
  );

  /**
   * Request password reset
   * POST /api/v1/coaches/request-password-reset
   */
  requestPasswordReset = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { email } = req.body;

      // Generate one-time code (6 digits)
      const oneTimeCode = Math.floor(100000 + Math.random() * 900000);
      const expireAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

      // Set reset password data
      const result = await coachService.setResetPasswordData(
        email,
        oneTimeCode,
        expireAt
      );

      if (!result) {
        return sendResponse(res, {
          success: false,
          statusCode: StatusCodes.NOT_FOUND,
          message: 'Coach not found',
          data: null,
        });
      }

      // TODO: Send email with oneTimeCode
      // This is where you would integrate your email service

      // Send success response
      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Password reset code sent to email',
        data: {
          // In production, don't send the code in response
          // This is for testing purposes only
          oneTimeCode:
            process.env.NODE_ENV === 'development' ? oneTimeCode : undefined,
          expiresIn: '15 minutes',
        },
      });
    }
  );

  /**
   * Reset password using code
   * POST /api/v1/coaches/reset-password
   */
  resetPassword = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { email, oneTimeCode, newPassword } = req.body;

      // Reset password using service
      const result = await coachService.resetPassword(
        email,
        oneTimeCode,
        newPassword
      );

      // Send success response
      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Password reset successfully',
        data: result,
      });
    }
  );
}
