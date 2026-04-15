import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { AthleteRouter } from '../app/modules/adminPanel/athlete/athleteRoute';
import { coachRoutes } from '../app/modules/adminPanel/coach/coachroute';
import { CoachAuthRoutes } from '../app/modules/adminPanel/coach/coachAuthRoute';
import { ExerciseRouter } from '../app/modules/adminPanel/exercise/exercise.route';
import { AthleteAuthRoutes } from '../app/modules/adminPanel/athlete/athleteAuthRoute';
import { FoodItemRoutes } from '../app/modules/adminPanel/nutrition/Food/food.routes';
import { SupplementItemRoute } from '../app/modules/adminPanel/nutrition/Supplement/supplement.routes';
import { ShowManagementRoutes } from '../app/modules/coachPanel/showManagement/management.route';
import { DailyTrackingRoutes } from '../app/modules/appAthlete/dailyTracking/daily.tracking.routes';
import { CheckInRoter } from '../app/modules/appAthlete/checkIn/checkin.routes';
import { CoachNutritionRouter } from '../app/modules/coachPanel/athletNutrition/athlete.nutrition.routes';
import { DailyTrackingMealRoutes } from '../app/modules/appAthlete/trackMeal/track.meal.route';
import { TrainingPlanRoutes } from '../app/modules/coachPanel/trainingPlan/trainingplan.routes';
import { TrainingPushDayHistoryRoutes } from '../app/modules/appAthlete/trainingPlanHistory/trainigplan.history.route';
import { TrainingPlanSpliteRoutes } from '../app/modules/coachPanel/trainingSplite/training.splite.route';
import { getAthleteTimelineController } from '../app/modules/coachPanel/timeLine/timeline.controller';
import { TimeLineRouter } from '../app/modules/coachPanel/timeLine/timeline.routes';
import { ProfileRouter } from '../app/modules/appAthlete/profile/profile.routes';
import { PEDDatabaseRouter } from '../app/modules/coachPanel/ped/ped.route';
import { DashboardRouter } from '../app/modules/adminPanel/dashboard/dashboard.route';
import { WeeklyCheckInRouter } from '../app/modules/adminPanel/weeklyCheckIn/weekly.route';
import { PEDDatabaseInfoRouter } from '../app/modules/coachPanel/pedDatabase/ped.database.route';
import { CoachExerciseRouter } from '../app/modules/coachPanel/coachExercise/exercise.route';
import { WaterRoutes } from '../app/modules/appAthlete/water/water.route';
import NotesRouter from '../app/modules/coachPanel/notes/notes.route';

const router = express.Router();

const apiRoutes = [
  {
    path: '/user',
    route: UserRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/auth/coach',
    route: CoachAuthRoutes,
  },
  {
    path: '/coach',
    route: coachRoutes,
  },
  {
    path: '/auth/athlete',
    route: AthleteAuthRoutes,
  },
  {
    path: '/dashboard',
    route: DashboardRouter,
  },
  {
    path: '/athlete',
    route: AthleteRouter,
  },
  {
    path: '/exercise',
    route: ExerciseRouter,
  },
  {
    path: '/exercise/coach',
    route: CoachExerciseRouter,
  },
  {
    path: '/food/nutrition',
    route: FoodItemRoutes,
  },
  {
    path: '/supplement/nutrition',
    route: SupplementItemRoute,
  },
  {
    path: '/ped/nutrition',
    route: PEDDatabaseInfoRouter,
  },
  {
    path: '/show/management',
    route: ShowManagementRoutes,
  },
  {
    path: '/daily/tracking',
    route: DailyTrackingRoutes,
  },
  {
    path: '/check-in',
    route: CheckInRoter,
  },
  {
    path: '/coach/nutrition',
    route: CoachNutritionRouter,
  },
  {
    path: '/track/meal',
    route: DailyTrackingMealRoutes,
  },
  {
    path: '/training/plan',
    route: TrainingPlanRoutes,
  },
  {
    path: '/training/history',
    route: TrainingPushDayHistoryRoutes,
  },
  {
    path: '/training/splite',
    route: TrainingPlanSpliteRoutes,
  },
  {
    path: '/timeline',
    route: TimeLineRouter,
  },
  {
    path: '/profile',
    route: ProfileRouter,
  },
  {
    path: '/ped',
    route: PEDDatabaseRouter,
  },
  {
    path: '/weekly',
    route: WeeklyCheckInRouter,
  },
  {
    path: '/water',
    route: WaterRoutes,
  },

  {
    path: '/notes',
    route: NotesRouter,
  },
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
