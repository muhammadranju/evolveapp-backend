import express from 'express';
import { USER_ROLES } from '../../../../enums/user';
import { CoachController } from './coachController';
import auth from '../../../middlewares/auth';
import fileUploadHandler from '../../../middlewares/fileUploadHandler';

const router = express.Router();
const coachController = new CoachController();

// Public routes
router.post('/request-password-reset', coachController.requestPasswordReset);

router.post('/reset-password', coachController.resetPassword);

// Protected routes
/**
 * @route   GET /api/v1/coaches
 * @desc    Get all coaches with pagination
 * @access  Private (Admin only)
 */
router.get('/', coachController.getAll);

/**
 * @route   GET /api/v1/coaches/:id
 * @desc    Get single coach by ID
 * @access  Private (Coach or Admin)
 */
router.get(
  '/:id',
  auth(USER_ROLES.COACH, USER_ROLES.SUPER_ADMIN),
  coachController.getById
);

/**
 * @route   POST /api/v1/coaches
 * @desc    Create a new coach
 * @access  Public (for registration) or Private (Admin)
 */
router.post('/', fileUploadHandler(), coachController.create);

/**
 * @route   PATCH /api/v1/coaches/:id
 * @desc    Update coach by ID
 * @access  Private (Coach or Admin)
 */
router.patch(
  '/:id',
  auth(USER_ROLES.COACH, USER_ROLES.SUPER_ADMIN),
  fileUploadHandler(),
  coachController.update
);

/**
 * @route   DELETE /api/v1/coaches/:id
 * @desc    Delete coach (soft delete)
 * @access  Private (Admin only)
 */
router.delete(
  '/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.COACH),
  coachController.delete
);

/**
 * @route   PATCH /api/v1/coaches/:id/verify
 * @desc    Verify coach account
 * @access  Private (Admin only)
 */
router.patch(
  '/:id/verify',
  auth(USER_ROLES.SUPER_ADMIN),
  coachController.verifyCoach
);

/**
 * @route   PATCH /api/v1/coaches/:id/last-active
 * @desc    Update coach last active timestamp
 * @access  Private (Coach only)
 */
router.patch(
  '/:id/last-active',
  auth(USER_ROLES.COACH),
  coachController.updateLastActive
);

/**
 * @route   PATCH /api/v1/coaches/:id/change-password
 * @desc    Change coach password
 * @access  Private (Coach only)
 */
router.patch(
  '/:id/change-password',
  auth(USER_ROLES.COACH),
  coachController.changePassword
);

export const coachRoutes = router;
