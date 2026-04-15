import { Schema, model, Document } from "mongoose";
import { IDailyTrackingNotificationHistory } from "./daily.tracking.interface";

const DailyTrackingNotificationHistorySchema =
  new Schema<IDailyTrackingNotificationHistory>(
    {
      userId: {
        type: String,
        required: true,
        trim: true,
      },
      coachId: {
        type: String,
        required: true,
        trim: true,
      },
      title: {
        type: String,
        required: true,
        trim: true,
      },
      comments: {
        type: String,
        trim: true,
      },
      fcmToken: {
        type: String,
      },
      read: {
        type: Boolean,
        default: false, 
      },
      sentAt: {
        type: Date,
        default: Date.now, 
      },
    },
    {
      timestamps: true, 
    }
  );


export const DailyTrackingNotificationHistoryModel =
  model<IDailyTrackingNotificationHistory>(
    "DailyTrackingNotificationHistory",
    DailyTrackingNotificationHistorySchema
  );
