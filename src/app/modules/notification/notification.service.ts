// services/notification.service.ts
import admin from '../../../config/firebase';
import {
  NotificationModel,
  NotificationHistoryModel,
} from './notification.model';
import {
  INotification,
  INotificationHistory,
  SendNotificationResult,
} from './notification.interface';
import { Types } from 'mongoose';
import { DailyTrackingNotificationHistoryModel } from '../appAthlete/dailyTracking/dailytracking.notification.model';

// Save or update FCM token when user login.

const saveFCMToken = async (
  userId: string,
  username: string,
  email: string,
  fcmToken: string
): Promise<INotification> => {
  console.log('not', fcmToken);
  const existing = await NotificationModel.findOne({ fcmToken });
  if (existing) {
    return existing;
  }
  const newNotification = new NotificationModel({
    userId,
    username,
    email,
    fcmToken,
    lastActive: new Date(),
  });
  return await newNotification.save();
};

export const sendCheckingNotification = async (
  title: string,
  description: string,
  token: string,
  coachId: string
): Promise<SendNotificationResult> => {
  if (!token) {
    return { success: false, message: 'FCM token is required' };
  }

  const message: admin.messaging.Message = {
    token,
    notification: {
      title,
      body: description,
    },
  };

  try {
    const response = await admin.messaging().send(message);

    // Save notification history (optional but recommended)
    await NotificationHistoryModel.create({
      title,
      description,
      fcmToken: token,
      userId: coachId,
    });

    return { success: true, message: 'Notification is send to Coach' };
  } catch (error) {
    console.error('Push notification error:', error);
    return { success: false, message: 'Failed to send notification' };
  }
};

//Mark the read and unread notification...
const markNotificationAsRead = async (notificationId: string) => {
  return NotificationHistoryModel.findByIdAndUpdate(
    notificationId,
    { read: true },
    { new: true }
  );
};
//get unmark message from notification...
const getUnreadNotifications = async (userId: string) => {
  return NotificationHistoryModel.find({ userId, read: false }).sort({
    sentAt: -1,
  });
};

// get sppecefic user notification ....
const getNotification = async (userId: string) => {
  return await NotificationHistoryModel.find({ userId }).sort({ sentAt: -1 });
};

const getNotificationForAdmin = async () => {
  return await NotificationHistoryModel.find().sort({ sentAt: -1 });
};

/**
 * Send push notification to a single device
 * @param {string} deviceToken - FCM device token of athlete
 * @param {object} payload - {title, body}
 */
interface PushPayload {
  title: string;
  description: string;
}

interface PushResult {
  success: boolean;
  message?: string;
  response?: unknown;
}

/**
 * Send push notification via Firebase Cloud Messaging
 */
export const sendPushNotification = async (
  fcmToken: string,
  payload: PushPayload,
  userId: string
): Promise<PushResult> => {
  try {
    const message: admin.messaging.Message = {
      token: fcmToken,
      notification: {
        title: payload.title,
        body: payload.description,
      },
      data: {
        userId,
        type: 'CHECK_IN',
      },
    };

    const response = await admin.messaging().send(message);

    return {
      success: true,
      response,
    };
  } catch (error: any) {
    console.error('FCM Push Error:', error);

    return {
      success: false,
      message: error.message || 'Push notification failed',
    };
  }
};



/**
 * Send push notification via Firebase Cloud Messaging
 */
export const sendCheckingNotificationForDailyTracking = async (
  title: string,
  description: string,
  token: string,
  userId: string,
  coachId: string
): Promise<SendNotificationResult> => {
  if (!token) {
    return { success: false, message: 'FCM token is required' };
  }

  const message: admin.messaging.Message = {
    token,
    notification: {
      title,
      body: description,
    },
  };

  try {
    const response = await admin.messaging().send(message);

    // Save notification history (optional but recommended)
    await DailyTrackingNotificationHistoryModel.create({
      userId: userId,
      coachId: coachId,
      title,
      comments:description,
      fcmToken: token,
    });

    return { success: true, message: 'Notification is send to Coach' };
  } catch (error) {
    console.error('Push notification error:', error);
    return { success: false, message: 'Failed to send notification' };
  }
};




export const NotificationService = {
  saveFCMToken,
  markNotificationAsRead,
  getUnreadNotifications,
  getNotification,
  getNotificationForAdmin,
};
