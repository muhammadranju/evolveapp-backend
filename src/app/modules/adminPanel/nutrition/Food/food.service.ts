import { IFoodItem } from './food.interface';
import { FoodItemModel } from './food.model';

export class FoodItemService {
  /**
   * Create a new food item
   */
  async createFoodItem(payload: IFoodItem) {
    const foodItem = await FoodItemModel.create(payload);
    return foodItem;
  }

  /**
   * Get all food items with pagination and search by name
   */
  async getAllFoodItems(
    search?: string,
    page = 1,
    limit = 10,
    filter?: string
  ) {
    const query: any = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (filter) {
      query.name = { $regex: filter, $options: 'i' };
    }

    const skip = (page - 1) * limit;
    const total = await FoodItemModel.countDocuments(query);
    const items = await FoodItemModel.find(query).skip(skip).limit(limit);

    return {
      total,
      page,
      limit,
      items,
    };
  }

  /**
   * Get food item by ID
   */
  async getFoodItemById(id: string) {
    const foodItem = await FoodItemModel.findById(id);
    return foodItem;
  }

  /**
   * Update a food item by ID
   */
  async updateFoodItem(id: string, payload: Partial<IFoodItem>) {
    const updated = await FoodItemModel.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });
    return updated;
  }

  /**
   * Delete a food item by ID
   */
  async deleteFoodItem(id: string) {
    await FoodItemModel.findByIdAndDelete(id);
  }
}
