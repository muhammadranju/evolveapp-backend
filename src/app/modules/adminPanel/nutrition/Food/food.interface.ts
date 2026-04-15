export enum FoodCategory {
  Protein = 'Protein',
  Carbs = 'Carbs',
  Fats = 'Fats',
  Vegetables = 'Vegetables',
  Fruits = 'Fruits',
  Dairy = 'Dairy',
  Supplements = 'Supplements',
  Other = 'Other',
}

export interface IFoodItem {
  name: string;
  brand: string;
  category: FoodCategory;
  defaultQuantity: string;
  caloriesQuantity: number;
  proteinQuantity: number;
  fatsQuantity: number;
  carbsQuantity: number;
  sugarQuantity: number;
  fiberQuantity: number;
  saturatedFats: number;
  unsaturatedFats: number;
}
