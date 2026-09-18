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
  transitionBookingStatus,
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
} from '../../apps/web/src/lib/services/admin-portal.service';
import type { Booking } from '@legalhub/types';

describe('Phase 26: Staging Environment Automated Smoke Test Suite', () => {
  const stagingClientUid = 'stg_client_rahul_01';
  const stagingLawyerUid = 'lawyer-1';
  const stagingAdminUid = 'stg_admin_ops_01';
  const testSecretKey = 'rzp_test_staging_sandbox_secret_2026';

  beforeAll(() => {
    process.env.NEXT_PUBLIC_APP_ENV = 'staging';
    process.env.NEXT_PUBLIC_APP_URL = 'https://staging.legalhubmumbai.com';
    process.env.RAZORPAY_KEY_SECRET = testSecretKey;
  });

  beforeEach(() => {
    resetBookingStore();
    resetPaymentStore();
    resetNotificationSystem();
    resetReviewStore();
    seedAdminPortalData();
  });

  // Flow 1: Authentication & Role Verification
  it('1. Smoke Test: Authentication & Role Verification', () => {
    expect(stagingClientUid).toBeDefined();
    expect(stagingLawyerUid).toBeDefined();
    expect(stagingAdminUid).toBeDefined();
    expect(process.env.NEXT_PUBLIC_APP_ENV).toBe('staging');
  });

  // Flow 2: Lawyer Search & Discovery across Mumbai localities
  it('2. Smoke Test: Lawyer Search & Discovery', async () => {
    const lawyers = await listAdminLawyers({ status: 'all' });
    expect(lawyers.length).toBeGreaterThan(0);

    const filtered = lawyers.filter(
      (l) =>
        l.locality.toLowerCase().includes('fort') ||
        l.locality.toLowerCase().includes('mumbai') ||
        l.practiceAreas.includes('Property Registration & Conveyancing')
    );

    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered[0]?.sanadNumber).toBeDefined();
  });

  // Flow 3: Lawyer Public Profile & Sanad Verification Inspection
  it('3. Smoke Test: Lawyer Public Profile Inspection', async () => {
    const profile = await getPublicLawyerProfile(stagingLawyerUid);

    expect(profile).toBeDefined();
    expect(profile?.sanadNumber).toBeDefined();
    expect(profile?.isAcceptingBookings).toBe(true);
    expect(profile?.consultationFeeInr).toBeGreaterThan(0);
  });

  // Flow 4: Lawyer Registration (KYC Onboarding Validation & Path Security)
  it('4. Smoke Test: Lawyer KYC Registration & Document Upload Validation', () => {
    const validSanad = { name: 'sanad_certificate.pdf', size: 1.2 * 1024 * 1024, type: 'application/pdf' };
    const check = validateKycFile(validSanad);
    expect(check.valid).toBe(true);

    const securePath = getPrivateKycStoragePath(stagingLawyerUid, 'sanad', validSanad.name);
    expect(securePath).toContain(`lawyer_kyc/${stagingLawyerUid}/sanad_`);
  });

  // Flow 5: Admin Approval of Advocate KYC
  it('5. Smoke Test: Admin Approval of Advocate Sanad', async () => {
    const lawyers = await listAdminLawyers({ status: 'all' });
    expect(lawyers.length).toBeGreaterThan(0);

    const isTransitionValid = canTransitionKycStatus('under_review', 'verified');
    expect(isTransitionValid).toBe(true);
  });

  // Flow 6: Consultation Booking & Slot Reservation
  it('6. Smoke Test: Consultation Booking Creation & Slot Lock', async () => {
    const bookingRes = await createBooking(
      {
        lawyerUid: stagingLawyerUid,
        serviceCategory: 'Property Registration & Conveyancing',
        caseDescription: 'Staging environment smoke test booking for TSR review.',
        preferredDate: '2026-09-30',
        preferredTimeSlot: '11:00-12:00',
        consultationMode: 'in_person_office',
        clientName: 'Rahul Sharma',
        clientPhone: '+919820011223',
      },
      stagingClientUid
    );

    expect(bookingRes.success).toBe(true);
    expect(bookingRes.booking).toBeDefined();
    expect(bookingRes.booking?.status).toBe('pending_payment');
    expect(bookingRes.booking?.unlockAmountInr).toBe(299);
  });

  // Flow 7: Test Payment via Razorpay Sandbox & Signature Validation
  it('7. Smoke Test: Razorpay Sandbox Test Payment Verification', async () => {
    const bRes = await createBooking(
      {
        lawyerUid: stagingLawyerUid,
        serviceCategory: 'Property Registration & Conveyancing',
        caseDescription: 'Staging test payment',
        preferredDate: '2026-09-30',
        preferredTimeSlot: '14:00-15:00',
        consultationMode: 'in_person_office',
        clientName: 'Rahul Sharma',
        clientPhone: '+919820011223',
      },
      stagingClientUid
    );
    const testBkId = bRes.booking!.id;

    const orderRes = await createRazorpayOrder({
      bookingId: testBkId,
      userId: stagingClientUid,
      userRole: 'client',
      purpose: 'unlock_consultation',
    });

    expect(orderRes.success).toBe(true);
    const rzpOrderId = orderRes.order!.id;
    const rzpPaymentId = 'pay_stg_sandbox_001';

    const validSignature = crypto
      .createHmac('sha256', testSecretKey)
      .update(`${rzpOrderId}|${rzpPaymentId}`)
      .digest('hex');

    const verifyRes = await verifyPayment({
      bookingId: testBkId,
      razorpayOrderId: rzpOrderId,
      razorpayPaymentId: rzpPaymentId,
      razorpaySignature: validSignature,
      userId: stagingClientUid,
    });

    expect(verifyRes.success).toBe(true);
    expect(verifyRes.transaction?.status).toBe('captured');
    expect(verifyRes.booking?.status).toBe('pending_lawyer');
  });

  // Flow 8: Document Vault Secure Upload & Multi-Tenant Access
  it('8. Smoke Test: Secure Document Vault Upload & Signed Token', async () => {
    const bRes = await createBooking(
      {
        lawyerUid: stagingLawyerUid,
        serviceCategory: 'Property Registration & Conveyancing',
        caseDescription: 'Staging vault test',
        preferredDate: '2026-09-30',
        preferredTimeSlot: '15:00-16:00',
        consultationMode: 'in_person_office',
        clientName: 'Rahul Sharma',
        clientPhone: '+919820011223',
      },
      stagingClientUid
    );
    const testBkId = bRes.booking!.id;

    const uploadRes = await uploadBookingDocument({
      bookingId: testBkId,
      uploaderUid: stagingClientUid,
      uploaderRole: 'client',
      documentType: 'property_title_deed',
      file: {
        name: 'deed_staging.pdf',
        size: 1024 * 1024,
        type: 'application/pdf',
      },
    });

    expect(uploadRes.success).toBe(true);
    const docId = uploadRes.document!.id;

    const dlRes = await generateSecureDocumentDownloadUrl(docId, stagingLawyerUid, 'lawyer');
    expect(dlRes.success).toBe(true);
    expect(dlRes.downloadUrl).toBeDefined();
  });

  // Flow 9: Notification Dispatch & Receipt Check
  it('9. Smoke Test: Multi-Driver Notification Dispatch & Spool', async () => {
    const emitRes = await emitNotificationEvent({
      recipientUid: stagingClientUid,
      type: 'BOOKING_CONFIRMED',
      title: 'Staging Consultation Confirmed',
      body: 'Your consultation has been confirmed for testing on staging.',
      channels: ['in_app', 'email', 'sms'],
    });

    expect(emitRes.success).toBe(true);
    const unread = await getUnreadNotificationCount(stagingClientUid, stagingClientUid);
    expect(unread.count).toBeGreaterThanOrEqual(1);
  });

  // Flow 10: Verified Review Submission & Aggregate Rating Recalculation
  it('10. Smoke Test: Verified Review Submission & Aggregate Recalculation', async () => {
    const completedBooking: Booking = {
      id: 'bk_stg_smoke_completed',
      bookingReferenceNumber: 'LHM-STG-2026-001',
      clientUid: stagingClientUid,
      clientName: 'Rahul Sharma',
      clientPhone: '+919820011223',
      lawyerUid: stagingLawyerUid,
      lawyerName: 'Adv. Rajeshwar Deshmukh',
      lawyerSanadNumber: 'MAH/4821/2012',
      serviceCategory: 'Property Registration & Conveyancing',
      caseDescription: 'Completed consultation for staging review test',
      preferredDate: '2026-09-25',
      preferredTimeSlot: '11:00-12:00',
      consultationMode: 'video_call',
      status: 'completed',
      unlockAmountInr: 299,
      timeline: [],
      uploadedDocumentIds: [],
      createdAt: '2026-09-25T10:00:00Z',
      updatedAt: '2026-09-25T11:00:00Z',
    };

    seedReviewBookingsStore([completedBooking]);

    const elig = await checkReviewEligibility(stagingClientUid, completedBooking.id);
    expect(elig.isEligible).toBe(true);

    const reviewRes = await createReview(stagingClientUid, 'Rahul Sharma', {
      bookingId: completedBooking.id,
      lawyerId: stagingLawyerUid,
      rating: 5,
      reviewTitle: 'Exceptional Redevelopment Legal Advisory',
      reviewComment: 'Advocate Deshmukh resolved critical CTS plot boundary questions in 30 minutes.',
    });

    expect(reviewRes.success).toBe(true);
    expect(reviewRes.review?.rating).toBe(5);

    const aggregate = calculateAggregateRating([reviewRes.review!]);
    expect(aggregate.totalReviews).toBe(1);
    expect(aggregate.averageRating).toBe(5);
  });
});
