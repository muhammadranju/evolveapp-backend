import bcrypt from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';
import { JwtPayload, Secret } from 'jsonwebtoken';
import {
  IAuthResetPassword,
  IChangePassword,
  ILoginData,
  IVerifyEmail,
} from '../../../../types/auth';
import ApiError from '../../../../errors/ApiError';
import { jwtHelper } from '../../../../helpers/jwtHelper';
import config from '../../../../config';
import generateOTP from '../../../../util/generateOTP';
import { emailTemplate } from '../../../../shared/emailTemplate';
import { emailHelper } from '../../../../helpers/emailHelper';
import cryptoToken from '../../../../util/cryptoToken';
import { ResetToken } from '../../resetToken/resetToken.model';
import { AthleteModel } from './athleteModel';
import { NotificationService } from '../../notification/notification.service';
import { IAthlete } from './athleteInterface';
import unlinkFile from '../../../../shared/unlinkFile';

export class AthleteAuthService {
  /**
   * Login athlete with email and password
   */
  async loginAthleteFromDB(payload: ILoginData) {
    const { email, password, fcmToken } = payload;

    const isExistAthlete = await AthleteModel.findOne({ email }).select(
      '+password',
    );
    if (!isExistAthlete) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Athlete doesn't exist!");
    }

    // if (!fcmToken) {
    //   throw new ApiError(StatusCodes.BAD_REQUEST, 'FCM token Needed!');
    // }

    if (!password) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Password is required!');
    }

    if (
      password &&
      !(await AthleteModel.isMatchPassword(password, isExistAthlete.password))
    ) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Password is incorrect!');
    }

    await AthleteModel.findByIdAndUpdate(isExistAthlete._id, {
      isActive: 'Active',
      lastActive: new Date(),
    });

    const createToken = jwtHelper.createToken(
      {
        id: isExistAthlete._id,
        email: isExistAthlete.email,
        name: isExistAthlete.name,
        role: isExistAthlete.role,
      },
      config.jwt.jwt_secret as Secret,
      config.jwt.jwt_expire_in as string,
    );

    const { password: athletePassword, ...athleteData } =
      isExistAthlete.toObject();

    // 2️⃣ Save FCM token if provided
    if (fcmToken && isExistAthlete.role == 'ATHLETE') {
      console.log('Notification running');
      isExistAthlete.fcmToken = fcmToken;
      await isExistAthlete.save();
    }

    return {
      token: createToken,
    };
  }

  /**
   * Send OTP for password reset
   * @param email Coach email
   * @returns Success message
   */
  async forgetPasswordToDB(email: string) {
    const isExistUser = await AthleteModel.isExistAthleteByEmail(email);
    if (!isExistUser) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Athlete doesn't exist!");
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
    await AthleteModel.findOneAndUpdate(
      { email },
      { $set: { authentication } },
    );
  }

  /**
   * Verify email with OTP
   * @param payload Email and OTP
   * @returns Verification result
   */
  async verifyEmailToDB(payload: IVerifyEmail) {
    const { email, oneTimeCode } = payload;
    const isExistUser = await AthleteModel.findOne({ email }).select(
      '+authentication',
    );
    if (!isExistUser) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Athlete doesn't exist!");
    }

    if (!oneTimeCode) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Please give the otp, check your email we send a code',
      );
    }
    console.log(oneTimeCode);
    console.log(isExistUser.authentication?.oneTimeCode);

    if (isExistUser.authentication?.oneTimeCode !== Number(oneTimeCode)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Athlete provided wrong otp');
    }

    const date = new Date();
    if (date > isExistUser.authentication?.expireAt) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Otp already expired, Please try again',
      );
    }

    let message;
    let data;

    if (!isExistUser.verified) {
      await AthleteModel.findOneAndUpdate(
        { _id: isExistUser._id },
        {
          verified: true,
          authentication: { oneTimeCode: null, expireAt: null },
        },
      );
      message = 'Email verify successfully';
    } else {
      await AthleteModel.findOneAndUpdate(
        { _id: isExistUser._id },
        {
          authentication: {
            isResetPassword: true,
            oneTimeCode: null,
            expireAt: null,
          },
        },
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
    const isExistUser = await AthleteModel.findById(isExistToken.user).select(
      '+authentication',
    );
    if (!isExistUser?.authentication?.isResetPassword) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "You don't have permission to change the password. Please click again to 'Forgot Password'",
      );
    }

    //validity check
    const isValid = await ResetToken.isExpireToken(token);
    if (!isValid) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Token expired, Please click again to the forget password',
      );
    }

    //check password
    if (newPassword !== confirmPassword) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "New password and Confirm password doesn't match!",
      );
    }

    const hashPassword = await bcrypt.hash(
      newPassword,
      Number(config.bcrypt_salt_rounds),
    );

    const updateData = {
      password: hashPassword,
      authentication: {
        isResetPassword: false,
      },
    };

    await AthleteModel.findOneAndUpdate(
      { _id: isExistToken.user },
      updateData,
      {
        new: true,
      },
    );
  }

  /**
   * Change password for authenticated athlete
   */
  async changePasswordToDB(user: JwtPayload, payload: IChangePassword) {
    const { currentPassword, newPassword, confirmPassword } = payload;

    const isExistAthlete = await AthleteModel.findById(user.id).select(
      '+password',
    );
    if (!isExistAthlete)
      throw new ApiError(StatusCodes.BAD_REQUEST, "Athlete doesn't exist!");

    if (
      currentPassword &&
      !(await AthleteModel.isMatchPassword(
        currentPassword,
        isExistAthlete.password,
      ))
    ) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Current password is incorrect',
      );
    }

    if (currentPassword === newPassword) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'New password must be different',
      );
    }

    if (newPassword !== confirmPassword) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Passwords don't match");
    }

    const hashPassword = await bcrypt.hash(
      newPassword,
      Number(config.bcrypt_salt_rounds),
    );

    await AthleteModel.findByIdAndUpdate(user.id, { password: hashPassword });

    return { message: 'Password changed successfully' };
  }

  /**
   * Get athlete profile
   */
  async getProfile(user: JwtPayload) {
    const athlete = await AthleteModel.findById(user.id)
      .select('-password -authentication')
      .lean();
    if (!athlete)
      throw new ApiError(StatusCodes.NOT_FOUND, 'Athlete not found');
    return athlete;
  }

  /**
   * Update athlete profile
   */
  async updateProfile(athleteId: string, payload: Partial<IAthlete>) {
    const isExistUser = await AthleteModel.isExistAthleteById(athleteId);
    if (!isExistUser) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Athlete doesn't exist!");
    }

    //unlink file here
    if (payload.image) {
      unlinkFile(isExistUser.image);
    }

    const updateDoc = await AthleteModel.findOneAndUpdate(
      { _id: athleteId },
      { $set: payload },
      { new: true },
    );

    return updateDoc;
  }

  /**
   * Logout athlete
   */
  async logoutAthlete(user: JwtPayload) {
    await AthleteModel.findByIdAndUpdate(user.id, {
      lastActive: new Date(),
      isActive: 'In-Active',
    });
    return { message: 'Logged out successfully' };
  }

  /**
   * Request email verification OTP
   */
  async requestEmailVerification(email: string) {
    const isExistAthlete = await AthleteModel.isExistAthleteByEmail(email);
    if (!isExistAthlete)
      throw new ApiError(StatusCodes.BAD_REQUEST, "Athlete doesn't exist!");
    if (isExistAthlete.verified)
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already verified');

    const otp = generateOTP();
    const value = {
      otp,
      email: isExistAthlete.email,
      name: isExistAthlete.name,
    };
    const verificationEmail = emailTemplate.resetPassword(value);

    emailHelper.sendEmail(verificationEmail);

    const authentication = {
      oneTimeCode: otp,
      expireAt: new Date(Date.now() + 10 * 60000),
    };
    await AthleteModel.findOneAndUpdate(
      { email },
      { $set: { authentication } },
    );

    return {
      message: 'Verification OTP sent to your email',
      otp: process.env.NODE_ENV === 'development' ? otp : undefined,
    };
  }
}
