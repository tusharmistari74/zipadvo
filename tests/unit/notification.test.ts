import { describe, it, expect, beforeEach } from 'vitest';
import type { NotificationEventType, NotificationPayload } from '@legalhub/types';
import {
  emitNotificationEvent,
  getUserNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  resetNotificationSystem,
  getSentEmailSpool,
  getSentSmsSpool,
  getSentPushSpool,
} from '../../apps/web/src/lib/services/notifications/notification.service';

describe('Phase 14: Central Event-Driven Notification Infrastructure', () => {
  const testUserA = 'client_rahul_mumbai_01';
  const testUserB = 'client_sneha_pune_02';

  beforeEach(() => {
    resetNotificationSystem();
  });

  describe('1. All 13 Mandatory Event Types Architecture', () => {
    const all13Events: NotificationEventType[] = [
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
    ];

    it('should successfully emit and dispatch all 13 lifecycle event types', async () => {
      for (const eventType of all13Events) {
        const payload: NotificationPayload = {
          recipientUid: testUserA,
          type: eventType,
          title: `Test Event: ${eventType}`,
          body: `Notification body for ${eventType} event.`,
          channels: ['in_app', 'email', 'sms', 'push'],
          recipientEmail: 'rahul.mehta@example.com',
          recipientPhone: '+919820011223',
          actionUrl: '/dashboard',
          metadata: { eventType, testRunId: 'run_123' },
        };

        const result = await emitNotificationEvent(payload);

        expect(result.success).toBe(true);
        expect(result.notificationId).toBeDefined();
        expect(result.notification.type).toBe(eventType);
        expect(result.notification.recipientUid).toBe(testUserA);
        expect(result.notification.deliveryStatus?.in_app).toBe('delivered');
        expect(result.notification.deliveryStatus?.email).toBe('sent');
        expect(result.notification.deliveryStatus?.sms).toBe('sent');
        expect(result.notification.deliveryStatus?.push).toBe('sent');
      }

      // Check spools
      expect(getSentEmailSpool().length).toBe(13);
      expect(getSentSmsSpool().length).toBe(13);
      expect(getSentPushSpool().length).toBe(13);

      // Check in-app user feed
      const feed = await getUserNotifications(testUserA, testUserA);
      expect(feed.success).toBe(true);
      expect(feed.notifications.length).toBe(13);
    });
  });

  describe('2. Multi-Channel Dispatch & Spooling', () => {
    it('should dispatch to selected channels only when specified', async () => {
      const emailOnlyPayload: NotificationPayload = {
        recipientUid: testUserA,
        type: 'APPOINTMENT_REMINDER',
        title: 'Appointment in 1 Hour',
        body: 'Your consultation with Adv. Rajesh Shinde starts at 2:00 PM IST.',
        channels: ['email'],
        recipientEmail: 'rahul.mehta@example.com',
      };

      const result = await emitNotificationEvent(emailOnlyPayload);
      expect(result.success).toBe(true);
      expect(result.notification.deliveryStatus?.email).toBe('sent');
      expect(result.notification.deliveryStatus?.in_app).toBe('skipped');
      expect(result.notification.deliveryStatus?.sms).toBe('skipped');

      expect(getSentEmailSpool().length).toBe(1);
      expect(getSentSmsSpool().length).toBe(0);
    });

    it('should format SMS payload with Mumbai locale text', async () => {
      await emitNotificationEvent({
        recipientUid: testUserA,
        type: 'PAYMENT_SUCCESS',
        title: 'Unlock Payment Verified',
        body: '₹299 paid. Adv. Shinde contact details unlocked.',
        channels: ['sms'],
        recipientPhone: '+919820011223',
      });

      const smsSpool = getSentSmsSpool();
      expect(smsSpool.length).toBe(1);
      expect(smsSpool[0]!.to).toBe('+919820011223');
      expect(smsSpool[0]!.text).toContain('₹299');
    });
  });

  describe('3. Transactional Error Isolation (Zero Core Corruption)', () => {
    it('should not throw or fail notification when email or SMS delivery fails', async () => {
      // Missing email address
      const invalidEmailPayload: NotificationPayload = {
        recipientUid: testUserA,
        type: 'DOCUMENT_READY',
        title: 'Title Search Ready',
        body: 'Final legal opinion uploaded.',
        channels: ['in_app', 'email', 'sms'],
        recipientEmail: 'invalid_email_no_at_symbol',
        recipientPhone: '123', // invalid short phone
      };

      const result = await emitNotificationEvent(invalidEmailPayload);

      // Core event should still succeed and in-app should still be delivered!
      expect(result.success).toBe(true);
      expect(result.notification.deliveryStatus?.in_app).toBe('delivered');
      expect(result.notification.deliveryStatus?.email).toBe('failed');
      expect(result.notification.deliveryStatus?.sms).toBe('failed');

      // Reports should record the delivery errors for debugging
      const emailReport = result.deliveryReports.find((r) => r.channel === 'email');
      expect(emailReport?.status).toBe('failed');
      expect(emailReport?.error).toBeDefined();
    });
  });

  describe('4. In-App Notification Feed & Read State Management', () => {
    it('should compute accurate unread counts and support single and bulk read operations', async () => {
      // Emit 3 notifications for User A
      const notif1 = await emitNotificationEvent({
        recipientUid: testUserA,
        type: 'BOOKING_CREATED',
        title: 'Booking 1',
        body: 'First booking',
      });

      const notif2 = await emitNotificationEvent({
        recipientUid: testUserA,
        type: 'PAYMENT_SUCCESS',
        title: 'Booking 2 Paid',
        body: 'Payment successful',
      });

      await emitNotificationEvent({
        recipientUid: testUserA,
        type: 'DOCUMENT_UPLOADED',
        title: 'Document Uploaded',
        body: 'Index II attached',
      });

      // Initially 3 unread
      let countRes = await getUnreadNotificationCount(testUserA, testUserA);
      expect(countRes.count).toBe(3);

      // Mark 1 as read
      const mark1Res = await markNotificationAsRead(notif1.notificationId, testUserA);
      expect(mark1Res.success).toBe(true);
      expect(mark1Res.notification?.isRead).toBe(true);

      // Now 2 unread
      countRes = await getUnreadNotificationCount(testUserA, testUserA);
      expect(countRes.count).toBe(2);

      // Bulk mark all as read
      const markAllRes = await markAllNotificationsAsRead(testUserA);
      expect(markAllRes.success).toBe(true);
      expect(markAllRes.updatedCount).toBe(2);

      // Now 0 unread
      countRes = await getUnreadNotificationCount(testUserA, testUserA);
      expect(countRes.count).toBe(0);
    });
  });

  describe('5. Multi-Tenant Privacy & Isolation', () => {
    it('should isolate notification feeds between different users', async () => {
      // Notification for User A
      await emitNotificationEvent({
        recipientUid: testUserA,
        type: 'KYC_APPROVED',
        title: 'User A KYC Approved',
        body: 'Details for user A',
      });

      // Notification for User B
      await emitNotificationEvent({
        recipientUid: testUserB,
        type: 'KYC_APPROVED',
        title: 'User B KYC Approved',
        body: 'Details for user B',
      });

      // User A feed
      const userAFeed = await getUserNotifications(testUserA, testUserA);
      expect(userAFeed.notifications.length).toBe(1);
      expect(userAFeed.notifications[0]!.title).toBe('User A KYC Approved');

      // User B feed
      const userBFeed = await getUserNotifications(testUserB, testUserB);
      expect(userBFeed.notifications.length).toBe(1);
      expect(userBFeed.notifications[0]!.title).toBe('User B KYC Approved');

      // Unauthorized access attempt: User B trying to access User A's feed
      const unauthorizedFeed = await getUserNotifications(testUserA, testUserB);
      expect(unauthorizedFeed.success).toBe(false);
      expect(unauthorizedFeed.error).toMatch(/unauthorized/i);
    });
  });
});
