import { BaseEntity } from './common';

export type DisputeStatus =
  | 'open'
  | 'in_review'
  | 'resolved'
  | 'closed'
  // Backwards-compatible aliases
  | 'opened'
  | 'under_investigation'
  | 'resolved_refunded'
  | 'resolved_dismissed';

export type DisputeReason =
  | 'lawyer_did_not_show_up'
  | 'client_unresponsive'
  | 'poor_consultation_quality'
  | 'incorrect_legal_advice'
  | 'delay_in_document_review'
  | 'fraud_or_misrepresentation'
  | 'fee_disagreement'
  | 'other';

export type DisputeResolutionAction =
  | 'client_refund'
  | 'lawyer_payout'
  | 'dismissed'
  | 'mutual_settlement';

export interface DisputeTimelineEvent {
  status: DisputeStatus;
  timestamp: string;
  actorUid: string;
  actorRole: 'client' | 'lawyer' | 'admin' | 'system';
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface Dispute extends BaseEntity {
  id: string;
  disputeId?: string; // Canonical alias matching id
  bookingId: string;
  userId: string; // Client UID
  raisedByUid: string; // Client or Lawyer UID
  againstUid: string; // Counterpart UID
  lawyerId: string; // Lawyer UID
  raisedBy: 'client' | 'lawyer';
  reason: DisputeReason;
  description: string;
  status: DisputeStatus;
  evidenceDocumentUrls?: string[];
  resolution?: DisputeResolutionAction;
  resolutionSummary?: string;
  resolvedByAdminUid?: string;
  resolvedBy?: string; // Alias for resolvedByAdminUid
  refundAmount?: number; // Refund in INR
  refundAmountInr?: number; // Alias for refundAmount
  refundPaymentId?: string; // Connected Razorpay Payment ID
  adminNotes?: string;
  timeline?: DisputeTimelineEvent[];
  resolvedAt?: string;
  closedAt?: string;
}

export interface CreateDisputePayload {
  bookingId: string;
  reason: DisputeReason;
  description: string;
  evidenceDocumentUrls?: string[];
}

export interface AdjudicateDisputePayload {
  resolution: DisputeResolutionAction;
  resolutionSummary: string;
  refundAmountInr?: number;
  adminNotes?: string;
}

export interface DisputeFilter {
  status?: DisputeStatus | 'all';
  bookingId?: string;
  userId?: string;
  lawyerId?: string;
  searchQuery?: string;
}
