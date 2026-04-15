export interface FoodMacros {
  caloriesQuantity: number;
  proteinQuantity: number;
  fatsQuantity: number;
  carbsQuantity: number;
  defaultQuantity: number;
}

export interface CalculatedMacros {
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
}
interface NutritionTotals {
  totalProtein: number;
  totalFats: number;
  totalCarbs: number;
  totalCalories: number;
}

export const calculateMacrosByQuantity = (
  macros: FoodMacros,
  consumedQuantity: number
): CalculatedMacros => {
  const ratio =
    macros.defaultQuantity === 1
      ? consumedQuantity
      : consumedQuantity / macros.defaultQuantity;

  return {
    calories: Number((macros.caloriesQuantity * ratio).toFixed(2)),
    protein: Number((macros.proteinQuantity * ratio).toFixed(2)),
    fats: Number((macros.fatsQuantity * ratio).toFixed(2)),
    carbs: Number((macros.carbsQuantity * ratio).toFixed(2)),
  };
};

/**
 * Calculate total macros from enriched nutrition plans array
 */
export const calculateTotalNutritionFromPlans = (
  plans: Array<{
    totalProtein: number;
    totalFats: number;
    totalCarbs: number;
    totalCalories: number;
  }>
): NutritionTotals => {
  return plans.reduce(
    (acc, plan) => {
      acc.totalProtein += plan.totalProtein || 0;
      acc.totalFats += plan.totalFats || 0;
      acc.totalCarbs += plan.totalCarbs || 0;
      acc.totalCalories += plan.totalCalories || 0;
      return acc;
    },
    {
      totalProtein: 0,
      totalFats: 0,
      totalCarbs: 0,
      totalCalories: 0,
    }
  );
};
