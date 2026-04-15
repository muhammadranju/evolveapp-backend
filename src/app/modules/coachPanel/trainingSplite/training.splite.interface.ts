import { Types } from 'mongoose';

export interface ISplite {
  day: string;
  exerciseName: string;
}

export interface ITrainingSplite extends Document {
  userId: string;
  coachId: Types.ObjectId;
  splite: ISplite[];
}
