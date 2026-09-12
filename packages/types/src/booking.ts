import { BaseEntity } from './common';
import { PracticeArea } from './lawyer';

export type BookingStatus =
  | 'draft'
  | 'pending_unlock_payment' // Client needs to pay ₹299 fee
  | 'unlocked' // Payment verified, lawyer details revealed & notified
  | 'accepted' // Lawyer confirmed appointment
  | 'in_progress' // Consultation underway / documents in review
  | 'completed' // Consultation completed
  | 'cancelled_by_client'
  | 'cancelled_by_lawyer'
  | 'disputed';

export type ConsultationMode = 'in_person_office' | 'video_call' | 'phone_call';

export interface BookingTimelineEvent {
  status: BookingStatus;
  timestamp: string;
  actorUid: string;
  notes?: string;
}

export interface Booking extends BaseEntity {
  id: string;
  bookingReferenceNumber: string; // e.g. LHM-2026-XXXX
  clientUid: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  lawyerUid: string;
  lawyerName: string;
  lawyerSanadNumber: string;
  serviceCategory: PracticeArea;
  caseDescription: string;
  preferredDate: string; // YYYY-MM-DD
  preferredTimeSlot: string; // e.g. "14:00 - 15:00"
  consultationMode: ConsultationMode;
  status: BookingStatus;
  timeline: BookingTimelineEvent[];
  unlockPaymentId?: string;
  unlockAmountInr: number; // default 299
  uploadedDocumentIds: string[];
  meetingLink?: string;
  cancellationReason?: string;
}
