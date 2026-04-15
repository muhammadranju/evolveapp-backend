import { NotesModel } from './notes.model';

// create notes
const createNotesToDB = async (payload: any) => {
  const { athleteId, note } = payload;
  const result = await NotesModel.create({ athleteId, note });
  return result;
};

// get single notes
const getSingleNotesToDB = async (netoId: string) => {
  const result = await NotesModel.findOne({ _id: netoId }).populate(
    'athleteId',
    'name email',
  );

  return result;
};

// //  get notes by athlete id
const getNotesByAthleteIdToDB = async (athleteId: string) => {
  const result = await NotesModel.find({ athleteId })
    .populate('athleteId', 'name email')
    .sort({ createdAt: -1 });
  return result;
};

// get all notes
const getAllNotesDataToDB = async () => {
  const result = await NotesModel.find()
    .populate('athleteId', 'name email')
    .sort({ createdAt: -1 });
  return result;
};
export const NotesService = {
  createNotesToDB,
  getSingleNotesToDB,
  getNotesByAthleteIdToDB,
  getAllNotesDataToDB,
};
