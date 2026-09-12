import { BaseEntity } from './common';

export type NotificationType =
  | 'booking_requested'
  | 'booking_unlocked'
  | 'booking_accepted'
  | 'booking_cancelled'
  | 'kyc_approved'
  | 'kyc_rejected'
  | 'payment_received'
  | 'dispute_opened'
  | 'dispute_updated';

export type NotificationChannel = 'in_app' | 'sms' | 'email' | 'whatsapp';

export interface AppNotification extends BaseEntity {
  id: string;
  recipientUid: string;
  type: NotificationType;
  title: string;
  body: string;
  channels: NotificationChannel[];
  isRead: boolean;
  actionUrl?: string;
  metadata?: Record<string, string>;
}
