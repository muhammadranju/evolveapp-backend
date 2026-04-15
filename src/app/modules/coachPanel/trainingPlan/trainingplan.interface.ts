import { Types } from 'mongoose';


export interface ITrainingPlanSets {
  sets: string;
  repRange: string;
  rir: string; 
}

export interface IExercise {
  _id: string;
  exerciseName: string;
  exerciseSets: ITrainingPlanSets[];
  excerciseNote: string;
}
export interface ITrainingPlan extends Document {
  userId: string;
  coachId: Types.ObjectId;
  traingPlanName: string;
  exercise: IExercise[];
  dificulty: string;
  comment: string;
}
