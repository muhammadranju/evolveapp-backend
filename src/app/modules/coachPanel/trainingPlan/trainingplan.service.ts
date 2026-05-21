import { ITrainingPlan } from './trainingplan.interface';
import { TrainingPlanModel } from './trainingplan.model';

export class TrainingPlanService {
  /**
   * Create a new training plan
   */
  async createTrainingPlan(payload: ITrainingPlan) {
    const lastPlan = await TrainingPlanModel.findOne({
      userId: payload.userId,
    }).sort({ position: -1 });

    const nextPosition = lastPlan ? lastPlan.position + 1 : 1;
    payload.position = nextPosition;

    // Assign sequential positions to exercises if they exist
    if (payload.exercise && payload.exercise.length > 0) {
      payload.exercise.forEach((ex, index) => {
        ex.position = index + 1;
      });
    }

    const result = await TrainingPlanModel.create(payload);
    return result;
  }

  /**
   * Get training plans by training plan name (search)
   */
  async getTrainingPlansByName(
    trainingPlanName: string | undefined,
    userId: string,
  ) {
    const query: Record<string, any> = { userId };

    if (trainingPlanName) {
      query.traingPlanName = {
        $regex: trainingPlanName,
        $options: 'i',
      };
    }

    const trainingPlans = await TrainingPlanModel.find(query).sort({
      position: 1,
    });

    return trainingPlans;
  }

  async getTrainingPlansById(id: string, userId: string) {
    const item = await TrainingPlanModel.findOne({ _id: id, userId })?.populate(
      'exercise.exerciseId',
    );
    return item;
  }

  /**
   * Update training plan by ID
   */
  async updateTrainingPlan(
    userId: string,
    id: string,
    payload: Partial<ITrainingPlan>,
  ) {
    const updatedTrainingPlan = await TrainingPlanModel.findOneAndUpdate(
      { _id: id, userId },
      payload,
      { new: true },
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

  /**
   * Reorder Training Plans
   */
  async reorderTrainingPlans(userId: string, id: string, newPosition: number) {
    // 1. Fetch all items for this user, sorted by position
    const items = await TrainingPlanModel.find({ userId }).sort({
      position: 1,
    });

    if (items.length === 0) {
      throw new Error('No training plans found for this user');
    }

    // 2. Find the item to move
    const itemIndex = items.findIndex(item => item._id.toString() === id);
    if (itemIndex === -1) {
      throw new Error('Training plan not found');
    }

    const itemToMove = items[itemIndex];

    // 3. Remove item from current position
    const otherItems = items.filter((_, idx) => idx !== itemIndex);

    // 4. Insert at target position (1-based to 0-based)
    // Clamp newPosition between 1 and total items count
    const targetPosition = Math.max(1, Math.min(newPosition, items.length));
    const targetIndex = targetPosition - 1;

    otherItems.splice(targetIndex, 0, itemToMove);

    // 5. Prepare bulk updates only for changed positions
    const bulkOps = otherItems
      .map((item, index) => {
        const sequentialPos = index + 1;
        if (item.position !== sequentialPos) {
          return {
            updateOne: {
              filter: { _id: item._id },
              update: { $set: { position: sequentialPos } },
            },
          };
        }
        return null;
      })
      .filter(op => op !== null);

    if (bulkOps.length > 0) {
      await TrainingPlanModel.bulkWrite(bulkOps as any);
    }

    // Return the updated item
    return await TrainingPlanModel.findById(id);
  }

  /**
   * Reorder Exercises within a Training Plan
   */
  async reorderExercises(
    trainingPlanId: string,
    exerciseId: string,
    newPosition: number,
  ) {
    const trainingPlan = await TrainingPlanModel.findById(trainingPlanId);
    if (!trainingPlan) {
      throw new Error('Training plan not found');
    }

    const exercises = [...trainingPlan.exercise];

    // Find the exercise to move
    const exerciseIndex = exercises.findIndex(
      ex => ex._id?.toString() === exerciseId,
    );

    if (exerciseIndex === -1) {
      throw new Error('Exercise not found in this training plan');
    }

    const [exerciseToMove] = exercises.splice(exerciseIndex, 1);

    // Target index (1-based to 0-based)
    const targetIndex = Math.max(
      0,
      Math.min(newPosition - 1, exercises.length),
    );

    exercises.splice(targetIndex, 0, exerciseToMove);

    // Update sequential positions for all exercises in the array
    exercises.forEach((ex, index) => {
      ex.position = index + 1;
    });

    trainingPlan.exercise = exercises;
    await trainingPlan.save();

    return trainingPlan;
  }
}
