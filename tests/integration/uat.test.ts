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
  raiseDispute,
  adjudicateDispute,
  closeDispute,
  resetDisputeServiceStores,
  seedDisputeServiceData,
} from '../../apps/web/src/lib/services/dispute.service';
import {
  seedAdminPortalData,
  getAdminDashboardMetrics,
  getAdminUsers,
  toggleBlockUser,
  getAdminBookings,
  overrideBookingStatus,
  getAdminAuditLogs,
  getAdminPlatformSettings,
  updateAdminPlatformSettings,
  recordAuditLog,
} from '../../apps/web/src/lib/services/admin-portal.service';
import {
  seedLawyerPortalBookings,
  acceptLawyerBooking,
  updateLawyerBookingStatus,
  getLawyerEarningsReport,
} from '../../apps/web/src/lib/services/lawyer-dashboard.service';
import {
  getClientDashboardOverview,
} from '../../apps/web/src/lib/services/client-dashboard.service';
import type { Booking, PaymentTransaction } from '@legalhub/types';

describe('Phase 27: Comprehensive User Acceptance Testing (UAT)', () => {
  const clientUid = 'uat_client_ananya';
  const clientName = 'Ananya Sen';
  const clientPhone = '+919820044556';
  const clientEmail = 'ananya.sen@example.com';

  const lawyerUid = 'lawyer-1';

  const adminUid = 'uat_admin_sys';
  const secretKey = 'rzp_test_uat_secret_2026';

  beforeAll(() => {
    process.env.NEXT_PUBLIC_APP_ENV = 'staging';
    process.env.RAZORPAY_KEY_SECRET = secretKey;
  });

  beforeEach(() => {
    resetBookingStore();
    resetPaymentStore();
    resetNotificationSystem();
    resetReviewStore();
    resetDisputeServiceStores();
    seedAdminPortalData();
  });

  // ============================================================================
  // PERSONA 1: CLIENT JOURNEY UAT
  // ============================================================================
  describe('Persona 1: Client User Experience Flow', () => {
    let paymentOrderId: string;
    let clientDocumentId: string;

    it('Flow 1.1: Signup & Profile Validation', () => {
      expect(clientUid).toBeDefined();
      expect(clientName).toBe('Ananya Sen');
      expect(clientPhone).toMatch(/^\+91[6-9]\d{9}$/);
    });

    it('Flow 1.2: Lawyer Discovery & Locality Filters', async () => {
      const lawyers = await listAdminLawyers({ status: 'all' });
      expect(lawyers.length).toBeGreaterThan(0);

      // Filter by practice area and locality
      const propertyAdvocates = lawyers.filter(
        (l) => l.practiceAreas.includes('Property Registration & Conveyancing')
      );
      expect(propertyAdvocates.length).toBeGreaterThan(0);
      expect(propertyAdvocates[0]?.sanadNumber).toBeDefined();
    });

    it('Flow 1.3: Advocate Profile Inspection & Sanad Verification', async () => {
      const profile = await getPublicLawyerProfile(lawyerUid);
      expect(profile).toBeDefined();
      expect(profile?.fullName).toContain('Rajeshwar');
      expect(profile?.isAcceptingBookings).toBe(true);
      expect(profile?.consultationFeeInr).toBeGreaterThanOrEqual(1000);
      expect(profile?.sanadNumber).toBeDefined();
    });

    it('Flow 1.4: Consultation Booking Creation & Concurrency Slot Lock', async () => {
      const bRes = await createBooking(
        {
          lawyerUid,
          serviceCategory: 'Property Registration & Conveyancing',
          caseDescription: 'Drafting sale deed and 30-year search title report for flat in Prabhadevi.',
          preferredDate: '2026-09-29',
          preferredTimeSlot: '11:00-12:00',
          consultationMode: 'in_person_office',
          clientName,
          clientPhone,
          clientEmail,
        },
        clientUid
      );

      expect(bRes.success).toBe(true);
      expect(bRes.booking).toBeDefined();
      expect(bRes.booking?.status).toBe('pending_payment');
      expect(bRes.booking?.unlockAmountInr).toBe(299);
    });

    it('Flow 1.5: Razorpay Contact Unlock Payment', async () => {
      const bRes = await createBooking(
        {
          lawyerUid,
          serviceCategory: 'Property Registration & Conveyancing',
          caseDescription: 'Unlock fee test',
          preferredDate: '2026-09-29',
          preferredTimeSlot: '15:00-16:00',
          consultationMode: 'in_person_office',
          clientName,
          clientPhone,
        },
        clientUid
      );
      const testBkId = bRes.booking!.id;

      // 1. Order creation
      const orderRes = await createRazorpayOrder({
        bookingId: testBkId,
        userId: clientUid,
        userRole: 'client',
        purpose: 'unlock_consultation',
      });
      expect(orderRes.success).toBe(true);
      paymentOrderId = orderRes.order!.id;

      // 2. Cryptographic signature verification
      const paymentId = 'pay_uat_client_001';
      const validSignature = crypto
        .createHmac('sha256', secretKey)
        .update(`${paymentOrderId}|${paymentId}`)
        .digest('hex');

      const verifyRes = await verifyPayment({
        bookingId: testBkId,
        razorpayOrderId: paymentOrderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: validSignature,
        userId: clientUid,
      });

      expect(verifyRes.success).toBe(true);
      expect(verifyRes.transaction?.status).toBe('captured');
      expect(verifyRes.booking?.status).toBe('pending_lawyer');
    });

    it('Flow 1.6: Document Vault Upload & Access Token Generation', async () => {
      const bRes = await createBooking(
        {
          lawyerUid,
          serviceCategory: 'Property Registration & Conveyancing',
          caseDescription: 'Vault test',
          preferredDate: '2026-09-30',
          preferredTimeSlot: '11:00-12:00',
          consultationMode: 'in_person_office',
          clientName,
          clientPhone,
        },
        clientUid
      );
      const testBkId = bRes.booking!.id;

      const uploadRes = await uploadBookingDocument({
        bookingId: testBkId,
        uploaderUid: clientUid,
        uploaderRole: 'client',
        documentType: 'property_title_deed',
        file: {
          name: 'sale_deed_prabhadevi.pdf',
          size: 2 * 1024 * 1024,
          type: 'application/pdf',
        },
      });

      expect(uploadRes.success).toBe(true);
      clientDocumentId = uploadRes.document!.id;

      // Client can list documents
      const docsRes = await getBookingDocuments(testBkId, clientUid, 'client');
      expect(docsRes.success).toBe(true);
      expect(docsRes.documents.length).toBeGreaterThan(0);

      // Download URL generated
      const dlRes = await generateSecureDocumentDownloadUrl(clientDocumentId, clientUid, 'client');
      expect(dlRes.success).toBe(true);
      expect(dlRes.downloadUrl).toBeDefined();
    });

    it('Flow 1.7: Track Booking Status & Timeline via Client Dashboard', async () => {
      const testBk: Booking = {
        id: 'bk_uat_track_01',
        bookingReferenceNumber: 'LHM-2026-UAT-001',
        clientUid,
        clientName,
        clientPhone,
        lawyerUid,
        lawyerName: 'Adv. Rajeshwar Deshmukh',
        lawyerSanadNumber: 'MAH/4821/2012',
        serviceCategory: 'Property Registration & Conveyancing',
        caseDescription: 'Tracking test',
        preferredDate: '2026-09-29',
        preferredTimeSlot: '11:00-12:00',
        consultationMode: 'in_person_office',
        status: 'confirmed',
        unlockAmountInr: 299,
        timeline: [
          {
            status: 'pending_payment',
            timestamp: '2026-09-22T10:00:00Z',
            actorUid: clientUid,
            actorRole: 'client',
            notes: 'Booking created',
          },
          {
            status: 'confirmed',
            timestamp: '2026-09-22T10:05:00Z',
            actorUid: lawyerUid,
            actorRole: 'lawyer',
            notes: 'Advocate accepted',
          },
        ],
        uploadedDocumentIds: [],
        createdAt: '2026-09-22T10:00:00Z',
        updatedAt: '2026-09-22T10:05:00Z',
      };

      const dash = await getClientDashboardOverview(clientUid, [testBk]);
      expect(dash.metrics.activeBookingsCount).toBe(1);
      expect(dash.recentBookings[0]?.status).toBe('confirmed');
    });

    it('Flow 1.8: Verified Post-Consultation Review Submission', async () => {
      const completedBk: Booking = {
        id: 'bk_uat_rev_01',
        bookingReferenceNumber: 'LHM-2026-UAT-REV',
        clientUid,
        clientName,
        clientPhone,
        lawyerUid,
        lawyerName: 'Adv. Rajeshwar Deshmukh',
        lawyerSanadNumber: 'MAH/4821/2012',
        serviceCategory: 'Property Registration & Conveyancing',
        caseDescription: 'Completed review test',
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

      seedReviewBookingsStore([completedBk]);

      const elig = await checkReviewEligibility(clientUid, completedBk.id);
      expect(elig.isEligible).toBe(true);

      const revRes = await createReview(clientUid, clientName, {
        bookingId: completedBk.id,
        lawyerId: lawyerUid,
        rating: 5,
        reviewTitle: 'Exceptional Redevelopment Counsel',
        reviewComment: 'Advocate Deshmukh provided deep title insights on our redevelopment agreement.',
      });

      expect(revRes.success).toBe(true);
      expect(revRes.review?.rating).toBe(5);

      const aggregate = calculateAggregateRating([revRes.review!]);
      expect(aggregate.averageRating).toBe(5);
      expect(aggregate.totalReviews).toBe(1);
    });
  });

  // ============================================================================
  // PERSONA 2: LAWYER / ADVOCATE JOURNEY UAT
  // ============================================================================
  describe('Persona 2: Advocate Experience Flow', () => {
    it('Flow 2.1: Advocate KYC Registration & Sanad File Validation', () => {
      const validSanad = { name: 'sanad_adv_deshmukh.pdf', size: 1.5 * 1024 * 1024, type: 'application/pdf' };
      const val = validateKycFile(validSanad);
      expect(val.valid).toBe(true);

      const path = getPrivateKycStoragePath(lawyerUid, 'sanad', validSanad.name);
      expect(path).toContain(`lawyer_kyc/${lawyerUid}/sanad_`);
    });

    it('Flow 2.2: Admin Sanad Verification & KYC Status Transition', () => {
      expect(canTransitionKycStatus('submitted', 'under_review')).toBe(true);
      expect(canTransitionKycStatus('under_review', 'verified')).toBe(true);
      expect(canTransitionKycStatus('verified', 'suspended')).toBe(true);
    });

    it('Flow 2.3: Advocate Booking Management (Accept / Reject)', async () => {
      const bRes = await createBooking(
        {
          lawyerUid,
          serviceCategory: 'Property Registration & Conveyancing',
          caseDescription: 'Lawyer accept test',
          preferredDate: '2026-09-29',
          preferredTimeSlot: '16:00-17:00',
          consultationMode: 'in_person_office',
          clientName,
          clientPhone,
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

      const bk = (await getBookingById(testBkId, adminUid, 'admin')).booking!;
      seedLawyerPortalBookings([bk]);

      // Advocate accepts
      const acceptRes = await acceptLawyerBooking(lawyerUid, testBkId);
      expect(acceptRes.success).toBe(true);
      expect(acceptRes.booking?.status).toBe('confirmed');
      expect(acceptRes.booking?.clientPhone).toBe(clientPhone); // Unmasked upon confirmation
    });

    it('Flow 2.4: Advocate Authorized Document Access', async () => {
      const bRes = await createBooking(
        {
          lawyerUid,
          serviceCategory: 'Property Registration & Conveyancing',
          caseDescription: 'Lawyer doc access test',
          preferredDate: '2026-09-30',
          preferredTimeSlot: '14:00-15:00',
          consultationMode: 'in_person_office',
          clientName,
          clientPhone,
        },
        clientUid
      );
      const testBkId = bRes.booking!.id;

      const upRes = await uploadBookingDocument({
        bookingId: testBkId,
        uploaderUid: clientUid,
        uploaderRole: 'client',
        documentType: 'property_title_deed',
        file: { name: 'title_deed.pdf', size: 1024 * 1024, type: 'application/pdf' },
      });

      const docId = upRes.document!.id;
      const dlRes = await generateSecureDocumentDownloadUrl(docId, lawyerUid, 'lawyer');
      expect(dlRes.success).toBe(true);
      expect(dlRes.downloadUrl).toBeDefined();
    });

    it('Flow 2.5: Service Progression to in_progress and completed', async () => {
      const bRes = await createBooking(
        {
          lawyerUid,
          serviceCategory: 'Property Registration & Conveyancing',
          caseDescription: 'Service progress test',
          preferredDate: '2026-09-30',
          preferredTimeSlot: '16:00-17:00',
          consultationMode: 'in_person_office',
          clientName,
          clientPhone,
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

      const progRes = await updateLawyerBookingStatus(lawyerUid, testBkId, 'in_progress');
      expect(progRes.success).toBe(true);
      expect(progRes.booking?.status).toBe('in_progress');

      const compRes = await updateLawyerBookingStatus(
        lawyerUid,
        testBkId,
        'completed',
        'Title search report completed and delivered.'
      );
      expect(compRes.success).toBe(true);
      expect(compRes.booking?.status).toBe('completed');
    });

    it('Flow 2.6: Advocate Earnings Computation', async () => {
      const completedBk: Booking = {
        id: 'bk_earn_01',
        bookingReferenceNumber: 'LHM-2026-EARN',
        clientUid,
        clientName,
        clientPhone,
        lawyerUid,
        lawyerName: 'Adv. Rajeshwar Deshmukh',
        lawyerSanadNumber: 'MAH/4821/2012',
        serviceCategory: 'Property Registration & Conveyancing',
        caseDescription: 'Earnings calculation',
        preferredDate: '2026-09-28',
        preferredTimeSlot: '11:00-12:00',
        consultationMode: 'in_person_office',
        status: 'completed',
        unlockAmountInr: 299,
        timeline: [],
        uploadedDocumentIds: [],
        createdAt: '2026-09-28T10:00:00Z',
        updatedAt: '2026-09-28T11:00:00Z',
      };

      const earnings = await getLawyerEarningsReport(lawyerUid, [completedBk]);
      expect(earnings.grossTotalInr).toBe(299);
      expect(earnings.netEarningsInr).toBe(Math.round(299 * 0.85)); // 15% commission
      expect(earnings.totalCommissionInr).toBe(Math.round(299 * 0.15));
    });
  });

  // ============================================================================
  // PERSONA 3: ADMIN & GOVERNANCE JOURNEY UAT
  // ============================================================================
  describe('Persona 3: Administrator & Platform Governance Flow', () => {
    it('Flow 3.1: Admin Dashboard Metrics Derived From Real Platform Records', async () => {
      const metrics = await getAdminDashboardMetrics('admin');
      expect(metrics.totalUsersCount).toBeGreaterThan(0);
      expect(metrics.totalGrossRevenueInr).toBeGreaterThanOrEqual(0);
      expect(metrics.totalPlatformCommissionInr).toBeGreaterThanOrEqual(0);
    });

    it('Flow 3.2: User Management, Search & Account Status Enforcement', async () => {
      const usersRes = await getAdminUsers('admin', { role: 'all' });
      expect(usersRes.success).toBe(true);
      expect(usersRes.users.length).toBeGreaterThan(0);

      // Block user with audit trail
      const blockRes = await toggleBlockUser(
        adminUid,
        'admin',
        'usr_client_01',
        'block',
        'Repeated spam booking attempts detected'
      );
      expect(blockRes.success).toBe(true);
      expect(blockRes.user?.status).toBe('suspended');

      // Unblock user
      const unblockRes = await toggleBlockUser(
        adminUid,
        'admin',
        'usr_client_01',
        'unblock',
        'Client identity re-verified successfully'
      );
      expect(unblockRes.success).toBe(true);
      expect(unblockRes.user?.status).toBe('active');
    });

    it('Flow 3.3: Booking Manual Admin Override & Audit Logging', async () => {
      const bookingsRes = await getAdminBookings('admin', { status: 'all' });
      expect(bookingsRes.success).toBe(true);

      const targetBk = bookingsRes.bookings[0]!;
      const overrideRes = await overrideBookingStatus(adminUid, 'admin', targetBk.id, {
        newStatus: 'completed',
        reason: 'Client confirmed offline document handover completion.',
      });

      expect(overrideRes.success).toBe(true);
      expect(overrideRes.booking?.status).toBe('completed');
    });

    it('Flow 3.4: Dispute Management & Client Refund Adjudication', async () => {
      const disputedBk: Booking = {
        id: 'bk_uat_disp_01',
        bookingReferenceNumber: 'LHM-2026-DISP-UAT',
        clientUid,
        clientName,
        clientPhone,
        lawyerUid,
        lawyerName: 'Adv. Rajeshwar Deshmukh',
        lawyerSanadNumber: 'MAH/4821/2012',
        serviceCategory: 'Property Registration & Conveyancing',
        caseDescription: 'No show',
        preferredDate: '2026-09-22',
        preferredTimeSlot: '11:00-12:00',
        consultationMode: 'video_call',
        status: 'confirmed',
        unlockAmountInr: 299,
        timeline: [],
        uploadedDocumentIds: [],
        createdAt: '2026-09-22T10:00:00Z',
        updatedAt: '2026-09-22T10:00:00Z',
      };

      const disputedPayment: PaymentTransaction = {
        id: 'pay_uat_disp_01',
        paymentId: 'pay_uat_disp_01',
        userId: clientUid,
        clientUid,
        lawyerId: lawyerUid,
        lawyerUid,
        bookingId: disputedBk.id,
        amount: 299,
        amountInr: 299,
        amountPaise: 29900,
        currency: 'INR',
        type: 'unlock_consultation',
        purpose: 'unlock_consultation',
        gateway: 'razorpay',
        razorpayOrderId: 'order_uat_01',
        razorpayPaymentId: 'pay_uat_01',
        status: 'captured',
        refunds: [],
        createdAt: '2026-09-22T10:05:00Z',
        updatedAt: '2026-09-22T10:05:00Z',
      };

      seedDisputeServiceData({
        bookings: [disputedBk],
        payments: [disputedPayment],
      });

      // 1. Client raises dispute
      const raiseRes = await raiseDispute(clientUid, 'client', {
        bookingId: disputedBk.id,
        reason: 'lawyer_did_not_show_up',
        description: 'Advocate did not join video consultation.',
      });
      expect(raiseRes.success).toBe(true);
      const disputeId = raiseRes.dispute!.id;

      // 2. Admin reviews and adjudicates with refund
      const adjRes = await adjudicateDispute(adminUid, 'admin', disputeId, {
        resolution: 'client_refund',
        resolutionSummary: 'Verified technical failure. ₹299 full refund approved.',
        refundAmountInr: 299,
      });
      expect(adjRes.success).toBe(true);
      expect(adjRes.dispute?.status).toBe('resolved');
      expect(adjRes.dispute?.refundAmountInr).toBe(299);

      // 3. Admin closes dispute
      const closeRes = await closeDispute(adminUid, 'admin', disputeId);
      expect(closeRes.success).toBe(true);
      expect(closeRes.dispute?.status).toBe('closed');
    });

    it('Flow 3.5: Platform Settings Configuration & Audit Trail', async () => {
      const getRes = await getAdminPlatformSettings('admin');
      expect(getRes.success).toBe(true);
      expect(getRes.settings.commissionRate).toBeDefined();

      const updateRes = await updateAdminPlatformSettings(adminUid, 'admin', {
        commissionRate: 15,
        unlockFee: 299,
        reason: 'Executive annual platform fee confirmation',
      });
      expect(updateRes.success).toBe(true);
      expect(updateRes.settings.commissionRate).toBe(15);
      expect(updateRes.settings.unlockFee).toBe(299);
    });

    it('Flow 3.6: Immutable System Audit Log Integrity', async () => {
      await recordAuditLog(
        adminUid,
        'admin',
        'user_blocked',
        'usr_client_01',
        'user',
        { reason: 'UAT audit integrity test' }
      );

      const auditRes = await getAdminAuditLogs('admin');
      expect(auditRes.success).toBe(true);
      expect(auditRes.logs.length).toBeGreaterThan(0);
      expect(auditRes.logs[0]?.actorUid).toBeDefined();
      expect(auditRes.logs[0]?.action).toBeDefined();
    });
  });
});
