export const calculateAverages = (entries: any[]) => {
  if (!entries.length) return null;

  const total = entries.reduce(
    (acc, cur) => {
      acc.weight += cur.weight || 0;
      acc.protein += cur.protein || 0;
      acc.fats += cur.fats || 0;
      acc.carbs += cur.carbs || 0;
      acc.calories += cur.calories || 0;
      acc.activityStep += cur.activityStep || 0;
      acc.cardioPerMin += cur.cardioPerMin || 0;
      return acc;
    },
    {
      weight: 0,
      protein: 0,
      fats: 0,
      carbs: 0,
      calories: 0,
      activityStep: 0,
      cardioPerMin: 0,
    }
  );

  const count = entries.length;

  return {
    avgWeight: total.weight / count,
    avgProtein: total.protein / count,
    avgFats: total.fats / count,
    avgCarbs: total.carbs / count,
    avgCalories: total.calories / count,
    avgActivityStep: total.activityStep / count,
    avgCardioPerMin: total.cardioPerMin / count,
  };
};
