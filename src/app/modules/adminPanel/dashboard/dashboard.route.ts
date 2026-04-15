import { Router } from 'express';
import auth from '../../../middlewares/auth';
import { USER_ROLES } from '../../../../enums/user';
import { adminDashboardController } from './dashboard.controller';
import { CoachDashboardController } from '../../coachPanel/dashboard/dashboard.controller';

const router = Router();
const controller = new adminDashboardController();
const dashboardController = new CoachDashboardController();
router.get(
  '/admin',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.COACH),
  controller.dashboardInfo,
);
router.get('/alert', controller.dashboardAlert);
router.get(
  '/coach',
  auth(USER_ROLES.COACH),
  dashboardController.getCoachDashboardStats,
);
router.get(
  '/weekly-checkins',
  auth(USER_ROLES.COACH),
  dashboardController.getWeeklyCheckins,
);

export const DashboardRouter = router;
