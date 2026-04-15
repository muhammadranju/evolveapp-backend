import { Schema, Types, model } from 'mongoose';
import {
  DailyTracking,
  TRAINING_PLAN_VALUES,
  CARDIO_TYPE_VALUES,
  CYCLE_PHASE_VALUES,
  WOMEN_SYMPTOMS_VALUES,
} from './daily.tracking.interface';

// =====================
// SUB SCHEMAS
// =====================

const EnergyAndWellBeingSchema = new Schema(
  {
    energyLevel: { type: Number, required: false },
    stressLevel: { type: Number, required: false },
    muscelLevel: { type: Number, required: false },
    mood: { type: Number, required: false },
    motivation: { type: Number, required: false },
    bodyTemperature: { type: String, required: false },
  },
  { _id: false },
);

const TrainingSchema = new Schema(
  {
    trainingCompleted: { type: Boolean, required: false },

    trainingPlan: {
      type: [String],
      enum: TRAINING_PLAN_VALUES,
      required: false,
    },

    cardioCompleted: { type: Boolean, required: false },

    cardioType: {
      type: String,
      enum: CARDIO_TYPE_VALUES,
      required: false,
    },

    duration: { type: String, required: false },
  },
  { _id: false },
);

const NutritionSchema = new Schema(
  {
    calories: { type: Number, required: false },
    carbs: { type: Number, required: false },
    protein: { type: Number, required: false },
    fats: { type: Number, required: false },
    hungerLevel: { type: Number, required: false },
    digestionLevel: { type: Number, required: false },
    salt: { type: Number, required: false },
  },
  { _id: false },
);

const WomanHealthSchema = new Schema(
  {
    cyclePhase: {
      type: String,
      enum: CYCLE_PHASE_VALUES,
      required: false,
    },

    cycleDay: { type: String, required: false },
    pmsSymptoms: { type: Number, required: false },
    cramps: { type: Number, required: false },

    symptoms: {
      type: [String],
      enum: WOMEN_SYMPTOMS_VALUES,
      required: false,
    },
  },
  { _id: false },
);

const MedicationSchema = new Schema(
  {
    dailyDosage: { type: String, required: false },
    sideEffect: { type: String, required: false },
  },
  { _id: false },
);

const BloodPressureSchema = new Schema(
  {
    systolic: { type: String, required: false },
    diastolic: { type: String, required: false },
    restingHeartRate: { type: String, required: false },
    bloodGlucose: { type: String, required: false },
  },
  { _id: false },
);

// =====================
// MAIN SCHEMA
// =====================

const DailyTrackingSchema = new Schema<DailyTracking>(
  {
    date: { type: String, required: false },
    userId: {
      type: String,
      required: false,
    },
    coachId: { type: String, required: false },
    weight: { type: Number, required: false },
    sleepHour: { type: Number, required: false },
    sleepQuality: { type: String, required: false },
    sick: { type: Boolean, required: false },
    water: { type: String, required: false },

    energyAndWellBeing: {
      type: EnergyAndWellBeingSchema,
      required: false,
    },

    training: {
      type: TrainingSchema,
      required: false,
    },

    activityStep: { type: Number, required: false },

    nutrition: {
      type: NutritionSchema,
      required: false,
    },

    woman: {
      type: WomanHealthSchema,
      required: false,
    },

    ped: {
      type: MedicationSchema,
      required: false,
    },

    bloodPressure: {
      type: BloodPressureSchema,
      required: false,
    },

    dailyNotes: { type: String, required: false },
  },
  { timestamps: true },
);

DailyTrackingSchema.index({ userId: 1, date: 1 }, { unique: false });

export const DailyTrackingModel = model<DailyTracking>(
  'DailyTracking',
  DailyTrackingSchema,
);
