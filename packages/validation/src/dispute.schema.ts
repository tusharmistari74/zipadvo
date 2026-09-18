import { z } from 'zod';

export const disputeReasonEnum = z.enum([
  'lawyer_did_not_show_up',
  'client_unresponsive',
  'poor_consultation_quality',
  'incorrect_legal_advice',
  'delay_in_document_review',
  'fraud_or_misrepresentation',
  'fee_disagreement',
  'other',
]);

export const disputeStatusEnum = z.enum([
  'open',
  'in_review',
  'resolved',
  'closed',
  'opened',
  'under_investigation',
  'resolved_refunded',
  'resolved_dismissed',
]);

export const disputeResolutionActionEnum = z.enum([
  'client_refund',
  'lawyer_payout',
  'dismissed',
  'mutual_settlement',
]);

export const raiseDisputeSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  reason: disputeReasonEnum,
  description: z
    .string({ required_error: 'Description is required' })
    .min(10, 'Please explain the dispute with at least 10 characters')
    .max(3000, 'Description cannot exceed 3000 characters'),
  evidenceDocumentUrls: z.array(z.string().url()).optional().default([]),
});

export const updateDisputeStatusSchema = z.object({
  status: disputeStatusEnum,
  adminNotes: z.string().optional(),
});

export const adjudicateDisputeSchema = z.object({
  resolution: disputeResolutionActionEnum,
  resolutionSummary: z
    .string({ required_error: 'Resolution summary is required' })
    .min(10, 'Resolution summary must be at least 10 characters'),
  refundAmountInr: z.number().min(0, 'Refund amount cannot be negative').optional(),
  adminNotes: z.string().optional(),
});

export const closeDisputeSchema = z.object({
  closingNotes: z.string().optional(),
});

export type RaiseDisputeInput = z.infer<typeof raiseDisputeSchema>;
export type UpdateDisputeStatusInput = z.infer<typeof updateDisputeStatusSchema>;
export type AdjudicateDisputeInput = z.infer<typeof adjudicateDisputeSchema>;
export type CloseDisputeInput = z.infer<typeof closeDisputeSchema>;
