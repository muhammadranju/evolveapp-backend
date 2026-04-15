import express from 'express';
import { FoodItemController } from './food.controller';
import auth from '../../../../middlewares/auth';
import { USER_ROLES } from '../../../../../enums/user';

const router = express.Router();
const foodController = new FoodItemController();

// Public routes
router.get('/', foodController.getAllFoodItems);
router.get('/:id', foodController.getFoodItemById);

// Protected routes (Admin or Coach)
router.post(
  '/',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.COACH, USER_ROLES.ATHLETE),
  foodController.addFoodItem
);
router.put(
  '/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.COACH),
  foodController.updateFoodItem
);
router.delete(
  '/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.COACH),
  foodController.deleteFoodItem
);

export const FoodItemRoutes = router;
