import { Schema, model } from 'mongoose';
import { ICheckInQuestion, DynamicSlider } from './checkinQuestion.interface';
import { QuestionAnswerSchema } from './checkin.model';

export const DynamicSliderSchema = new Schema<DynamicSlider>({
  title: { type: String, required: true },
  inputType: { type: String, default: 'range' },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 10 },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
});

const CheckInQuestionSchema = new Schema<ICheckInQuestion>(
  {
    userId: { type: String, required: true, unique: true },
    coachId: { type: String, required: true },
    questions: { type: [QuestionAnswerSchema], default: [] },
    sliders: { type: [DynamicSliderSchema], default: [] }
  },
  { timestamps: true }
);

const CheckInQuestionModel = model<ICheckInQuestion>('CheckInQuestion', CheckInQuestionSchema);

export default CheckInQuestionModel;
