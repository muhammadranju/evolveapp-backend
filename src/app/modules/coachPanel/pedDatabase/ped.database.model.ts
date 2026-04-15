import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  ICategory,
  IPEDDatabase,
  ISubCategory,
} from './ped.database.interface';

/* ---------- Schemas ---------- */

const SubCategorySchema = new Schema<ISubCategory>(
  {
    id: String,
    name: String,
    dosage: { type: String, default: '' },
    frequency: { type: String, default: '' },
    mon: { type: String, default: '' },
    tue: { type: String, default: '' },
    wed: { type: String, default: '' },
    thu: { type: String, default: '' },
    fri: { type: String, default: '' },
    sat: { type: String, default: '' },
    sun: { type: String, default: '' },
  },
  { _id: false }
);

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    subCategory: { type: [SubCategorySchema] },
  },
  { _id: false }
);

const PEDDatabaseSchema = new Schema<IPEDDatabase>(
  {
    categories: { type: [CategorySchema], default: [] },
  },
  { timestamps: true }
);

PEDDatabaseSchema.index({ coachId: 1, week: 1 }, { unique: true });

export const PEDDatabaseInfoModel: Model<IPEDDatabase> =
  mongoose.models.PEDDatabase ||
  mongoose.model<IPEDDatabase>('PEDInfo', PEDDatabaseSchema);
