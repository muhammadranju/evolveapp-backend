import { Types } from 'mongoose';

interface EnergyAndWellBeing {
  energyLevel: number;
  stressLevel: number;
  muscelLevel: number;
  mood: number;
  motivation: number;
  bodyTemperature: string;
}

interface Training {
  trainingCompleted: boolean;
  trainingPlan: string[]; // or a specific object type
  cardioCompleted: boolean;
  cardioType: string;
  duration: string;
}

interface Nutrition {
  calories: number;
  carbs: number;
  protein: number;
  fats: number;
  hungerLevel: number;
  digestionLevel: number;
  salt: number;
}

interface Woman {
  cyclePhase: string;
  cycleDay: string;
  pmsSymptoms: number;
  cramps: number;
  symptoms: string[];
}

interface Ped {
  dailyDosage: string;
  sideEffect: string;
}

interface BloodPressure {
  systolic: string;
  diastolic: string;
  restingHeartRate: string;
  bloodGlucose: string;
}

export interface DailyData {
  _id?: Types.ObjectId;
  date: string;
  userId: Types.ObjectId;
  weight: number;
  sleepHour: number;
  sleepQuality: string;
  sick: boolean;
  water: string;
  energyAndWellBeing: EnergyAndWellBeing;
  training: Training;
  activityStep: number;
  nutrition: Nutrition;
  woman: Woman;
  ped: Ped;
  bloodPressure: BloodPressure;
  dailyNotes: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Averages {
  avgWeight: number;
  avgProtein: number;
  avgFats: number;
  avgCarbs: number;
  avgCalories: number;
  avgActivityStep: number;
  avgCardioPerMin: number;
}

export interface TimelineHistory {
  userId: Types.ObjectId | string;
  phase: string;
  checkInDate: string;
  nextCheckInDate: string;
  dailyData: DailyData[];
  averages: {
    trainingDay: Averages | null;
    restDay: Averages | null;
  };
}
