import express from 'express';
import { TrainingPlanSpliteController } from './training.splite.controller';
import auth from '../../../middlewares/auth';
import { USER_ROLES } from '../../../../enums/user';

const router = express.Router();
const controller = new TrainingPlanSpliteController();

/**
 * Create training plan split
 */
router.post(
  '/:userId',
  auth(USER_ROLES.COACH),
  controller.addTrainingPlanSplite
);

/**
 * Get all training plan splits
 */
router.get(
  '/:userId',
  auth(USER_ROLES.COACH, USER_ROLES.ATHLETE),
  controller.getTrainingPlanSplites
);

/**
 * Update training plan split
 */
router.put(
  '/:userId/:id',
  auth(USER_ROLES.COACH),
  controller.updateTrainingPlanSplite
);

/**
 * Delete training plan split
 */
router.delete(
  '/:userId/:id',
  auth(USER_ROLES.COACH),
  controller.deleteTrainingPlanSplite
);

export const TrainingPlanSpliteRoutes = router;
