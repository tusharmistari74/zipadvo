import { BaseEntity } from './common';

export type NotificationEventType =
  | 'BOOKING_CREATED'
  | 'PAYMENT_SUCCESS'
  | 'LAWYER_ACCEPTED'
  | 'LAWYER_REJECTED'
  | 'BOOKING_CANCELLED'
  | 'DOCUMENT_UPLOADED'
  | 'DOCUMENT_READY'
  | 'KYC_SUBMITTED'
  | 'KYC_APPROVED'
  | 'KYC_REJECTED'
  | 'APPOINTMENT_REMINDER'
  | 'DISPUTE_UPDATED'
  | 'REFUND_PROCESSED';

export type NotificationType =
  | NotificationEventType
  | 'booking_requested'
  | 'booking_unlocked'
  | 'booking_accepted'
  | 'booking_cancelled'
  | 'kyc_approved'
  | 'kyc_rejected'
  | 'payment_received'
  | 'dispute_opened'
  | 'dispute_updated';

export type NotificationChannel = 'in_app' | 'sms' | 'email' | 'push' | 'whatsapp';

export type ChannelDeliveryStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'skipped';

export interface NotificationDeliveryReport {
  channel: NotificationChannel;
  status: ChannelDeliveryStatus;
  provider?: string;
  providerMessageId?: string;
  error?: string;
  dispatchedAt?: string;
}

export interface AppNotification extends BaseEntity {
  id: string;
  notificationId?: string; // Alias for id
  recipientUid: string;
  userId?: string; // Alias for recipientUid
  type: NotificationType;
  eventType?: NotificationEventType;
  title: string;
  message?: string; // Message body alias
  body: string;
  channels: NotificationChannel[];
  deliveryStatus?: Record<NotificationChannel, ChannelDeliveryStatus>;
  deliveryReports?: NotificationDeliveryReport[];
  isRead: boolean;
  read?: boolean; // Alias for isRead
  readAt?: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPayload {
  recipientUid: string;
  type: NotificationEventType;
  title: string;
  body: string;
  channels?: NotificationChannel[];
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  recipientEmail?: string;
  recipientPhone?: string;
}
