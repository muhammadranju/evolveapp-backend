import express from 'express';
import { ShowManagementController } from './mangement.controller';
import auth from '../../../middlewares/auth';
import { USER_ROLES } from '../../../../enums/user';

const router = express.Router();
const showController = new ShowManagementController();

// CRUD routes
router.post(
  '/',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.COACH),
  showController.addShow,
);
router.get('/', showController.getAllShows);

router.get('/:id', showController.getShowById);
router.put(
  '/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.COACH),
  showController.updateShow,
);
router.delete(
  '/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.COACH),
  showController.deleteShow,
);
router.post(
  '/show-assign',
  // auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.COACH),
  showController.assignShow,
);

export const ShowManagementRoutes = router;
