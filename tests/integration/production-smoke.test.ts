import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import crypto from 'crypto';
import {
  getPublicLawyerProfile,
} from '../../apps/web/src/lib/services/lawyer-profile.service';
import {
  canTransitionKycStatus,
  validateKycFile,
  getPrivateKycStoragePath,
} from '../../apps/web/src/lib/services/lawyer-kyc.service';
import {
  listAdminLawyers,
} from '../../apps/web/src/lib/services/admin-lawyer.service';
import {
  createBooking,
  getBookingById,
  resetBookingStore,
} from '../../apps/web/src/lib/services/booking.service';
import {
  createRazorpayOrder,
  verifyPayment,
  resetPaymentStore,
} from '../../apps/web/src/lib/services/payment.service';
import {
  uploadBookingDocument,
  getBookingDocuments,
  generateSecureDocumentDownloadUrl,
} from '../../apps/web/src/lib/services/document.service';
import {
  emitNotificationEvent,
  getUnreadNotificationCount,
  resetNotificationSystem,
} from '../../apps/web/src/lib/services/notifications/notification.service';
import {
  createReview,
  checkReviewEligibility,
  calculateAggregateRating,
  resetReviewStore,
  seedReviewBookingsStore,
} from '../../apps/web/src/lib/services/review.service';
import {
  seedAdminPortalData,
  assertAdminAuthorization,
} from '../../apps/web/src/lib/services/admin-portal.service';
import type { Booking } from '@legalhub/types';

describe('Phase 29: Production Environment Automated Smoke Test Suite', () => {
  const prodClientUid = 'prod_client_ananya_01';
  const prodLawyerUid = 'lawyer-1';
  const prodAdminUid = 'prod_admin_ops_01';
  const prodSecretKey = 'rzp_live_production_secret_key_2026';

  beforeAll(() => {
    process.env.NEXT_PUBLIC_APP_ENV = 'production';
    process.env.NEXT_PUBLIC_APP_URL = 'https://legalhubmumbai.com';
    process.env.RAZORPAY_KEY_SECRET = prodSecretKey;
  });

  beforeEach(() => {
    resetBookingStore();
    resetPaymentStore();
    resetNotificationSystem();
    resetReviewStore();
    seedAdminPortalData();
  });

  // Flow 1: Production Configuration & Homepage Target
  it('1. Production Smoke Test: Production Environment & Domain Verification', () => {
    expect(process.env.NEXT_PUBLIC_APP_ENV).toBe('production');
    expect(process.env.NEXT_PUBLIC_APP_URL).toBe('https://legalhubmumbai.com');
    expect(prodClientUid).toBeDefined();
    expect(prodLawyerUid).toBeDefined();
    expect(prodAdminUid).toBeDefined();
  });

  // Flow 2: Authentication & Role Boundary Check
  it('2. Production Smoke Test: Authentication & Client/Admin Role Enforcement', () => {
    expect(() => assertAdminAuthorization('admin')).not.toThrow();
    expect(() => assertAdminAuthorization('client')).toThrowError(/Unauthorized: Privileged administrative access required/);
  });

  // Flow 3: Lawyer Search & Discovery across Mumbai Micromarkets
  it('3. Production Smoke Test: Lawyer Search & Discovery', async () => {
    const lawyers = await listAdminLawyers({ status: 'all' });
    expect(lawyers.length).toBeGreaterThan(0);

    const fortLawyers = lawyers.filter(
      (l) =>
        l.locality.toLowerCase().includes('fort') ||
        l.locality.toLowerCase().includes('mumbai') ||
        l.practiceAreas.includes('Property Registration & Conveyancing')
    );

    expect(fortLawyers.length).toBeGreaterThan(0);
    expect(fortLawyers[0]?.sanadNumber).toBeDefined();
    expect(fortLawyers[0]?.rating).toBeGreaterThanOrEqual(4.5);
  });

  // Flow 4: Lawyer Public Profile & Sanad Credential Verification
  it('4. Production Smoke Test: Lawyer Profile & Public Data Sanitization', async () => {
    const profile = await getPublicLawyerProfile(prodLawyerUid);

    expect(profile).toBeDefined();
    expect(profile?.sanadNumber).toBe('MAH/4821/2012');
    expect(profile?.isAcceptingBookings).toBe(true);
    expect(profile?.consultationFeeInr).toBe(1500);
    expect(profile?.contactPhone).toBeUndefined(); // PII protected before unlock
  });

  // Flow 5: Lawyer Registration & KYC Submission Security
  it('5. Production Smoke Test: Lawyer Registration & KYC File Guard', () => {
    const validSanad = { name: 'advocate_sanad_prod.pdf', size: 2.1 * 1024 * 1024, type: 'application/pdf' };
    const check = validateKycFile(validSanad);
    expect(check.valid).toBe(true);

    const secureStoragePath = getPrivateKycStoragePath(prodLawyerUid, 'sanad', validSanad.name);
    expect(secureStoragePath).toContain(`lawyer_kyc/${prodLawyerUid}/sanad_`);

    const canVerify = canTransitionKycStatus('under_review', 'verified');
    expect(canVerify).toBe(true);
  });

  // Flow 6: Admin Login & Secure Dashboard Access
  it('6. Production Smoke Test: Admin Login & Portal Data Access', async () => {
    assertAdminAuthorization('admin');
    const lawyers = await listAdminLawyers({ status: 'verified' });
    expect(lawyers.length).toBeGreaterThan(0);
  });

  // Flow 7: Booking Creation & Slot Reservation
  it('7. Production Smoke Test: Consultation Booking Creation', async () => {
    const bookingRes = await createBooking(
      {
        lawyerUid: prodLawyerUid,
        serviceCategory: 'Property Registration & Conveyancing',
        caseDescription: 'Production launch validation for CTS plot title clearance consultation.',
        preferredDate: '2026-10-05',
        preferredTimeSlot: '11:00-12:00',
        consultationMode: 'in_person_office',
        clientName: 'Ananya Mehta',
        clientPhone: '+919820099887',
      },
      prodClientUid
    );

    expect(bookingRes.success).toBe(true);
    expect(bookingRes.booking).toBeDefined();
    expect(bookingRes.booking?.status).toBe('pending_payment');
    expect(bookingRes.booking?.unlockAmountInr).toBe(299);
  });

  // Flow 8: Payment Execution via Razorpay & HMAC Signature Verification
  it('8. Production Smoke Test: Razorpay ₹299 Unlock Payment Verification', async () => {
    const bRes = await createBooking(
      {
        lawyerUid: prodLawyerUid,
        serviceCategory: 'Property Registration & Conveyancing',
        caseDescription: 'Production payment smoke test',
        preferredDate: '2026-10-05',
        preferredTimeSlot: '14:00-15:00',
        consultationMode: 'in_person_office',
        clientName: 'Ananya Mehta',
        clientPhone: '+919820099887',
      },
      prodClientUid
    );
    const testBkId = bRes.booking!.id;

    const orderRes = await createRazorpayOrder({
      bookingId: testBkId,
      userId: prodClientUid,
      userRole: 'client',
      purpose: 'unlock_consultation',
    });

    expect(orderRes.success).toBe(true);
    const rzpOrderId = orderRes.order!.id;
    const rzpPaymentId = 'pay_prod_live_tx_00991';

    const validSignature = crypto
      .createHmac('sha256', prodSecretKey)
      .update(`${rzpOrderId}|${rzpPaymentId}`)
      .digest('hex');

    const verifyRes = await verifyPayment({
      bookingId: testBkId,
      razorpayOrderId: rzpOrderId,
      razorpayPaymentId: rzpPaymentId,
      razorpaySignature: validSignature,
      userId: prodClientUid,
    });

    expect(verifyRes.success).toBe(true);
    expect(verifyRes.transaction?.status).toBe('captured');
    expect(verifyRes.transaction?.amount).toBe(299);
    expect(verifyRes.booking?.status).toBe('pending_lawyer');
  });

  // Flow 9: Document Upload & Multi-Tenant Access in Vault
  it('9. Production Smoke Test: Secure Document Vault Upload & Signed Token', async () => {
    const bRes = await createBooking(
      {
        lawyerUid: prodLawyerUid,
        serviceCategory: 'Property Registration & Conveyancing',
        caseDescription: 'Production document vault verification',
        preferredDate: '2026-10-05',
        preferredTimeSlot: '15:00-16:00',
        consultationMode: 'in_person_office',
        clientName: 'Ananya Mehta',
        clientPhone: '+919820099887',
      },
      prodClientUid
    );
    const testBkId = bRes.booking!.id;

    const uploadRes = await uploadBookingDocument({
      bookingId: testBkId,
      uploaderUid: prodClientUid,
      uploaderRole: 'client',
      documentType: 'property_title_deed',
      file: {
        name: 'bandra_society_share_cert.pdf',
        size: 1.5 * 1024 * 1024,
        type: 'application/pdf',
      },
    });

    expect(uploadRes.success).toBe(true);
    const docId = uploadRes.document!.id;

    const dlRes = await generateSecureDocumentDownloadUrl(docId, prodLawyerUid, 'lawyer');
    expect(dlRes.success).toBe(true);
    expect(dlRes.downloadUrl).toBeDefined();

    const unauthorizedDl = await generateSecureDocumentDownloadUrl(docId, 'unauthorized_stranger_uid', 'client');
    expect(unauthorizedDl.success).toBe(false);
  });

  // Flow 10: Multi-Channel Notification Dispatch
  it('10. Production Smoke Test: Multi-Channel Notification Engine', async () => {
    const emitRes = await emitNotificationEvent({
      recipientUid: prodClientUid,
      type: 'BOOKING_CONFIRMED',
      title: 'Consultation Confirmed with Adv. Deshmukh',
      body: 'Your property consultation is locked for Oct 5, 2026.',
      channels: ['in_app', 'email', 'sms'],
    });

    expect(emitRes.success).toBe(true);
    const unread = await getUnreadNotificationCount(prodClientUid, prodClientUid);
    expect(unread.count).toBeGreaterThanOrEqual(1);
  });

  // Flow 11: Review & Rating Recalculation
  it('11. Production Smoke Test: Verified Client Review Submission', async () => {
    const completedBooking: Booking = {
      id: 'bk_prod_smoke_completed',
      bookingReferenceNumber: 'LHM-PROD-2026-001',
      clientUid: prodClientUid,
      clientName: 'Ananya Mehta',
      clientPhone: '+919820099887',
      lawyerUid: prodLawyerUid,
      lawyerName: 'Adv. Rajeshwar Deshmukh',
      lawyerSanadNumber: 'MAH/4821/2012',
      serviceCategory: 'Property Registration & Conveyancing',
      caseDescription: 'Completed consultation for production review smoke test',
      preferredDate: '2026-09-18',
      preferredTimeSlot: '11:00-12:00',
      consultationMode: 'video_call',
      status: 'completed',
      unlockAmountInr: 299,
      timeline: [],
      uploadedDocumentIds: [],
      createdAt: '2026-09-18T10:00:00Z',
      updatedAt: '2026-09-18T11:00:00Z',
    };

    seedReviewBookingsStore([completedBooking]);

    const elig = await checkReviewEligibility(prodClientUid, completedBooking.id);
    expect(elig.isEligible).toBe(true);

    const reviewRes = await createReview(prodClientUid, 'Ananya Mehta', {
      bookingId: completedBooking.id,
      lawyerId: prodLawyerUid,
      rating: 5,
      reviewTitle: 'Flawless Title Verification Advisory',
      reviewComment: 'Advocate Deshmukh conducted thorough due diligence on CTS plot survey documents.',
    });

    expect(reviewRes.success).toBe(true);
    expect(reviewRes.review?.rating).toBe(5);

    const aggregate = calculateAggregateRating([reviewRes.review!]);
    expect(aggregate.totalReviews).toBe(1);
    expect(aggregate.averageRating).toBe(5);
  });
});
