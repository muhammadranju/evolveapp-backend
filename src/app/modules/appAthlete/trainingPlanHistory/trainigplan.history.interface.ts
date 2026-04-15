import { Types } from 'mongoose';
export interface ITime {
  hour: string;
  minite: string;
}
export interface IPushData {
  reps: number;
  weight: number;
  repRange: string;
  rir: string;
  exerciseName: string;
  set: number;
}

export interface ITrainingPushDayHistory {
  userId: Types.ObjectId;
  trainingName: string;
  time: ITime;
  pushData: IPushData[];
  note: string;
}
