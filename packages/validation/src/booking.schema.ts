import { z } from 'zod';
import { practiceAreasEnum } from './lawyer.schema';
import { indianPhoneRegex } from './user.schema';

export const createBookingSchema = z.object({
  lawyerUid: z.string().min(1, 'Lawyer ID is required'),
  serviceCategory: practiceAreasEnum,
  caseDescription: z.string().min(20, 'Please describe your legal requirement in at least 20 characters').max(3000),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
  preferredTimeSlot: z.string().min(3, 'Time slot selection is required'),
  consultationMode: z.enum(['in_person_office', 'video_call', 'phone_call']),
  clientName: z.string().min(2),
  clientPhone: z.string().regex(indianPhoneRegex, 'Valid Indian phone number is required'),
  clientEmail: z.string().email().optional(),
  uploadedDocumentIds: z.array(z.string()).default([]),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum([
    'accepted',
    'in_progress',
    'completed',
    'cancelled_by_client',
    'cancelled_by_lawyer',
    'disputed',
  ]),
  notes: z.string().max(500).optional(),
  cancellationReason: z.string().max(500).optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
