

// =====================
// ENUM VALUES (RUNTIME SAFE)
// =====================

export const TRAINING_PLAN_VALUES: string[] = [];

export const CARDIO_TYPE_VALUES = [
  'WALKING',
  'CYCLING',
  'RUNNING',
  'SWIMMING',
  'ROWING',
  'HIKING',
  'JUMP_ROPE',
  'CROSSTRAINER',
  'STAIRMASTER',
  'OTHER',
] as const;

export const CYCLE_PHASE_VALUES = [
  'FOLLICULAR',
  'OVULATION',
  'LUTEAL',
  'MENSTRUATION',
] as const;

export const WOMEN_SYMPTOMS_VALUES = [
  'EVERYTHING_FINE',
  'CRAMPS',
  'BREAST_TENDERNESS',
  'HEADACHE',
  'ACNE',
  'LOWER_BACK_PAIN',
  'TIREDNESS',
  'CRAVINGS',
  'SLEEPLESS',
  'ABDOMINAL_PAIN',
  'VAGINAL_ITCHING',
  'VAGINAL_DRYNESS',
] as const;

// =====================
// TYPES (DERIVED)
// =====================

export type TrainingPlan = (typeof TRAINING_PLAN_VALUES)[number];
export type CardioType = (typeof CARDIO_TYPE_VALUES)[number];
export type CyclePhase = (typeof CYCLE_PHASE_VALUES)[number];
export type WomenSymptoms = (typeof WOMEN_SYMPTOMS_VALUES)[number];

// =====================
// MAIN INTERFACE
// =====================

export interface DailyTracking {
  date?: string;
  userId?: string;
  coachId?: string;
  weight?: number;
  sleepHour?: number;
  sleepQuality?: string;
  sick?: boolean;
  water?: string;

  energyAndWellBeing?: EnergyAndWellBeing;
  training?: Training;
  activityStep?: number;
  nutrition?: Nutrition;
  woman?: WomanHealth;
  ped?: Medication;
  bloodPressure?: BloodPressure;
  dailyNotes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// =====================
// SUB INTERFACES
// =====================

export interface EnergyAndWellBeing {
  energyLevel?: number;
  stressLevel?: number;
  muscelLevel?: number;
  mood?: number;
  motivation?: number;
  bodyTemperature?: string;
}

export interface Training {
  trainingCompleted?: boolean;
  trainingPlan?: TrainingPlan[];
  cardioCompleted?: boolean;
  cardioType?: CardioType;
  duration?: string;
}

export interface Nutrition {
  calories?: number;
  carbs?: number;
  protein?: number;
  fats?: number;
  hungerLevel?: number;
  digestionLevel?: number;
  salt?: number;
}

export interface WomanHealth {
  cyclePhase?: CyclePhase;
  cycleDay?: string;
  pmsSymptoms?: number;
  cramps?: number;
  symptoms?: WomenSymptoms[];
}

export interface Medication {
  dailyDosage?: string;
  sideEffect?: string;
}

export interface BloodPressure {
  systolic?: string;
  diastolic?: string;
  restingHeartRate?: string;
  bloodGlucose?: string;
}

export interface IDailyTrackingHistory {
  userId: string;
}


export interface IDailyTrackingNotificationHistory{
  userId:string;
  coachId:string;
  title:string;
  comments:string;
  fcmToken?: string;
  read?: boolean;
  sentAt?: Date;
}