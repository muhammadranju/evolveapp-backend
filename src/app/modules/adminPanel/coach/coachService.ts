import { Types } from 'mongoose';
import { USER_ROLES } from '../../../../enums/user';
import ApiError from '../../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { CoachModel } from './coachModel';
import { ICoach } from './coachInterface';
import generateOTP from '../../../../util/generateOTP';
import { emailTemplate } from '../../../../shared/emailTemplate';
import { emailHelper } from '../../../../helpers/emailHelper';

export class CoachService {
  private model: typeof CoachModel;

  constructor() {
    this.model = CoachModel;
  }

  /**
   * Create a new coach
   * @param data Coach data
   * @returns Created coach
   */
  async createCoach(data: ICoach): Promise<ICoach> {
    try {
      // Check if email already exists
      const existingCoach = await this.model.isExistCoachByEmail(data.email);
      if (existingCoach) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already exists');
      }

      // Create coach with default role
      const coachData = {
        ...data,
        role: USER_ROLES.COACH,
      };

      const coach = await this.model.create(coachData);
      if (!coach) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create Athlete');
      }

      //send email
      const otp = generateOTP();
      const values = {
        name: coach.name,
        otp: otp,
        email: coach.email!,
      };
      const createAccountTemplate = emailTemplate.createAccount(values);
      emailHelper.sendEmail(createAccountTemplate);

      //save to DB
      const authentication = {
        oneTimeCode: otp,
        expireAt: new Date(Date.now() + 3 * 60000),
      };
      await this.model.findOneAndUpdate(
        { _id: coach._id },
        { $set: { authentication } }
      );

      return coach;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all coaches with pagination and filtering
   * @param page Page number
   * @param limit Items per page
   * @param filter Filter conditions
   * @returns Coaches with pagination metadata
   */
  async getAllCoaches(
    page: number = 1,
    limit: number = 10,
    filter: Record<string, any> = {}
  ) {
    try {
      const skip = (page - 1) * limit;

      const [coaches, total] = await Promise.all([
        this.model
          .find(filter)
          .select('-password -authentication')
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 })
          .lean(),
        this.model.countDocuments(filter),
      ]);

      return {
        coaches,
        meta: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get single coach by ID
   * @param id Coach ID
   * @returns Coach document
   */
  async getCoachById(id: string): Promise<ICoach | null> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid coach ID');
      }

      const coach = await this.model
        .findById(id)
        .select('-password -authentication')
        .lean();

      return coach;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get coach by email
   * @param email Coach email
   * @returns Coach document
   */
  async getCoachByEmail(email: string): Promise<ICoach | null> {
    try {
      const coach = await this.model
        .findOne({ email })
        .select('-password -authentication')
        .lean();

      return coach;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update coach by ID
   * @param id Coach ID
   * @param updateData Data to update
   * @returns Updated coach
   */
  async updateCoach(
    id: string,
    updateData: Partial<ICoach>
  ): Promise<ICoach | null> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid coach ID');
      }

      // Check if coach exists
      const existingCoach = await this.model.isExistCoachById(id);
      if (!existingCoach) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Coach not found');
      }

      // Remove password and email from update data (these should be updated separately)
      const { password, email, ...safeUpdateData } = updateData;

      const coach = await this.model
        .findByIdAndUpdate(
          id,
          { $set: safeUpdateData },
          { new: true, runValidators: true }
        )
        .select('-password -authentication')
        .lean();

      return coach;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete coach (soft delete by setting isActive to 'In-Active')
   * @param id Coach ID
   * @returns Updated coach
   */
  async deleteCoach(id: string): Promise<ICoach | null> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid coach ID');
      }

      // Check if coach exists
      const existingCoach = await this.model.isExistCoachById(id);
      if (!existingCoach) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Coach not found');
      }

      const coach = await this.model.findByIdAndDelete(id);

      return coach;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update coach verification status
   * @param id Coach ID
   * @param verified Verification status
   * @returns Updated coach
   */
  async updateVerificationStatus(
    id: string,
    verified: boolean
  ): Promise<ICoach | null> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid coach ID');
      }

      // Check if coach exists
      const existingCoach = await this.model.isExistCoachById(id);
      if (!existingCoach) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Coach not found');
      }

      const coach = await this.model
        .findByIdAndUpdate(id, { $set: { verified } }, { new: true })
        .select('-password -authentication')
        .lean();

      return coach;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update coach last active timestamp
   * @param id Coach ID
   * @returns Updated coach
   */
  async updateLastActive(id: string): Promise<ICoach | null> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid coach ID');
      }

      // Check if coach exists
      const existingCoach = await this.model.isExistCoachById(id);
      if (!existingCoach) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Coach not found');
      }

      const coach = await this.model
        .findByIdAndUpdate(
          id,
          { $set: { lastActive: new Date() } },
          { new: true }
        )
        .select('-password -authentication')
        .lean();

      return coach;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Change coach password
   * @param id Coach ID
   * @param currentPassword Current password
   * @param newPassword New password
   * @returns Success status
   */
  async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid coach ID');
      }

      // Get coach with password
      const coach = await this.model.findById(id);
      if (!coach) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Coach not found');
      }

      // Verify current password
      const isMatch = await this.model.isMatchPassword(
        currentPassword,
        coach.password
      );
      if (!isMatch) {
        throw new ApiError(
          StatusCodes.UNAUTHORIZED,
          'Current password is incorrect'
        );
      }

      // Update password
      coach.password = newPassword;
      await coach.save();

      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Set reset password authentication data
   * @param email Coach email
   * @param oneTimeCode One time code
   * @param expireAt Expiration time
   * @returns Success status
   */
  async setResetPasswordData(
    email: string,
    oneTimeCode: number,
    expireAt: Date
  ): Promise<boolean> {
    try {
      const coach = await this.model.findOneAndUpdate(
        { email },
        {
          $set: {
            'authentication.isResetPassword': true,
            'authentication.oneTimeCode': oneTimeCode,
            'authentication.expireAt': expireAt,
          },
        },
        { new: true }
      );

      return !!coach;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reset password using one-time code
   * @param email Coach email
   * @param oneTimeCode One time code
   * @param newPassword New password
   * @returns Success status
   */
  async resetPassword(
    email: string,
    oneTimeCode: number,
    newPassword: string
  ): Promise<boolean> {
    try {
      const coach = await this.model.findOne({ email });
      if (!coach) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Coach not found');
      }

      // Check if reset password is requested and code is valid
      if (
        !coach.authentication?.isResetPassword ||
        coach.authentication.oneTimeCode !== oneTimeCode ||
        !coach.authentication.expireAt ||
        coach.authentication.expireAt < new Date()
      ) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'Invalid or expired reset code'
        );
      }

      // Update password and clear reset data
      coach.password = newPassword;
      coach.authentication.isResetPassword = false;
      coach.authentication.oneTimeCode = null as any;
      coach.authentication.expireAt = null as any;

      await coach.save();

      return true;
    } catch (error) {
      throw error;
    }
  }
}
