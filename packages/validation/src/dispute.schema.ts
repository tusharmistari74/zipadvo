import { z } from 'zod';

export const disputeReasonEnum = z.enum([
  'lawyer_did_not_show_up',
  'poor_consultation_quality',
  'incorrect_legal_advice',
  'delay_in_document_review',
  'fraud_or_misrepresentation',
  'other',
]);

export const raiseDisputeSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  againstUid: z.string().min(1, 'Target UID is required'),
  reason: disputeReasonEnum,
  description: z.string().min(30, 'Please explain the issue with at least 30 characters').max(3000),
  evidenceDocumentUrls: z.array(z.string().url()).default([]),
});

export const resolveDisputeSchema = z.object({
  status: z.enum(['resolved_refunded', 'resolved_dismissed', 'closed']),
  resolutionSummary: z.string().min(10, 'Resolution summary is required'),
  adminNotes: z.string().optional(),
});

export type RaiseDisputeInput = z.infer<typeof raiseDisputeSchema>;
export type ResolveDisputeInput = z.infer<typeof resolveDisputeSchema>;
