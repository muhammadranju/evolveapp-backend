import { Schema, Types, model } from 'mongoose';

interface INotes {
  athleteId: Types.ObjectId;
  note: string;
}

const NotesSchema = new Schema<INotes>(
  {
    athleteId: { type: Types.ObjectId, required: true, ref: 'Athlete' },
    note: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

export const NotesModel = model<INotes>('Notes', NotesSchema);
