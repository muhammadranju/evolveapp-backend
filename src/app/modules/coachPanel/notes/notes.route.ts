import express from 'express';
import { NotesController } from './notes.controller';
const router = express.Router();

router.get('/single/:noteId', NotesController.getSingleNotes);
router.get('/athlete/:athleteId', NotesController.getNotesByAthleteId);
// router.get('/all', NotesController.getNetosByAthleteId);
router.get('/', NotesController.getAllNotesData);
router.post('/', NotesController.createNotes);

const NotesRouter = router;

export default NotesRouter;
