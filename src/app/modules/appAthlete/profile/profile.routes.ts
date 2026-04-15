import { Router } from 'express';
import { ProfileController } from './profile.controller';
import auth from '../../../middlewares/auth';
import { USER_ROLES } from '../../../../enums/user';

const router = Router();
const profileController = new ProfileController();
// GET /api/athlete/:athleteId/details
router.get('/', auth(USER_ROLES.ATHLETE), profileController.getProfileDetails);

export const ProfileRouter = router;
