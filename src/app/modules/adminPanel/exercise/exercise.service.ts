import { ExerciseModel } from './exercise.model';
import { IExercise } from './exercise.interface';

export class ExerciseService {
  async createExercise(data: IExercise) {
    return await ExerciseModel.create(data);
  }

  async getAllExercises(
    page: number,
    limit: number,
    search?: string,
    musalCategory?: string
  ) {
    const skip = (page - 1) * limit;
    const filter: any = {};

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    if (musalCategory) {
      filter.musal = musalCategory;
    }

    const exercises = await ExerciseModel.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await ExerciseModel.countDocuments(filter);

    return {
      meta: {
        total,
        page,
        limit,
      },
      exercises,
    };
  }

  async getExerciseById(id: string) {
    return await ExerciseModel.findById(id);
  }

  async updateExercise(id: string, data: Partial<IExercise>) {
    return await ExerciseModel.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteExercise(id: string) {
    return await ExerciseModel.findByIdAndDelete(id);
  }
}
