import type {
  Dispute,
  CreateDisputePayload,
  AdjudicateDisputePayload,
  DisputeFilter,
  Booking,
  PaymentTransaction,
  RefundDetails,
  UserRole,
} from '@legalhub/types';
import { logger } from '@legalhub/utils';
import { emitNotificationEvent } from './notifications/notification.service';
import { recordAuditLog, assertAdminAuthorization } from './admin-portal.service';

// In-memory data stores for dispute and refund operations
let disputesStore: Record<string, Dispute> = {};
let bookingsStoreRef: Record<string, Booking> = {};
let paymentsStoreRef: Record<string, PaymentTransaction> = {};

export function resetDisputeServiceStores(): void {
  disputesStore = {};
  bookingsStoreRef = {};
  paymentsStoreRef = {};
}

export function seedDisputeServiceData(data: {
  disputes?: Dispute[];
  bookings?: Booking[];
  payments?: PaymentTransaction[];
}): void {
  if (data.disputes) {
    data.disputes.forEach((d) => {
      disputesStore[d.id] = { ...d, disputeId: d.id };
    });
  }
  if (data.bookings) {
    data.bookings.forEach((b) => {
      bookingsStoreRef[b.id] = { ...b };
    });
  }
  if (data.payments) {
    data.payments.forEach((p) => {
      paymentsStoreRef[p.id] = { ...p };
    });
  }
}

/**
 * Raises a formal dispute against a consultation booking
 * Security & Anti-Abuse:
 * - Only verified booking participants (client or lawyer) can raise a dispute.
 * - Prevents multiple simultaneous open disputes on the same booking.
 */
export async function raiseDispute(
  actorUid: string,
  actorRole: 'client' | 'lawyer',
  payload: CreateDisputePayload,
  customStores?: {
    bookings?: Record<string, Booking>;
    disputes?: Record<string, Dispute>;
  }
): Promise<{ success: boolean; dispute?: Dispute; error?: string }> {
  const bookings = customStores?.bookings || bookingsStoreRef;
  const disputes = customStores?.disputes || disputesStore;

  const booking = bookings[payload.bookingId];
  if (!booking) {
    return { success: false, error: 'Booking not found' };
  }

  // Security: Verify that the caller is a participant in this booking
  if (actorRole === 'client' && booking.clientUid !== actorUid) {
    logger.warn('Unauthorized dispute creation attempt by client', { actorUid, bookingId: payload.bookingId });
    return { success: false, error: 'Unauthorized: You are not the client for this booking' };
  }
  if (actorRole === 'lawyer' && booking.lawyerUid !== actorUid) {
    logger.warn('Unauthorized dispute creation attempt by lawyer', { actorUid, bookingId: payload.bookingId });
    return { success: false, error: 'Unauthorized: You are not the assigned advocate for this booking' };
  }

  // Anti-Abuse: Check for existing active dispute on this booking
  const existingActiveDispute = Object.values(disputes).find(
    (d) => d.bookingId === payload.bookingId && (d.status === 'open' || d.status === 'opened' || d.status === 'in_review' || d.status === 'under_investigation')
  );
  if (existingActiveDispute) {
    return {
      success: false,
      error: 'An active dispute is already open for this consultation booking',
    };
  }

  const now = new Date().toISOString();
  const disputeId = `disp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const againstUid = actorRole === 'client' ? booking.lawyerUid : booking.clientUid;

  const dispute: Dispute = {
    id: disputeId,
    disputeId,
    bookingId: booking.id,
    userId: booking.clientUid,
    lawyerId: booking.lawyerUid,
    raisedByUid: actorUid,
    againstUid,
    raisedBy: actorRole,
    reason: payload.reason,
    description: payload.description.trim(),
    status: 'open',
    evidenceDocumentUrls: payload.evidenceDocumentUrls || [],
    createdAt: now,
    updatedAt: now,
    timeline: [
      {
        status: 'open',
        timestamp: now,
        actorUid,
        actorRole,
        notes: `Dispute opened by ${actorRole}: ${payload.reason.replace(/_/g, ' ')}`,
      },
    ],
  };

  // Update booking status
  booking.status = 'disputed';
  booking.updatedAt = now;
  booking.timeline = booking.timeline || [];
  booking.timeline.push({
    status: 'disputed',
    timestamp: now,
    actorUid,
    actorRole,
    notes: `Dispute opened: ${disputeId}`,
  });

  disputes[disputeId] = dispute;
  bookings[booking.id] = booking;

  // Record audit log
  await recordAuditLog(
    actorUid,
    actorRole,
    'dispute_opened',
    disputeId,
    'dispute',
    {
      bookingId: booking.id,
      reason: payload.reason,
      raisedBy: actorRole,
    }
  );

  logger.info('Dispute opened successfully', { disputeId, bookingId: booking.id, actorUid });

  // Notify opposite party
  try {
    await emitNotificationEvent({
      type: 'DISPUTE_UPDATED',
      recipientUid: againstUid,
      title: 'Dispute Raised on Consultation',
      body: `A dispute has been raised on booking ${booking.id}. Our operations team will investigate.`,
      metadata: { disputeId, bookingId: booking.id },
    });
  } catch (err) {
    logger.warn('Failed to emit dispute notification', { err });
  }

  return { success: true, dispute };
}

/**
 * Returns disputes filtered strictly by role and caller authorization
 */
export async function getDisputesForUser(
  actorUid: string,
  actorRole: UserRole,
  filter?: DisputeFilter,
  customDisputes?: Record<string, Dispute>
): Promise<{ success: boolean; disputes: Dispute[] }> {
  const disputes = customDisputes || disputesStore;
  let list = Object.values(disputes);

  // RBAC & Security Isolation
  if (actorRole === 'admin' || actorRole === 'super_admin') {
    // Admin sees all disputes
  } else if (actorRole === 'client') {
    list = list.filter((d) => d.userId === actorUid || d.raisedByUid === actorUid);
  } else if (actorRole === 'lawyer') {
    list = list.filter((d) => d.lawyerId === actorUid || d.raisedByUid === actorUid);
  } else {
    return { success: true, disputes: [] };
  }

  if (filter?.status && filter.status !== 'all') {
    list = list.filter((d) => d.status === filter.status);
  }

  if (filter?.bookingId) {
    list = list.filter((d) => d.bookingId === filter.bookingId);
  }

  if (filter?.searchQuery) {
    const q = filter.searchQuery.toLowerCase();
    list = list.filter(
      (d) =>
        d.id.toLowerCase().includes(q) ||
        d.bookingId.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.reason.toLowerCase().includes(q)
    );
  }

  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return { success: true, disputes: list };
}

/**
 * Retrieves a single dispute with multi-party authorization check
 */
export async function getDisputeById(
  actorUid: string,
  actorRole: UserRole,
  disputeId: string,
  customStores?: {
    disputes?: Record<string, Dispute>;
    bookings?: Record<string, Booking>;
    payments?: Record<string, PaymentTransaction>;
  }
): Promise<{
  success: boolean;
  dispute?: Dispute;
  linkedBooking?: Booking;
  linkedPayment?: PaymentTransaction;
  error?: string;
}> {
  const disputes = customStores?.disputes || disputesStore;
  const bookings = customStores?.bookings || bookingsStoreRef;
  const payments = customStores?.payments || paymentsStoreRef;

  const dispute = disputes[disputeId];
  if (!dispute) {
    return { success: false, error: 'Dispute not found' };
  }

  // Security: Verify authorization
  const isAdmin = actorRole === 'admin' || actorRole === 'super_admin';
  const isParticipant =
    dispute.userId === actorUid ||
    dispute.lawyerId === actorUid ||
    dispute.raisedByUid === actorUid;

  if (!isAdmin && !isParticipant) {
    logger.warn('Unauthorized dispute access attempt', { actorUid, disputeId });
    return { success: false, error: 'Unauthorized: You do not have permission to access this dispute' };
  }

  const linkedBooking = bookings[dispute.bookingId];
  const linkedPayment = Object.values(payments).find((p) => p.bookingId === dispute.bookingId);

  return {
    success: true,
    dispute,
    linkedBooking,
    linkedPayment,
  };
}

/**
 * Transitions dispute status to 'in_review' for administrative investigation
 */
export async function moveDisputeToReview(
  adminUid: string,
  adminRole: UserRole,
  disputeId: string,
  adminNotes?: string,
  customDisputes?: Record<string, Dispute>
): Promise<{ success: boolean; dispute?: Dispute; error?: string }> {
  assertAdminAuthorization(adminRole);

  const disputes = customDisputes || disputesStore;
  const dispute = disputes[disputeId];

  if (!dispute) {
    return { success: false, error: 'Dispute not found' };
  }

  const now = new Date().toISOString();
  dispute.status = 'in_review';
  dispute.updatedAt = now;
  if (adminNotes) dispute.adminNotes = adminNotes.trim();

  dispute.timeline = dispute.timeline || [];
  dispute.timeline.push({
    status: 'in_review',
    timestamp: now,
    actorUid: adminUid,
    actorRole: 'admin',
    notes: adminNotes ? `Moved to review by admin: ${adminNotes}` : 'Moved to review by operations team',
  });

  disputes[disputeId] = dispute;

  logger.info('Dispute moved to in_review status', { disputeId, adminUid });
  return { success: true, dispute };
}

/**
 * Adjudicates a dispute with resolution recording and financial payment-linked refund execution
 * Financial Security:
 * - Links to actual payment transaction.
 * - Enforces duplicate refund prevention.
 */
export async function adjudicateDispute(
  adminUid: string,
  adminRole: UserRole,
  disputeId: string,
  payload: AdjudicateDisputePayload,
  customStores?: {
    disputes?: Record<string, Dispute>;
    bookings?: Record<string, Booking>;
    payments?: Record<string, PaymentTransaction>;
  }
): Promise<{ success: boolean; dispute?: Dispute; error?: string }> {
  assertAdminAuthorization(adminRole);

  const disputes = customStores?.disputes || disputesStore;
  const bookings = customStores?.bookings || bookingsStoreRef;
  const payments = customStores?.payments || paymentsStoreRef;

  const dispute = disputes[disputeId];
  if (!dispute) {
    return { success: false, error: 'Dispute not found' };
  }

  if (!payload.resolutionSummary || payload.resolutionSummary.trim().length < 10) {
    return { success: false, error: 'Resolution summary must be at least 10 characters' };
  }

  const now = new Date().toISOString();
  const linkedBooking = bookings[dispute.bookingId];
  let refundAmount = 0;
  let refundPaymentId: string | undefined;

  // Handle Client Refund resolution
  if (payload.resolution === 'client_refund') {
    const payment = Object.values(payments).find((p) => p.bookingId === dispute.bookingId);

    if (!payment) {
      return { success: false, error: 'Cannot process refund: No linked payment transaction found for this booking' };
    }

    // Duplicate Refund Prevention
    if (payment.status === 'refunded') {
      return {
        success: false,
        error: 'Duplicate refund prevented: A refund has already been processed for this payment transaction',
      };
    }

    refundAmount = payload.refundAmountInr || payment.amountInr || payment.amount || linkedBooking?.unlockAmountInr || 299;
    refundPaymentId = payment.id;

    // Update payment record with refund details
    payment.status = 'refunded';
    payment.updatedAt = now;
    payment.refunds = payment.refunds || [];
    const refundRecord: RefundDetails = {
      refundId: `rfnd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      paymentId: payment.id,
      amountInr: refundAmount,
      reason: payload.resolutionSummary.trim(),
      processedBy: adminUid,
      status: 'processed',
      processedAt: now,
    };
    payment.refunds.push(refundRecord);
    payments[payment.id] = payment;

    // Cancel booking
    if (linkedBooking) {
      linkedBooking.status = 'cancelled';
      linkedBooking.updatedAt = now;
      linkedBooking.cancellationDetails = {
        reason: `Dispute ${disputeId} resolved with client refund: ${payload.resolutionSummary.trim()}`,
        cancelledByUid: adminUid,
        cancelledByRole: 'admin',
        cancelledAt: now,
        refundEligible: true,
        refundProcessed: true,
      };
      linkedBooking.timeline = linkedBooking.timeline || [];
      linkedBooking.timeline.push({
        status: 'cancelled',
        timestamp: now,
        actorUid: adminUid,
        actorRole: 'admin',
        notes: `Dispute resolved with full refund of ₹${refundAmount}`,
      });
      bookings[linkedBooking.id] = linkedBooking;
    }
  }

  // Update dispute status and resolution
  dispute.status = 'resolved';
  dispute.resolution = payload.resolution;
  dispute.resolutionSummary = payload.resolutionSummary.trim();
  dispute.resolvedByAdminUid = adminUid;
  dispute.resolvedBy = adminUid;
  dispute.resolvedAt = now;
  dispute.updatedAt = now;
  if (payload.adminNotes) dispute.adminNotes = payload.adminNotes.trim();
  if (refundAmount > 0) {
    dispute.refundAmount = refundAmount;
    dispute.refundAmountInr = refundAmount;
    dispute.refundPaymentId = refundPaymentId;
  }

  dispute.timeline = dispute.timeline || [];
  dispute.timeline.push({
    status: 'resolved',
    timestamp: now,
    actorUid: adminUid,
    actorRole: 'admin',
    notes: `Adjudication: ${payload.resolution} — ${payload.resolutionSummary.trim()}`,
    metadata: {
      resolution: payload.resolution,
      refundAmount,
      refundPaymentId,
    },
  });

  disputes[disputeId] = dispute;

  // Record audit log
  await recordAuditLog(
    adminUid,
    adminRole,
    payload.resolution === 'client_refund' ? 'dispute_refunded' : 'dispute_dismissed',
    disputeId,
    'dispute',
    {
      bookingId: dispute.bookingId,
      resolution: payload.resolution,
      refundAmount,
      refundPaymentId,
      summary: payload.resolutionSummary.trim(),
    }
  );

  logger.info('Dispute adjudicated successfully', { disputeId, resolution: payload.resolution, refundAmount });

  // Emit notification events
  try {
    await emitNotificationEvent({
      type: 'DISPUTE_UPDATED',
      recipientUid: dispute.userId,
      title: 'Dispute Adjudicated',
      body: `Your dispute for booking ${dispute.bookingId} has been resolved (${payload.resolution.replace(/_/g, ' ')}).`,
      metadata: { disputeId, resolution: payload.resolution },
    });
  } catch (err) {
    logger.warn('Failed to emit resolution notification', { err });
  }

  return { success: true, dispute };
}

/**
 * Closes an adjudicated dispute
 */
export async function closeDispute(
  adminUid: string,
  adminRole: UserRole,
  disputeId: string,
  closingNotes?: string,
  customDisputes?: Record<string, Dispute>
): Promise<{ success: boolean; dispute?: Dispute; error?: string }> {
  assertAdminAuthorization(adminRole);

  const disputes = customDisputes || disputesStore;
  const dispute = disputes[disputeId];

  if (!dispute) {
    return { success: false, error: 'Dispute not found' };
  }

  const now = new Date().toISOString();
  dispute.status = 'closed';
  dispute.closedAt = now;
  dispute.updatedAt = now;

  dispute.timeline = dispute.timeline || [];
  dispute.timeline.push({
    status: 'closed',
    timestamp: now,
    actorUid: adminUid,
    actorRole: 'admin',
    notes: closingNotes ? `Dispute closed: ${closingNotes.trim()}` : 'Dispute closed by operations team',
  });

  disputes[disputeId] = dispute;

  logger.info('Dispute closed', { disputeId, adminUid });
  return { success: true, dispute };
}
