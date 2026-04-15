import { Schema, model } from 'mongoose';
import { IWater } from './water.interface';

const waterSchema = new Schema<IWater>(
  {
    date: {
      type: String,
      required: true,
        },
    userId: {
      type: String,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export const Water = model<IWater>('Water', waterSchema);
