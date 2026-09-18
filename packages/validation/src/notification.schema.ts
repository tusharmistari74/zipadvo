import { z } from 'zod';

export const notificationEventTypeEnum = z.enum([
  'BOOKING_CREATED',
  'PAYMENT_SUCCESS',
  'LAWYER_ACCEPTED',
  'LAWYER_REJECTED',
  'BOOKING_CANCELLED',
  'DOCUMENT_UPLOADED',
  'DOCUMENT_READY',
  'KYC_SUBMITTED',
  'KYC_APPROVED',
  'KYC_REJECTED',
  'APPOINTMENT_REMINDER',
  'DISPUTE_UPDATED',
  'REFUND_PROCESSED',
]);

export const notificationChannelEnum = z.enum([
  'in_app',
  'sms',
  'email',
  'push',
  'whatsapp',
]);

export const emitNotificationEventSchema = z.object({
  recipientUid: z.string().optional(),
  userId: z.string().optional(),
  type: notificationEventTypeEnum,
  title: z.string().min(1, 'Title is required').max(200),
  body: z.string().min(1, 'Body is required').max(2000),
  message: z.string().optional(),
  channels: z.array(notificationChannelEnum).optional().default(['in_app']),
  actionUrl: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  recipientEmail: z.string().email().optional().or(z.literal('')),
  recipientPhone: z.string().optional(),
}).refine((data) => !!(data.recipientUid || data.userId), {
  message: 'Recipient UID is required',
  path: ['recipientUid'],
});

export const markNotificationReadSchema = z.object({
  notificationId: z.string().min(1, 'Notification ID is required'),
  userId: z.string().min(1, 'User ID is required'),
});

export const queryNotificationsSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  unreadOnly: z.boolean().optional().default(false),
  limit: z.number().int().min(1).max(100).optional().default(20),
});

export type EmitNotificationEventInput = z.infer<typeof emitNotificationEventSchema>;
export type MarkNotificationReadInput = z.infer<typeof markNotificationReadSchema>;
export type QueryNotificationsInput = z.infer<typeof queryNotificationsSchema>;
