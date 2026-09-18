import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import crypto from 'crypto';
import {
  verifyRazorpayPaymentSignature,
  verifyRazorpayWebhookSignature,
  createPaymentOrderSchema,
  verifyPaymentSignatureSchema,
  processRefundSchema,
} from '@legalhub/validation';
import {
  createRazorpayOrder,
  verifyPayment,
  processRazorpayWebhook,
  processRefund,
  getUserPaymentHistory,
  getAdminPaymentHistory,
  resetPaymentStore,
} from '../../apps/web/src/lib/services/payment.service';
import {
  getConsultationUnlockFee,
  updateConsultationUnlockFee,
  resetPlatformSettings,
} from '../../apps/web/src/lib/services/settings.service';
import {
  createBooking,
  getBookingById,
  resetBookingStore,
} from '../../apps/web/src/lib/services/booking.service';

describe('Phase 13: Production Razorpay Payment Integration', () => {
  const testClientUid = 'client_mumbai_test_01';
  const testLawyerUid = 'lawyer-1';
  let testBookingId: string;
  const mockSecret = 'test_razorpay_secret_key_98765';
  const mockWebhookSecret = 'test_webhook_secret_key_12345';

  beforeAll(() => {
    process.env.RAZORPAY_KEY_SECRET = mockSecret;
    process.env.RAZORPAY_WEBHOOK_SECRET = mockWebhookSecret;
  });

  beforeEach(async () => {
    resetPaymentStore();
    resetBookingStore();
    resetPlatformSettings();

    // Create a fresh booking in pending_payment state
    const res = await createBooking(
      {
        lawyerUid: testLawyerUid,
        serviceCategory: 'Property Registration & Conveyancing',
        caseDescription: 'Title search and conveyance verification for flat in Bandra West.',
        preferredDate: '2026-10-05',
        preferredTimeSlot: '11:00-12:00',
        consultationMode: 'in_person_office',
        clientName: 'Rahul Mehta',
        clientPhone: '+919820011223',
        clientEmail: 'rahul.mehta@example.com',
      },
      testClientUid
    );

    expect(res.success).toBe(true);
    expect(res.booking).toBeDefined();
    testBookingId = res.booking!.id;
  });

  describe('1. Platform Settings & Dynamic Unlock Fee Resolution', () => {
    it('should default unlock fee to ₹299 from configuration', async () => {
      const fee = await getConsultationUnlockFee();
      expect(fee).toBe(299);
    });

    it('should dynamically update unlock fee when admin reconfigures settings', async () => {
      updateConsultationUnlockFee(399);
      expect(await getConsultationUnlockFee()).toBe(399);

      // Reset back
      updateConsultationUnlockFee(299);
      expect(await getConsultationUnlockFee()).toBe(299);
    });

    it('should reject invalid fee updates (negative or excessive amounts)', () => {
      expect(() => updateConsultationUnlockFee(-50)).toThrow();
      expect(() => updateConsultationUnlockFee(100000)).toThrow();
    });
  });

  describe('2. Razorpay Order Creation', () => {
    it('should create an order with exact integer paise for ₹299 (29900 paise)', async () => {
      const result = await createRazorpayOrder({
        bookingId: testBookingId,
        userId: testClientUid,
        userRole: 'client',
        clientName: 'Rahul Mehta',
        clientEmail: 'rahul.mehta@example.com',
        clientPhone: '+919820011223',
      });

      expect(result.success).toBe(true);
      expect(result.order).toBeDefined();
      expect(result.order!.amount).toBe(29900); // 299 * 100 paise
      expect(result.order!.currency).toBe('INR');
      expect(result.order!.receipt).toBe(`rcpt_${testBookingId}`);
      expect(result.order!.status).toBe('created');
      expect(result.order!.notes.bookingId).toBe(testBookingId);
      expect(result.order!.notes.userId).toBe(testClientUid);
    });

    it('should reject order creation if booking ID does not exist', async () => {
      const result = await createRazorpayOrder({
        bookingId: 'non_existent_booking_id',
        userId: testClientUid,
      });

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/not found/i);
    });

    it('should validate request schema with createPaymentOrderSchema', () => {
      const validPayload = {
        bookingId: testBookingId,
        userId: testClientUid,
        clientName: 'Rahul Mehta',
        clientPhone: '+919820011223',
      };

      const parsed = createPaymentOrderSchema.safeParse(validPayload);
      expect(parsed.success).toBe(true);

      const invalidPayload = {
        bookingId: '',
      };
      const invalidParsed = createPaymentOrderSchema.safeParse(invalidPayload);
      expect(invalidParsed.success).toBe(false);
    });
  });

  describe('3. Cryptographic Signature Verification & Zero-Trust Security', () => {
    it('should verify genuine HMAC-SHA256 signatures generated with secret', () => {
      const orderId = 'order_MOCK_1234567890';
      const paymentId = 'pay_MOCK_abcdefghij';
      const text = `${orderId}|${paymentId}`;
      const validSignature = crypto
        .createHmac('sha256', mockSecret)
        .update(text)
        .digest('hex');

      const isValid = verifyRazorpayPaymentSignature({
        orderId,
        paymentId,
        signature: validSignature,
        secret: mockSecret,
      });

      expect(isValid).toBe(true);
    });

    it('should strictly reject tampered payment signatures', () => {
      const orderId = 'order_MOCK_1234567890';
      const paymentId = 'pay_MOCK_abcdefghij';
      const text = `${orderId}|${paymentId}`;
      const validSignature = crypto
        .createHmac('sha256', mockSecret)
        .update(text)
        .digest('hex');

      // Tampered payment ID
      const tamperedPaymentId = 'pay_MOCK_attacker_forged';
      const isValidTamperedId = verifyRazorpayPaymentSignature({
        orderId,
        paymentId: tamperedPaymentId,
        signature: validSignature,
        secret: mockSecret,
      });
      expect(isValidTamperedId).toBe(false);

      // Tampered signature string
      const tamperedSig = validSignature.slice(0, -4) + '0000';
      const isValidTamperedSig = verifyRazorpayPaymentSignature({
        orderId,
        paymentId,
        signature: tamperedSig,
        secret: mockSecret,
      });
      expect(isValidTamperedSig).toBe(false);
    });

    it('should reject verification if secret is missing or empty', () => {
      const isValid = verifyRazorpayPaymentSignature({
        orderId: 'order_123',
        paymentId: 'pay_123',
        signature: 'some_sig',
        secret: '',
      });
      expect(isValid).toBe(false);
    });
  });

  describe('4. End-to-End Payment Verification & Booking State Transition', () => {
    it('should verify payment, update transaction status to captured, and transition booking to pending_lawyer', async () => {
      // 1. Create order
      const orderRes = await createRazorpayOrder({
        bookingId: testBookingId,
        userId: testClientUid,
        userRole: 'client',
      });
      expect(orderRes.success).toBe(true);
      const orderId = orderRes.order!.id;
      const paymentId = `pay_test_${Date.now()}`;

      // 2. Generate valid HMAC-SHA256 signature
      const validSignature = crypto
        .createHmac('sha256', mockSecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      // 3. Verify payment server-side
      const verifyRes = await verifyPayment({
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: validSignature,
        bookingId: testBookingId,
        userId: testClientUid,
        userRole: 'client',
        paymentMethod: 'upi',
      });

      expect(verifyRes.success).toBe(true);
      expect(verifyRes.transaction).toBeDefined();
      expect(verifyRes.transaction!.status).toBe('captured');
      expect(verifyRes.transaction!.razorpayPaymentId).toBe(paymentId);
      expect(verifyRes.transaction!.amountInr).toBe(299);

      // 4. Check booking status was updated to pending_lawyer and unlock details linked
      const bookingCheck = await getBookingById(testBookingId, testClientUid, 'client');
      expect(bookingCheck.success).toBe(true);
      expect(bookingCheck.booking!.status).toBe('pending_lawyer');
      expect(bookingCheck.booking!.unlockPaymentId).toBe(verifyRes.transaction!.id);
      expect(bookingCheck.booking!.unlockAmountInr).toBe(299);
    });

    it('should reject duplicate payment on a booking that is already paid and unlocked', async () => {
      // 1. First payment
      const orderRes = await createRazorpayOrder({
        bookingId: testBookingId,
        userId: testClientUid,
      });
      const orderId = orderRes.order!.id;
      const paymentId = 'pay_first_123';
      const sig = crypto.createHmac('sha256', mockSecret).update(`${orderId}|${paymentId}`).digest('hex');

      await verifyPayment({
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: sig,
        bookingId: testBookingId,
        userId: testClientUid,
      });

      // 2. Attempt duplicate verification
      const dupPaymentId = 'pay_duplicate_456';
      const dupSig = crypto.createHmac('sha256', mockSecret).update(`${orderId}|${dupPaymentId}`).digest('hex');

      const dupRes = await verifyPayment({
        razorpayOrderId: orderId,
        razorpayPaymentId: dupPaymentId,
        razorpaySignature: dupSig,
        bookingId: testBookingId,
        userId: testClientUid,
      });

      expect(dupRes.success).toBe(false);
      expect(dupRes.error).toMatch(/already.*paid|not in pending_payment/i);
    });
  });

  describe('5. Webhook Signature Verification & Event Deduplication', () => {
    it('should verify Razorpay webhook signature header using raw payload', () => {
      const payload = JSON.stringify({
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_webhook_test_1',
              order_id: 'order_webhook_test_1',
              amount: 29900,
              status: 'captured',
            },
          },
        },
      });

      const signature = crypto
        .createHmac('sha256', mockWebhookSecret)
        .update(payload)
        .digest('hex');

      const isValid = verifyRazorpayWebhookSignature({
        rawBody: payload,
        signature,
        secret: mockWebhookSecret,
      });

      expect(isValid).toBe(true);
    });

    it('should reject webhook requests with invalid or missing signature', async () => {
      const payload = JSON.stringify({ event: 'payment.failed' });

      const res = await processRazorpayWebhook({
        rawBody: payload,
        signatureHeader: 'invalid_forged_webhook_signature',
      });

      expect(res.success).toBe(false);
      expect(res.error).toMatch(/signature/i);
    });

    it('should deduplicate webhook deliveries with identical webhook ID / event ID', async () => {
      // 1. Create order and transaction
      const orderRes = await createRazorpayOrder({
        bookingId: testBookingId,
        userId: testClientUid,
      });
      const orderId = orderRes.order!.id;
      const paymentId = 'pay_webhook_dedup_01';

      const webhookPayload = JSON.stringify({
        event: 'payment.captured',
        id: 'event_wh_unique_9988',
        payload: {
          payment: {
            entity: {
              id: paymentId,
              order_id: orderId,
              amount: 29900,
              currency: 'INR',
              status: 'captured',
              method: 'upi',
            },
          },
        },
      });

      const signature = crypto
        .createHmac('sha256', mockWebhookSecret)
        .update(webhookPayload)
        .digest('hex');

      // First webhook delivery
      const firstDelivery = await processRazorpayWebhook({
        rawBody: webhookPayload,
        signatureHeader: signature,
      });
      expect(firstDelivery.success).toBe(true);
      expect(firstDelivery.handled).toBe(true);

      // Second webhook delivery (replay/retry from Razorpay)
      const secondDelivery = await processRazorpayWebhook({
        rawBody: webhookPayload,
        signatureHeader: signature,
      });
      expect(secondDelivery.success).toBe(true);
      expect(secondDelivery.handled).toBe(true); // Handled idempotently without error
    });
  });

  describe('6. Server-Controlled Refund Architecture & RBAC', () => {
    let capturedPaymentId: string;

    beforeEach(async () => {
      const orderRes = await createRazorpayOrder({
        bookingId: testBookingId,
        userId: testClientUid,
      });
      const orderId = orderRes.order!.id;
      const paymentId = `pay_refund_target_${Date.now()}`;
      const sig = crypto.createHmac('sha256', mockSecret).update(`${orderId}|${paymentId}`).digest('hex');

      const vRes = await verifyPayment({
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: sig,
        bookingId: testBookingId,
        userId: testClientUid,
      });

      capturedPaymentId = vRes.transaction!.id;
    });

    it('should allow admin/super_admin to process full refund with audit justification', async () => {
      const refundRes = await processRefund({
        paymentId: capturedPaymentId,
        amountInr: 299,
        reason: 'booking_cancelled',
        adminNotes: 'Client cancelled 48 hours prior to consultation as per policy.',
        adminUid: 'admin_audit_01',
        adminRole: 'admin',
      });

      expect(refundRes.success).toBe(true);
      expect(refundRes.transaction).toBeDefined();
      expect(refundRes.transaction!.status).toBe('refunded');
      expect(refundRes.transaction!.refundDetails).toBeDefined();
      expect(refundRes.transaction!.refundDetails!.amountInr).toBe(299);
      expect(refundRes.transaction!.refundDetails!.reason).toBe('booking_cancelled');
      expect(refundRes.transaction!.refundDetails!.adminUid).toBe('admin_audit_01');
      expect(refundRes.transaction!.refundDetails!.refundProviderId).toMatch(/^rfnd_/);
    });

    it('should reject refund if requested by non-admin role (e.g. client or lawyer)', async () => {
      const refundRes = await processRefund({
        paymentId: capturedPaymentId,
        amountInr: 299,
        reason: 'client_requested',
        adminNotes: 'Attacker attempting unauthorized refund trigger',
        adminUid: testClientUid,
        adminRole: 'client',
      });

      expect(refundRes.success).toBe(false);
      expect(refundRes.error).toMatch(/unauthorized|admin/i);
    });

    it('should reject refund amount exceeding transaction amount', async () => {
      const refundRes = await processRefund({
        paymentId: capturedPaymentId,
        amountInr: 500, // Original was 299
        reason: 'duplicate_payment',
        adminNotes: 'Invalid amount',
        adminUid: 'super_admin_01',
        adminRole: 'super_admin',
      });

      expect(refundRes.success).toBe(false);
      expect(refundRes.error).toMatch(/exceeds/i);
    });

    it('should validate refund payload schema with processRefundSchema', () => {
      const valid = processRefundSchema.safeParse({
        paymentId: capturedPaymentId,
        amountInr: 299,
        reason: 'booking_cancelled',
        adminNotes: 'Valid audit note',
        adminUid: 'admin_1',
        adminRole: 'admin',
      });
      expect(valid.success).toBe(true);

      const invalid = processRefundSchema.safeParse({
        paymentId: '',
        amountInr: -10,
        reason: '',
        adminNotes: '',
        adminUid: '',
        adminRole: 'client',
      });
      expect(invalid.success).toBe(false);
    });
  });

  describe('7. Multi-Tenant Payment History & Ledger Isolation', () => {
    it('should ensure clients can only view their own payment transactions', async () => {
      // Create payment for client 1
      const order1 = await createRazorpayOrder({
        bookingId: testBookingId,
        userId: testClientUid,
      });

      // Query as client 1
      const client1History = await getUserPaymentHistory(testClientUid, testClientUid, 'client');
      expect(client1History.success).toBe(true);
      expect(client1History.transactions.length).toBeGreaterThanOrEqual(1);
      expect(client1History.transactions.every((t) => t.userId === testClientUid)).toBe(true);

      // Attempt querying client 1 history as attacker client 2
      const attackerHistory = await getUserPaymentHistory(testClientUid, 'attacker_client_id', 'client');
      expect(attackerHistory.success).toBe(false);
      expect(attackerHistory.error).toMatch(/unauthorized/i);
    });

    it('should allow admin to access system-wide financial ledger with filters', async () => {
      const adminLedger = await getAdminPaymentHistory({
        adminUid: 'admin_finance_01',
        adminRole: 'admin',
      });

      expect(adminLedger.success).toBe(true);
      expect(Array.isArray(adminLedger.transactions)).toBe(true);

      // Non-admin cannot call admin ledger
      const nonAdminLedger = await getAdminPaymentHistory({
        adminUid: testClientUid,
        adminRole: 'client',
      });
      expect(nonAdminLedger.success).toBe(false);
      expect(nonAdminLedger.error).toMatch(/unauthorized/i);
    });
  });
});
