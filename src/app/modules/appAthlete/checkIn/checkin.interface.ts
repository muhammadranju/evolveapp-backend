export interface QuestionAnswer {
  question?: string;
  answer?: string;
  status?: boolean;
}

export interface WellBeing {
  energyLevel?: number;
  stressLevel?: number;
  moodLevel?: number;
  sleepQuality?: number;
  hungerLevel?: number;
  nutritionPlanadherence?: number;
}

export interface Nutrition {
  dietLevel?: number;
  digestionLevel?: number;
  challengeDiet?: string;
}

export interface Training {
  feelStrength?: number;
  pumps?: number;
  cardioCompleted?: boolean;
  trainingCompleted?: boolean;
}

export interface ICheckInInfo {
  userId?: String;
  slider?: {
    energyLevel?: number;
    stressLevel?: number;
    moodLevel?: number;
    hungerLevel?: number;
    sleepQuality?: number;
    nutritionPlanadherence?: number;
  };
  coachId?: string;
  currentWeight?: number;
  averageWeight?: number;
  questionAndAnswer?: QuestionAnswer[];
  wellBeing?: WellBeing;
  nutrition?: Nutrition;
  training?: Training;
  trainingFeedback?: string;
  athleteNote?: string;
  coachNote?: string;
  checkinCompleted?: string;
  image?: string[];
  media?: string[];
}
