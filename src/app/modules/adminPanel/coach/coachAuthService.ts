import bcrypt from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';
import { JwtPayload, Secret } from 'jsonwebtoken';
import {
  IAuthResetPassword,
  IChangePassword,
  ILoginData,
  IVerifyEmail,
} from '../../../../types/auth';
import { CoachModel } from './coachModel';
import ApiError from '../../../../errors/ApiError';
import { jwtHelper } from '../../../../helpers/jwtHelper';
import config from '../../../../config';
import generateOTP from '../../../../util/generateOTP';
import { emailTemplate } from '../../../../shared/emailTemplate';
import { emailHelper } from '../../../../helpers/emailHelper';
import cryptoToken from '../../../../util/cryptoToken';
import { ResetToken } from '../../resetToken/resetToken.model';
import { NotificationService } from '../../notification/notification.service';
import { ICoach } from './coachInterface';
import unlinkFile from '../../../../shared/unlinkFile';

export class CoachAuthService {
  /**
   * Login coach with email and password
   * @param payload Login credentials
   * @returns JWT token
   */
  async loginCoachFromDB(payload: ILoginData) {
    const { email, password, fcmToken } = payload;

    // Find coach by email with password field
    const isExistCoach = await CoachModel.findOne({ email }).select(
      '+password'
    );
    if (!isExistCoach) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Coach doesn't exist!");
    }

    // if (!fcmToken) {
    //   throw new ApiError(StatusCodes.BAD_REQUEST, 'FCM token Needed!');
    // }

    // Check if password matches
    if (
      password &&
      !(await CoachModel.isMatchPassword(password, isExistCoach.password))
    ) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Password is incorrect!');
    }

    // Update last active timestamp
    await CoachModel.findByIdAndUpdate(isExistCoach._id, {
      lastActive: new Date(),
      isActive: 'Active',
    });

    // Create JWT token
    const createToken = jwtHelper.createToken(
      {
        id: isExistCoach._id,
        role: isExistCoach.role,
        email: isExistCoach.email,
        name: isExistCoach.name,
      },
      config.jwt.jwt_secret as Secret,
      config.jwt.jwt_expire_in as string
    );

    // Remove sensitive data from response
    const {
      password: coachPassword,
      authentication,
      ...coachData
    } = isExistCoach.toObject();
    // 2️⃣ Save FCM token if provided
    if (fcmToken && isExistCoach.role !== 'SUPER_ADMIN') {
      console.log('Notification running');
      isExistCoach.fcmToken = fcmToken;
      await isExistCoach.save();
    }
    const role = isExistCoach.role;
    return {
      token: createToken,
      role: role,
    };
  }

  /**
   * Send OTP for password reset
   * @param email Coach email
   * @returns Success message
   */
  async forgetPasswordToDB(email: string) {
    const isExistUser = await CoachModel.isExistCoachByEmail(email);
    if (!isExistUser) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }

    //send mail
    const otp = generateOTP();
    const value = {
      otp,
      email: isExistUser.email,
    };
    const forgetPassword = emailTemplate.resetPassword(value);
    emailHelper.sendEmail(forgetPassword);

    //save to DB
    const authentication = {
      oneTimeCode: otp,
      expireAt: new Date(Date.now() + 3 * 60000),
    };
    await CoachModel.findOneAndUpdate({ email }, { $set: { authentication } });
  }

  /**
   * Verify email with OTP
   * @param payload Email and OTP
   * @returns Verification result
   */
  async verifyEmailToDB(payload: IVerifyEmail) {
    const { email, oneTimeCode } = payload;
    const isExistUser = await CoachModel.findOne({ email }).select(
      '+authentication'
    );
    if (!isExistUser) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }

    if (!oneTimeCode) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Please give the otp, check your email we send a code'
      );
    }
    console.log(oneTimeCode);
    console.log(isExistUser.authentication?.oneTimeCode);

    if (isExistUser.authentication?.oneTimeCode !== Number(oneTimeCode)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'You provided wrong otp');
    }

    const date = new Date();
    if (date > isExistUser.authentication?.expireAt) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Otp already expired, Please try again'
      );
    }

    let message;
    let data;

    if (!isExistUser.verified) {
      await CoachModel.findOneAndUpdate(
        { _id: isExistUser._id },
        {
          verified: true,
          authentication: { oneTimeCode: null, expireAt: null },
        }
      );
      message = 'Email verify successfully';
    } else {
      await CoachModel.findOneAndUpdate(
        { _id: isExistUser._id },
        {
          authentication: {
            isResetPassword: true,
            oneTimeCode: null,
            expireAt: null,
          },
        }
      );

      //create token ;
      const createToken = cryptoToken();
      await ResetToken.create({
        user: isExistUser._id,
        token: createToken,
        expireAt: new Date(Date.now() + 5 * 60000),
      });
      message =
        'Verification Successful: Please securely store and utilize this code for reset password';
      data = createToken;
    }
    return { data, message };
  }

  /**
   * Reset password using reset token
   * @param token Reset token
   * @param payload New password details
   * @returns Success message
   */
  async resetPasswordToDB(token: string, payload: IAuthResetPassword) {
    const { newPassword, confirmPassword } = payload;
    //isExist token
    const isExistToken = await ResetToken.isExistToken(token);
    if (!isExistToken) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'You are not authorized');
    }

    //user permission check
    const isExistUser = await CoachModel.findById(isExistToken.user).select(
      '+authentication'
    );
    if (!isExistUser?.authentication?.isResetPassword) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "You don't have permission to change the password. Please click again to 'Forgot Password'"
      );
    }

    //validity check
    const isValid = await ResetToken.isExpireToken(token);
    if (!isValid) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Token expired, Please click again to the forget password'
      );
    }

    //check password
    if (newPassword !== confirmPassword) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "New password and Confirm password doesn't match!"
      );
    }

    const hashPassword = await bcrypt.hash(
      newPassword,
      Number(config.bcrypt_salt_rounds)
    );

    const updateData = {
      password: hashPassword,
      authentication: {
        isResetPassword: false,
      },
    };

    await CoachModel.findOneAndUpdate({ _id: isExistToken.user }, updateData, {
      new: true,
    });
  }

  /**
   * Change password for authenticated coach
   * @param user JWT payload
   * @param payload Password change details
   * @returns Success message
   */
  async changePasswordToDB(user: JwtPayload, payload: IChangePassword) {
    const { currentPassword, newPassword, confirmPassword } = payload;

    // Find coach with password
    const isExistCoach = await CoachModel.findById(user.id).select('+password');
    if (!isExistCoach) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Coach doesn't exist!");
    }

    // Verify current password
    if (
      currentPassword &&
      !(await CoachModel.isMatchPassword(
        currentPassword,
        isExistCoach.password
      ))
    ) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Current password is incorrect'
      );
    }

    // Check if new password is different from current
    if (currentPassword === newPassword) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'New password must be different from current password'
      );
    }

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "New password and confirm password don't match"
      );
    }

    // Hash new password
    const hashPassword = await bcrypt.hash(
      newPassword,
      Number(config.bcrypt_salt_rounds)
    );

    // Update password
    const updateData = {
      password: hashPassword,
    };

    await CoachModel.findByIdAndUpdate(user.id, updateData, { new: true });

    return { message: 'Password changed successfully' };
  }

  /**
   * Get current coach profile
   * @param user JWT payload
   * @returns Coach profile
   */
  async getProfile(user: JwtPayload) {
    const coach = await CoachModel.findById(user.id)
      .select('-password -authentication')
      .lean();

    if (!coach) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Coach not found');
    }

    return coach;
  }

  /**
   * Update coach profile
   * @param user JWT payload
   * @param updateData Profile update data
   * @returns Updated coach profile
   */
  async updateProfile(coachId: string, payload: Partial<ICoach>) {
    const isExistUser = await CoachModel.isExistCoachById(coachId);
    if (!isExistUser) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Athlete doesn't exist!");
    }

    //unlink file here
    if (payload.image) {
      unlinkFile(isExistUser.image);
    }

    const updateDoc = await CoachModel.findOneAndUpdate(
      { _id: coachId },
      { $set: payload },
      { new: true }
    );

    return updateDoc;
  }

  /**
   * Logout coach (optional - can be handled client-side)
   * @param user JWT payload
   * @returns Success message
   */
  async logoutCoach(user: JwtPayload) {
    // In a stateless JWT system, logout is handled client-side
    // But we can update last active timestamp
    await CoachModel.findByIdAndUpdate(user.id, {
      lastActive: new Date(),
      isActive: 'In-Active',
    });

    return { message: 'Logged out successfully' };
  }

  /**
   * Request email verification OTP
   * @param email Coach email
   * @returns Success message
   */
  async requestEmailVerification(email: string) {
    const isExistCoach = await CoachModel.isExistCoachByEmail(email);
    if (!isExistCoach) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Coach doesn't exist!");
    }

    // Check if already verified
    if (isExistCoach.verified) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already verified');
    }

    // Generate OTP
    const otp = generateOTP();

    // Prepare email content
    const value = {
      otp,
      email: isExistCoach.email,
      name: isExistCoach.name,
    };
    const verificationEmail = emailTemplate.resetPassword(value);

    // Send email
    emailHelper.sendEmail(verificationEmail);

    // Save OTP to database
    const authentication = {
      oneTimeCode: otp,
      expireAt: new Date(Date.now() + 10 * 60000), // 10 minutes expiry
    };

    await CoachModel.findOneAndUpdate({ email }, { $set: { authentication } });

    return {
      message: 'Verification OTP sent to your email',
      otp: process.env.NODE_ENV === 'development' ? otp : undefined,
    };
  }
}
