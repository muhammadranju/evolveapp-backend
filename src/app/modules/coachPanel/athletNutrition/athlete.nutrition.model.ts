import { Schema, model } from 'mongoose';
import { IAthleteNutritionPlan, IFood } from './athlete.nutrition.interface';
import { tr } from 'zod/v4/locales';

// Sub-schema for IFood
const foodSchema = new Schema<IFood>(
  {
    foodName: { type: String, required: true },
    quantity: { type: Number, required: true },
  },
  { _id: false }
);

const athleteNutritionPlanSchema = new Schema<IAthleteNutritionPlan>(
  {
    athleteId: { type: String, required: true },
    coachId: { type: String, required: true },
    mealName: { type: String, required: true },
    food: { type: [foodSchema], required: true },
    time: { type: String, required: true },
    trainingDay: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const AthleteNutritionPlanModel = model<IAthleteNutritionPlan>(
  'AthleteNutritionPlan',
  athleteNutritionPlanSchema
);
