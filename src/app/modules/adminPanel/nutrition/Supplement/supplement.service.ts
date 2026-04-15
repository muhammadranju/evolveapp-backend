import { ISupplementItem } from './supplement.interface';
import { SupplementItemModel } from './supplement.model';

export class SupplementItemService {
  /**
   * Create a new supplement
   */
  async createSupplement(payload: ISupplementItem) {
    const supplement = await SupplementItemModel.create(payload);
    return supplement;
  }

  /**
   * Get all supplements with pagination and optional search by name
   */
  async getAllSupplements(
    userId?: string,
    coachId?: string,
    search?: string,
    page = 1,
    limit = 10
  ) {
    const query: any = {};

    // ✅ filter by userId
    if (userId) {
      query.userId = userId;
    }
    if (coachId) {
      query.coachId = coachId;
    }

    // ✅ search by supplement name
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;

    const [total, items] = await Promise.all([
      SupplementItemModel.countDocuments(query),
      SupplementItemModel.find(query).skip(skip).limit(limit).lean(),
    ]);

    return {
      total,
      page,
      limit,
      items,
    };
  }

  async getAllSupplementsByAdmin(
    search?: string,
    page: number = 1,
    limit: number = 10
  ) {
    const query: any = {};
    // ✅ search by supplement name
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;

    const [total, items] = await Promise.all([
      SupplementItemModel.countDocuments(query),
      SupplementItemModel.find(query).skip(skip).limit(limit).lean(),
    ]);

    return {
      total,
      page,
      limit,
      items,
    };
  }

  /**
   * Get a supplement by ID
   */
  async getSupplementById(id: string) {
    return await SupplementItemModel.findById(id);
  }

  /**
   * Update a supplement by ID
   */
  async updateSupplement(id: string, payload: Partial<ISupplementItem>) {
    return await SupplementItemModel.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });
  }


    /**
   * Update a supplement by ID
   */
async updateSupplementByCoach(
  id: string,
  payload: Partial<ISupplementItem>,
  coachId: string,
  userId: string
) {
  const updated = await SupplementItemModel.findOneAndUpdate(
    {
      _id: id,
      coachId: coachId,
      userId: userId,
    },
    payload,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updated) {
    throw new Error("Supplement not found or not authorized");
  }

  return updated;
}


  /**
   * Delete a supplement by ID
   */
  async deleteSupplement(id: string) {
    const result = await SupplementItemModel.findByIdAndDelete(id);
    return result;
  }

    async deleteSupplementByCoach(id: string, coachId: string, userId: string) {
    const result = await SupplementItemModel.findOneAndDelete({
      _id: id,
      coachId: coachId,
      userId: userId,
    });
    return result;
  }
}
