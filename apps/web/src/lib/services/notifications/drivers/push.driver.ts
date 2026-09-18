import type { NotificationDeliveryReport } from '@legalhub/types';

export interface OutgoingPushPayload {
  userId: string;
  title: string;
  body: string;
  actionUrl?: string;
  data?: Record<string, unknown>;
}

export interface SentPushRecord extends OutgoingPushPayload {
  messageId: string;
  sentAt: string;
  provider: string;
}

const sentPushSpool: SentPushRecord[] = [];

export function getSentPushSpool(): SentPushRecord[] {
  return [...sentPushSpool];
}

export function clearSentPushSpool(): void {
  sentPushSpool.length = 0;
}

/**
 * Dispatches a WebPush/FCM mobile push alert
 */
export async function deliverPushNotification(
  payload: OutgoingPushPayload
): Promise<NotificationDeliveryReport> {
  const now = new Date().toISOString();
  const messageId = `msg_push_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  if (!payload.userId) {
    return {
      channel: 'push',
      status: 'failed',
      provider: 'fcm_webpush_simulator',
      error: 'Invalid recipient userId',
      dispatchedAt: now,
    };
  }

  try {
    sentPushSpool.push({
      ...payload,
      messageId,
      sentAt: now,
      provider: 'fcm_webpush_simulator',
    });

    return {
      channel: 'push',
      status: 'sent',
      provider: 'fcm_webpush_simulator',
      providerMessageId: messageId,
      dispatchedAt: now,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown push delivery failure';
    return {
      channel: 'push',
      status: 'failed',
      provider: 'fcm_webpush_simulator',
      error: errorMsg,
      dispatchedAt: now,
    };
  }
}
