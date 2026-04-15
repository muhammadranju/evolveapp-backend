import { Schema, model } from 'mongoose';
import { IExercise, MuscleCategory } from './exercise.interface';

const ExerciseSchema = new Schema<IExercise>(
  {
    coachId: { type: String, required: true },
    name: { type: String, required: true },

    musal: { type: String, required: true },

    difficulty: { type: String, required: true },

    equipment: { type: String, required: true },

    description: { type: String, required: true },

    subCategory: {
      type: [String],
      enum: Object.values(MuscleCategory),
      required: true,
    },

    image: { type: String, required: true },

    video: { type: String, required: true },
  },
  { timestamps: true }
);

export const ExerciseModel = model<IExercise>('CoachExercise', ExerciseSchema);
