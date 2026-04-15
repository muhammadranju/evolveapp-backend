import express from 'express';
import { DailyTrackingController } from './daily.tracking.controller';
import auth from '../../../middlewares/auth';
import { USER_ROLES } from '../../../../enums/user';

const router = express.Router();
const controller = new DailyTrackingController();

/**
 * Daily Tracking Routes
 */
router.get(
  '/notifications',
  auth(USER_ROLES.ATHLETE),
  controller.getDailyTrackingAllNotification,
);

router.get(
  '/notifications/single/:id',
  auth(USER_ROLES.ATHLETE),
  controller.getSingleDailyTrackingPushNotification,
);

router.get(
  '/by-date',
  auth(USER_ROLES.ATHLETE),
  controller.getAllDailyTrackingByDate,
);

router.post('/', auth(USER_ROLES.ATHLETE), controller.createDailyTracking);
router.get(
  '/:userId',
  auth(USER_ROLES.ATHLETE, USER_ROLES.COACH),
  controller.getAllDailyTracking,
);

router.get('/single/:id', controller.getSingleDailyTracking);

router.put(
  '/',
  auth(USER_ROLES.COACH, USER_ROLES.ATHLETE),
  controller.updateDailyTracking,
);

router.delete(
  '/:id',
  auth(USER_ROLES.COACH, USER_ROLES.SUPER_ADMIN),
  controller.deleteDailyTracking,
);

router.post(
  '/comment-notification/:userId',
  auth(USER_ROLES.COACH),
  controller.createDailyTrackingCommentNotification,
);

export const DailyTrackingRoutes = router;
