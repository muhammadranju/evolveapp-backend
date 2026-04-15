import { Schema, model } from 'mongoose';
import { IShowManagement } from './management.interface';

// Calculate countdown in days
const calculateCountdown = (dateStr: string) => {
  const showDate = new Date(dateStr);
  const now = new Date();
  const diffMs = showDate.getTime() - now.getTime();
  if (diffMs <= 0) return 0;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
};

const ShowManagementSchema = new Schema<IShowManagement>(
  {
    name: { type: String, required: true },
    division: { type: String, required: true },
    date: { type: String, required: true },
    location: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual countdown (auto-updates daily)
ShowManagementSchema.virtual('countdown').get(function () {
  return calculateCountdown(this.date);
});

export const ShowManagementModel = model<IShowManagement>(
  'ShowManagement',
  ShowManagementSchema
);
