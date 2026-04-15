import { Router } from 'express';
import { AthleteNutritionPlanController } from './athlete.nutrition.controller';
import { USER_ROLES } from '../../../../enums/user';
import auth from '../../../middlewares/auth';

const router = Router();
const controller = new AthleteNutritionPlanController();

// CRUD routes
router.post('/:id', auth(USER_ROLES.COACH), controller.addNutritionPlan);
router.get('/:id', controller.getNutritionPlans); // with filter/search

router.get('/one/:id', controller.getNutritionPlanById);
router.put('/:userId/:id', controller.updateNutritionPlan);
router.delete('/:userId/:id', controller.deleteNutritionPlan);

export const CoachNutritionRouter = router;
