import { Schema, model } from 'mongoose';

const WeeklyAverageSchema = new Schema(
  {
    userId: { type: String, required: true },
    coachId: { type: String, required: true },
    weekNumber: { type: Number, required: true },
    weight: {
      type: Number,
      required: true,
    },

    sleepHour: {
      type: Number,
      required: true,
    },

    sleepQuality: {
      type: Number,
      required: true,
    },

    activityStep: {
      type: Number,
      required: true,
    },

    energyAndWellBeing: {
      energyLevel: { type: Number, required: true },
      stressLevel: { type: Number, required: true },
      muscelLevel: { type: Number, required: true },
      mood: { type: Number, required: true },
      motivation: { type: Number, required: true },
      bodyTemperature: { type: Number, required: true },
    },

    nutrition: {
      calories: { type: Number, required: true },
      carbs: { type: Number, required: true },
      protein: { type: Number, required: true },
      fats: { type: Number, required: true },
      hungerLevel: { type: Number, required: true },
      digestionLevel: { type: Number, required: true },
      salt: { type: Number, required: true },
    },

    training: {
      cardioDuration: {
        type: Number,
        required: true,
      },
    },

    woman: {
      pmsSymptoms: { type: Number },
      cramps: { type: Number },
    },

    bloodPressure: {
      systolic: { type: Number, required: true },
      diastolic: { type: Number, required: true },
      restingHeartRate: { type: Number, required: true },
      bloodGlucose: { type: Number, required: true },
    },
  },
  { timestamps: true }
);

export const WeeklyAverageModel = model(
  'WeeklyAverageReport',
  WeeklyAverageSchema
);
