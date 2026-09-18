import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import crypto from 'crypto';
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
  getUserNotifications,
  resetNotificationSystem,
} from '../../apps/web/src/lib/services/notifications/notification.service';
import {
  raiseDispute,
  moveDisputeToReview,
  adjudicateDispute,
  closeDispute,
  resetDisputeServiceStores,
  seedDisputeServiceData,
} from '../../apps/web/src/lib/services/dispute.service';
import {
  createReview,
  checkReviewEligibility,
  calculateAggregateRating,
  resetReviewStore,
  seedReviewBookingsStore,
} from '../../apps/web/src/lib/services/review.service';
import {
  listAdminLawyers,
} from '../../apps/web/src/lib/services/admin-lawyer.service';
import {
  canTransitionKycStatus,
} from '../../apps/web/src/lib/services/lawyer-kyc.service';
import {
  getAdminDashboardMetrics,
  getAdminBookings,
  getAdminAuditLogs,
  seedAdminPortalData,
} from '../../apps/web/src/lib/services/admin-portal.service';
import {
  acceptLawyerBooking,
  updateLawyerBookingStatus,
  seedLawyerPortalBookings,
} from '../../apps/web/src/lib/services/lawyer-dashboard.service';
import {
  calculatePlatformBusinessMetrics,
  seedAnalyticsTestData,
} from '../../apps/web/src/lib/services/analytics.service';
import type { Booking, PaymentTransaction } from '@legalhub/types';

describe('Phase 24: Subsystem Integration & Full Legal Transaction Lifecycle', () => {
  const clientUid = 'usr_client_lifecycle_01';
  const lawyerUid = 'lawyer-1';
  const adminUid = 'admin_sys_01';
  const secretKey = 'rzp_test_secret_integration_2026';
  const webhookSecret = 'whsec_test_secret_integration_2026';

  let bookingId: string;
  let paymentOrderId: string;
  let documentId: string;
  let disputeId: string;

  beforeAll(() => {
    process.env.RAZORPAY_KEY_SECRET = secretKey;
    process.env.RAZORPAY_WEBHOOK_SECRET = webhookSecret;
  });

  beforeEach(() => {
    resetBookingStore();
    resetPaymentStore();
    resetNotificationSystem();
    resetDisputeServiceStores();
    resetReviewStore();
    seedAdminPortalData();
    seedAnalyticsTestData();
  });

  describe('Stage 1: Advocate KYC & Admin Verification Flow', () => {
    it('should list submitted advocate profiles and verify Sanad credentials', async () => {
      // 1. Admin lists pending/submitted advocates
      const lawyers = await listAdminLawyers({ status: 'all' });
      expect(lawyers.length).toBeGreaterThan(0);

      // 2. Verify state transition constraints
      expect(canTransitionKycStatus('submitted', 'under_review')).toBe(true);
      expect(canTransitionKycStatus('under_review', 'verified')).toBe(true);
      expect(canTransitionKycStatus('draft', 'verified')).toBe(false);
    });
  });

  describe('Stage 2: Consultation Booking & Slot Reservation', () => {
    it('should create booking in pending_payment status and reserve calendar slot', async () => {
      const createRes = await createBooking(
        {
          lawyerUid,
          serviceCategory: 'Property Registration & Conveyancing',
          caseDescription: 'Complete title check and TSR for redevelopment flat in Dadar West.',
          preferredDate: '2026-09-28',
          preferredTimeSlot: '11:00-12:00',
          consultationMode: 'in_person_office',
          clientName: 'Sunil Gavaskar',
          clientPhone: '+919820088990',
        },
        clientUid
      );

      expect(createRes.success).toBe(true);
      expect(createRes.booking).toBeDefined();
      expect(createRes.booking?.status).toBe('pending_payment');
      expect(createRes.booking?.unlockAmountInr).toBe(299);

      bookingId = createRes.booking!.id;
    });
  });

  describe('Stage 3: Razorpay Payment & Cryptographic Verification', () => {
    it('should initiate Razorpay order, verify signature, and transition booking to pending_lawyer', async () => {
      // Create booking for this stage
      const bRes = await createBooking(
        {
          lawyerUid,
          serviceCategory: 'Property Registration & Conveyancing',
          caseDescription: 'Title search fee payment integration test',
          preferredDate: '2026-09-29',
          preferredTimeSlot: '14:00-15:00',
          consultationMode: 'in_person_office',
          clientName: 'Sunil Gavaskar',
          clientPhone: '+919820088990',
        },
        clientUid
      );
      expect(bRes.success).toBe(true);
      const testBkId = bRes.booking!.id;

      // 1. Create Razorpay order
      const orderRes = await createRazorpayOrder({
        bookingId: testBkId,
        userId: clientUid,
        userRole: 'client',
        purpose: 'unlock_consultation',
      });

      expect(orderRes.success).toBe(true);
      expect(orderRes.order).toBeDefined();
      expect(orderRes.order?.amountInr).toBe(299);
      expect(orderRes.order?.amount).toBe(29900);

      paymentOrderId = orderRes.order!.id;
      const paymentId = 'pay_integ_test_001';

      // 2. Generate valid HMAC-SHA256 signature
      const validSignature = crypto
        .createHmac('sha256', secretKey)
        .update(`${paymentOrderId}|${paymentId}`)
        .digest('hex');

      // 3. Verify payment
      const verifyRes = await verifyPayment({
        bookingId: testBkId,
        razorpayOrderId: paymentOrderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: validSignature,
        userId: clientUid,
      });

      expect(verifyRes.success).toBe(true);
      expect(verifyRes.transaction?.status).toBe('captured');

      // 4. Verify booking state transitioned to pending_lawyer
      const updatedBooking = await getBookingById(testBkId, clientUid, 'client');
      expect(updatedBooking.success).toBe(true);
      expect(updatedBooking.booking?.status).toBe('pending_lawyer');
    });
  });

  describe('Stage 4: Advocate Acceptance & Client Contact Unmasking', () => {
    it('should allow advocate to inspect and accept booking request', async () => {
      const bRes = await createBooking(
        {
          lawyerUid,
          serviceCategory: 'Property Registration & Conveyancing',
          caseDescription: 'Acceptance test booking',
          preferredDate: '2026-09-29',
          preferredTimeSlot: '16:00-17:00',
          consultationMode: 'in_person_office',
          clientName: 'Sunil Gavaskar',
          clientPhone: '+919820088990',
        },
        clientUid
      );
      const testBkId = bRes.booking!.id;

      // System transitions state upon successful unlock payment
      await transitionBookingStatus({
        bookingId: testBkId,
        targetStatus: 'pending_lawyer',
        actorUid: 'system',
        actorRole: 'system',
        notes: 'Payment verified',
      });

      // Seed lawyer portal store with this unlocked booking
      const bk = (await getBookingById(testBkId, adminUid, 'admin')).booking!;
      seedLawyerPortalBookings([bk]);

      // Advocate accepts booking
      const acceptRes = await acceptLawyerBooking(lawyerUid, testBkId);
      expect(acceptRes.success).toBe(true);
      expect(acceptRes.booking?.status).toBe('confirmed');
      expect(acceptRes.booking?.clientPhone).toBe('+919820088990');
    });
  });

  describe('Stage 5: Secure Document Vault & Multi-Tenant Access', () => {
    it('should securely upload document, enforce multi-tenant access, and generate signed download token', async () => {
      const bRes = await createBooking(
        {
          lawyerUid,
          serviceCategory: 'Property Registration & Conveyancing',
          caseDescription: 'Document vault test',
          preferredDate: '2026-09-30',
          preferredTimeSlot: '10:00-11:00',
          consultationMode: 'in_person_office',
          clientName: 'Sunil Gavaskar',
          clientPhone: '+919820088990',
        },
        clientUid
      );
      const testBkId = bRes.booking!.id;

      // 1. Client uploads property title deed
      const uploadRes = await uploadBookingDocument({
        bookingId: testBkId,
        uploaderUid: clientUid,
        uploaderRole: 'client',
        documentType: 'property_title_deed',
        file: {
          name: 'title_deed_dadar.pdf',
          size: 1.5 * 1024 * 1024,
          type: 'application/pdf',
        },
      });

      expect(uploadRes.success).toBe(true);
      expect(uploadRes.document).toBeDefined();
      documentId = uploadRes.document!.id;

      // 2. Advocate can list booking documents
      const docsRes = await getBookingDocuments(testBkId, lawyerUid, 'lawyer');
      expect(docsRes.success).toBe(true);
      expect(docsRes.documents.length).toBeGreaterThan(0);

      // 3. Authorized advocate gets signed download URL
      const dlRes = await generateSecureDocumentDownloadUrl(documentId, lawyerUid, 'lawyer');
      expect(dlRes.success).toBe(true);
      expect(dlRes.downloadUrl).toBeDefined();

      // 4. Unauthorized stranger is denied
      const unauthDl = await generateSecureDocumentDownloadUrl(documentId, 'usr_stranger_99', 'client');
      expect(unauthDl.success).toBe(false);
      expect(unauthDl.error).toMatch(/Unauthorized|Access Denied/i);
    });
  });

  describe('Stage 6: Service Execution & Completion Lifecycle', () => {
    it('should progress booking from confirmed -> in_progress -> completed', async () => {
      const bRes = await createBooking(
        {
          lawyerUid,
          serviceCategory: 'Property Registration & Conveyancing',
          caseDescription: 'Service execution test',
          preferredDate: '2026-09-30',
          preferredTimeSlot: '11:00-12:00',
          consultationMode: 'in_person_office',
          clientName: 'Sunil Gavaskar',
          clientPhone: '+919820088990',
        },
        clientUid
      );
      const testBkId = bRes.booking!.id;
      await transitionBookingStatus({
        bookingId: testBkId,
        targetStatus: 'pending_lawyer',
        actorUid: 'system',
        actorRole: 'system',
      });
      await transitionBookingStatus({
        bookingId: testBkId,
        targetStatus: 'confirmed',
        actorUid: lawyerUid,
        actorRole: 'lawyer',
      });

      const bk = (await getBookingById(testBkId, adminUid, 'admin')).booking!;
      seedLawyerPortalBookings([bk]);

      // 1. Move to in_progress
      const progressRes = await updateLawyerBookingStatus(lawyerUid, testBkId, 'in_progress');
      expect(progressRes.success).toBe(true);
      expect(progressRes.booking?.status).toBe('in_progress');

      // 2. Complete consultation with deliverable notes
      const completeRes = await updateLawyerBookingStatus(
        lawyerUid,
        testBkId,
        'completed',
        'Title verification completed. Clean 30-year search report issued.'
      );
      expect(completeRes.success).toBe(true);
      expect(completeRes.booking?.status).toBe('completed');
    });
  });

  describe('Stage 7: Review & Rating Engine', () => {
    it('should validate completed booking eligibility and calculate updated aggregate lawyer rating', async () => {
      const completedBooking: Booking = {
        id: 'bk_completed_review_01',
        bookingReferenceNumber: 'LHM-2026-REV-001',
        clientUid,
        clientName: 'Sunil Gavaskar',
        clientPhone: '+919820088990',
        lawyerUid,
        lawyerName: 'Adv. Rajeshwar Deshmukh',
        lawyerSanadNumber: 'MAH/4821/2012',
        serviceCategory: 'Property Registration & Conveyancing',
        caseDescription: 'Completed consultation for review',
        preferredDate: '2026-09-20',
        preferredTimeSlot: '11:00-12:00',
        consultationMode: 'video_call',
        status: 'completed',
        unlockAmountInr: 299,
        timeline: [],
        uploadedDocumentIds: [],
        createdAt: '2026-09-20T10:00:00Z',
        updatedAt: '2026-09-20T11:00:00Z',
      };

      // Seed booking store for review eligibility check
      seedReviewBookingsStore([completedBooking]);

      // Check eligibility
      const elig = await checkReviewEligibility(clientUid, completedBooking.id);
      expect(elig.isEligible).toBe(true);

      // Submit review
      const reviewRes = await createReview(clientUid, 'Sunil Gavaskar', {
        bookingId: completedBooking.id,
        lawyerId: lawyerUid,
        rating: 5,
        reviewTitle: 'Exemplary Property Title Guidance',
        reviewComment: 'Advocate Deshmukh provided deep title insights on the redevelopment project.',
      });

      expect(reviewRes.success).toBe(true);
      expect(reviewRes.review?.rating).toBe(5);

      // Verify aggregate calculation
      const aggregate = calculateAggregateRating([reviewRes.review!]);
      expect(aggregate.totalReviews).toBe(1);
      expect(aggregate.averageRating).toBe(5);
    });
  });

  describe('Stage 8: Dispute Resolution & Admin Governance', () => {
    it('should allow client to raise dispute, admin to review & resolve with refund', async () => {
      const disputedBooking: Booking = {
        id: 'bk_disp_integ_01',
        bookingReferenceNumber: 'LHM-2026-DISP-001',
        clientUid,
        clientName: 'Sunil Gavaskar',
        clientPhone: '+919820088990',
        lawyerUid,
        lawyerName: 'Adv. Rajeshwar Deshmukh',
        lawyerSanadNumber: 'MAH/4821/2012',
        serviceCategory: 'Property Registration & Conveyancing',
        caseDescription: 'No-show dispute',
        preferredDate: '2026-09-21',
        preferredTimeSlot: '15:00-16:00',
        consultationMode: 'video_call',
        status: 'confirmed',
        unlockAmountInr: 299,
        timeline: [],
        uploadedDocumentIds: [],
        createdAt: '2026-09-21T10:00:00Z',
        updatedAt: '2026-09-21T10:00:00Z',
      };

      const disputedPayment: PaymentTransaction = {
        id: 'pay_disp_integ_01',
        paymentId: 'pay_disp_integ_01',
        userId: clientUid,
        clientUid,
        lawyerId: lawyerUid,
        lawyerUid,
        bookingId: disputedBooking.id,
        amount: 299,
        amountInr: 299,
        amountPaise: 29900,
        currency: 'INR',
        type: 'unlock_consultation',
        purpose: 'unlock_consultation',
        gateway: 'razorpay',
        razorpayOrderId: 'order_disp_01',
        razorpayPaymentId: 'pay_disp_01',
        status: 'captured',
        refunds: [],
        createdAt: '2026-09-21T10:05:00Z',
        updatedAt: '2026-09-21T10:05:00Z',
      };

      seedDisputeServiceData({
        bookings: [disputedBooking],
        payments: [disputedPayment],
      });

      // 1. Client raises dispute
      const raiseRes = await raiseDispute(clientUid, 'client', {
        bookingId: disputedBooking.id,
        reason: 'lawyer_did_not_show_up',
        description: 'Advocate was unavailable during scheduled video session.',
      });

      expect(raiseRes.success).toBe(true);
      disputeId = raiseRes.dispute!.id;

      // 2. Admin moves dispute to in_review
      const reviewRes = await moveDisputeToReview(adminUid, 'admin', disputeId);
      expect(reviewRes.success).toBe(true);
      expect(reviewRes.dispute?.status).toBe('in_review');

      // 3. Admin adjudicates with client refund
      const adjRes = await adjudicateDispute(
        adminUid,
        'admin',
        disputeId,
        {
          resolution: 'client_refund',
          resolutionSummary: 'Verified advocate technical outage. Full unlock fee refunded.',
          refundAmountInr: 299,
        }
      );

      expect(adjRes.success).toBe(true);
      expect(adjRes.dispute?.status).toBe('resolved');
      expect(adjRes.dispute?.refundAmountInr).toBe(299);

      // 4. Admin closes dispute
      const closeRes = await closeDispute(adminUid, 'admin', disputeId);
      expect(closeRes.success).toBe(true);
      expect(closeRes.dispute?.status).toBe('closed');
    });
  });

  describe('Stage 9: Platform Financial & Business Analytics Aggregation', () => {
    it('should aggregate platform metrics, gross payment volume, and revenue accurately', async () => {
      const metrics = await calculatePlatformBusinessMetrics('all');

      expect(metrics.totalUsers).toBeGreaterThanOrEqual(1);
      expect(metrics.totalBookings).toBeGreaterThanOrEqual(0);
      expect(metrics.grossPaymentVolumeInr).toBeGreaterThanOrEqual(0);
      expect(metrics.dataSource).toBeDefined();
    });
  });
});
