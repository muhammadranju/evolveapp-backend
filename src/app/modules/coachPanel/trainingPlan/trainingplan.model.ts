import { model, Schema } from "mongoose";
import { IExercise, ITrainingPlan, ITrainingPlanSets } from "./trainingplan.interface";

const TrainingPlanSetsSchema = new Schema<ITrainingPlanSets>(
  {
    sets: {
      type: String,
      required: true,
      trim: true,
    },
    repRange: {
      type: String,
      required: true,
      trim: true,
    },
    rir: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false } // No separate _id for each set
);

/* ================================
   🔹 Sub Schema: Exercise
================================ */

const ExerciseSchema = new Schema<IExercise>(
  {
    exerciseName: {
      type: String,
      required: true,
      trim: true,
    },
    excerciseNote: {
      type: String,
      default: "",
      trim: true,
    },
    exerciseSets: {
      type: [TrainingPlanSetsSchema],
      required: true,
    },
  },
  {
    _id: true, // Each exercise will have its own Mongo _id
  }
);

/* ================================
   🔹 Main Training Plan Schema
================================ */

const TrainingPlanSchema = new Schema<ITrainingPlan>(
  {
    userId: {
      type: String,
      required: true,
    },
    coachId: {
      type: Schema.Types.ObjectId,
      ref: "Coach",
      required: true,
    },
    traingPlanName: {
      type: String,
      required: true,
      trim: true,
    },
    dificulty: {
      type: String,
      required: true,
      trim: true,
    },
    comment: {
      type: String,
      default: "",
      trim: true,
    },
    exercise: {
      type: [ExerciseSchema],
      required: true,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

/* ================================
   🔹 Model Export
================================ */

export const TrainingPlanModel = model<ITrainingPlan>(
  "TrainingPlanForAthlete",
  TrainingPlanSchema
);