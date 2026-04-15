// models/Notification.ts
import { Schema, Types, model } from 'mongoose';
import { INotification, INotificationHistory } from './notification.interface';

const notificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  email: { type: String, required: true },
  username: { type: String, required: true },
  fcmToken: { type: String, default: '' },
  lastActive: { type: Date, default: Date.now }, // last login active time.
});

const notificationHistorySchema = new Schema<INotificationHistory>({
  userId: {
    type: Types.ObjectId,
    required: true,
    refPath: 'userModel',
  },
  userModel: {
    type: String,
    required: true,
    enum: ['Athlete', 'Coach', 'User'],
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  fcmToken: { type: String },
  read: { type: Boolean, default: false },
  sentAt: { type: Date, default: Date.now },
});

// notification are deleted after 3 months
notificationHistorySchema.index(
  { sentAt: 1 },
  { expireAfterSeconds: 3 * 30 * 24 * 60 * 60 }
);

export const NotificationModel = model('Notification_User', notificationSchema);
export const NotificationHistoryModel = model(
  'Notification_History',
  notificationHistorySchema
);

/** Get athletes whose checkDay matches today and haven't been notified */
export const getAthletesNotification = async (
  today: string
): Promise<INotification[]> => {
  return await NotificationModel.find();
};
