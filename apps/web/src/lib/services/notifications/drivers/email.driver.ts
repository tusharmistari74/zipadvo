import type { NotificationDeliveryReport } from '@legalhub/types';

export interface OutgoingEmailPayload {
  to: string;
  subject: string;
  body: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface SentEmailRecord extends OutgoingEmailPayload {
  messageId: string;
  sentAt: string;
  provider: string;
}

const sentEmailSpool: SentEmailRecord[] = [];

export function getSentEmailSpool(): SentEmailRecord[] {
  return [...sentEmailSpool];
}

export function clearSentEmailSpool(): void {
  sentEmailSpool.length = 0;
}

/**
 * Dispatches an email notification with simulated spooling and provider error isolation
 */
export async function deliverEmailNotification(
  payload: OutgoingEmailPayload
): Promise<NotificationDeliveryReport> {
  const now = new Date().toISOString();
  const messageId = `msg_mail_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  if (!payload.to || !payload.to.includes('@')) {
    return {
      channel: 'email',
      status: 'failed',
      provider: 'sendgrid_ses_simulator',
      error: 'Invalid or missing recipient email address',
      dispatchedAt: now,
    };
  }

  try {
    // Record to outgoing spool for testing & audit
    sentEmailSpool.push({
      ...payload,
      messageId,
      sentAt: now,
      provider: 'sendgrid_ses_simulator',
    });

    return {
      channel: 'email',
      status: 'sent',
      provider: 'sendgrid_ses_simulator',
      providerMessageId: messageId,
      dispatchedAt: now,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown email delivery failure';
    return {
      channel: 'email',
      status: 'failed',
      provider: 'sendgrid_ses_simulator',
      error: errorMsg,
      dispatchedAt: now,
    };
  }
}
