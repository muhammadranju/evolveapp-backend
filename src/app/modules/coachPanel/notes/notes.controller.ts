import catchAsync from '../../../../shared/catchAsync';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../../../shared/sendResponse';
import { NotesService } from './notes.service';

const createNotes = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ...userData } = req.body;
    const result = await NotesService.createNotesToDB(userData);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'User created successfully',
      data: result,
    });
  },
);

const getSingleNotes = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { noteId } = req.params;
    const result = await NotesService.getSingleNotesToDB(noteId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'User created successfully',
      data: result,
    });
  },
);

const getNotesByAthleteId = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { athleteId } = req.params;
    const result = await NotesService.getNotesByAthleteIdToDB(athleteId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'User created successfully',
      data: result,
    });
  },
);

const getAllNotesData = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await NotesService.getAllNotesDataToDB();

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'User created successfully',
      data: result,
    });
  },
);

export const NotesController = {
  createNotes,
  getSingleNotes,
  getNotesByAthleteId,
  getAllNotesData,
};
