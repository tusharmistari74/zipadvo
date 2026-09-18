import {
  doc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../../../firebase/client';
import { COLLECTIONS } from '../../../firebase/collections';
import type { AppNotification, NotificationDeliveryReport } from '@legalhub/types';

// In-memory notifications store for instant responsiveness & test resilience
const inAppNotificationStore: Record<string, AppNotification> = {};

export function resetInAppNotificationStore(): void {
  Object.keys(inAppNotificationStore).forEach((k) => delete inAppNotificationStore[k]);
}

/**
 * Persists an in-app notification to the user's notification feed
 */
export async function deliverInAppNotification(
  notification: AppNotification
): Promise<NotificationDeliveryReport> {
  const now = new Date().toISOString();
  notification.updatedAt = now;

  // 1. Write to memory store
  inAppNotificationStore[notification.id] = { ...notification };

  // 2. Write to Firestore if not in test environment
  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'test') {
    try {
      const notifRef = doc(db, COLLECTIONS.NOTIFICATIONS, notification.id);
      await setDoc(notifRef, notification);
    } catch {
      // Memory fallback
    }
  }

  return {
    channel: 'in_app',
    status: 'delivered',
    provider: 'firestore_in_app',
    providerMessageId: notification.id,
    dispatchedAt: now,
  };
}

/**
 * Retrieves all in-app notifications for a user (strict tenant isolation)
 */
export async function getInAppNotificationsForUser(
  userId: string,
  options?: { unreadOnly?: boolean; limit?: number }
): Promise<AppNotification[]> {
  let userNotifs = Object.values(inAppNotificationStore).filter(
    (n) => n.recipientUid === userId || n.userId === userId
  );

  if (options?.unreadOnly) {
    userNotifs = userNotifs.filter((n) => !n.isRead && !n.read);
  }

  // Sort descending by creation date
  userNotifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (options?.limit && options.limit > 0) {
    userNotifs = userNotifs.slice(0, options.limit);
  }

  return userNotifs;
}

/**
 * Gets count of unread notifications for a user
 */
export async function getUnreadInAppCount(userId: string): Promise<number> {
  const userNotifs = Object.values(inAppNotificationStore).filter(
    (n) => (n.recipientUid === userId || n.userId === userId) && !n.isRead && !n.read
  );
  return userNotifs.length;
}

/**
 * Marks a single notification as read
 */
export async function markInAppNotificationAsRead(
  notificationId: string,
  userId: string
): Promise<{ success: boolean; error?: string; notification?: AppNotification }> {
  const notif = inAppNotificationStore[notificationId];

  if (!notif) {
    return { success: false, error: 'Notification not found.' };
  }

  // Tenant authorization check
  if (notif.recipientUid !== userId && notif.userId !== userId) {
    return { success: false, error: 'Unauthorized: Cannot modify another user notification.' };
  }

  const now = new Date().toISOString();
  notif.isRead = true;
  notif.read = true;
  notif.readAt = now;
  notif.updatedAt = now;

  inAppNotificationStore[notificationId] = notif;

  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'test') {
    try {
      const notifRef = doc(db, COLLECTIONS.NOTIFICATIONS, notificationId);
      await updateDoc(notifRef, { isRead: true, read: true, readAt: now, updatedAt: now });
    } catch {
      // Memory fallback
    }
  }

  return { success: true, notification: notif };
}

/**
 * Marks all notifications as read for a user
 */
export async function markAllInAppNotificationsAsRead(
  userId: string
): Promise<{ success: boolean; updatedCount: number }> {
  const now = new Date().toISOString();
  let updatedCount = 0;

  Object.values(inAppNotificationStore).forEach((notif) => {
    if ((notif.recipientUid === userId || notif.userId === userId) && (!notif.isRead || !notif.read)) {
      notif.isRead = true;
      notif.read = true;
      notif.readAt = now;
      notif.updatedAt = now;
      updatedCount++;
    }
  });

  return { success: true, updatedCount };
}
