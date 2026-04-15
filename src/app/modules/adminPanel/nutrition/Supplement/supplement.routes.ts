import express from 'express';
import { SupplementItemController } from './supplement.controller';
import auth from '../../../../middlewares/auth';
import { USER_ROLES } from '../../../../../enums/user';

const router = express.Router();
const supplementController = new SupplementItemController();

// Public routes
router.get(
  '/:userId',
  auth(USER_ROLES.ATHLETE, USER_ROLES.COACH),
  supplementController.getAllSupplements
);

router.get(
  '/',
  auth(USER_ROLES.ATHLETE, USER_ROLES.COACH, USER_ROLES.SUPER_ADMIN),
  supplementController.getAllSupplementsByAdmin
);

router.get('/:id', supplementController.getSupplementById);

// Protected routes (Admin or Coach), here pass userID by query params userId.
router.post(
  '/:userId',
  auth(USER_ROLES.COACH),
  supplementController.addSupplement
);

router.post(
  '/',
  auth(USER_ROLES.SUPER_ADMIN,USER_ROLES.COACH),
  supplementController.addSupplementByAdmin
);
router.put(
  '/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.COACH),
  supplementController.updateSupplement
);
router.put(
  '/coach/:userId/:id',
  auth(USER_ROLES.COACH),
  supplementController.updateSupplementByCoach
);

router.delete(
  '/coach/:userId/:id',
  auth(USER_ROLES.COACH),
  supplementController.deleteSupplementByCoach
);
router.delete(
  '/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.COACH),
  supplementController.deleteSupplement
);

export const SupplementItemRoute = router;
