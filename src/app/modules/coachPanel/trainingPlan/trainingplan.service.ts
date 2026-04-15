import { ITrainingPlan } from './trainingplan.interface';
import { TrainingPlanModel } from './trainingplan.model';

export class TrainingPlanService {
  /**
   * Create a new training plan
   */
  async createTrainingPlan(payload: ITrainingPlan) {
    const result = await TrainingPlanModel.create(payload);
    return result;
  }

  /**
   * Get training plans by training plan name (search)
   */
  async getTrainingPlansByName(
    trainingPlanName: string | undefined,
    userId: string
  ) {
    const query: Record<string, any> = { userId };

    if (trainingPlanName) {
      query.traingPlanName = {
        $regex: trainingPlanName,
        $options: 'i',
      };
    }

    const trainingPlans = await TrainingPlanModel.find(query);

    return trainingPlans;
  }

  async getTrainingPlansById(id: string, userId: string) {
    const item = await TrainingPlanModel.findById({ _id: id, userId });
    return item;
  }

  /**
   * Update training plan by ID
   */
  async updateTrainingPlan(
    userId: string,
    id: string,
    payload: Partial<ITrainingPlan>
  ) {
    const updatedTrainingPlan = await TrainingPlanModel.findOneAndUpdate(
      { _id: id, userId },
      payload,
      { new: true }
    );

    return updatedTrainingPlan;
  }

  /**
   * Delete training plan by ID
   */
  async deleteTrainingPlan(userId: string, id: string) {
    const result = await TrainingPlanModel.findByIdAndDelete({
      userId,
      _id: id,
    });
    return result;
  }
}
