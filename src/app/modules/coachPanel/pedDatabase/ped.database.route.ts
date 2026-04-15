import express from 'express';
import { PEDDatabaseController } from './ped.database.controller';
import auth from '../../../middlewares/auth';
import { USER_ROLES } from '../../../../enums/user';

const router = express.Router();
const controller = new PEDDatabaseController();

/**
 * PED Database Routes
 */
router.post(
  '/',
  auth(USER_ROLES.COACH, USER_ROLES.SUPER_ADMIN),
  controller.createWeeklyPEDDatabase
);
// router.get('/', controller.getPEDByAthlete);
// router.get('/', controller.getPEDByWeek);

export const PEDDatabaseInfoRouter = router;
