import { Types } from 'mongoose';
export interface ITime {
  hour: string;
  minite: string;
}
export interface IPushData {
  rep: number;
  weight: number;
  repRange: string;
  rir: string;
  exerciseName: string;
  sets: number;
  exerciseNote: string;
  dateTime: string;
}

export interface ITrainingPushDayHistory {
  userId: Types.ObjectId;
  trainingName: string;
  time: ITime;
  pushData: IPushData[];
  note: string;
  dateTime: string;
}
