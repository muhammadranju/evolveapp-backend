import { Types } from 'mongoose';

export interface IFoodItem {
  _id?: Types.ObjectId;
  foodNme: string;
  quantity: number;
}

export interface ITrackMeal {
  _id?: Types.ObjectId;
  mealNumber: string;
  food: IFoodItem[];
  totalProtein?: number;
  totalFats?: number;
  totalCarbs?: number;
  totalCalories?: number;
}

export interface IDailyTracking {
  userId: Types.ObjectId;
  date: string;
  meals: ITrackMeal[];
}
