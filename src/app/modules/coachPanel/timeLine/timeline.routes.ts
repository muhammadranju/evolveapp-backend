import { Router } from 'express';
import {
  bulkUpdateTimelinePhaseController,
  getAthleteTimelineController,
  getAvailableTimelineYearsController,
  updatePhaseAthleteTimelineController,
} from './timeline.controller';

const router = Router();

router.get('/years/:athleteId', getAvailableTimelineYearsController);
router.get('/:athleteId', getAthleteTimelineController);
router.patch(
  '/bulk-update-phase/:athleteId',
  bulkUpdateTimelinePhaseController,
);
router.patch('/:athleteId', updatePhaseAthleteTimelineController);

export const TimeLineRouter = router;
