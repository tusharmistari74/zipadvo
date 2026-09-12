import { BaseEntity } from './common';

export type DisputeStatus =
  | 'opened'
  | 'under_investigation'
  | 'resolved_refunded'
  | 'resolved_dismissed'
  | 'closed';

export type DisputeReason =
  | 'lawyer_did_not_show_up'
  | 'poor_consultation_quality'
  | 'incorrect_legal_advice'
  | 'delay_in_document_review'
  | 'fraud_or_misrepresentation'
  | 'other';

export interface Dispute extends BaseEntity {
  id: string;
  bookingId: string;
  raisedByUid: string;
  againstUid: string;
  reason: DisputeReason;
  description: string;
  evidenceDocumentUrls: string[];
  status: DisputeStatus;
  adminNotes?: string;
  resolvedAt?: string;
  resolvedByAdminUid?: string;
  resolutionSummary?: string;
}
