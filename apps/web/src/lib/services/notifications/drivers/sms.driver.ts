import type { NotificationDeliveryReport } from '@legalhub/types';

export interface OutgoingSmsPayload {
  to: string; // E.164 phone number (e.g. +919820011223)
  text: string;
  metadata?: Record<string, unknown>;
}

export interface SentSmsRecord extends OutgoingSmsPayload {
  messageId: string;
  sentAt: string;
  provider: string;
}

const sentSmsSpool: SentSmsRecord[] = [];

export function getSentSmsSpool(): SentSmsRecord[] {
  return [...sentSmsSpool];
}

export function clearSentSmsSpool(): void {
  sentSmsSpool.length = 0;
}

/**
 * Dispatches an SMS/WhatsApp notification with simulated spooling and provider error isolation
 */
export async function deliverSmsNotification(
  payload: OutgoingSmsPayload
): Promise<NotificationDeliveryReport> {
  const now = new Date().toISOString();
  const messageId = `msg_sms_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  if (!payload.to || payload.to.length < 10) {
    return {
      channel: 'sms',
      status: 'failed',
      provider: 'msg91_twilio_simulator',
      error: 'Invalid or missing recipient phone number',
      dispatchedAt: now,
    };
  }

  try {
    sentSmsSpool.push({
      ...payload,
      messageId,
      sentAt: now,
      provider: 'msg91_twilio_simulator',
    });

    return {
      channel: 'sms',
      status: 'sent',
      provider: 'msg91_twilio_simulator',
      providerMessageId: messageId,
      dispatchedAt: now,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown SMS delivery failure';
    return {
      channel: 'sms',
      status: 'failed',
      provider: 'msg91_twilio_simulator',
      error: errorMsg,
      dispatchedAt: now,
    };
  }
}
