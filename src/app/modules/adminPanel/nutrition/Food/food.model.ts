import { Schema, model } from 'mongoose';
import { IFoodItem, FoodCategory } from './food.interface';

const FoodItemSchema = new Schema<IFoodItem>(
  {
    name: { type: String, required: true },
    brand: { type: String, required: true },
    category: {
      type: String,
      enum: Object.values(FoodCategory),
      required: true,
    },
    defaultQuantity: { type: String, required: true },
    caloriesQuantity: { type: Number, required: true },
    proteinQuantity: { type: Number, required: true },
    fatsQuantity: { type: Number, required: true },
    carbsQuantity: { type: Number, required: true },
    sugarQuantity: { type: Number, required: true },
    fiberQuantity: { type: Number, required: true },
    saturatedFats: { type: Number, required: true },
    unsaturatedFats: { type: Number, required: true },
  },
  { timestamps: true }
);

export const FoodItemModel = model<IFoodItem>('FoodItem', FoodItemSchema);
