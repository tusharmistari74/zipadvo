import type {
  AppNotification,
  NotificationChannel,
  NotificationDeliveryReport,
  ChannelDeliveryStatus,
  NotificationPayload,
} from '@legalhub/types';
import {
  deliverInAppNotification,
  getInAppNotificationsForUser,
  getUnreadInAppCount,
  markInAppNotificationAsRead,
  markAllInAppNotificationsAsRead,
  resetInAppNotificationStore,
} from './drivers/in-app.driver';
import {
  deliverEmailNotification,
  getSentEmailSpool,
  clearSentEmailSpool,
} from './drivers/email.driver';
import {
  deliverSmsNotification,
  getSentSmsSpool,
  clearSentSmsSpool,
} from './drivers/sms.driver';
import {
  deliverPushNotification,
  getSentPushSpool,
  clearSentPushSpool,
} from './drivers/push.driver';

export interface DispatchNotificationResult {
  success: boolean;
  notificationId: string;
  notification: AppNotification;
  deliveryReports: NotificationDeliveryReport[];
  error?: string;
}

/**
 * Emits a decoupled business event and dispatches notifications across configured channels
 * with strict transactional error isolation
 */
export async function emitNotificationEvent(
  payload: NotificationPayload
): Promise<DispatchNotificationResult> {
  const now = new Date().toISOString();
  const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const recipientUid = payload.recipientUid;
  const channels: NotificationChannel[] = payload.channels || ['in_app', 'email'];

  const deliveryStatusMap: Record<NotificationChannel, ChannelDeliveryStatus> = {
    in_app: 'skipped',
    email: 'skipped',
    sms: 'skipped',
    push: 'skipped',
    whatsapp: 'skipped',
  };

  const deliveryReports: NotificationDeliveryReport[] = [];

  const baseNotification: AppNotification = {
    id: notificationId,
    notificationId,
    recipientUid,
    userId: recipientUid,
    type: payload.type,
    eventType: payload.type,
    title: payload.title,
    body: payload.body,
    message: payload.body,
    channels,
    deliveryStatus: deliveryStatusMap,
    deliveryReports,
    isRead: false,
    read: false,
    actionUrl: payload.actionUrl,
    metadata: payload.metadata,
    createdAt: now,
    updatedAt: now,
  };

  // 1. In-App Delivery
  if (channels.includes('in_app')) {
    try {
      const inAppReport = await deliverInAppNotification(baseNotification);
      deliveryReports.push(inAppReport);
      deliveryStatusMap.in_app = inAppReport.status;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'In-app persistence failure';
      deliveryReports.push({
        channel: 'in_app',
        status: 'failed',
        error: errorMsg,
        dispatchedAt: now,
      });
      deliveryStatusMap.in_app = 'failed';
    }
  }

  // 2. Email Delivery (Error Isolated)
  if (channels.includes('email') && payload.recipientEmail) {
    try {
      const emailReport = await deliverEmailNotification({
        to: payload.recipientEmail,
        subject: `[LegalHubMumbai] ${payload.title}`,
        body: payload.body,
        actionUrl: payload.actionUrl,
        metadata: payload.metadata,
      });
      deliveryReports.push(emailReport);
      deliveryStatusMap.email = emailReport.status;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Email dispatch network failure';
      deliveryReports.push({
        channel: 'email',
        status: 'failed',
        error: errorMsg,
        dispatchedAt: now,
      });
      deliveryStatusMap.email = 'failed';
    }
  }

  // 3. SMS Delivery (Error Isolated)
  if (channels.includes('sms') && payload.recipientPhone) {
    try {
      const smsReport = await deliverSmsNotification({
        to: payload.recipientPhone,
        text: `LegalHubMumbai: ${payload.title}. ${payload.body}`,
        metadata: payload.metadata,
      });
      deliveryReports.push(smsReport);
      deliveryStatusMap.sms = smsReport.status;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'SMS dispatch network failure';
      deliveryReports.push({
        channel: 'sms',
        status: 'failed',
        error: errorMsg,
        dispatchedAt: now,
      });
      deliveryStatusMap.sms = 'failed';
    }
  }

  // 4. Push Delivery (Error Isolated)
  if (channels.includes('push')) {
    try {
      const pushReport = await deliverPushNotification({
        userId: recipientUid,
        title: payload.title,
        body: payload.body,
        actionUrl: payload.actionUrl,
        data: payload.metadata,
      });
      deliveryReports.push(pushReport);
      deliveryStatusMap.push = pushReport.status;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Push notification delivery failure';
      deliveryReports.push({
        channel: 'push',
        status: 'failed',
        error: errorMsg,
        dispatchedAt: now,
      });
      deliveryStatusMap.push = 'failed';
    }
  }

  baseNotification.deliveryStatus = deliveryStatusMap;
  baseNotification.deliveryReports = deliveryReports;

  return {
    success: true,
    notificationId,
    notification: baseNotification,
    deliveryReports,
  };
}

/**
 * Retrieves in-app notifications for a user (strict multi-tenant isolation)
 */
export async function getUserNotifications(
  targetUserId: string,
  callerUid: string,
  options?: { unreadOnly?: boolean; limit?: number }
): Promise<{ success: boolean; error?: string; notifications: AppNotification[] }> {
  if (targetUserId !== callerUid) {
    return {
      success: false,
      error: 'Unauthorized: You can only access your own notifications feed.',
      notifications: [],
    };
  }

  const notifications = await getInAppNotificationsForUser(targetUserId, options);
  return { success: true, notifications };
}

/**
 * Retrieves unread notifications count for badge display
 */
export async function getUnreadNotificationCount(
  targetUserId: string,
  callerUid: string
): Promise<{ success: boolean; error?: string; count: number }> {
  if (targetUserId !== callerUid) {
    return {
      success: false,
      error: 'Unauthorized: You can only query your own unread badge count.',
      count: 0,
    };
  }

  const count = await getUnreadInAppCount(targetUserId);
  return { success: true, count };
}

/**
 * Marks a single notification as read
 */
export async function markNotificationAsRead(
  notificationId: string,
  callerUid: string
): Promise<{ success: boolean; error?: string; notification?: AppNotification }> {
  return markInAppNotificationAsRead(notificationId, callerUid);
}

/**
 * Marks all notifications as read for the user
 */
export async function markAllNotificationsAsRead(
  callerUid: string
): Promise<{ success: boolean; updatedCount: number }> {
  return markAllInAppNotificationsAsRead(callerUid);
}

/**
 * Resets notification queues and stores (useful in test runner)
 */
export function resetNotificationSystem(): void {
  resetInAppNotificationStore();
  clearSentEmailSpool();
  clearSentSmsSpool();
  clearSentPushSpool();
}

export {
  getSentEmailSpool,
  getSentSmsSpool,
  getSentPushSpool,
};
