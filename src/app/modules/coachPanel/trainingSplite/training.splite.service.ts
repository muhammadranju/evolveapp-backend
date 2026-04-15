import { ITrainingSplite } from './training.splite.interface';
import { TrainingPlanSpliteModel } from './training.splite.model';

export class TrainingPlanSpliteService {
  /**
   * Create a new training plan split
   */
  async createTrainingPlanSplite(payload: ITrainingSplite) {
    const result = await TrainingPlanSpliteModel.create(payload);
    return result;
  }

  /**
   * Get all training plan splits
   */
  async getTrainingPlanSplites(userId: string) {
    const result = await TrainingPlanSpliteModel.find({ userId });
    return result;
  }

  /**
   * Update training plan split by ID
   */
  async updateTrainingPlanSplite(
    userId: string,
    id: string,
    payload: Partial<ITrainingSplite>
  ) {
    const result = await TrainingPlanSpliteModel.findByIdAndUpdate(
      {
        userId,
        _id: id,
      },
      payload,
      { new: true, runValidators: true }
    );

    return result;
  }

  /**
   * Delete training plan split by ID
   */
  async deleteTrainingPlanSplite(userId: string, id: string) {
    const result = await TrainingPlanSpliteModel.findByIdAndDelete({
      userId,
      _id: id,
    });
    return result;
  }
}
