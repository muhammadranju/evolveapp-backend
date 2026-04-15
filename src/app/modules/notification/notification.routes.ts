// routes/notification.route.ts
import { Router } from 'express';
import { NotificationController } from './notification.controller';

import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';

const router = Router();
//get all notification..
router.get(
  '/',
  auth(USER_ROLES.COACH, USER_ROLES.ATHLETE, USER_ROLES.SUPER_ADMIN),
  NotificationController.getAllNotificationByUser
);
router.get('/admin', NotificationController.getAllNotificationByAdmin);
//send notification
router.post(
  '/send',
  auth(USER_ROLES.COACH, USER_ROLES.SUPER_ADMIN),
  NotificationController.pushNotification
);

router.patch('/read/:notificationId', NotificationController.readNotification);

router.get(
  '/unread',
  auth(USER_ROLES.COACH, USER_ROLES.SUPER_ADMIN),
  NotificationController.unreadNotifications
);

export const NotificationRoutes = router;
