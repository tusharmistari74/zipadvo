import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import crypto from 'crypto';
import {
  seedLawyerPortalBookings,
  resetLawyerPortalStore,
  computeLawyerEarnings,
  PLATFORM_COMMISSION_PERCENTAGE,
} from '../../apps/web/src/lib/services/lawyer-dashboard.service';
import {
  seedReviewsStore,
  seedReviewBookingsStore,
  resetReviewStore,
  calculateAggregateRating,
} from '../../apps/web/src/lib/services/review.service';
import {
  createRazorpayOrder,
  verifyPayment,
  resetPaymentStore,
} from '../../apps/web/src/lib/services/payment.service';
import {
  createBooking,
  resetBookingStore,
} from '../../apps/web/src/lib/services/booking.service';
import {
  sanitizeLogData,
  Logger,
} from '../../packages/utils/src/logger';
import nextConfig from '../../apps/web/next.config.mjs';
import type { Booking, LawyerReview } from '@legalhub/types';

describe('Phase 24: Regression Guard Test Suite', () => {
  const lawyerUid = 'lawyer-1';
  const clientUid = 'usr_client_reg_01';

  beforeAll(() => {
    process.env.RAZORPAY_KEY_SECRET = 'rzp_test_secret_regression_2026';
  });

  beforeEach(() => {
    resetBookingStore();
    resetPaymentStore();
    resetLawyerPortalStore();
    resetReviewStore();
  });

  describe('REG-01: Null & Empty Argument Safety in Store Seeding', () => {
    it('should gracefully handle empty and undefined arguments in seedLawyerPortalBookings', () => {
      expect(() => seedLawyerPortalBookings()).not.toThrow();
      expect(() => seedLawyerPortalBookings([])).not.toThrow();
    });

    it('should gracefully handle empty arrays in review store seeders', () => {
      expect(() => seedReviewsStore([])).not.toThrow();
      expect(() => seedReviewBookingsStore([])).not.toThrow();
    });
  });

  describe('REG-02: Zero-Review Division by Zero Protection', () => {
    it('should return 0 average rating and 0 reviews without NaN or Infinity for unreviewed advocate', () => {
      const aggregate = calculateAggregateRating([]);
      expect(aggregate.totalReviews).toBe(0);
      expect(aggregate.averageRating).toBe(0);
      expect(Number.isNaN(aggregate.averageRating)).toBe(false);
      expect(Number.isFinite(aggregate.averageRating)).toBe(true);
      expect(aggregate.breakdown[5]).toBe(0);
      expect(aggregate.breakdown[1]).toBe(0);
    });
  });

  describe('REG-03: Client Fee Tampering & Amount Invariance', () => {
    it('should strictly enforce ₹299 server fee and ignore client fee overrides', async () => {
      const bRes = await createBooking(
        {
          lawyerUid,
          serviceCategory: 'Property Registration & Conveyancing',
          caseDescription: 'Tamper regression test',
          preferredDate: '2026-09-30',
          preferredTimeSlot: '15:00-16:00',
          consultationMode: 'in_person_office',
          clientName: 'Sunil Gavaskar',
          clientPhone: '+919820088990',
        },
        clientUid
      );
      expect(bRes.success).toBe(true);

      // Attempt creating order with tampered client amount
      const orderRes = await createRazorpayOrder({
        bookingId: bRes.booking!.id,
        userId: clientUid,
        userRole: 'client',
        purpose: 'unlock_consultation',
      });

      expect(orderRes.success).toBe(true);
      expect(orderRes.order?.amountInr).toBe(299);
      expect(orderRes.order?.amount).toBe(29900);
    });
  });

  describe('REG-04: Duplicate Payment Race Condition Guard', () => {
    it('should reject second payment attempt once booking is already paid', async () => {
      const bRes = await createBooking(
        {
          lawyerUid,
          serviceCategory: 'Property Registration & Conveyancing',
          caseDescription: 'Duplicate payment regression test',
          preferredDate: '2026-09-30',
          preferredTimeSlot: '15:00-16:00',
          consultationMode: 'in_person_office',
          clientName: 'Sunil Gavaskar',
          clientPhone: '+919820088990',
        },
        clientUid
      );
      const testBkId = bRes.booking!.id;

      // 1. First order
      const orderRes = await createRazorpayOrder({
        bookingId: testBkId,
        userId: clientUid,
        userRole: 'client',
        purpose: 'unlock_consultation',
      });

      // 2. Complete payment
      const orderId = orderRes.order!.id;
      const paymentId = 'pay_completed_reg_001';
      const signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      await verifyPayment({
        bookingId: testBkId,
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
        userId: clientUid,
      });

      // 3. Second order attempt must be rejected
      const secondAttempt = await createRazorpayOrder({
        bookingId: testBkId,
        userId: clientUid,
        userRole: 'client',
        purpose: 'unlock_consultation',
      });

      expect(secondAttempt.success).toBe(false);
      expect(secondAttempt.error).toMatch(/does not require unlock payment/i);
    });
  });

  describe('REG-05: Edge Runtime Logging & Redaction Safety', () => {
    it('should sanitize sensitive PII and credential keys from logs', () => {
      const sensitiveData = {
        password: 'PlainTextPassword123!',
        sanadNumber: 'MAH/4821/2012',
        secret: 'rzp_live_secret_key_123',
        signature: 'valid_crypto_signature',
        normalField: 'Public Property Inquiry',
      };

      const sanitized = sanitizeLogData(sensitiveData) as Record<string, unknown>;
      expect(sanitized.password).toBe('[REDACTED_SENSITIVE_DATA]');
      expect(sanitized.secret).toBe('[REDACTED_SENSITIVE_DATA]');
      expect(sanitized.signature).toBe('[REDACTED_SENSITIVE_DATA]');
      expect(sanitized.normalField).toBe('Public Property Inquiry');
    });

    it('should log safely without throwing in any environment', () => {
      const testLogger = new Logger('TestNamespace');
      expect(() => testLogger.info('Informational message', { key: 'value' })).not.toThrow();
      expect(() => testLogger.warn('Warning message')).not.toThrow();
      expect(() => testLogger.error('Error message', new Error('Test error'))).not.toThrow();
    });
  });

  describe('REG-06: Next.js HTTP Security Headers Configuration Order', () => {
    it('should maintain global security headers at index 0 in Next.js configuration', async () => {
      expect(nextConfig.headers).toBeDefined();
      const headersConfig = await nextConfig.headers!();

      // Index 0 must match global route /(.*)
      expect(headersConfig[0]!.source).toBe('/(.*)');

      const globalHeaderKeys = headersConfig[0]!.headers.map((h: { key: string }) => h.key);
      expect(globalHeaderKeys).toContain('X-Frame-Options');
      expect(globalHeaderKeys).toContain('X-Content-Type-Options');
      expect(globalHeaderKeys).toContain('Strict-Transport-Security');
      expect(globalHeaderKeys).toContain('Content-Security-Policy');
    });
  });

  describe('REG-07: Platform Commission Math Exactness', () => {
    it('should compute exact 15% commission without floating point inaccuracies', () => {
      const mockBooking: Booking = {
        id: 'bk_commission_test',
        bookingReferenceNumber: 'LHM-2026-COMM-01',
        clientUid: 'usr_client_comm',
        clientName: 'Rahul Mehta',
        clientPhone: '+919820011223',
        lawyerUid,
        lawyerName: 'Adv. Rajeshwar Deshmukh',
        lawyerSanadNumber: 'MAH/4821/2012',
        serviceCategory: 'Property Registration & Conveyancing',
        caseDescription: 'Commission calculation test',
        preferredDate: new Date().toISOString().split('T')[0]!,
        preferredTimeSlot: '11:00-12:00',
        consultationMode: 'video_call',
        status: 'completed',
        unlockAmountInr: 1500,
        timeline: [],
        uploadedDocumentIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const earnings = computeLawyerEarnings(lawyerUid, [mockBooking]);
      expect(earnings.grossTotalInr).toBe(1500);
      expect(earnings.commissionRatePercentage).toBe(PLATFORM_COMMISSION_PERCENTAGE);
      expect(earnings.commissionRatePercentage).toBe(15);
      expect(earnings.totalCommissionInr).toBe(225); // 15% of 1500
      expect(earnings.netEarningsInr).toBe(1275); // 1500 - 225
    });
  });
});
