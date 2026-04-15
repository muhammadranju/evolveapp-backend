import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';
import { IShowManagement } from './management.interface';
import { ShowManagementModel } from './management.model';
import ApiError from '../../../../errors/ApiError';
import { AthleteModel } from '../../adminPanel/athlete/athleteModel';

export class ShowManagementService {
  /**
   * Create a new show management entry
   * @param payload - ShowManagement data
   * @returns Created document
   */
  async createShow(payload: IShowManagement) {
    const result = await ShowManagementModel.create(payload);
    return result;
  }

  /**
   * Get all shows, sorted by newest first
   * @returns Array of ShowManagement
   */
  async getAllShows() {
    const shows = await ShowManagementModel.find().sort({ createdAt: -1 });
    return shows;
  }

  /**
   * Get a single show by ID
   * @param id - ShowManagement ID
   * @returns ShowManagement document
   */
  async getShowById(id: string) {
    const show = await ShowManagementModel.findById(id);
    return show;
  }

  /**
   * Update a show by ID
   * @param id - ShowManagement ID
   * @param payload - Partial data to update
   * @returns Updated document
   */
  async updateShow(id: string, payload: Partial<IShowManagement>) {
    const updatedShow = await ShowManagementModel.findByIdAndUpdate(
      id,
      { $set: payload },
      { new: true, runValidators: true },
    );
    return updatedShow;
  }

  /**
   * Delete a show by ID
   * @param id - ShowManagement ID
   * @returns Deleted document
   */
  async deleteShow(id: string) {
    const deletedShow = await ShowManagementModel.findByIdAndDelete(id);
    return deletedShow;
  }

  async assignShow(payload: { showId: string; userIds: string | string[] }) {
    let { showId, userIds } = payload;

    // Convert single userId to array
    const userIdsArray = Array.isArray(userIds) ? userIds : [userIds];

    // Explicitly cast to ObjectId
    const showObjectId = new Types.ObjectId(showId);
    const userObjectIds = userIdsArray.map(id => new Types.ObjectId(id));

    const showExists = await ShowManagementModel.exists({ _id: showObjectId });

    if (!showExists) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Show not found');
    }

    const updatedUsers = await AthleteModel.updateMany(
      { _id: { $in: userObjectIds } },
      { $addToSet: { shows: showObjectId } },
    );

    if (updatedUsers.matchedCount === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'No athletes found with the provided IDs');
    }

    if (updatedUsers.modifiedCount === 0) {
      // If it's a single user, it's likely already assigned
      if (userObjectIds.length === 1) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Show already assigned to this athlete');
      }
    }

    return { updatedUsers, message: 'Show assigned successfully' };
  }
}
