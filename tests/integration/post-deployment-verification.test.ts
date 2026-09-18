import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import crypto from 'crypto';
import {
  getPublicLawyerProfile,
} from '../../apps/web/src/lib/services/lawyer-profile.service';
import {
  createBooking,
  getBookingById,
  resetBookingStore,
} from '../../apps/web/src/lib/services/booking.service';
import {
  createRazorpayOrder,
  verifyPayment,
  processRazorpayWebhook,
  getUserPaymentHistory,
  resetPaymentStore,
} from '../../apps/web/src/lib/services/payment.service';
import {
  uploadBookingDocument,
  generateSecureDocumentDownloadUrl,
} from '../../apps/web/src/lib/services/document.service';
import {
  emitNotificationEvent,
  getUnreadNotificationCount,
  resetNotificationSystem,
} from '../../apps/web/src/lib/services/notifications/notification.service';
import {
  seedAdminPortalData,
  assertAdminAuthorization,
  getAdminDashboardMetrics,
  updateAdminPlatformSettings,
} from '../../apps/web/src/lib/services/admin-portal.service';
import {
  getClientDashboardOverview,
} from '../../apps/web/src/lib/services/client-dashboard.service';
import {
  getLawyerDashboardOverview,
} from '../../apps/web/src/lib/services/lawyer-dashboard.service';

describe('Phase 30: Post-Production Reliability & Verification Suite', () => {
  const prodClient1 = 'prod_user_client_1';
  const prodClient2 = 'prod_user_client_2';
  const prodLawyer1 = 'lawyer-1';
  const prodLawyer2 = 'lawyer-2';
  const prodAdmin = 'prod_admin_sys_01';
  const secretKey = 'rzp_live_post_deploy_secret_2026';
  const webhookSecret = 'whsec_live_post_deploy_secret_2026';

  beforeAll(() => {
    process.env.NEXT_PUBLIC_APP_ENV = 'production';
    process.env.NEXT_PUBLIC_APP_URL = 'https://legalhubmumbai.com';
    process.env.RAZORPAY_KEY_SECRET = secretKey;
    process.env.RAZORPAY_WEBHOOK_SECRET = webhookSecret;
  });

  beforeEach(() => {
    resetBookingStore();
    resetPaymentStore();
    resetNotificationSystem();
    seedAdminPortalData();
  });

  describe('1. Security & Multi-Tenant Boundary Verification', () => {
    it('Sec-1: Public users cannot access private documents without authorization', async () => {
      const bRes = await createBooking(
        {
          lawyerUid: prodLawyer1,
          serviceCategory: 'Property Registration & Conveyancing',
          caseDescription: 'Post-deploy security check',
          preferredDate: '2026-10-10',
          preferredTimeSlot: '11:00-12:00',
          consultationMode: 'in_person_office',
          clientName: 'Client One',
          clientPhone: '+919820011111',
        },
        prodClient1
      );
      const bkId = bRes.booking!.id;

      const docRes = await uploadBookingDocument({
        bookingId: bkId,
        uploaderUid: prodClient1,
        uploaderRole: 'client',
        documentType: 'property_title_deed',
        file: { name: 'deed.pdf', size: 1024 * 500, type: 'application/pdf' },
      });

      const unauthenticatedAttempt = await generateSecureDocumentDownloadUrl(
        docRes.document!.id,
        'unauthenticated_public_user',
        'client'
      );
      expect(unauthenticatedAttempt.success).toBe(false);
      expect(unauthenticatedAttempt.downloadUrl).toBeUndefined();
    });

    it('Sec-2: Users cannot access other users private data or payment history', async () => {
      const client1Overview = await getClientDashboardOverview(prodClient1, []);
      const client2Overview = await getClientDashboardOverview(prodClient2, []);

      expect(client1Overview.metrics).toBeDefined();
      expect(client2Overview.metrics).toBeDefined();

      // Multi-tenant check: Client 2 attempting to view Client 1 payment history is rejected
      const crossUserPaymentAccess = await getUserPaymentHistory(prodClient1, prodClient2, 'client');
      expect(crossUserPaymentAccess.success).toBe(false);
      expect(crossUserPaymentAccess.error).toContain('Unauthorized');
    });

    it('Sec-3: Lawyers cannot access unrelated bookings or documents', async () => {
      const bRes = await createBooking(
        {
          lawyerUid: prodLawyer1,
          serviceCategory: 'Property Registration & Conveyancing',
          caseDescription: 'Lawyer 1 confidential matter',
          preferredDate: '2026-10-10',
          preferredTimeSlot: '14:00-15:00',
          consultationMode: 'in_person_office',
          clientName: 'Client One',
          clientPhone: '+919820011111',
        },
        prodClient1
      );
      const bkId = bRes.booking!.id;

      const docRes = await uploadBookingDocument({
        bookingId: bkId,
        uploaderUid: prodClient1,
        uploaderRole: 'client',
        documentType: 'encumbrance_certificate',
        file: { name: 'encumbrance.pdf', size: 1024 * 300, type: 'application/pdf' },
      });

      // Lawyer 2 attempts to generate download URL for Lawyer 1 booking document
      const lawyer2Attempt = await generateSecureDocumentDownloadUrl(
        docRes.document!.id,
        prodLawyer2,
        'lawyer'
      );
      expect(lawyer2Attempt.success).toBe(false);
    });

    it('Sec-4: Non-admins cannot perform admin operations or modify platform settings', async () => {
      expect(() => assertAdminAuthorization('client')).toThrowError(/Unauthorized/);
      expect(() => assertAdminAuthorization('lawyer')).toThrowError(/Unauthorized/);
      expect(() => assertAdminAuthorization(undefined)).toThrowError(/Unauthorized/);

      await expect(
        updateAdminPlatformSettings(
          prodClient1,
          'client',
          { commissionRate: 20 }
        )
      ).rejects.toThrowError(/Unauthorized: Privileged administrative access required/);
    });
  });

  describe('2. Payment Lifecycle, Webhook & Duplicate Protection', () => {
    it('Pay-1: Payment creation, signature verification, and booking status transition', async () => {
      const bRes = await createBooking(
        {
          lawyerUid: prodLawyer1,
          serviceCategory: 'Property Registration & Conveyancing',
          caseDescription: 'Post deploy payment test',
          preferredDate: '2026-10-12',
          preferredTimeSlot: '16:00-17:00',
          consultationMode: 'in_person_office',
          clientName: 'Client One',
          clientPhone: '+919820011111',
        },
        prodClient1
      );
      const bkId = bRes.booking!.id;

      const orderRes = await createRazorpayOrder({
        bookingId: bkId,
        userId: prodClient1,
        userRole: 'client',
        purpose: 'unlock_consultation',
      });
      expect(orderRes.success).toBe(true);

      const rzpOrderId = orderRes.order!.id;
      const rzpPaymentId = 'pay_post_deploy_live_001';
      const validSig = crypto
        .createHmac('sha256', secretKey)
        .update(`${rzpOrderId}|${rzpPaymentId}`)
        .digest('hex');

      const verifyRes = await verifyPayment({
        bookingId: bkId,
        razorpayOrderId: rzpOrderId,
        razorpayPaymentId: rzpPaymentId,
        razorpaySignature: validSig,
        userId: prodClient1,
      });

      expect(verifyRes.success).toBe(true);
      expect(verifyRes.transaction?.status).toBe('captured');
      expect(verifyRes.booking?.status).toBe('pending_lawyer');
    });

    it('Pay-2: Duplicate payment protection prevents double capture', async () => {
      const bRes = await createBooking(
        {
          lawyerUid: prodLawyer1,
          serviceCategory: 'Property Registration & Conveyancing',
          caseDescription: 'Duplicate payment test',
          preferredDate: '2026-10-12',
          preferredTimeSlot: '17:00-18:00',
          consultationMode: 'in_person_office',
          clientName: 'Client One',
          clientPhone: '+919820011111',
        },
        prodClient1
      );
      const bkId = bRes.booking!.id;

      const orderRes = await createRazorpayOrder({
        bookingId: bkId,
        userId: prodClient1,
        userRole: 'client',
        purpose: 'unlock_consultation',
      });

      const rzpOrderId = orderRes.order!.id;
      const rzpPaymentId = 'pay_dup_001';
      const validSig = crypto
        .createHmac('sha256', secretKey)
        .update(`${rzpOrderId}|${rzpPaymentId}`)
        .digest('hex');

      const firstCapture = await verifyPayment({
        bookingId: bkId,
        razorpayOrderId: rzpOrderId,
        razorpayPaymentId: rzpPaymentId,
        razorpaySignature: validSig,
        userId: prodClient1,
      });
      expect(firstCapture.success).toBe(true);

      // Repeat verification with same booking ID now in pending_lawyer status
      const secondCapture = await verifyPayment({
        bookingId: bkId,
        razorpayOrderId: rzpOrderId,
        razorpayPaymentId: rzpPaymentId,
        razorpaySignature: validSig,
        userId: prodClient1,
      });
      // Correctly fails and prevents duplicate capture
      expect(secondCapture.success).toBe(false);
      expect(secondCapture.error).toContain('already been paid and unlocked');
    });

    it('Pay-3: Webhook event processing with signature verification', async () => {
      const webhookPayload = JSON.stringify({
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_wh_live_999',
              order_id: 'order_wh_live_999',
              amount: 29900,
              currency: 'INR',
              status: 'captured',
            },
          },
        },
      });

      const validWebhookSig = crypto
        .createHmac('sha256', webhookSecret)
        .update(webhookPayload)
        .digest('hex');

      const webhookRes = await processRazorpayWebhook({
        rawBody: webhookPayload,
        signature: validWebhookSig,
      });
      expect(webhookRes.success).toBe(true);

      const invalidWebhookRes = await processRazorpayWebhook({
        rawBody: webhookPayload,
        signature: 'invalid_signature_hex',
      });
      expect(invalidWebhookRes.success).toBe(false);
    });
  });

  describe('3. Core Role Portals & Analytics', () => {
    it('Portal-1: Client Dashboard returns user bookings & documents', async () => {
      const clientData = await getClientDashboardOverview(prodClient1, []);
      expect(clientData).toBeDefined();
      expect(clientData.metrics).toBeDefined();
      expect(clientData.metrics.totalDocumentsCount).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(clientData.recentBookings)).toBe(true);
    });

    it('Portal-2: Lawyer Dashboard returns earnings & pending consultations', async () => {
      const lawyerData = await getLawyerDashboardOverview(prodLawyer1);
      expect(lawyerData).toBeDefined();
      expect(lawyerData.metrics).toBeDefined();
      expect(lawyerData.metrics.rating).toBeGreaterThanOrEqual(4.0);
    });

    it('Portal-3: Admin Portal returns real analytics metrics', async () => {
      const metrics = await getAdminDashboardMetrics('admin');
      expect(metrics).toBeDefined();
      expect(metrics.totalUsersCount).toBeGreaterThan(0);
      expect(metrics.verifiedLawyersCount).toBeGreaterThan(0);
    });
  });
});
