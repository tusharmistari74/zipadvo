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

export interface TimeSlotItem {
  id: string; // e.g. "10:00-11:00"
  startTime: string; // "10:00"
  endTime: string; // "11:00"
  isAvailable: boolean;
  reason?: 'booked' | 'break' | 'past' | 'blocked' | 'notice_period' | 'unavailable_day';
  breakLabel?: string;
}

export interface DateAvailabilitySummary {
  date: string; // YYYY-MM-DD
  isBlocked: boolean;
  blockedReason?: string;
  isWorkingDay: boolean;
  availableSlotCount: number;
  totalSlotCount: number;
  slots: TimeSlotItem[];
}

export interface SlotReservation extends BaseEntity {
  id: string; // composite key: `${date}_${slotId}`
  lawyerUid: string;
  date: string; // YYYY-MM-DD
  slotId: string; // e.g. "10:00-11:00"
  startTime: string;
  endTime: string;
  clientUid: string;
  bookingId?: string;
  status: 'reserved' | 'confirmed' | 'released';
  expiresAt?: string; // For temporary reservations during checkout
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

