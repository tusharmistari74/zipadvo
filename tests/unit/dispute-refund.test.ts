import { describe, it, expect, beforeEach } from 'vitest';
import {
  raiseDispute,
  getDisputesForUser,
  getDisputeById,
  moveDisputeToReview,
  adjudicateDispute,
  closeDispute,
  resetDisputeServiceStores,
  seedDisputeServiceData,
} from '../../apps/web/src/lib/services/dispute.service';
import {
  getAdminAuditLogs,
  seedAdminPortalData,
} from '../../apps/web/src/lib/services/admin-portal.service';
import type { Booking, PaymentTransaction } from '@legalhub/types';

describe('PHASE 19: Dispute & Refund Operations', () => {
  const clientUid = 'usr_client_rahul';
  const lawyerUid = 'usr_lawyer_deshmukh';
  const unrelatedUid = 'usr_unrelated_stranger';
  const adminUid = 'admin_sys_01';

  const sampleBooking: Booking = {
    id: 'bk_disp_001',
    bookingReferenceNumber: 'LHM-2026-DISP-0001',
    clientUid,
    clientName: 'Rahul Mehta',
    clientPhone: '+919820011223',
    lawyerUid,
    lawyerName: 'Adv. Rajeshwar Deshmukh',
    lawyerSanadNumber: 'MAH/4821/2012',
    serviceCategory: 'Property Registration & Conveyancing',
    caseDescription: 'Property title search consultation',
    preferredDate: '2026-09-15',
    preferredTimeSlot: '11:00-12:00',
    consultationMode: 'video_call',
    status: 'confirmed',
    unlockAmountInr: 299,
    timeline: [],
    uploadedDocumentIds: [],
    createdAt: '2026-09-15T10:00:00Z',
    updatedAt: '2026-09-15T10:00:00Z',
  };

  const samplePayment: PaymentTransaction = {
    id: 'pay_disp_001',
    paymentId: 'pay_disp_001',
    bookingId: 'bk_disp_001',
    userId: clientUid,
    clientUid,
    lawyerId: lawyerUid,
    lawyerUid,
    amount: 299,
    amountInr: 299,
    amountPaise: 29900,
    currency: 'INR',
    type: 'unlock_consultation',
    purpose: 'unlock_consultation',
    gateway: 'razorpay',
    razorpayOrderId: 'order_disp_001',
    razorpayPaymentId: 'pay_rzp_disp_001',
    status: 'captured',
    refunds: [],
    createdAt: '2026-09-15T10:00:00Z',
    updatedAt: '2026-09-15T10:00:00Z',
  };

  beforeEach(() => {
    resetDisputeServiceStores();
    seedAdminPortalData();
    seedDisputeServiceData({
      bookings: [sampleBooking],
      payments: [samplePayment],
    });
  });

  describe('1. Dispute Creation & Anti-Abuse Controls', () => {
    it('should allow a verified client to raise a dispute on their booking', async () => {
      const res = await raiseDispute(clientUid, 'client', {
        bookingId: 'bk_disp_001',
        reason: 'lawyer_did_not_show_up',
        description: 'Waited 30 minutes in video call; advocate was unavailable without notice.',
      });

      expect(res.success).toBe(true);
      expect(res.dispute).toBeDefined();
      expect(res.dispute?.status).toBe('open');
      expect(res.dispute?.userId).toBe(clientUid);
      expect(res.dispute?.lawyerId).toBe(lawyerUid);
      expect(res.dispute?.raisedBy).toBe('client');
      expect(res.dispute?.timeline).toHaveLength(1);

      // Verify booking status changed to disputed
      const disputesList = await getDisputesForUser(clientUid, 'client');
      expect(disputesList.disputes).toHaveLength(1);

      // Verify audit log
      const auditRes = await getAdminAuditLogs('admin', { action: 'dispute_opened' });
      expect(auditRes.logs.some((l) => l.targetEntityId === res.dispute?.id)).toBe(true);
    });

    it('should allow an advocate to raise a dispute (e.g. client unresponsive)', async () => {
      const res = await raiseDispute(lawyerUid, 'lawyer', {
        bookingId: 'bk_disp_001',
        reason: 'client_unresponsive',
        description: 'Client did not provide title deed documents required for TSR vetting.',
      });

      expect(res.success).toBe(true);
      expect(res.dispute?.raisedBy).toBe('lawyer');
      expect(res.dispute?.againstUid).toBe(clientUid);
    });

    it('should reject dispute creation by an unrelated user', async () => {
      const res = await raiseDispute(unrelatedUid, 'client', {
        bookingId: 'bk_disp_001',
        reason: 'poor_consultation_quality',
        description: 'Unrelated stranger attempting to interfere with consultation.',
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain('Unauthorized');
    });

    it('should prevent duplicate active disputes on the same booking', async () => {
      // First dispute
      const first = await raiseDispute(clientUid, 'client', {
        bookingId: 'bk_disp_001',
        reason: 'lawyer_did_not_show_up',
        description: 'First dispute submission.',
      });
      expect(first.success).toBe(true);

      // Attempt second dispute
      const second = await raiseDispute(clientUid, 'client', {
        bookingId: 'bk_disp_001',
        reason: 'fee_disagreement',
        description: 'Second duplicate dispute submission.',
      });

      expect(second.success).toBe(false);
      expect(second.error).toContain('already open');
    });
  });

  describe('2. Multi-Party Authorization & Data Isolation', () => {
    it('should isolate disputes so client only sees their own disputes', async () => {
      await raiseDispute(clientUid, 'client', {
        bookingId: 'bk_disp_001',
        reason: 'lawyer_did_not_show_up',
        description: 'Dispute description for testing visibility.',
      });

      const clientFeed = await getDisputesForUser(clientUid, 'client');
      expect(clientFeed.disputes).toHaveLength(1);

      const strangerFeed = await getDisputesForUser(unrelatedUid, 'client');
      expect(strangerFeed.disputes).toHaveLength(0);
    });

    it('should allow lawyer to see disputes where they are the assigned counsel', async () => {
      await raiseDispute(clientUid, 'client', {
        bookingId: 'bk_disp_001',
        reason: 'lawyer_did_not_show_up',
        description: 'Dispute description for lawyer check.',
      });

      const lawyerFeed = await getDisputesForUser(lawyerUid, 'lawyer');
      expect(lawyerFeed.disputes).toHaveLength(1);
    });

    it('should allow admin to see all disputes across platform', async () => {
      await raiseDispute(clientUid, 'client', {
        bookingId: 'bk_disp_001',
        reason: 'lawyer_did_not_show_up',
        description: 'Platform dispute.',
      });

      const adminFeed = await getDisputesForUser(adminUid, 'admin');
      expect(adminFeed.disputes).toHaveLength(1);
    });

    it('should reject unauthorized single dispute detail inspection', async () => {
      const created = await raiseDispute(clientUid, 'client', {
        bookingId: 'bk_disp_001',
        reason: 'lawyer_did_not_show_up',
        description: 'Confidential dispute.',
      });

      const disputeId = created.dispute!.id;

      const unauthDetail = await getDisputeById(unrelatedUid, 'client', disputeId);
      expect(unauthDetail.success).toBe(false);
      expect(unauthDetail.error).toContain('Unauthorized');

      const authDetail = await getDisputeById(clientUid, 'client', disputeId);
      expect(authDetail.success).toBe(true);
      expect(authDetail.linkedBooking?.id).toBe('bk_disp_001');
      expect(authDetail.linkedPayment?.id).toBe('pay_disp_001');
    });
  });

  describe('3. Status Lifecycle & Administrative Investigation', () => {
    it('should transition dispute status from open to in_review', async () => {
      const created = await raiseDispute(clientUid, 'client', {
        bookingId: 'bk_disp_001',
        reason: 'lawyer_did_not_show_up',
        description: 'Advocate absent.',
      });

      const disputeId = created.dispute!.id;

      const reviewRes = await moveDisputeToReview(
        adminUid,
        'admin',
        disputeId,
        'Contacted advocate for explanation.'
      );

      expect(reviewRes.success).toBe(true);
      expect(reviewRes.dispute?.status).toBe('in_review');
      expect(reviewRes.dispute?.adminNotes).toContain('Contacted advocate');
      expect(reviewRes.dispute?.timeline?.some((e) => e.status === 'in_review')).toBe(true);
    });

    it('should reject non-admin attempting to move dispute to review', async () => {
      const created = await raiseDispute(clientUid, 'client', {
        bookingId: 'bk_disp_001',
        reason: 'lawyer_did_not_show_up',
        description: 'Advocate absent.',
      });

      await expect(
        moveDisputeToReview(clientUid, 'client', created.dispute!.id)
      ).rejects.toThrow(/Privileged administrative access required/);
    });
  });

  describe('4. Financial Linkage, Adjudication & Duplicate Refund Protection', () => {
    it('should adjudicate with client refund, link to payment, and cancel booking', async () => {
      const created = await raiseDispute(clientUid, 'client', {
        bookingId: 'bk_disp_001',
        reason: 'lawyer_did_not_show_up',
        description: 'Advocate failed to attend scheduled slot.',
      });

      const disputeId = created.dispute!.id;

      const adjRes = await adjudicateDispute(adminUid, 'admin', disputeId, {
        resolution: 'client_refund',
        resolutionSummary: 'Advocate was unavailable. 100% refund approved.',
        refundAmountInr: 299,
      });

      expect(adjRes.success).toBe(true);
      expect(adjRes.dispute?.status).toBe('resolved');
      expect(adjRes.dispute?.resolution).toBe('client_refund');
      expect(adjRes.dispute?.refundAmount).toBe(299);
      expect(adjRes.dispute?.refundPaymentId).toBe('pay_disp_001');

      // Verify linked payment transaction was marked refunded
      const detail = await getDisputeById(adminUid, 'admin', disputeId);
      expect(detail.linkedPayment?.status).toBe('refunded');
      expect(detail.linkedPayment?.refunds).toHaveLength(1);
      expect(detail.linkedPayment?.refunds[0]?.amountInr).toBe(299);

      // Verify linked booking was cancelled
      expect(detail.linkedBooking?.status).toBe('cancelled');
      expect(detail.linkedBooking?.cancellationDetails?.refundProcessed).toBe(true);

      // Verify audit log
      const auditRes = await getAdminAuditLogs('admin', { action: 'dispute_refunded' });
      expect(auditRes.logs.some((l) => l.targetEntityId === disputeId)).toBe(true);
    });

    it('should strictly prevent duplicate refunds on the same payment', async () => {
      const created = await raiseDispute(clientUid, 'client', {
        bookingId: 'bk_disp_001',
        reason: 'lawyer_did_not_show_up',
        description: 'Advocate absent.',
      });

      const disputeId = created.dispute!.id;

      // 1. First refund execution -> succeeds
      const firstAdj = await adjudicateDispute(adminUid, 'admin', disputeId, {
        resolution: 'client_refund',
        resolutionSummary: 'Initial refund approval.',
      });
      expect(firstAdj.success).toBe(true);

      // 2. Second refund execution -> fails duplicate refund check
      const secondAdj = await adjudicateDispute(adminUid, 'admin', disputeId, {
        resolution: 'client_refund',
        resolutionSummary: 'Second accidental refund attempt.',
      });

      expect(secondAdj.success).toBe(false);
      expect(secondAdj.error).toContain('Duplicate refund prevented');
    });

    it('should allow dispute dismissal without refunding payment', async () => {
      const created = await raiseDispute(clientUid, 'client', {
        bookingId: 'bk_disp_001',
        reason: 'poor_consultation_quality',
        description: 'Client dissatisfied with standard legal opinion.',
      });

      const disputeId = created.dispute!.id;

      const adjRes = await adjudicateDispute(adminUid, 'admin', disputeId, {
        resolution: 'dismissed',
        resolutionSummary: 'Consultation conducted fully in accordance with standards. Claim dismissed.',
      });

      expect(adjRes.success).toBe(true);
      expect(adjRes.dispute?.status).toBe('resolved');
      expect(adjRes.dispute?.resolution).toBe('dismissed');
      expect(adjRes.dispute?.refundAmount).toBeUndefined();

      // Payment transaction remains captured
      const detail = await getDisputeById(adminUid, 'admin', disputeId);
      expect(detail.linkedPayment?.status).toBe('captured');

      // Verify audit log
      const auditRes = await getAdminAuditLogs('admin', { action: 'dispute_dismissed' });
      expect(auditRes.logs.some((l) => l.targetEntityId === disputeId)).toBe(true);
    });
  });

  describe('5. Dispute Closing Lifecycle', () => {
    it('should allow admin to close an adjudicated dispute', async () => {
      const created = await raiseDispute(clientUid, 'client', {
        bookingId: 'bk_disp_001',
        reason: 'lawyer_did_not_show_up',
        description: 'Advocate absent.',
      });

      const disputeId = created.dispute!.id;

      // Adjudicate
      await adjudicateDispute(adminUid, 'admin', disputeId, {
        resolution: 'dismissed',
        resolutionSummary: 'Dismissed after review.',
      });

      // Close
      const closeRes = await closeDispute(adminUid, 'admin', disputeId, 'Final case archive.');
      expect(closeRes.success).toBe(true);
      expect(closeRes.dispute?.status).toBe('closed');
      expect(closeRes.dispute?.closedAt).toBeDefined();
      expect(closeRes.dispute?.timeline?.some((e) => e.status === 'closed')).toBe(true);
    });
  });
});
