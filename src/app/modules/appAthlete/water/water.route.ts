import express from 'express';
import { WaterController } from './water.controller';
import { USER_ROLES } from '../../../../enums/user';
import auth from '../../../middlewares/auth';


const router = express.Router();

router.post('/', auth(USER_ROLES.ATHLETE),WaterController.createWater);
router.get('/',auth(USER_ROLES.ATHLETE), WaterController.getAllWater);
router.get('/:id', WaterController.getSingleWater);
router.patch('/:id', WaterController.updateWater);
router.delete('/:id', WaterController.deleteWater);

export const WaterRoutes = router;
