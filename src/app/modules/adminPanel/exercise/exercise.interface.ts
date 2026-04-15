export enum MuscleCategory {
  Chest = 'Chest',
  Neck = 'Neck',
  Shoulders = 'Shoulders',
  Arms = 'Arms',
  Back = 'Back',
  Glutes = 'Glutes',
  Core = 'Core',
  Legs = 'Legs',
  Triceps = 'Triceps',
  Hamstrings = 'Hamstrings',
  LowerBack = 'Lower Back',
  Quadriceps = 'Quadriceps',
  Calves = 'Calves',
  Other = 'Other',
  Biceps = 'Biceps',
}

export interface IExercise {
  name: string;
  musal: string;
  difficulty: string;
  equipment: string;
  description: string;
  subCategory: MuscleCategory[];
  image: string;
  vedio: string;
}
