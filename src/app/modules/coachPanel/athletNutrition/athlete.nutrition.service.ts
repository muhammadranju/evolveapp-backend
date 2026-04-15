import {
  calculateMacrosByQuantity,
  calculateTotalNutritionFromPlans,
} from '../../../../util/calculate.total.nutrition';
import { FoodItemModel } from '../../adminPanel/nutrition/Food/food.model';
import { IAthleteNutritionPlan } from './athlete.nutrition.interface';
import { AthleteNutritionPlanModel } from './athlete.nutrition.model';

interface FilterOptions {
  mealName?: string;
  trainingDay?: string;
}

export class AthleteNutritionPlanService {
  /**
   * Create a new nutrition plan
   */
  async createNutritionPlan(payload: Partial<IAthleteNutritionPlan>) {
    const result = await AthleteNutritionPlanModel.create(payload);
    return result;
  }

  /**
   * Get all nutrition plans with optional search & filter
   */
  async getNutritionPlans(filters: any, athleteId: string) {
    const query: Record<string, any> = {};

    if (filters.mealName) {
      query.mealName = { $regex: filters.mealName, $options: 'i' };
    }

    if (filters.trainingDay) {
      query.trainingDay = filters.trainingDay;
    }

    const plans = await AthleteNutritionPlanModel.find({
      athleteId,
      ...query,
    }).sort({ createdAt: -1 });

    if (!plans.length) return [];

    const foodNames = [
      ...new Set(plans.flatMap(plan => plan.food.map(food => food.foodName))),
    ];

    const foodItems = await FoodItemModel.find({
      name: { $in: foodNames },
    });

    const foodMap = new Map(foodItems.map(food => [food.name, food]));

    const enrichedPlans = plans.map(plan => {
      let totalProtein = 0;
      let totalFats = 0;
      let totalCarbs = 0;
      let totalCalories = 0;

      plan.food.forEach(food => {
        const foodItem = foodMap.get(food.foodName);
        if (!foodItem) return;

        const defaultQty =
          Number(foodItem.defaultQuantity.replace('g', '')) || 1;

        const macros = calculateMacrosByQuantity(
          {
            caloriesQuantity: foodItem.caloriesQuantity,
            proteinQuantity: foodItem.proteinQuantity,
            fatsQuantity: foodItem.fatsQuantity,
            carbsQuantity: foodItem.carbsQuantity,
            defaultQuantity: defaultQty,
          },
          food.quantity
        );

        totalProtein += macros.protein;
        totalFats += macros.fats;
        totalCarbs += macros.carbs;
        totalCalories += macros.calories;
      });

      return {
        ...plan.toObject(),
        totalProtein: Number(totalProtein.toFixed(2)),
        totalFats: Number(totalFats.toFixed(2)),
        totalCarbs: Number(totalCarbs.toFixed(2)),
        totalCalories: Number(totalCalories.toFixed(2)),
      };
    });

    // ✅ NEW: calculate grand totals
    const totals = calculateTotalNutritionFromPlans(enrichedPlans);

    return {
      plans: enrichedPlans,
      totals: {
        totalProtein: Number(totals.totalProtein.toFixed(2)),
        totalFats: Number(totals.totalFats.toFixed(2)),
        totalCarbs: Number(totals.totalCarbs.toFixed(2)),
        totalCalories: Number(totals.totalCalories.toFixed(2)),
      },
    };
  }

  /**
   * Get single nutrition plan by ID
   */
  async getNutritionPlanById(id: string) {
    const plan = await AthleteNutritionPlanModel.findById(id);
    return plan;
  }

  /**
   * Update a nutrition plan by ID
   */
  async updateNutritionPlan(
    userId: string,
    id: string,
    payload: Partial<IAthleteNutritionPlan>
  ) {
    const updatedPlan = await AthleteNutritionPlanModel.findByIdAndUpdate(
      {
        _id: id,
        athleteId: userId,
      },
      payload,
      {
        new: true,
        runValidators: true,
      }
    );
    return updatedPlan;
  }

  /**
   * Delete a nutrition plan by ID
   */
  async deleteNutritionPlan(userId: string, id: string) {
    const deletedPlan = await AthleteNutritionPlanModel.findByIdAndDelete({
      athleteId: userId,
      _id: id,
    });
    return deletedPlan;
  }
}
