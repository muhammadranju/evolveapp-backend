import mongoose, { Schema, Types, Document } from 'mongoose';
import {
  IPushData,
  ITime,
  ITrainingPushDayHistory,
} from './trainigplan.history.interface';

const TimeSchema = new Schema<ITime>(
  {
    hour: {
      type: String,
      required: true,
    },
    minite: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);
const PushDataSchema = new Schema<IPushData>(
  {
    weight: { type: Number, required: true },
    repRange: { type: String, required: true },
    rir: { type: String, required: true },
    set: { type: Number, required: true },
    exerciseName: { type: String },
  },
  { _id: false }
);

const TrainingPushDayHistorySchema = new Schema<ITrainingPushDayHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'Athlete',
      required: true,
      index: true,
    },
    trainingName: { type: String, required: true, trim: true },
    time: { type: TimeSchema, required: true },
    pushData: { type: [PushDataSchema], required: true },
    note: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

export const TrainingPushDayHistoryModel =
  mongoose.model<ITrainingPushDayHistory>(
    'TrainingPushDayHistory',
    TrainingPushDayHistorySchema
  );
