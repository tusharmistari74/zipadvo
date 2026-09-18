import { getMessaging, getToken, onMessage, Messaging, isSupported } from 'firebase/messaging';
import { app } from './client';
import { logger } from '@legalhub/utils';

export const VAPID_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ||
  'BElhVcQ9mTyHi_3sb0959JN_0Mo-qAqiEonahETk3sLuZIBgPV1tqKqRAqAtZhcwdst6JqmQotE_VXcYy3U-3YU';

let messagingInstance: Messaging | null = null;

/**
 * Initializes and returns the Firebase Messaging instance in supported browser environments
 */
export async function getMessagingInstance(): Promise<Messaging | null> {
  if (typeof window === 'undefined') return null;

  const supported = await isSupported().catch(() => false);
  if (!supported) {
    logger.info('Firebase Cloud Messaging is not supported in this browser environment');
    return null;
  }

  if (!messagingInstance) {
    try {
      messagingInstance = getMessaging(app);
    } catch (err) {
      logger.warn('Failed to initialize Firebase Messaging', { error: err });
      return null;
    }
  }

  return messagingInstance;
}

/**
 * Requests Notification permission and retrieves the FCM Web Push Token
 */
export async function requestNotificationPermissionAndGetToken(): Promise<string | null> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      logger.info('Notification permission was not granted by user', { permission });
      return null;
    }

    const messaging = await getMessagingInstance();
    if (!messaging) return null;

    const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
    if (currentToken) {
      logger.info('FCM Registration Token generated successfully');
      return currentToken;
    } else {
      logger.warn('No registration token available. Request permission to generate one.');
      return null;
    }
  } catch (error) {
    logger.error('An error occurred while retrieving FCM token', { error });
    return null;
  }
}

/**
 * Listens for incoming push notification messages while application is in the foreground
 */
export async function onForegroundMessage(callback: (payload: unknown) => void): Promise<(() => void) | null> {
  const messaging = await getMessagingInstance();
  if (!messaging) return null;

  return onMessage(messaging, (payload) => {
    logger.info('Foreground push notification received', { payload });
    callback(payload);
  });
}
