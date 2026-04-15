import { Model } from 'mongoose';
import { USER_ROLES } from '../../../../enums/user';

export interface ICoach {
  name: string;
  role?: USER_ROLES;
  email: string;
  password: string;
  image?: string;
  verified: boolean;
  isActive: 'Active' | 'In-Active';
  lastActive?: Date;
  authentication?: {
    isResetPassword: boolean;
    oneTimeCode: number;
    expireAt: Date;
  };
  fcmToken?: string;
}

export type CoachType = {
  isExistCoachById(id: string): any;
  isExistCoachByEmail(email: string): any;
  isMatchPassword(password: string, hashPassword: string): boolean;
} & Model<ICoach>;
