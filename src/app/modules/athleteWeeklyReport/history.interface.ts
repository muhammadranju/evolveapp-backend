// ================= ROOT =================

export interface IWeeklyAverage {
  userId: string;
  coachId: string;
  weekNumber?: number;
  weight: number;
  sleepHour: number;
  sleepQuality: number;
  activityStep: number;

  energyAndWellBeing: IEnergyAndWellBeing;
  nutrition: INutrition;
  training: ITraining;
  woman?: IWoman;
  bloodPressure: IBloodPressure;
}

// ================= ENERGY =================

export interface IEnergyAndWellBeing {
  energyLevel: number;
  stressLevel: number;
  muscelLevel: number;
  mood: number;
  motivation: number;
  bodyTemperature: number;
}

// ================= NUTRITION =================

export interface INutrition {
  calories: number;
  carbs: number;
  protein: number;
  fats: number;
  hungerLevel: number;
  digestionLevel: number;
  salt: number;
}

// ================= TRAINING =================

export interface ITraining {
  cardioDuration: number;
}

// ================= WOMAN =================

export interface IWoman {
  pmsSymptoms: number;
  cramps: number;
}

// ================= BLOOD PRESSURE =================

export interface IBloodPressure {
  systolic: number;
  diastolic: number;
  restingHeartRate: number;
  bloodGlucose: number;
}
