export enum MuscleCategory {
  Chest = 'Chest',
  Neck = 'Neck',
  Shoulders = 'Shoulders',
  Arms = 'Arms',
  Back = 'Back',
  Core = 'Core',
  Legs = 'Legs',
  Triceps = 'Triceps',
}

export interface IExercise {
  coachId: string;
  name: string;
  musal: string;
  difficulty: string;
  equipment: string;
  description: string;
  subCategory: MuscleCategory[];
  image: string;
  video: string;
}
