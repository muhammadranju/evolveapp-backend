import mongoose, { Schema, model } from 'mongoose';
import { IDailyTracking } from './track.meal.interface';
import { Types } from 'mongoose';

const FoodItemSchema = new Schema({
  foodNme: { type: String, required: true },
  quantity: { type: Number, required: true },
});

const TrackMealSchema = new Schema({
  mealNumber: { type: String, required: true },
  food: { type: [FoodItemSchema], required: true },
});

const DailyTrackingSchema = new Schema<IDailyTracking>(
  {
    userId: {
      type: Types.ObjectId,
      ref: 'Athlete',
      required: true,
    },

    date: { type: String, required: true },
    meals: {
      type: [TrackMealSchema],
      validate: {
        validator: function (v: any[]) {
          return v.length <= 7;
        },
        message: 'Maximum 7 meals allowed per day',
      },
    },
  },
  { timestamps: true }
);

export const DailyTrackingMealModel = model<IDailyTracking>(
  'DailyTrackingMeal',
  DailyTrackingSchema
);
