export function calculateFoodMacros(foodData: any, quantity: number) {
  if (!foodData) return { protein: 0, fats: 0, carbs: 0, calories: 0 };
  const defaultQty1 = foodData.defaultQuantity.replace('g', '');
  const defaultQty = Number(defaultQty1);
  const factor = defaultQty === 1 ? quantity : quantity / defaultQty;

  return {
    protein: foodData.proteinQuantity * factor,
    fats: foodData.fatsQuantity * factor,
    carbs: foodData.carbsQuantity * factor,
    calories: foodData.caloriesQuantity * factor,
  };
}

export function calculateNutritionStats(totals: {
  totalProtein: number;
  totalFats: number;
  totalCarbs: number;
}) {
  const { totalProtein, totalFats, totalCarbs } = totals;

  const calculatedCalories = totalProtein + totalFats + totalCarbs;

  const proteinPercent = (totalProtein / calculatedCalories) * 100;
  const carbsPercent = (totalFats / calculatedCalories) * 100;
  const fatsPercent = (totalCarbs / calculatedCalories) * 100;

  return {
    percentages: {
      proteinPercent: +proteinPercent.toFixed(2),
      carbsPercent: +carbsPercent.toFixed(2),
      fatsPercent: +fatsPercent.toFixed(2),
    },
  };
}
