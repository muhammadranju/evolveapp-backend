import { Schema, model, Types } from 'mongoose';

const DailyDataSchema = new Schema(
  {
    date: { type: String, required: true },
    userId: { type: Types.ObjectId, required: true, ref: 'Athlete' },
    weight: Number,
    sleepHour: Number,
    sleepQuality: String,
    sick: Boolean,
    water: String,
    energyAndWellBeing: {
      energyLevel: Number,
      stressLevel: Number,
      muscelLevel: Number,
      mood: Number,
      motivation: Number,
      bodyTemperature: String,
    },
    training: {
      trainingCompleted: Boolean,
      trainingPlan: [Schema.Types.Mixed],
      cardioCompleted: Boolean,
      cardioType: String,
      duration: String,
    },
    activityStep: Number,
    nutrition: {
      calories: Number,
      carbs: Number,
      protein: Number,
      fats: Number,
      hungerLevel: Number,
      digestionLevel: Number,
      salt: Number,
    },
    woman: {
      cyclePhase: String,
      cycleDay: String,
      pmsSymptoms: Number,
      cramps: Number,
      symptoms: [String],
    },
    ped: {
      dailyDosage: String,
      sideEffect: String,
    },
    bloodPressure: {
      systolic: String,
      diastolic: String,
      restingHeartRate: String,
      bloodGlucose: String,
    },
    dailyNotes: String,
  },
  { _id: false }
);

const TimelineHistorySchema = new Schema(
  {
    userId: { type: Types.ObjectId, required: true, ref: 'Athlete' },
    phase: String,
    checkInDate: String,
    nextCheckInDate: String,
    dailyData: [DailyDataSchema],
    averages: {
      trainingDay: {
        avgWeight: Number,
        avgProtein: Number,
        avgFats: Number,
        avgCarbs: Number,
        avgCalories: Number,
        avgActivityStep: Number,
        avgCardioPerMin: Number,
      },
      restDay: {
        avgWeight: Number,
        avgProtein: Number,
        avgFats: Number,
        avgCarbs: Number,
        avgCalories: Number,
        avgActivityStep: Number,
        avgCardioPerMin: Number,
      },
    },
  },
  { timestamps: true }
);

TimelineHistorySchema.index({ userId: 1, checkInDate: 1 }, { unique: true });

export const TimelineHistoryModel = model(
  'TimelineHistory',
  TimelineHistorySchema
);
