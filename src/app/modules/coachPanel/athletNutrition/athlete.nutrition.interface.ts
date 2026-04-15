export interface IFood {
  foodName: string;
  quantity: number;
}

export interface IAthleteNutritionPlan {
  athleteId: string;
  coachId: string;
  mealName: string;
  food: IFood[];
  time: string;
  trainingDay: string;
  createdAt?: string;
  updatedAt?: string;
}
