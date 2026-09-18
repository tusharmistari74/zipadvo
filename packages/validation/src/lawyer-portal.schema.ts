import { z } from 'zod';

export const lawyerRejectBookingSchema = z.object({
  reason: z
    .string()
    .min(5, 'Rejection reason must be at least 5 characters')
    .max(500, 'Rejection reason cannot exceed 500 characters'),
  internalNote: z.string().max(500).optional(),
});

export const lawyerUpdateBookingStatusSchema = z.object({
  status: z.enum(['in_progress', 'completed']),
  completionNotes: z.string().max(1000).optional(),
});

export const lawyerBookingFilterSchema = z.object({
  status: z.enum([
    'all',
    'draft',
    'pending_payment',
    'pending_lawyer',
    'confirmed',
    'in_progress',
    'completed',
    'cancelled',
    'disputed',
  ]).optional(),
  searchQuery: z.string().max(100).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const lawyerPortalProfileUpdateSchema = z.object({
  title: z.string().min(3).max(120).optional(),
  bio: z.string().min(10).max(2000).optional(),
  consultationFeeInr: z.number().min(0).max(100000).optional(),
  chamberAddress: z.string().min(5).max(300).optional(),
  isAcceptingBookings: z.boolean().optional(),
  spokenLanguages: z.array(z.string()).optional(),
});

export type LawyerRejectBookingInput = z.infer<typeof lawyerRejectBookingSchema>;
export type LawyerUpdateBookingStatusInput = z.infer<typeof lawyerUpdateBookingStatusSchema>;
export type LawyerBookingFilterInput = z.infer<typeof lawyerBookingFilterSchema>;
export type LawyerPortalProfileUpdateInput = z.infer<typeof lawyerPortalProfileUpdateSchema>;
