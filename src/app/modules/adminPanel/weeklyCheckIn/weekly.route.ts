import express from 'express';
import { WeeklyCheckInController } from './weekly.controller';

const router = express.Router();
const controller = new WeeklyCheckInController();
// GET /api/athletes-with-coach
router.get('/', controller.getWeeklyCheckIn);

export const WeeklyCheckInRouter = router;
