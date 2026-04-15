import mongoose, { Schema, Document, Model } from 'mongoose';
import { ICategory, IPEDDatabase, ISubCategory } from './ped.interface';

/* ---------- Schemas ---------- */

const SubCategorySchema = new Schema<ISubCategory>(
  {
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
  { _id: true },
);

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    subCategory: { type: [SubCategorySchema] },
  },
  { _id: true },
);

const PEDDatabaseSchema = new Schema<IPEDDatabase>(
  {
    athleteId: { type: String, default: '' },
    coachId: { type: String, default: '' },
    week: { type: String, default: '' },
    categories: { type: [CategorySchema], default: [] },
    isTemplate: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const PEDDatabaseModel: Model<IPEDDatabase> =
  mongoose.models.PEDDatabase ||
  mongoose.model<IPEDDatabase>('PEDDatabase', PEDDatabaseSchema);
