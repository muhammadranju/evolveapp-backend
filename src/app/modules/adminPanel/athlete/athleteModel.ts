import { Schema, Types, model } from 'mongoose';
import { AthleteType, IAthlete } from './athleteInterface';
import { USER_ROLES } from '../../../../enums/user';
import config from '../../../../config';
import bcrypt from 'bcryptjs';
import ApiError from '../../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';

const athleteSchema = new Schema<IAthlete, AthleteType>(
  {
    name: { type: String, required: true },
    coachId: {
      type: String,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    dateOfBirth: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      select: 0,
      minlength: 8,
    },

    gender: { type: String, enum: ['Male', 'Female'], required: true },
    category: { type: String, required: true },
    phase: { type: String, required: true },

    weight: { type: Number, required: true },
    height: { type: Number, required: true },

    image: {
      type: String,
      default: 'https://i.ibb.co/z5YHLV9/profile.png',
    },
    notifiedThisWeek: { type: Boolean, default: false },
    fcmToken: { type: String },
    age: { type: Number, required: true },
    waterQuantity: { type: Number, required: true },

    status: { type: String, enum: ['Natural', 'Enhanced'], required: true },

    trainingDaySteps: { type: Number, required: true },
    restDaySteps: { type: Number, required: true },
    checkInDay: { type: String, required: true },
    goal: { type: String, required: true },
    verified: {
      type: Boolean,
      default: true,
    },
    lastCheckIn: { type: Date },
    isActive: {
      type: String,
      enum: ['Active', 'In-Active'],
      default: 'In-Active',
    },
    lastActive: { type: Date },
    shows: [
      {
        type: Schema.Types.ObjectId,
        ref: 'ShowManagement',
      },
    ],
    authentication: {
      type: {
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
      select: 0,
    },
  },
  { timestamps: true },
);

//exist user check
athleteSchema.statics.isExistAthleteById = async (id: string) => {
  const isExist = await AthleteModel.findById(id);
  return isExist;
};

athleteSchema.statics.isExistAthleteByEmail = async (email: string) => {
  const isExist = await AthleteModel.findOne({ email });
  return isExist;
};

//is match password
athleteSchema.statics.isMatchPassword = async (
  password: string,
  hashPassword: string,
): Promise<boolean> => {
  return await bcrypt.compare(password, hashPassword);
};

//check user
athleteSchema.pre('save', async function () {
  const user = this;
  console.log(user);
  // Check if email exists
  const isExist = await AthleteModel.findOne({ email: user.email });
  console.log(isExist);
  if (isExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already exists!');
  }

  // Hash password
  user.password = await bcrypt.hash(
    user.password,
    Number(config.bcrypt_salt_rounds),
  );
});

export const AthleteModel = model<IAthlete, AthleteType>(
  'Athlete',
  athleteSchema,
);

/** Get athletes whose checkDay matches today and haven't been notified */
export const getAthletesForToday = async (
  today: string,
): Promise<IAthlete[]> => {
  return AthleteModel.find({ checkDay: today, notifiedThisWeek: false });
};

/** Mark athlete as notified this week */
export const markNotificationSent = async (id: string): Promise<void> => {
  await AthleteModel.findByIdAndUpdate(id, { notifiedThisWeek: true });
};

/** Reset notifications for all athletes (weekly reset) */
export const resetWeeklyNotifications = async (): Promise<void> => {
  await AthleteModel.updateMany({}, { notifiedThisWeek: false });
};
