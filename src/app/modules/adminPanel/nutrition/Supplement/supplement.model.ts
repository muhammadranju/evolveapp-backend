import { Schema, model } from 'mongoose';
import { ISupplementItem } from './supplement.interface';

const SupplementItemSchema = new Schema<ISupplementItem>(
  {
    userId: { type: String, default: '' },
    coachId: { type: String, default: '' },
    adminId: { type: String, default: '' },
    name: { type: String, required: true },
    brand: { type: String, required: true },
    dosage: { type: String },
    frequency: { type: String },
    time: { type: String },
    purpose: { type: String, required: true },
    productLink: { type: String, required: true },
    note: { type: String },
  },
  { timestamps: true },
);

export const SupplementItemModel = model<ISupplementItem>(
  'SupplementItem',
  SupplementItemSchema,
);
