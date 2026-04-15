import catchAsync from '../../../shared/catchAsync';
import { Request, Response, NextFunction } from 'express';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import {
  NotificationService,
  sendPushNotification,
} from './notification.service';
import { CoachModel } from '../adminPanel/coach/coachModel';

// Save or update FCM token
const saveToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, username, email, fcmToken } = req.body;

      if (!userId || !username || !email || !fcmToken) {
        return sendResponse(res, {
          success: false,
          statusCode: StatusCodes.BAD_REQUEST,
          message: 'userId, username, email and fcmToken are required',
        });
      }

      const notification = await NotificationService.saveFCMToken(
        userId,
        username,
        email,
        fcmToken
      );

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'FCM token saved successfully',
        data: notification,
      });
    } catch (err) {
      next(err);
    }
  }
);

// Send push notification only for check-in complerted.
const pushNotification = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;

  const coach = await CoachModel.findById(userId).select('fcmToken name');

  if (!coach?.fcmToken) {
    return sendResponse(res, {
      success: false,
      statusCode: StatusCodes.BAD_REQUEST,
      message: 'FCM token not found',
    });
  }

  const title = 'Check-in completed';
  const description = `${coach.name}, an athlete has completed his check-in. Please review it.`;

  const payload = {
    title,
    description,
  };

  const result = await sendPushNotification(coach.fcmToken, payload, userId);

  sendResponse(res, {
    success: result.success,
    statusCode: StatusCodes.OK,
    message: result.success
      ? 'Notification sent successfully'
      : result.message || 'Failed to send notification',
    data: result.response,
  });
});

// set the read notification base on the user..
const readNotification = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { notificationId } = req.params;

      if (!notificationId) {
        return sendResponse(res, {
          success: false,
          statusCode: StatusCodes.BAD_REQUEST,
          message: 'Notification ID is required',
        });
      }

      const notification = await NotificationService.markNotificationAsRead(
        notificationId
      );

      sendResponse(res, {
        success: !!notification,
        statusCode: notification ? StatusCodes.OK : StatusCodes.NOT_FOUND,
        message: notification
          ? 'Notification marked as read'
          : 'Notification not found',
        data: notification,
      });
    } catch (err) {
      next(err);
    }
  }
);

// get all unread notification for the user..
const unreadNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;

    const notifications = await NotificationService.getUnreadNotifications(
      userId
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Unread notifications retrieved successfully',
      data: notifications,
    });
  } catch (err) {
    next(err);
  }
};

// get all notification for the spacefic user...
const getAllNotificationByUser = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user.id;
    const result = await NotificationService.getNotification(userId);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Notification fetch successfully',
      data: result,
    });
  }
);

const getAllNotificationByAdmin = catchAsync(
  async (req: Request, res: Response) => {
    const result = await NotificationService.getNotificationForAdmin();
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Notification fetch successfully',
      data: result,
    });
  }
);

export const NotificationController = {
  pushNotification,
  saveToken,
  readNotification,
  unreadNotifications,
  getAllNotificationByUser,
  getAllNotificationByAdmin,
};
