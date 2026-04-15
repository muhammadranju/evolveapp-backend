import mongoose, { Schema } from 'mongoose';
import { USER_ROLES } from '../../../../enums/user';
import { CoachType, ICoach } from './coachInterface';
import bcrypt from 'bcryptjs';
import config from '../../../../config';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../../errors/ApiError';

const coachSchema = new Schema<ICoach, CoachType>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.COACH,
      required: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    image: {
      type: String,
      default: 'https://i.ibb.co/z5YHLV9/profile.png',
    },
    verified: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: String,
      enum: ['Active', 'In-Active'],
      default: 'In-Active',
    },
    fcmToken: {
      type: String,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    authentication: {
      isResetPassword: {
        type: Boolean,
        default: false,
      },
      oneTimeCode: {
        type: Number,
        default: null,
      },
      expireAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

//exist user check
coachSchema.statics.isExistCoachById = async (id: string) => {
  const isExist = await CoachModel.findById(id);
  return isExist;
};

coachSchema.statics.isExistCoachByEmail = async (email: string) => {
  const isExist = await CoachModel.findOne({ email });
  return isExist;
};

//is match password
coachSchema.statics.isMatchPassword = async (
  password: string,
  hashPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashPassword);
};

//check user
coachSchema.pre('save', async function () {
  const user = this;

  // Check if email exists
  const isExist = await CoachModel.findOne({ email: user.email });
  if (isExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already exists!');
  }

  // Hash password
  user.password = await bcrypt.hash(
    user.password,
    Number(config.bcrypt_salt_rounds)
  );
});

export const CoachModel = mongoose.model<ICoach, CoachType>(
  'Coach',
  coachSchema
);
