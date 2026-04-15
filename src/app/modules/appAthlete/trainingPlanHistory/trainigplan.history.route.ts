import express from 'express';
import { TrainingPushDayHistoryController } from './trainigplan.history.controller';
import auth from '../../../middlewares/auth';
import { USER_ROLES } from '../../../../enums/user';

const router = express.Router();
const controller = new TrainingPushDayHistoryController();

/**
 * Add Training Push Day History
 */
router.post(
  '/',
  auth(USER_ROLES.ATHLETE, USER_ROLES.COACH, USER_ROLES.SUPER_ADMIN),
  controller.addTrainingPushDayHistory,
);

/**
 * Get Training Push Day History
 */
router.get(
  '/',
  auth(USER_ROLES.ATHLETE, USER_ROLES.COACH, USER_ROLES.SUPER_ADMIN),
  controller.getTrainingPushDayHistory,
);

router.get(
  '/:userId',
  auth(USER_ROLES.COACH, USER_ROLES.SUPER_ADMIN, USER_ROLES.ATHLETE),
  controller.getTrainingPushDayHistoryById,
);

/**
 * Update Training Push Day History
 */
router.patch(
  '/:id',
  auth(USER_ROLES.ATHLETE, USER_ROLES.COACH, USER_ROLES.SUPER_ADMIN),
  controller.updateTrainingPushDayHistory,
);

/**
 * Delete Training Push Day History
 */
router.delete(
  '/:id',
  auth(USER_ROLES.ATHLETE, USER_ROLES.COACH, USER_ROLES.SUPER_ADMIN),
  controller.deleteTrainingPushDayHistory,
);

export const TrainingPushDayHistoryRoutes = router;
