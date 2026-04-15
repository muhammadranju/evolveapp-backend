import mongoose, { Schema, Types } from 'mongoose';
import { ISplite, ITrainingSplite } from './training.splite.interface';

const SpliteSchema = new Schema<ISplite>(
  {
    day: {
      type: String,
      required: true,
      trim: true,
    },
    exerciseName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

/* Training Splite Schema */
const TrainingSpliteSchema = new Schema<ITrainingSplite>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    coachId: {
      type: Types.ObjectId,
      ref: 'Coach',
      required: true,
    },
    splite: {
      type: [SpliteSchema],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const TrainingPlanSpliteModel = mongoose.model<ITrainingSplite>(
  'TrainingPlanSplite',
  TrainingSpliteSchema
);
