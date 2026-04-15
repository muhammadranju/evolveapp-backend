import {
  getAthletesForToday,
  markNotificationSent,
  resetWeeklyNotifications,
} from '../../app/modules/adminPanel/athlete/athleteModel';
import { NotificationModel } from '../../app/modules/notification/notification.model';
import { sendPushNotification } from '../../app/modules/notification/notification.service';

const daysOfWeek = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/** Send weekly notifications automatically */
export const sendWeeklyNotifications = async (): Promise<void> => {
  try {
    const today = daysOfWeek[new Date().getDay()];
    console.log(`Today is ${today}, checking athletes...`);

    const athletes = await getAthletesForToday(today);
    for (const athlete of athletes) {
      if (!athlete.fcmToken) continue;
      await sendPushNotification(athlete.fcmToken, {
        title: 'Weekly Check Day Reminder',
        description: `Today is your check day (${today}). Don't forget to complete your activity!`,
      }, athlete._id.toString());

      await markNotificationSent(athlete._id.toString());
    }

    console.log('Weekly notifications sent for today!');
  } catch (err) {
    console.error('Error sending weekly notifications:', err);
  }
};

/** Reset weekly notification flags */
export const resetNotificationsWeekly = async (): Promise<void> => {
  try {
    await resetWeeklyNotifications();
    console.log('Weekly notifications reset!');
  } catch (err) {
    console.error('Error resetting notifications:', err);
  }
};
