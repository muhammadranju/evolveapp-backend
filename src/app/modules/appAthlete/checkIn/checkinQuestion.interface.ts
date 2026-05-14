import { QuestionAnswer } from './checkin.interface';

export interface DynamicSlider {
  _id?: string;
  title: string;
  inputType?: string;
  min?: number;
  max?: number;
  order?: number;
  isActive?: boolean;
}

export interface ICheckInQuestion {
  userId: string;
  coachId: string;
  questions: QuestionAnswer[];
  sliders?: DynamicSlider[];
}
