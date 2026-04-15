import { Schema, model } from 'mongoose';
import { ICheckInQuestion } from './checkinQuestion.interface';
import { QuestionAnswerSchema } from './checkin.model';

const CheckInQuestionSchema = new Schema<ICheckInQuestion>(
  {
    userId: { type: String, required: true, unique: true },
    coachId: { type: String, required: true },
    questions: { type: [QuestionAnswerSchema], default: [] },
  },
  { timestamps: true }
);

const CheckInQuestionModel = model<ICheckInQuestion>('CheckInQuestion', CheckInQuestionSchema);

export default CheckInQuestionModel;
