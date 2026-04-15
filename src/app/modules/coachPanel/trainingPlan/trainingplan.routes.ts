import express from 'express';
import { TrainingPlanController } from './trainingplan.controller';
import auth from '../../../middlewares/auth';
import { USER_ROLES } from '../../../../enums/user';

const router = express.Router();
const controller = new TrainingPlanController();

/**
 * Create training plan
 */
router.post('/:userId', auth(USER_ROLES.COACH), controller.addTrainingPlan);

/**
 * Get training plans by name
 * Example: /api/v1/training-plans?name=Leg
 */
router.get('/:userId', controller.getTrainingPlansByName);
router.get(
  '/id/:id',
  auth(USER_ROLES.ATHLETE, USER_ROLES.COACH),
  controller.getTrainingPlansById
);

/**
 * Update training plan by ID
 */
router.put(
  '/:userId/:id',
  auth(USER_ROLES.COACH),
  controller.updateTrainingPlan
);

/**
 * Delete training plan by ID
 */
router.delete('/:userId/:id', controller.deleteTrainingPlan);

export const TrainingPlanRoutes = router;
