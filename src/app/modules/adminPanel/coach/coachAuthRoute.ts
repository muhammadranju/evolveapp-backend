import express from 'express';
import { USER_ROLES } from '../../../../enums/user';
import { CoachAuthController } from './coachAuthController';
import auth from '../../../middlewares/auth';
import fileUploadHandler from '../../../middlewares/fileUploadHandler';

const router = express.Router();
const authController = new CoachAuthController();

// Public routes
router.post('/login', authController.login);

router.post('/forget-password', authController.forgotPassword);

router.post('/verify-email', authController.verifyEmail);

router.post('/request-verification', authController.requestVerification);

router.post('/reset-password', authController.resetPassword);

// Protected routes (require authentication)
router.get('/profile', auth(USER_ROLES.COACH), authController.getProfile);

router.patch(
  '/profile',
  auth(USER_ROLES.COACH),
  fileUploadHandler(),
  authController.updateProfile
);

router.patch(
  '/change-password',
  auth(USER_ROLES.COACH),
  authController.changePassword
);

router.post('/logout', auth(USER_ROLES.COACH), authController.logout);

export const CoachAuthRoutes = router;
