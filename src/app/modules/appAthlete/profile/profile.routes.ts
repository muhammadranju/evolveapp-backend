import { Router } from 'express';
import { ProfileController } from './profile.controller';
import auth from '../../../middlewares/auth';
import { USER_ROLES } from '../../../../enums/user';

const router = Router();
const profileController = new ProfileController();

// GET /api/athlete/:athleteId/details
router.get('/', auth(USER_ROLES.ATHLETE), profileController.getProfileDetails);

// DELETE /api/v1/profile/remove-show
// Body: { athleteId, showId }
router.delete(
  '/remove-show',
  auth(USER_ROLES.COACH, USER_ROLES.SUPER_ADMIN),
  profileController.removeShow,
);

export const ProfileRouter = router;
