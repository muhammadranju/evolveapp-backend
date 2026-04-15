import { QuestionAnswer } from './checkin.interface';

export interface ICheckInQuestion {
  userId: string;
  coachId: string;
  questions: QuestionAnswer[];
}
