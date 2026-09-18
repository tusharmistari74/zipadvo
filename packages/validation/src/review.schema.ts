import { z } from 'zod';

export const createReviewSchema = z.object({
  bookingId: z
    .string({ required_error: 'Booking ID is required' })
    .min(1, 'Booking ID is required'),
  rating: z
    .number({ required_error: 'Rating is required' })
    .int('Rating must be an integer')
    .min(1, 'Rating must be at least 1 star')
    .max(5, 'Rating cannot exceed 5 stars'),
  reviewTitle: z
    .string()
    .max(100, 'Review title cannot exceed 100 characters')
    .optional()
    .transform((val) => (val?.trim() ? val.trim() : undefined)),
  reviewComment: z
    .string()
    .max(1000, 'Review comment cannot exceed 1000 characters')
    .optional()
    .transform((val) => (val?.trim() ? val.trim() : undefined)),
});

export const updateReviewSchema = z.object({
  rating: z
    .number()
    .int('Rating must be an integer')
    .min(1, 'Rating must be at least 1 star')
    .max(5, 'Rating cannot exceed 5 stars')
    .optional(),
  reviewTitle: z
    .string()
    .max(100, 'Review title cannot exceed 100 characters')
    .optional()
    .transform((val) => (val?.trim() ? val.trim() : undefined)),
  reviewComment: z
    .string()
    .max(1000, 'Review comment cannot exceed 1000 characters')
    .optional()
    .transform((val) => (val?.trim() ? val.trim() : undefined)),
});

export const reviewEligibilityQuerySchema = z.object({
  bookingId: z
    .string({ required_error: 'Booking ID is required' })
    .min(1, 'Booking ID is required'),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type ReviewEligibilityQueryInput = z.infer<typeof reviewEligibilityQuerySchema>;
