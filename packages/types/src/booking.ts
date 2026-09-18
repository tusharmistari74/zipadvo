import { BaseEntity } from './common';
import { PracticeArea } from './lawyer';

export type BookingStatus =
  | 'pending_payment' // Client created booking, waiting for ₹299 contact unlock payment
  | 'pending_lawyer' // Payment completed, awaiting lawyer confirmation/acceptance
  | 'confirmed' // Lawyer accepted & confirmed appointment slot
  | 'in_progress' // Consultation active / document review underway
  | 'completed' // Consultation successfully completed
  | 'cancelled' // Booking cancelled by client, lawyer, or system
  | 'disputed' // Dispute raised for resolution
  // Backwards-compatible aliases
  | 'draft'
  | 'pending_unlock_payment'
  | 'unlocked'
  | 'accepted'
  | 'cancelled_by_client'
  | 'cancelled_by_lawyer';

export type ConsultationMode = 'in_person_office' | 'video_call' | 'phone_call';

export interface BookingTimelineEvent {
  status: BookingStatus;
  timestamp: string;
  actorUid: string;
  actorRole: 'client' | 'lawyer' | 'admin' | 'system';
  notes?: string;
  metadata?: Record<string, unknown>;
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

export interface CancellationPolicy {
  minimumNoticeHours: number; // e.g. 4 hours notice required
  allowClientCancellation: boolean;
  allowLawyerCancellation: boolean;
  feeRefundEligible: boolean;
}

export interface CancellationDetails {
  reason: string;
  cancelledByUid: string;
  cancelledByRole: 'client' | 'lawyer' | 'admin' | 'system';
  cancelledAt: string;
  cancellationFeeInr?: number;
  refundEligible: boolean;
  refundProcessed?: boolean;
}

export interface Booking extends BaseEntity {
  id: string;
  bookingReferenceNumber: string; // e.g. LHM-2026-XXXXX
  clientUid: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  lawyerUid: string;
  lawyerName: string;
  lawyerTitle?: string;
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
  consultationFeeInr?: number; // Lawyer's full regular fee
  chamberAddress?: string;
  uploadedDocumentIds: string[];
  meetingLink?: string;
  cancellationDetails?: CancellationDetails;
  cancellationReason?: string;
  paymentReferences?: {
    orderId?: string;
    paymentId?: string;
    status?: 'pending' | 'success' | 'failed' | 'refunded';
    paidAt?: string;
  };
}


