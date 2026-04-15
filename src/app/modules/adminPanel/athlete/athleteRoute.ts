import { Router } from 'express';
import { AthleteController } from './athleteController';
import auth from '../../../middlewares/auth';
import { USER_ROLES } from '../../../../enums/user';
import fileUploadHandler from '../../../middlewares/fileUploadHandler';

const router = Router();
const controller = new AthleteController();

router.post(
  '/',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.COACH),
  fileUploadHandler(),
  controller.create,
);

router.get(
  '/',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.COACH, USER_ROLES.ATHLETE),
  controller.getAll,
);

router.get(
  '/single/:id',
  // auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.COACH),
  controller.getSingleProfile,
);
router.get('/coachId', auth(USER_ROLES.COACH), controller.getAllByCoach);
router.get(
  '/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.COACH, USER_ROLES.ATHLETE),
  controller.getOne,
);
router.put(
  '/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.COACH),
  fileUploadHandler(),
  controller.update,
);
router.delete(
  '/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.COACH),
  controller.delete,
);

// Athlete check-in
router.put(
  '/check-in/:id',
  auth(USER_ROLES.COACH, USER_ROLES.ATHLETE),
  controller.checkIn,
);

// Active / In-Active update on log in and log out.
router.put('/status', auth(USER_ROLES.ATHLETE), controller.updateStatus);

// get and update athlete profile...
router
  .route('/profile')
  .get(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.COACH),
    controller.getAthleteProfile,
  )
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.COACH),
    fileUploadHandler(),
    controller.updateProfile,
  );

export const AthleteRouter = router;
