import { Request, Response } from 'express';
import {
  buildTimelineHistory,
  bulkUpdateTimelinePhaseService,
} from './timeline.service';
import mongoose from 'mongoose';
import { AthleteModel } from '../../adminPanel/athlete/athleteModel';

export const getAthleteTimelineController = async (
  req: Request,
  res: Response,
) => {
  try {
    const athleteId = req.params.athleteId;
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;
    const data = await buildTimelineHistory(athleteId, year);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ------------------------------------
// Bulk update timeline phase controller
// ------------------------------------
export const bulkUpdateTimelinePhaseController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { athleteId } = req.params;
    const { timelineIds, newPhase, year } = req.body;

    if (
      !timelineIds ||
      !Array.isArray(timelineIds) ||
      timelineIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'timelineIds must be a non-empty array',
      });
    }

    if (!newPhase) {
      return res.status(400).json({
        success: false,
        message: 'newPhase is required',
      });
    }

    const result = await bulkUpdateTimelinePhaseService(
      athleteId,
      timelineIds,
      newPhase,
      year ? parseInt(year) : undefined,
    );

    return res.status(200).json({
      success: true,
      message: 'Bulk phase updated successfully',
      updatedCount: result.modifiedCount || 0,
      createdCount: (result.upsertedCount || 0) + (result.insertedCount || 0),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

// export const updatePhaseAthleteTimelineController = async

export const updatePhaseAthleteTimelineController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { userIds, newPhase } = req.body;

    // Validation
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res
        .status(400)
        .json({ message: 'userIds must be a non-empty array' });
    }

    if (!newPhase) {
      return res.status(400).json({ message: 'newPhase is required' });
    }

    // ----------------------
    // Prepare bulk operations
    // ----------------------
    const bulkOps = userIds.map((id: string) => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(id) },
        update: { $set: { phase: newPhase } },
      },
    }));

    // ✅ Execute bulkWrite
    const result = await AthleteModel.bulkWrite(bulkOps);

    return res.status(200).json({
      message: 'Phase updated successfully',
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error('Bulk Phase Update Error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error });
  }
};
