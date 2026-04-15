import { Router } from 'express';
import {
  bulkUpdateTimelinePhaseController,
  getAthleteTimelineController,
  updatePhaseAthleteTimelineController,
} from './timeline.controller';

const router = Router();

router.get('/:athleteId', getAthleteTimelineController);
router.patch(
  '/bulk-update-phase/:athleteId',
  bulkUpdateTimelinePhaseController,
);
router.patch('/:athleteId', updatePhaseAthleteTimelineController);

export const TimeLineRouter = router;
