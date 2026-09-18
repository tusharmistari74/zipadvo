import { z } from 'zod';
import { practiceAreasEnum } from './lawyer.schema';
import { indianPhoneRegex } from './user.schema';

export const bookingStatusEnum = z.enum([
  'pending_payment',
  'pending_lawyer',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'disputed',
  // legacy aliases
  'draft',
  'pending_unlock_payment',
  'unlocked',
  'accepted',
  'cancelled_by_client',
  'cancelled_by_lawyer',
]);

export const createBookingSchema = z.object({
  lawyerUid: z.string().min(1, 'Lawyer ID is required'),
  serviceCategory: practiceAreasEnum,
  caseDescription: z
    .string()
    .min(10, 'Please describe your legal requirement in at least 10 characters')
    .max(3000),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
  preferredTimeSlot: z.string().min(3, 'Time slot selection is required'),
  consultationMode: z.enum(['in_person_office', 'video_call', 'phone_call']),
  clientName: z.string().min(2, 'Client name is required'),
  clientPhone: z.string().regex(indianPhoneRegex, 'Valid Indian phone number is required (+91...)'),
  clientEmail: z.string().email().optional().or(z.literal('')),
  uploadedDocumentIds: z.array(z.string()).default([]),
});

export const transitionBookingStatusSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  newStatus: bookingStatusEnum,
  notes: z.string().max(1000).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const cancelBookingSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  reason: z.string().min(5, 'Cancellation reason must be at least 5 characters').max(500),
});

export const updateBookingStatusSchema = z.object({
  status: bookingStatusEnum,
  notes: z.string().max(500).optional(),
  cancellationReason: z.string().max(500).optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type TransitionBookingStatusInput = z.infer<typeof transitionBookingStatusSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;

