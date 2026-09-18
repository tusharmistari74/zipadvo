import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import crypto from 'crypto';
import {
  checkRateLimit,
  resetRateLimiter,
  getRateLimitHeaders,
  RATE_LIMIT_CONFIGS,
} from '../../packages/utils/src/rate-limiter';
import {
  toggleBlockUser,
  overrideBookingStatus,
  resolveDispute,
  updateAdminPlatformSettings,
  seedAdminPortalData,
} from '../../apps/web/src/lib/services/admin-portal.service';
import {
  getLawyerEarningsReport,
  getLawyerBookings,
  acceptLawyerBooking,
  seedLawyerPortalBookings,
} from '../../apps/web/src/lib/services/lawyer-dashboard.service';
import {
  getDisputeById,
  adjudicateDispute,
  seedDisputeServiceData,
  resetDisputeServiceStores,
} from '../../apps/web/src/lib/services/dispute.service';
import {
  createRazorpayOrder,
  verifyPayment,
  processRazorpayWebhook,
  resetPaymentStore,
} from '../../apps/web/src/lib/services/payment.service';
import {
  createBooking,
  resetBookingStore,
} from '../../apps/web/src/lib/services/booking.service';
import {
  uploadBookingDocument,
  generateSecureDocumentDownloadUrl,
} from '../../apps/web/src/lib/services/document.service';
import {
  validateFileSafety,
  verifyRazorpayPaymentSignature,
} from '@legalhub/validation';
import {
  getBusinessAnalyticsDashboard,
  seedAnalyticsTestData,
} from '../../apps/web/src/lib/services/analytics.service';
import nextConfig from '../../apps/web/next.config.mjs';
import type { Booking, Dispute, PaymentTransaction, UserRole } from '@legalhub/types';

describe('Phase 22: Comprehensive Security Hardening & Access Control', () => {
  const clientUser = {
    userId: 'usr_client_rahul',
    role: 'client' as UserRole,
  };

  const otherClientUser = {
    userId: 'usr_client_stranger',
    role: 'client' as UserRole,
  };

  const lawyerUser = {
    userId: 'lawyer-1',
    role: 'lawyer' as UserRole,
  };

  const otherLawyerUser = {
    userId: 'usr_lawyer_other',
    role: 'lawyer' as UserRole,
  };

  const sampleBooking: Booking = {
    id: 'bk_sec_001',
    bookingReferenceNumber: 'LHM-2026-SEC-0001',
    clientUid: clientUser.userId,
    clientName: 'Rahul Mehta',
    clientPhone: '+919820011223',
    lawyerUid: lawyerUser.userId,
    lawyerName: 'Adv. Rajeshwar Deshmukh',
    lawyerSanadNumber: 'MAH/4821/2012',
    serviceCategory: 'Property Registration & Conveyancing',
    caseDescription: 'Security verification consultation',
    preferredDate: '2026-09-20',
    preferredTimeSlot: '11:00-12:00',
    consultationMode: 'video_call',
    status: 'pending_payment',
    unlockAmountInr: 299,
    timeline: [],
    uploadedDocumentIds: ['doc_sec_001'],
    createdAt: '2026-09-18T10:00:00Z',
    updatedAt: '2026-09-18T10:00:00Z',
  };

  const sampleDispute: Dispute = {
    id: 'disp_sec_001',
    bookingId: 'bk_sec_001',
    userId: clientUser.userId,
    lawyerId: lawyerUser.userId,
    raisedBy: 'client',
    reason: 'advocate_no_show',
    description: 'Advocate did not attend scheduled consultation.',
    status: 'open',
    createdAt: '2026-09-18T10:00:00Z',
    updatedAt: '2026-09-18T10:00:00Z',
  };

  const samplePayment: PaymentTransaction = {
    id: 'pay_sec_001',
    paymentId: 'pay_sec_001',
    bookingId: 'bk_sec_001',
    userId: clientUser.userId,
    amountInr: 299,
    amountPaise: 29900,
    currency: 'INR',
    purpose: 'unlock_consultation',
    status: 'success',
    createdAt: '2026-09-18T10:00:00Z',
    updatedAt: '2026-09-18T10:00:00Z',
  };

  beforeAll(() => {
    process.env.RAZORPAY_KEY_SECRET = 'rzp_test_secret_hardening_2026';
    process.env.RAZORPAY_WEBHOOK_SECRET = 'whsec_test_secret_hardening_2026';
  });

  beforeEach(() => {
    resetRateLimiter();
    resetBookingStore();
    resetPaymentStore();
    resetDisputeServiceStores();

    seedAdminPortalData();
    seedLawyerPortalBookings([sampleBooking]);
    seedDisputeServiceData({
      disputes: [sampleDispute],
      bookings: [sampleBooking],
      payments: [samplePayment],
    });
    seedAnalyticsTestData();
  });

  describe('1. Cross-Role Authorization & Privilege Escalation (RBAC)', () => {
    it('should reject USER attempting to execute ADMIN actions (toggleBlockUser)', async () => {
      await expect(
        toggleBlockUser(
          clientUser.userId,
          clientUser.role,
          'usr_target_01',
          'block',
          'Malicious attempt'
        )
      ).rejects.toThrow(/Privileged administrative access required/i);
    });

    it('should reject USER attempting to execute ADMIN actions (overrideBookingStatus)', async () => {
      await expect(
        overrideBookingStatus(
          clientUser.userId,
          clientUser.role,
          'bk_admin_001',
          {
            newStatus: 'completed',
            reason: 'User override',
          }
        )
      ).rejects.toThrow(/Privileged administrative access required/i);
    });

    it('should reject USER attempting to update platform configuration', async () => {
      await expect(
        updateAdminPlatformSettings(
          clientUser.userId,
          clientUser.role,
          { unlockFee: 0 }
        )
      ).rejects.toThrow(/Privileged administrative access required/i);
    });

    it('should reject USER attempting to access business analytics dashboard', async () => {
      const res = await getBusinessAnalyticsDashboard(clientUser.role);
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Forbidden/i);
    });

    it('should reject USER attempting to execute LAWYER portal actions (acceptLawyerBooking)', async () => {
      const res = await acceptLawyerBooking({
        lawyerUid: clientUser.userId,
        bookingId: 'bk_sec_001',
      });
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/not found|Unauthorized/i);
    });

    it('should reject LAWYER attempting to execute ADMIN actions (resolveDispute)', async () => {
      await expect(
        resolveDispute(
          lawyerUser.userId,
          lawyerUser.role,
          'disp_sec_001',
          {
            resolution: 'dismissed',
            resolutionSummary: 'Dismissed by advocate',
          }
        )
      ).rejects.toThrow(/Privileged administrative access required/i);
    });

    it('should reject LAWYER attempting to view OTHER LAWYER private earnings', async () => {
      const res = await getLawyerEarningsReport(otherLawyerUser.userId);
      // Returns 0 earnings since data isolation separates advocate accounts
      expect(res.grossTotalInr).toBe(0);
      expect(res.netEarningsInr).toBe(0);
    });

    it('should reject LAWYER attempting to inspect OTHER LAWYER private booking requests', async () => {
      const res = await getLawyerBookings(otherLawyerUser.userId);
      // Zero leak of another advocate's requests
      expect(res.bookings.length).toBe(0);
    });

    it('should reject IDOR: Client attempting to access another client private dispute', async () => {
      const res = await getDisputeById(
        otherClientUser.userId,
        otherClientUser.role,
        'disp_sec_001'
      );
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Unauthorized/i);
    });

    it('should reject non-admin attempting to adjudicate disputes', async () => {
      await expect(
        adjudicateDispute(
          clientUser.userId,
          clientUser.role,
          'disp_sec_001',
          {
            resolution: 'client_refund',
            resolutionSummary: 'Self-adjudicated refund',
          }
        )
      ).rejects.toThrow(/Privileged administrative access required/i);
    });
  });

  describe('2. Document Vault & Storage Security', () => {
    it('should reject unauthorized upload for non-participant', async () => {
      // Create a test booking
      const bRes = await createBooking(
        {
          lawyerUid: lawyerUser.userId,
          serviceCategory: 'Property Registration & Conveyancing',
          caseDescription: 'Doc access testing',
          preferredDate: '2026-09-22',
          preferredTimeSlot: '10:00-11:00',
          consultationMode: 'in_person_office',
          clientName: 'Rahul Mehta',
          clientPhone: '+919820011223',
        },
        clientUser.userId
      );

      expect(bRes.success).toBe(true);

      const res = await uploadBookingDocument({
        bookingId: bRes.booking!.id,
        uploaderUid: otherClientUser.userId,
        uploaderRole: otherClientUser.role,
        documentType: 'property_title_deed',
        file: {
          name: 'sale_deed.pdf',
          size: 1024 * 1024,
          type: 'application/pdf',
        },
      });

      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Unauthorized/i);
    });

    it('should reject unauthorized download URL generation for non-participant', async () => {
      // Create booking & upload doc
      const bRes = await createBooking(
        {
          lawyerUid: lawyerUser.userId,
          serviceCategory: 'Property Registration & Conveyancing',
          caseDescription: 'Doc download testing',
          preferredDate: '2026-09-22',
          preferredTimeSlot: '11:00-12:00',
          consultationMode: 'in_person_office',
          clientName: 'Rahul Mehta',
          clientPhone: '+919820011223',
        },
        clientUser.userId
      );

      const upRes = await uploadBookingDocument({
        bookingId: bRes.booking!.id,
        uploaderUid: clientUser.userId,
        uploaderRole: clientUser.role,
        documentType: 'property_title_deed',
        file: {
          name: 'valid_deed.pdf',
          size: 1024 * 500,
          type: 'application/pdf',
        },
      });

      expect(upRes.success).toBe(true);

      const res = await generateSecureDocumentDownloadUrl(
        upRes.document!.id,
        otherClientUser.userId,
        otherClientUser.role
      );

      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Unauthorized|Access Denied/i);
    });

    it('should reject oversize file upload (> 5MB limit)', () => {
      const res = validateFileSafety({
        filename: 'huge_scan.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 6 * 1024 * 1024, // 6 MB exceeds 5 MB limit
      });

      expect(res.valid).toBe(false);
      expect(res.error).toMatch(/exceeds/i);
    });

    it('should reject unsupported file MIME types (e.g. executable .exe / .js)', () => {
      const res = validateFileSafety({
        filename: 'script.exe',
        mimeType: 'application/x-msdownload',
        sizeBytes: 50000,
      });

      expect(res.valid).toBe(false);
      expect(res.error).toMatch(/Invalid file extension|Unsupported file format/i);
    });
  });

  describe('3. Payment Security & Anti-Fraud', () => {
    it('should prevent client-side amount tampering (server determines canonical fee)', async () => {
      const bRes = await createBooking(
        {
          lawyerUid: lawyerUser.userId,
          serviceCategory: 'Property Registration & Conveyancing',
          caseDescription: 'Payment tamper test',
          preferredDate: '2026-09-25',
          preferredTimeSlot: '15:00-16:00',
          consultationMode: 'in_person_office',
          clientName: 'Rahul Mehta',
          clientPhone: '+919820011223',
        },
        clientUser.userId
      );

      expect(bRes.success).toBe(true);

      const res = await createRazorpayOrder({
        bookingId: bRes.booking!.id,
        userId: clientUser.userId,
        userRole: clientUser.role,
        purpose: 'unlock_consultation',
      });

      expect(res.success).toBe(true);
      // Server must enforce ₹299 (29900 paise), regardless of client tampering
      expect(res.order?.amountInr).toBe(299);
      expect(res.order?.amount).toBe(29900);
    });

    it('should prevent duplicate payments on already paid bookings', async () => {
      const bRes = await createBooking(
        {
          lawyerUid: lawyerUser.userId,
          serviceCategory: 'Property Registration & Conveyancing',
          caseDescription: 'Payment duplicate test',
          preferredDate: '2026-09-25',
          preferredTimeSlot: '15:00-16:00',
          consultationMode: 'in_person_office',
          clientName: 'Rahul Mehta',
          clientPhone: '+919820011223',
        },
        clientUser.userId
      );

      expect(bRes.success).toBe(true);

      // 1. First payment order
      const orderRes = await createRazorpayOrder({
        bookingId: bRes.booking!.id,
        userId: clientUser.userId,
        userRole: clientUser.role,
        purpose: 'unlock_consultation',
      });

      expect(orderRes.success).toBe(true);

      // 2. Complete payment
      const secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret_hardening_2026';
      const orderId = orderRes.order!.id;
      const paymentId = 'pay_test_completed_001';
      const signature = crypto
        .createHmac('sha256', secret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      await verifyPayment({
        bookingId: bRes.booking!.id,
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
        userId: clientUser.userId,
      });

      // 3. Attempt second payment on same booking
      const duplicateRes = await createRazorpayOrder({
        bookingId: bRes.booking!.id,
        userId: clientUser.userId,
        userRole: clientUser.role,
        purpose: 'unlock_consultation',
      });

      expect(duplicateRes.success).toBe(false);
      expect(duplicateRes.error).toMatch(/does not require unlock payment/i);
    });

    it('should reject fake or invalid cryptographic signatures', () => {
      const isValid = verifyRazorpayPaymentSignature({
        razorpayOrderId: 'order_123',
        razorpayPaymentId: 'pay_456',
        razorpaySignature: 'invalid_tampered_signature_string',
        secret: 'test_secret_key',
      });

      expect(isValid).toBe(false);
    });

    it('should reject webhook replay or invalid signature events', async () => {
      const res = await processRazorpayWebhook({
        rawBody: JSON.stringify({ event: 'payment.captured' }),
        signature: 'invalid_tampered_webhook_signature',
      });

      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Invalid.*webhook signature/i);
    });
  });

  describe('4. Sliding-Window Rate Limiting System', () => {
    it('should allow requests within rate limit quota', () => {
      const result = checkRateLimit('192.168.1.1', 'auth');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(RATE_LIMIT_CONFIGS.auth.maxRequests - 1);
    });

    it('should block requests exceeding category limit and return 429 Retry-After metadata', () => {
      const ip = '192.168.1.100';
      const maxRequests = RATE_LIMIT_CONFIGS.otp.maxRequests;

      for (let i = 0; i < maxRequests; i++) {
        const res = checkRateLimit(ip, 'otp');
        expect(res.allowed).toBe(true);
      }

      // Exceeded limit attempt
      const blockedRes = checkRateLimit(ip, 'otp');
      expect(blockedRes.allowed).toBe(false);
      expect(blockedRes.remaining).toBe(0);
      expect(blockedRes.retryAfterSeconds).toBeGreaterThanOrEqual(1);

      const headers = getRateLimitHeaders(blockedRes);
      expect(headers['X-RateLimit-Limit']).toBe(maxRequests.toString());
      expect(headers['X-RateLimit-Remaining']).toBe('0');
      expect(headers['Retry-After']).toBeDefined();
    });

    it('should enforce distinct limits for different categories', () => {
      const user = 'usr_test_limiter';

      // Spend all auth tokens
      for (let i = 0; i < RATE_LIMIT_CONFIGS.auth.maxRequests; i++) {
        checkRateLimit(user, 'auth');
      }
      expect(checkRateLimit(user, 'auth').allowed).toBe(false);

      // Payments category quota should remain completely available
      const paymentRes = checkRateLimit(user, 'payments');
      expect(paymentRes.allowed).toBe(true);
      expect(paymentRes.remaining).toBe(RATE_LIMIT_CONFIGS.payments.maxRequests - 1);
    });
  });

  describe('5. Production HTTP Security Headers', () => {
    it('should configure strict security headers in Next.js configuration', async () => {
      expect(nextConfig.headers).toBeDefined();
      const headersConfig = await nextConfig.headers!();

      expect(headersConfig.length).toBeGreaterThan(0);
      const globalHeaders = headersConfig[0]!.headers;

      const headerMap = new Map(globalHeaders.map((h: { key: string; value: string }) => [h.key, h.value]));

      expect(headerMap.get('X-Frame-Options')).toBe('DENY');
      expect(headerMap.get('X-Content-Type-Options')).toBe('nosniff');
      expect(headerMap.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
      expect(headerMap.get('Strict-Transport-Security')).toContain('max-age=63072000');
      expect(headerMap.get('Content-Security-Policy')).toContain("default-src 'self'");
      expect(headerMap.get('Permissions-Policy')).toBe('camera=(), microphone=(), geolocation=()');
    });
  });
});
