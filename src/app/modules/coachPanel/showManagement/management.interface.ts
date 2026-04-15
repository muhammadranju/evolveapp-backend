import { Document } from 'mongoose';

export interface IShowManagement extends Document {
  name: string;
  division: string;
  date: string;
  location: string;
  countdown: number;
}
