import { model, Schema } from 'mongoose';
import { ICheckInInfo, QuestionAnswer, WellBeing } from './checkin.interface';

// Sub-schema for question and answer
export const QuestionAnswerSchema = new Schema<QuestionAnswer>({
  question: { type: String },
  answer: { type: String },
  status: { type: Boolean, default: false },
});

// Sub-schema for well-being
// const WellBeingSchema = new Schema<WellBeing>({
//   energyLevel: { type: Number },
//   stressLevel: { type: Number },
//   moodLevel: { type: Number },
//   sleepQuality: { type: Number },
//   hungerLevel: { type: Number },
//   nutritionPlanadherence: { type: Number },
// });

const WellBeingSchema = new Schema({}, { strict: false });

// Main Check-in Schema
const CheckInSchema = new Schema<ICheckInInfo>(
  {
    userId: { type: String },
    coachId: { type: String },
    currentWeight: { type: Number },
    averageWeight: { type: Number },
    questionAndAnswer: { type: [QuestionAnswerSchema] },
    wellBeing: { type: WellBeingSchema },
    athleteNote: { type: String },
    coachNote: { type: String },
    image: { type: [String], default: [] },
    media: { type: [String], default: [] },
    checkinCompleted: { type: String, default: 'Pending' },
  },
  { timestamps: true },
);

// Model
const CheckInModel = model<ICheckInInfo>('CheckIn', CheckInSchema);

export default CheckInModel;
